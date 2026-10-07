import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireDataEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
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
  const freshness=freshnessRaw?Math.max(0,Number(freshnessRaw)):null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowed=new Set(["database","api","analytics","file","webhook","platform","manual","other"]);
  if(!code||!name||!allowed.has(sourceType)||(freshness!==null&&!Number.isFinite(freshness))) throw new Error("invalid_data_source");
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

export default async function MasterDataPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since=new Date(Date.now()-30*86400000).toISOString();
  const[
    {data:sources},
    {data:metrics},
    {count:events},
    {count:pageViews},
    {count:leads},
    {count:amazonClicks},
    {data:recentEvents}
  ]=await Promise.all([
    supabase.from("data_sources").select("id,code,name,source_type,system_name,status,freshness_target_minutes,created_at").order("name",{ascending:true}),
    supabase.from("metric_definitions").select("id,code,name,domain,definition,formula,unit,source_table,status,created_at").order("domain",{ascending:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since),
    supabase.from("analytics_events").select("event_name,source,medium,created_at").order("created_at",{ascending:false}).limit(20)
  ]);

  const sourceRows=(sources||[]) as any[];
  const metricRows=(metrics||[]) as any[];
  const activeSources=sourceRows.filter(s=>s.status==="active");
  const degradedSources=sourceRows.filter(s=>s.status==="degraded");
  const conversion=(pageViews||0)>0?((leads||0)/(pageViews||1))*100:0;
  const amazonCtr=(pageViews||0)>0?((amazonClicks||0)/(pageViews||1))*100:0;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · DATOS</span><h1>Datos & Analytics</h1><p>Catálogo de fuentes y métricas persistentes sobre señales reales del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Fuentes activas</small><strong>{activeSources.length}</strong><span>{degradedSources.length} degraded</span></article>
      <article><small>Métricas definidas</small><strong>{metricRows.length}</strong><span>Metric registry</span></article>
      <article><small>Eventos 30D</small><strong>{(events||0).toLocaleString()}</strong><span>analytics_events</span></article>
      <article><small>Conversión lead</small><strong>{conversion.toFixed(1)}%</strong><span>Leads / page views</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>DATA CATALOG</span><h2>Fuentes</h2></div><p>Inventario persistente de bases, APIs, plataformas y pipelines.</p></section>
    <section className={styles.grid}>
      {sourceRows.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(s.status).toUpperCase()}</span><em>{s.source_type}</em></div>
        <h3>{s.name}</h3><p>{s.system_name||"Sistema no registrado"}<br/>{s.freshness_target_minutes!=null?"Freshness: "+s.freshness_target_minutes+" min":"Freshness no definido"}</p>
      </article>)}
      {!sourceRows.length&&<article className={styles.card}><h3>Data catalog preparado</h3><p>No se han formalizado fuentes todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>METRIC REGISTRY</span><h2>Definiciones KPI</h2></div><p>Una sola definición por métrica para evitar interpretaciones distintas entre módulos.</p></section>
    <section className={styles.grid}>
      {metricRows.map((m:any)=><article key={m.id} className={styles.card}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(m.status).toUpperCase()}</span><em>{m.domain}</em></div>
        <h3>{m.name}</h3><p>{m.definition}<br/>{m.formula||"Fórmula no registrada"} · {m.unit||"sin unidad"}<br/>{m.source_table||"Fuente no asociada"}</p>
      </article>)}
      {!metricRows.length&&<article className={styles.card}><h3>Metric Registry vacío</h3><p>Las definiciones corporativas se registrarán aquí.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createDataSource} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA FUENTE</span><h2>Registrar data source</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="supabase-main"/></label>
          <label>Nombre<input name="name" required placeholder="Supabase Principal"/></label>
          <label>Tipo<select name="source_type" defaultValue="database"><option value="database">Database</option><option value="api">API</option><option value="analytics">Analytics</option><option value="file">File</option><option value="webhook">Webhook</option><option value="platform">Platform</option><option value="manual">Manual</option><option value="other">Other</option></select></label>
          <label>Sistema<input name="system_name" placeholder="Supabase / Vercel / Meta"/></label>
          <label>Freshness target (min)<input type="number" min="0" name="freshness_target_minutes"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar fuente</button>
      </form>

      <form action={createMetric} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA MÉTRICA</span><h2>Registrar definición KPI</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lead-conversion"/></label>
          <label>Nombre<input name="name" required placeholder="Lead Conversion"/></label>
          <label>Dominio<input name="domain" required placeholder="Growth"/></label>
          <label>Unidad<input name="unit" placeholder="% / USD / count"/></label>
          <label>Fuente tabla<input name="source_table" placeholder="leads / analytics_events"/></label>
          <label>Fórmula<input name="formula" placeholder="leads / page_views"/></label>
          <label className={styles.span2}>Definición<textarea name="definition" required rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar métrica</button>
      </form>
    </section>}

    <section className={styles.sectionHead}><div><span>LIVE SIGNALS</span><h2>Señales recientes</h2></div><p>Datos existentes reutilizados como observabilidad operativa.</p></section>
    <section className={styles.grid}>
      {(recentEvents||[]).map((e:any,i:number)=><article key={i} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>REAL</span><em>{new Date(e.created_at).toLocaleString("es-US")}</em></div>
        <h3>{e.event_name}</h3>
        <p>{[e.source,e.medium].filter(Boolean).join(" · ")||"Directo / sin atribución"}</p>
      </article>)}
    </section>

    <section className={styles.kpis}>
      <article><small>Page Views 30D</small><strong>{(pageViews||0).toLocaleString()}</strong><span>Tráfico medido</span></article>
      <article><small>Amazon CTR</small><strong>{amazonCtr.toFixed(1)}%</strong><span>Clicks / page views</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Admin/editor</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>main intacto</span></article>
    </section>
  </main>;
}