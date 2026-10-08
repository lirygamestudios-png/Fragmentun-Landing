import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function dataEstadoLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",degraded:"DEGRADADO",paused:"PAUSADO",deprecated:"OBSOLETO",retired:"RETIRADO",draft:"BORRADOR"};
  return map[value]||String(value||"").toUpperCase();
}

function sourceTypeLabel(value:string){
  const map:Record<string,string>={database:"BASE DE DATOS",api:"SERVICIO EXTERNO",analytics:"ANALÍTICA",file:"ARCHIVO",webhook:"EVENTO AUTOMÁTICO",platform:"PLATAFORMA",manual:"MANUAL",other:"OTRO"};
  return map[value]||String(value||"").toUpperCase();
}

async function requireDataEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createDataSource(formData:FormData){
  "use server";
  const {supabase,user}=await requireDataEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const sourceType=String(formData.get("source_type")||"database");
  const systemName=String(formData.get("system_name")||"").trim()||null;
  const freshnessRaw=String(formData.get("freshness_target_minutes")||"").trim();
  const freshness=freshnessRaw?Number(freshnessRaw):null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowed=new Set(["database","api","analytics","file","webhook","platform","manual","other"]);
  if(!code||!name||!allowed.has(sourceType)||(freshness!==null&&(!Number.isFinite(freshness)||!Number.isInteger(freshness)||freshness<0))) throw new Error("invalid_data_source");
  const{error}=await supabase.from("data_sources").insert({
    code,name,source_type:sourceType,system_name:systemName,freshness_target_minutes:freshness,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/data");
}

async function createMetric(formData:FormData){
  "use server";
  const {supabase,user}=await requireDataEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const definition=String(formData.get("definition")||"").trim();
  const formula=String(formData.get("formula")||"").trim()||null;
  const unit=String(formData.get("unit")||"").trim()||null;
  const sourceTable=String(formData.get("source_table")||"").trim()||null;
  if(!code||!name||!domain||!definition) throw new Error("invalid_metric");
  const{error}=await supabase.from("metric_definitions").insert({
    code,name,domain,definition,formula,unit,source_table:sourceTable,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/data");
}


async function updateDataSource(formData:FormData){
  "use server";
  const {supabase}=await requireDataEditor();
  const id=String(formData.get("source_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const systemName=String(formData.get("system_name")||"").trim()||null;
  const freshnessRaw=String(formData.get("freshness_target_minutes")||"").trim();
  const freshness=freshnessRaw?Math.max(0,Number(freshnessRaw)):null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["active","degraded","paused","deprecated","retired"]);
  if(!id||!allowedEstado.has(status)||(freshness!==null&&(!Number.isFinite(freshness)||!Number.isInteger(freshness)||freshness<0))) throw new Error("invalid_data_source_update");
  const{error}=await supabase.from("data_sources").update({
    status,owner_user_id:ownerUserId,system_name:systemName,freshness_target_minutes:freshness,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/data");
}

async function updateMetric(formData:FormData){
  "use server";
  const {supabase}=await requireDataEditor();
  const id=String(formData.get("metric_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const definition=String(formData.get("definition")||"").trim()||null;
  const formula=String(formData.get("formula")||"").trim()||null;
  const unit=String(formData.get("unit")||"").trim()||null;
  const sourceTable=String(formData.get("source_table")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["draft","active","deprecated"]);
  if(!id||!allowedEstado.has(status)) throw new Error("invalid_metric_update");
  const patch:any={status,owner_user_id:ownerUserId,formula,unit,source_table:sourceTable,notes,updated_at:new Date().toISOString()};
  if(definition) patch.definition=definition;
  const{error}=await supabase.from("metric_definitions").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/data");
}

export default async function MasterDataPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const since=new Date(Date.now()-30*86400000).toISOString();
  const[
    {data:sources},
    {data:metrics},
    {count:events},
    {count:pageViews},
    {count:leads},
    {count:amazonClicks},
    {data:recentEvents},
    {data:owners}
  ]=await Promise.all([
    supabase.from("data_sources").select("id,code,name,source_type,system_name,status,freshness_target_minutes,owner_user_id,notes,created_at").order("name",{ascending:true}),
    supabase.from("metric_definitions").select("id,code,name,domain,definition,formula,unit,source_table,status,owner_user_id,notes,created_at").order("domain",{ascending:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since),
    supabase.from("analytics_events").select("event_name,source,medium,created_at").order("created_at",{ascending:false}).limit(20),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const sourceRows=(sources||[]) as any[];
  const metricRows=(metrics||[]) as any[];
  const activeSources=sourceRows.filter(s=>s.status==="active");
  const degradedSources=sourceRows.filter(s=>s.status==="degraded");
  const conversion=(pageViews||0)>0?((leads||0)/(pageViews||1))*100:0;
  const amazonCtr=(pageViews||0)>0?((amazonClicks||0)/(pageViews||1))*100:0;
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleData}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · DATOS</span><h1>Datos</h1><p>Fuentes, métricas y señales reales del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">DT</span>
      <div className={styles.moduleStripCopy}><small>DATOS Y MÉTRICAS</small><strong>Fuentes, definiciones y señales</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Fuentes y eventos conectados</span>
        <span>Edición protegida · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article className={degradedSources.length?styles.kpiAttention:undefined}><small>Fuentes activas</small><strong>{activeSources.length}</strong><span>{degradedSources.length?degradedSources.length+" degradadas":"Sin fuentes degradadas"}</span></article>
      <article><small>Métricas definidas</small><strong>{metricRows.length}</strong><span>Métricas registradas</span></article>
      <article><small>Eventos 30 días</small><strong>{(events||0).toLocaleString()}</strong><span>Actividad registrada</span></article>
      <article><small>Conversión de contactos</small><strong>{conversion.toFixed(1)}%</strong><span>Contactos / visitas</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>FUENTES</span><h2>Fuentes</h2></div><p>Inventario de bases, APIs, plataformas y otras fuentes de datos.</p></section>
    <section className={styles.grid}>
      {sourceRows.map((s:any)=><article key={s.id} className={`${styles.card} ${s.status==="degraded"?styles.cardAttention:s.status==="paused"?styles.cardWarning:["deprecated","retired"].includes(s.status)?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{dataEstadoLabel(s.status)}</span><em>{sourceTypeLabel(s.source_type)}</em></div>
        <h3>{s.name}</h3><p>{s.system_name||"Sistema no registrado"}<br/>Responsable: {ownerName(s.owner_user_id)}<br/>{s.freshness_target_minutes!=null?"Actualización: "+s.freshness_target_minutes+" min":"Actualización no definida"}</p>
      </article>)}
      {!sourceRows.length&&<article className={styles.card}><h3>Registro de fuentes preparado</h3><p>No se han formalizado fuentes todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>MÉTRICAS</span><h2>Definiciones de métricas</h2></div><p>Una sola definición por métrica para evitar interpretaciones distintas entre módulos.</p></section>
    <section className={styles.grid}>
      {metricRows.map((m:any)=><article key={m.id} className={`${styles.card} ${m.status==="draft"?styles.cardWarning:m.status==="deprecated"?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{dataEstadoLabel(m.status)}</span><em>{m.domain}</em></div>
        <h3>{m.name}</h3><p>Responsable: {ownerName(m.owner_user_id)}<br/>{m.definition}<br/>{m.formula?"Fórmula registrada":"Fórmula no registrada"} · {m.unit||"sin unidad"}<br/>{m.source_table?"Fuente asociada":"Fuente no asociada"}</p>
      </article>)}
      {!metricRows.length&&<article className={styles.card}><h3>Sin métricas definidas</h3><p>Las definiciones corporativas se registrarán aquí.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar fuentes y métricas manualmente.</p>
      <section className={styles.adminForms}>
      <MasterActionForm action={createDataSource} className={styles.adminForm} successText="Fuente de datos registrada correctamente.">
        <div className={styles.formTitle}><span>NUEVA FUENTE</span><h2>Registrar fuente</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="supabase-main"/></label>
          <label>Nombre<input name="name" required placeholder="Supabase Principal"/></label>
          <label>Tipo<select name="source_type" defaultValue="database"><option value="database">Base de datos</option><option value="api">Servicio externo</option><option value="analytics">Analítica</option><option value="file">Archivo</option><option value="webhook">Evento automático</option><option value="platform">Plataforma</option><option value="manual">Manual</option><option value="other">Otro</option></select></label>
          <label>Sistema<input name="system_name" placeholder="Supabase / Vercel / Meta"/></label>
          <label>Actualización objetivo (min)<input type="number" min="0" name="freshness_target_minutes"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar fuente</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createMetric} className={styles.adminForm} successText="Métrica registrada correctamente.">
        <div className={styles.formTitle}><span>NUEVA MÉTRICA</span><h2>Registrar métrica</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lead-conversion"/></label>
          <label>Nombre<input name="name" required placeholder="Conversión de contactos"/></label>
          <label>Dominio<input name="domain" required placeholder="Crecimiento"/></label>
          <label>Unidad<input name="unit" placeholder="% / USD / cantidad"/></label>
          <label>Fuente de datos<input name="source_table" placeholder="leads / Eventos registrados"/></label>
          <label>Fórmula<input name="formula" placeholder="leads / page_views"/></label>
          <label className={styles.span2}>Definición<textarea name="definition" required rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar métrica</MasterSubmitButton>
      </MasterActionForm>
      </section>

      <section className={styles.adminForms}>
      <MasterActionForm action={updateDataSource} className={styles.adminForm} successText="Fuente de datos actualizada correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR FUENTE</span><h2>Actualizar fuente</h2></div>
        <div className={styles.formGrid}>
          <label>Fuente<select name="source_id" required defaultValue=""><option value="" disabled>Seleccionar fuente</option>{sourceRows.map((s:any)=><option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="active">Activo</option><option value="degraded">Degradado</option><option value="paused">Pausado</option><option value="deprecated">Obsoleto</option><option value="retired">Retirado</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Sistema<input name="system_name"/></label>
          <label>Actualización objetivo (min)<input type="number" min="0" name="freshness_target_minutes"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!sourceRows.length} disabledReason="No hay fuentes de datos registradas para actualizar.">Actualizar fuente</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateMetric} className={styles.adminForm} successText="Métrica actualizada correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR MÉTRICA</span><h2>Actualizar definición</h2></div>
        <div className={styles.formGrid}>
          <label>Métrica<select name="metric_id" required defaultValue=""><option value="" disabled>Seleccionar métrica</option>{metricRows.map((m:any)=><option key={m.id} value={m.id}>{m.code} · {m.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="draft">Borrador</option><option value="active">Activo</option><option value="deprecated">Obsoleto</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Unidad<input name="unit"/></label>
          <label>Fuente de datos<input name="source_table"/></label>
          <label>Fórmula<input name="formula"/></label>
          <label className={styles.span2}>Definición<textarea name="definition" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!metricRows.length} disabledReason="No hay métricas registradas para actualizar.">Actualizar métrica</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>SEÑALES RECIENTES</span><h2>Señales recientes</h2></div><p>Actividad reciente registrada por el sistema.</p></section>
    <section className={styles.grid}>
      {(recentEvents||[]).map((e:any,i:number)=><article key={i} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>REAL</span><em>{new Date(e.created_at).toLocaleString("es-US")}</em></div>
        <h3>Actividad registrada</h3>
        <p>{[e.source,e.medium].filter(Boolean).join(" · ")||"Directo / sin atribución"}</p>
      </article>)}
    </section>

    <section className={styles.kpis}>
      <article><small>Visitas 30 días</small><strong>{(pageViews||0).toLocaleString()}</strong><span>Tráfico medido</span></article>
      <article><small>Conversión a Amazon</small><strong>{amazonCtr.toFixed(1)}%</strong><span>Clics / visitas</span></article>
      <article><small>Acceso a datos</small><strong className={styles.kpiCompactValue}>PROTEGIDO</strong><span>Administración y edición</span></article>
      <article><small>Producción</small><strong className={styles.kpiCompactValue}>PROTEGIDA</strong><span>Versión pública intacta</span></article>
    </section>
  </main>;
}