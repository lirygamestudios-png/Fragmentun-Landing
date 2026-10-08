import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function techEstadoLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",degraded:"DEGRADADO",maintenance:"MANTENIMIENTO",deprecated:"OBSOLETO",retired:"RETIRADO",planned:"PLANIFICADO",approved:"APROBADO",in_progress:"EN CURSO",completed:"COMPLETADO",failed:"FALLIDO",rolled_back:"REVERTIDO",canceled:"CANCELADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function riskLabel(value:string){
  const map:Record<string,string>={low:"BAJA",medium:"MEDIA",high:"ALTA",critical:"CRÍTICA"};
  return map[value]||String(value||"").toUpperCase();
}

function environmentLabel(value:string){
  const map:Record<string,string>={development:"DESARROLLO",preview:"VERSIÓN DE PRUEBA",staging:"PREPARACIÓN",production:"PRODUCCIÓN",shared:"COMPARTIDO"};
  return map[value]||String(value||"").toUpperCase();
}

function serviceTypeLabel(value:string){
  const map:Record<string,string>={application:"APLICACIÓN",database:"BASE DE DATOS",auth:"ACCESO",storage:"ALMACENAMIENTO",analytics:"ANALÍTICA",ci_cd:"DESPLIEGUE",hosting:"ALOJAMIENTO",integration:"INTEGRACIÓN",monitoring:"SUPERVISIÓN",other:"OTRO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function changeTypeLabel(value:string){
  const map:Record<string,string>={standard:"ESTÁNDAR",normal:"NORMAL",emergency:"EMERGENCIA",security:"SEGURIDAD",configuration:"CONFIGURACIÓN",dependency:"DEPENDENCIA",infrastructure:"INFRAESTRUCTURA",other:"OTRO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireTechEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function createService(formData:FormData){
  "use server";
  const {supabase,user}=await requireTechEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const serviceType=String(formData.get("service_type")||"application");
  const provider=String(formData.get("provider")||"").trim()||null;
  const environment=String(formData.get("environment")||"production");
  const criticality=String(formData.get("criticality")||"medium");
  const url=String(formData.get("url")||"").trim()||null;
  const version=String(formData.get("version")||"").trim()||null;
  const allowedType=new Set(["application","database","auth","storage","analytics","ci_cd","hosting","integration","monitoring","other"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  const allowedCrit=new Set(["low","medium","high","critical"]);
  if(!code||!name||!allowedType.has(serviceType)||!allowedEnv.has(environment)||!allowedCrit.has(criticality)) throw new Error("invalid_service");
  const{error}=await supabase.from("tech_services").insert({
    code,name,service_type:serviceType,provider,environment,criticality,url,version,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

async function createChange(formData:FormData){
  "use server";
  const {supabase,user}=await requireTechEditor();
  const code=String(formData.get("change_code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const type=String(formData.get("change_type")||"standard");
  const risk=String(formData.get("risk_level")||"medium");
  const serviceRaw=String(formData.get("service_id")||"").trim();
  const serviceId=serviceRaw||null;
  const env=String(formData.get("target_environment")||"preview");
  const plannedAt=String(formData.get("planned_at")||"").trim()||null;
  const rollback=String(formData.get("rollback_plan")||"").trim()||null;
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedType=new Set(["standard","normal","emergency","security","configuration","dependency","infrastructure","other"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!code||!title||!allowedType.has(type)||!allowedRisk.has(risk)||!allowedEnv.has(env)) throw new Error("invalid_change");
  if(env==="production"&&["high","critical"].includes(risk)&&!rollback) throw new Error("rollback_plan_required");
  const{error}=await supabase.from("tech_changes").insert({
    change_code:code,title,change_type:type,risk_level:risk,service_id:serviceId,target_environment:env,
    planned_at:plannedAt,rollback_plan:rollback,summary,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}


async function updateService(formData:FormData){
  "use server";
  const {supabase}=await requireTechEditor();
  const id=String(formData.get("service_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const criticality=String(formData.get("criticality")||"medium");
  const environment=String(formData.get("environment")||"production");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const provider=String(formData.get("provider")||"").trim()||null;
  const version=String(formData.get("version")||"").trim()||null;
  const url=String(formData.get("url")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["active","degraded","maintenance","deprecated","retired"]);
  const allowedCrit=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!id||!allowedEstado.has(status)||!allowedCrit.has(criticality)||!allowedEnv.has(environment)) throw new Error("invalid_service_update");
  const{error}=await supabase.from("tech_services").update({
    status,criticality,environment,owner_user_id:ownerUserId,provider,version,url,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

async function updateChange(formData:FormData){
  "use server";
  const {supabase,user,profile}=await requireTechEditor();
  const id=String(formData.get("change_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const risk=String(formData.get("risk_level")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const env=String(formData.get("target_environment")||"preview");
  const plannedAt=String(formData.get("planned_at")||"").trim()||null;
  const rollback=String(formData.get("rollback_plan")||"").trim()||null;
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedEstado=new Set(["planned","approved","in_progress","completed","failed","rolled_back","canceled"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!id||!allowedEstado.has(status)||!allowedRisk.has(risk)||!allowedEnv.has(env)) throw new Error("invalid_change_update");
  const protectedProduction=env==="production"&&["high","critical"].includes(risk);
  if(protectedProduction&&["approved","in_progress","completed"].includes(status)&&!rollback) throw new Error("rollback_plan_required");
  if(protectedProduction&&["approved","in_progress","completed"].includes(status)&&profile.role!=="admin") throw new Error("admin_approval_required");
  if(status==="approved"&&profile.role!=="admin") throw new Error("admin_approval_required");
  const patch:any={
    status,risk_level:risk,owner_user_id:ownerUserId,target_environment:env,planned_at:plannedAt,
    rollback_plan:rollback,summary,updated_at:new Date().toISOString()
  };
  if(status==="approved") patch.approved_by=user.id;
  if(status==="completed") patch.completed_at=new Date().toISOString();
  const{error}=await supabase.from("tech_changes").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

export default async function MasterTechnologyPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:services},
    {data:changes},
    {count:events},
    {count:rateRows},
    {count:media},
    {count:profiles},
    {data:owners}
  ]=await Promise.all([
    supabase.from("tech_services").select("id,code,name,service_type,provider,environment,status,criticality,owner_user_id,url,version,notes,created_at").order("name",{ascending:true}),
    supabase.from("tech_changes").select("id,change_code,title,change_type,status,risk_level,service_id,target_environment,planned_at,completed_at,rollback_plan,summary,owner_user_id,approved_by,created_at").order("created_at",{ascending:false}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const serviceRows=(services||[]) as any[];
  const changeRows=(changes||[]) as any[];
  const degraded=serviceRows.filter(s=>["degraded","maintenance"].includes(s.status)).length;
  const openChanges=changeRows.filter(c=>!["completed","failed","rolled_back","canceled"].includes(c.status));
  const riskyChanges=openChanges.filter(c=>["high","critical"].includes(c.risk_level));
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  const stack=[
    ["Aplicación web","Next.js","Alojada en Vercel"],
    ["Ejecución","Node.js","Servicios de la aplicación"],
    ["Datos y acceso","Supabase","Base de datos, acceso y archivos"],
    ["Código fuente","GitHub","Repositorio del proyecto"],
    ["Producción","Protegida","Versión pública protegida"],
    ["Versión de prueba","Separada","Cambios aislados de producción"]
  ];

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleTechnology}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · TECNOLOGÍA</span><h1>Tecnología</h1><p>Inventario técnico, cambios controlados y salud del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">TC</span>
      <div className={styles.moduleStripCopy}><small>TECNOLOGÍA Y PLATAFORMA</small><strong>Servicios, cambios y continuidad</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Infraestructura y cambios conectados</span>
        <span>Operación técnica protegida</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Servicios</small><strong>{serviceRows.length}</strong><span>{degraded} con incidencia o mantenimiento</span></article>
      <article><small>Cambios abiertos</small><strong>{openChanges.length}</strong><span>{riskyChanges.length} de riesgo alto o crítico</span></article>
      <article><small>Eventos</small><strong>{(events||0).toLocaleString()}</strong><span>Analítica acumulada</span></article>
      <article><small>Administradores</small><strong>{(profiles||0).toLocaleString()}</strong><span>Usuarios administrativos</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>SERVICIOS</span><h2>Servicios técnicos</h2></div><p>Componentes y proveedores técnicos registrados.</p></section>
    <section className={styles.grid}>
      {serviceRows.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{techEstadoLabel(s.status)}</span><em>{riskLabel(s.criticality)}</em></div>
        <h3>{s.name}</h3><p>{serviceTypeLabel(s.service_type)} · {s.provider||"Proveedor no registrado"}<br/>Responsable: {ownerName(s.owner_user_id)}<br/>{environmentLabel(s.environment)} · {s.version||"Sin versión"}<br/>{s.url||"URL no registrada"}</p>
      </article>)}
      {!serviceRows.length&&<article className={styles.card}><h3>Registro de servicios preparado</h3><p>No se han formalizado servicios técnicos todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CAMBIOS</span><h2>Cambios técnicos</h2></div><p>Cambios técnicos con riesgo, entorno objetivo y plan de reversión.</p></section>
    <section className={styles.grid}>
      {changeRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="completed"?styles.badgeActive:styles.badgePlanned}>{techEstadoLabel(c.status)}</span><em>{riskLabel(c.risk_level)}</em></div>
        <h3>{c.title}</h3><p>{changeTypeLabel(c.change_type)}<br/>Responsable: {ownerName(c.owner_user_id)}<br/>{environmentLabel(c.target_environment)} · {c.planned_at?new Date(c.planned_at).toLocaleString("es-US"):"Sin fecha"}<br/>{c.rollback_plan?"Plan de reversión definido":"Plan de reversión pendiente"}</p>
      </article>)}
      {!changeRows.length&&<article className={styles.card}><h3>Sin cambios técnicos registrados</h3><p>Los cambios técnicos formales se registrarán aquí.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar servicios y cambios técnicos manualmente.</p>
      <section className={styles.adminForms}>
      <MasterActionForm action={createService} className={styles.adminForm} successText="Servicio registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO SERVICIO</span><h2>Registrar componente</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="vercel-web"/></label>
          <label>Nombre<input name="name" required placeholder="Web Platform"/></label>
          <label>Tipo<select name="service_type" defaultValue="application">
            <option value="application">Aplicación</option><option value="database">Base de datos</option><option value="auth">Autenticación</option>
            <option value="storage">Almacenamiento</option><option value="analytics">Analítica</option><option value="ci_cd">Despliegue</option>
            <option value="hosting">Alojamiento</option><option value="integration">Integración</option><option value="monitoring">Supervisión</option><option value="other">Otro</option>
          </select></label>
          <label>Proveedor<input name="provider"/></label>
          <label>Entorno<select name="environment" defaultValue="production"><option value="development">Desarrollo</option><option value="preview">Pruebas</option><option value="staging">Preproducción</option><option value="production">Producción</option><option value="shared">Compartido</option></select></label>
          <label>Importancia<select name="criticality" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Versión<input name="version"/></label>
          <label>URL<input name="url"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar servicio</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createChange} className={styles.adminForm} successText="Cambio técnico registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO CAMBIO</span><h2>Registrar cambio técnico</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="change_code" required placeholder="chg-2026-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Tipo<select name="change_type" defaultValue="standard"><option value="standard">Estándar</option><option value="normal">Normal</option><option value="emergency">Emergencia</option><option value="security">Seguridad</option><option value="configuration">Configuración</option><option value="dependency">Dependencia</option><option value="infrastructure">Infraestructura</option><option value="other">Otro</option></select></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Servicio<select name="service_id" defaultValue=""><option value="">Sin servicio</option>{serviceRows.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Entorno objetivo<select name="target_environment" defaultValue="preview"><option value="development">Desarrollo</option><option value="preview">Pruebas</option><option value="staging">Preproducción</option><option value="production">Producción</option><option value="shared">Compartido</option></select></label>
          <label>Fecha planificada<input type="datetime-local" name="planned_at"/></label>
          <label className={styles.span2}>Plan de reversión<textarea name="rollback_plan" rows={3}/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar cambio</MasterSubmitButton>
      </MasterActionForm>
      </section>

      <section className={styles.adminForms}>
      <MasterActionForm action={updateService} className={styles.adminForm} successText="Servicio actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR SERVICIO</span><h2>Actualizar componente</h2></div>
        <div className={styles.formGrid}>
          <label>Servicio<select name="service_id" required defaultValue=""><option value="" disabled>Seleccionar servicio</option>{serviceRows.map((s:any)=><option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="active">Activo</option><option value="degraded">Degradado</option><option value="maintenance">Mantenimiento</option><option value="deprecated">Obsoleto</option><option value="retired">Retirado</option></select></label>
          <label>Importancia<select name="criticality" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Entorno<select name="environment" defaultValue="production"><option value="development">Desarrollo</option><option value="preview">Pruebas</option><option value="staging">Preproducción</option><option value="production">Producción</option><option value="shared">Compartido</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Proveedor<input name="provider"/></label>
          <label>Versión<input name="version"/></label>
          <label>URL<input name="url"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!serviceRows.length} disabledReason="No hay servicios técnicos registrados para actualizar.">Actualizar servicio</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateChange} className={styles.adminForm} successText="Cambio técnico actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR CAMBIO</span><h2>Actualizar cambio</h2></div>
        <div className={styles.formGrid}>
          <label>Cambio<select name="change_id" required defaultValue=""><option value="" disabled>Seleccionar cambio</option>{changeRows.map((x:any)=><option key={x.id} value={x.id}>{x.change_code} · {x.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="planned"><option value="planned">Planificado</option><option value="approved">Aprobado</option><option value="in_progress">En curso</option><option value="completed">Completado</option><option value="failed">Fallido</option><option value="rolled_back">Revertido</option><option value="canceled">Cancelado</option></select></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Entorno objetivo<select name="target_environment" defaultValue="preview"><option value="development">Desarrollo</option><option value="preview">Pruebas</option><option value="staging">Preproducción</option><option value="production">Producción</option><option value="shared">Compartido</option></select></label>
          <label>Fecha planificada<input type="datetime-local" name="planned_at"/></label>
          <label className={styles.span2}>Plan de reversión<textarea name="rollback_plan" rows={3}/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!changeRows.length} disabledReason="No hay cambios técnicos registrados para actualizar.">Actualizar cambio</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>ENTORNO TÉCNICO</span><h2>Contexto actual</h2></div></section>
    <section className={styles.grid}>
      {stack.map(([name,value,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>TECNOLOGÍA</em></div>
        <h3>{name}</h3><p><strong>{value}</strong><br/>{detail}</p>
      </article>)}
    </section>

    <section className={styles.kpis}>
      <article><small>Controles antiabuso</small><strong>{(rateRows||0).toLocaleString()}</strong><span>Antiabuso</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Recursos registrados</span></article>
      <article><small>Acceso a datos</small><strong>PROTEGIDO</strong><span>Administración y edición</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>Versión pública intacta</span></article>
    </section>
  </main>;
}
