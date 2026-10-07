import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function incidentStatusLabel(value:string){
  const map:Record<string,string>={open:"ABIERTO",investigating:"INVESTIGANDO",contained:"CONTENIDO",monitoring:"EN SEGUIMIENTO",resolved:"RESUELTO",closed:"CERRADO"};
  return map[value]||String(value||"").toUpperCase();
}

function severityLabel(value:string){
  const map:Record<string,string>={low:"BAJA",medium:"MEDIA",high:"ALTA",critical:"CRÍTICA"};
  return map[value]||String(value||"").toUpperCase();
}

function reviewEstadoLabel(value:string){
  const map:Record<string,string>={pending:"PENDIENTE",approved:"APROBADA",change_required:"REQUIERE CAMBIO",revoked:"REVOCADA",expired:"VENCIDA"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireSecurityAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createIncident(formData:FormData){
  "use server";
  const {supabase,user}=await requireSecurityAdmin();
  const code=String(formData.get("incident_code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const severity=String(formData.get("severity")||"medium");
  const category=String(formData.get("category")||"other");
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedSeverity=new Set(["low","medium","high","critical"]);
  const allowedCategory=new Set(["auth","data","application","infrastructure","vendor","abuse","availability","malware","phishing","privacy","other"]);
  if(!code||!title||!allowedSeverity.has(severity)||!allowedCategory.has(category)) throw new Error("invalid_incident");
  const{error}=await supabase.from("security_incidents").insert({
    incident_code:code,title,severity,category,summary,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/security");
}

async function createAccessRevisión(formData:FormData){
  "use server";
  const {supabase,user}=await requireSecurityAdmin();
  const subjectType=String(formData.get("subject_type")||"admin_user");
  const subjectRef=String(formData.get("subject_ref")||"").trim();
  const subjectName=String(formData.get("subject_name")||"").trim()||null;
  const risk=String(formData.get("risk_level")||"medium");
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedType=new Set(["admin_user","service_account","integration","vendor","other"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  if(!subjectRef||!allowedType.has(subjectType)||!allowedRisk.has(risk)) throw new Error("invalid_access_review");
  const{error}=await supabase.from("security_access_reviews").insert({
    subject_type:subjectType,subject_ref:subjectRef,subject_name:subjectName,risk_level:risk,due_date:dueDate,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/security");
}


async function updateIncident(formData:FormData){
  "use server";
  const {supabase}=await requireSecurityAdmin();
  const id=String(formData.get("incident_id")||"").trim();
  const status=String(formData.get("status")||"investigating");
  const severity=String(formData.get("severity")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const summary=String(formData.get("summary")||"").trim()||null;
  const rootCause=String(formData.get("root_cause")||"").trim()||null;
  const remediation=String(formData.get("remediation")||"").trim()||null;
  const allowedEstado=new Set(["open","investigating","contained","monitoring","resolved","closed"]);
  const allowedSeverity=new Set(["low","medium","high","critical"]);
  if(!id||!allowedEstado.has(status)||!allowedSeverity.has(severity)) throw new Error("invalid_incident_update");
  const patch:any={
    status,severity,owner_user_id:ownerUserId,summary,root_cause:rootCause,remediation,updated_at:new Date().toISOString()
  };
  if(["contained","monitoring","resolved","closed"].includes(status)) patch.contained_at=new Date().toISOString();
  if(["resolved","closed"].includes(status)) patch.resolved_at=new Date().toISOString();
  const{error}=await supabase.from("security_incidents").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/security");
}

async function updateAccessRevisión(formData:FormData){
  "use server";
  const {supabase,user}=await requireSecurityAdmin();
  const id=String(formData.get("review_id")||"").trim();
  const status=String(formData.get("review_status")||"pending");
  const risk=String(formData.get("risk_level")||"medium");
  const reviewerRaw=String(formData.get("reviewer_user_id")||"").trim();
  const reviewerUserId=reviewerRaw||user.id;
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["pending","approved","change_required","revoked","expired"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  if(!id||!allowedEstado.has(status)||!allowedRisk.has(risk)) throw new Error("invalid_access_review_update");
  const patch:any={review_status:status,risk_level:risk,reviewer_user_id:reviewerUserId,due_date:dueDate,notes};
  patch.reviewed_at=status==="pending"?null:new Date().toISOString();
  const{error}=await supabase.from("security_access_reviews").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/security");
}

export default async function MasterSecurityPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[
    {data:incidents},
    {data:accessReviews},
    {count:profiles},
    {count:allowlist},
    {count:rateRows},
    {count:adminEvents},
    {data:owners}
  ]=await Promise.all([
    supabase.from("security_incidents").select("id,incident_code,title,severity,status,category,detected_at,contained_at,resolved_at,owner_user_id,summary,root_cause,remediation,created_at").order("detected_at",{ascending:false}),
    supabase.from("security_access_reviews").select("id,subject_type,subject_ref,subject_name,review_status,risk_level,reviewer_user_id,due_date,reviewed_at,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_access_allowlist").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const incidentRows=(incidents||[]) as any[];
  const reviewRows=(accessReviews||[]) as any[];
  const openIncidents=incidentRows.filter(i=>!["resolved","closed"].includes(i.status));
  const criticalIncidents=incidentRows.filter(i=>["high","critical"].includes(i.severity)&&!["resolved","closed"].includes(i.status));
  const pendingReviews=reviewRows.filter(r=>r.review_status==="pending"||r.review_status==="change_required");
  const overdueReviews=reviewRows.filter(r=>r.due_date&&new Date(r.due_date).getTime()<Date.now()&&!["approved","revoked"].includes(r.review_status));
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  const controls=[
    ["RLS","Activo","Tablas públicas relevantes con Row Level Security"],
    ["Acceso administrativo","Activo",String(profiles||0)+" perfiles administrativos"],
    ["Lista de acceso","Activo",String(allowlist||0)+" accesos permitidos"],
    ["Control antiabuso","Activo",String(rateRows||0)+" registros de control"],
    ["Historial de auditoría","Activo",String(adminEvents||0)+" eventos administrativos"],
    ["Base protegida de producción","Protegido","main · 8eb878e"],
    ["Aislamiento de pruebas","Activo","Master Admin fuera de producción"],
    ["Claves sensibles","Servidor","Claves sensibles fuera del cliente"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · SEGURIDAD</span><h1>Seguridad</h1><p>Incidentes, revisiones de acceso y controles técnicos existentes.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Incidentes abiertos</small><strong>{openIncidents.length}</strong><span>{criticalIncidents.length} altos o críticos</span></article>
      <article><small>Revisiones de acceso</small><strong>{pendingReviews.length}</strong><span>{overdueReviews.length} vencidas</span></article>
      <article><small>Usuarios administrativos</small><strong>{(profiles||0).toLocaleString()}</strong><span>Provisionados</span></article>
      <article><small>Eventos de auditoría</small><strong>{(adminEvents||0).toLocaleString()}</strong><span>Trazabilidad</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>INCIDENTES</span><h2>Incidentes de seguridad</h2></div><p>Registro persistente y privado; empieza vacío hasta que exista un incidente real que documentar.</p></section>
    <section className={styles.grid}>
      {incidentRows.map((i:any)=><article key={i.id} className={styles.card}>
        <div className={styles.cardTop}><span className={["resolved","closed"].includes(i.status)?styles.badgeActive:styles.badgePlanned}>{incidentStatusLabel(i.status)}</span><em>{severityLabel(i.severity)}</em></div>
        <h3>{i.title}</h3><p>{i.incident_code} · {i.category}<br/>Responsable: {ownerName(i.owner_user_id)}<br/>{new Date(i.detected_at).toLocaleString("es-US")}<br/>{i.summary||"Sin resumen"}</p>
      </article>)}
      {!incidentRows.length&&<article className={styles.card}><h3>Sin incidentes registrados</h3><p>No se han creado incidentes ficticios.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>REVISIONES DE ACCESO</span><h2>Revisiones de acceso</h2></div></section>
    <section className={styles.grid}>
      {reviewRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}><span className={r.review_status==="approved"?styles.badgeActive:styles.badgePlanned}>{reviewEstadoLabel(r.review_status)}</span><em>{severityLabel(r.risk_level)}</em></div>
        <h3>{r.subject_name||r.subject_ref}</h3><p>{r.subject_type}<br/>Revisor: {ownerName(r.reviewer_user_id)}<br/>{r.due_date?"Fecha límite: "+r.due_date:"Sin fecha límite"}<br/>{r.notes||"Sin notas"}</p>
      </article>)}
      {!reviewRows.length&&<article className={styles.card}><h3>Sin revisiones pendientes</h3><p>Las revisiones se registrarán solo cuando exista una necesidad real de control.</p></article>}
    </section>

    <details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar incidentes y revisiones de acceso manualmente.</p>
        <section className={styles.adminForms}>
      <form action={createIncident} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO INCIDENTE</span><h2>Registrar incidente</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="incident_code" required placeholder="sec-2026-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Severidad<select name="severity" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Categoría<select name="category" defaultValue="other">
            <option value="auth">Autenticación</option><option value="data">Datos</option><option value="application">Aplicación</option><option value="infrastructure">Infraestructura</option>
            <option value="vendor">Proveedor</option><option value="abuse">Abuso</option><option value="availability">Disponibilidad</option><option value="malware">Malware</option>
            <option value="phishing">Phishing</option><option value="privacy">Privacidad</option><option value="other">Otro</option>
          </select></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar incidente</MasterSubmitButton>
      </form>

      <form action={createAccessRevisión} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA REVISIÓN</span><h2>Registrar revisión de acceso</h2></div>
        <div className={styles.formGrid}>
          <label>Tipo<select name="subject_type" defaultValue="admin_user"><option value="admin_user">Usuario administrativo</option><option value="service_account">Cuenta de servicio</option><option value="integration">Integración</option><option value="vendor">Proveedor</option><option value="other">Otro</option></select></label>
          <label>Referencia<input name="subject_ref" required placeholder="email / id / provider"/></label>
          <label>Nombre<input name="subject_name"/></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar revisión</MasterSubmitButton>
      </form>
    </section>


    <section className={styles.adminForms}>
      <form action={updateIncident} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR INCIDENTE</span><h2>Actualizar respuesta</h2></div>
        <div className={styles.formGrid}>
          <label>Incidente<select name="incident_id" required defaultValue=""><option value="" disabled>Seleccionar incidente</option>{incidentRows.map((i:any)=><option key={i.id} value={i.id}>{i.incident_code} · {i.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="investigating"><option value="open">Abierto</option><option value="investigating">Investigando</option><option value="contained">Contenido</option><option value="monitoring">En seguimiento</option><option value="resolved">Resuelto</option><option value="closed">Cerrado</option></select></label>
          <label>Severidad<select name="severity" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
          <label className={styles.span2}>Causa raíz<textarea name="root_cause" rows={3}/></label>
          <label className={styles.span2}>Remediación<textarea name="remediation" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!incidentRows.length}>Actualizar incidente</MasterSubmitButton>
      </form>

      <form action={updateAccessRevisión} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR REVISIÓN</span><h2>Actualizar acceso</h2></div>
        <div className={styles.formGrid}>
          <label>Revisión<select name="review_id" required defaultValue=""><option value="" disabled>Seleccionar revisión</option>{reviewRows.map((r:any)=><option key={r.id} value={r.id}>{r.subject_name||r.subject_ref}</option>)}</select></label>
          <label>Estado<select name="review_status" defaultValue="pending"><option value="pending">Pendiente</option><option value="approved">Aprobada</option><option value="change_required">Requiere cambio</option><option value="revoked">Revocada</option><option value="expired">Vencida</option></select></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Revisor<select name="reviewer_user_id" defaultValue=""><option value="">Usuario actual</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!reviewRows.length}>Actualizar revisión</MasterSubmitButton>
      </form>
      </section>
    </details>

    <section className={styles.sectionHead}><div><span>CONTROLES DE SEGURIDAD</span><h2>Controles existentes</h2></div><p>Señales técnicas separadas del registro de incidentes.</p></section>
    <section className={styles.grid}>
      {controls.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{state.toUpperCase()}</span><em>SEGURIDAD</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
