import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

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

async function createAccessReview(formData:FormData){
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
    {count:adminEvents}
  ]=await Promise.all([
    supabase.from("security_incidents").select("id,incident_code,title,severity,status,category,detected_at,contained_at,resolved_at,summary,root_cause,remediation,created_at").order("detected_at",{ascending:false}),
    supabase.from("security_access_reviews").select("id,subject_type,subject_ref,subject_name,review_status,risk_level,due_date,reviewed_at,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_access_allowlist").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true})
  ]);

  const incidentRows=(incidents||[]) as any[];
  const reviewRows=(accessReviews||[]) as any[];
  const openIncidents=incidentRows.filter(i=>!["resolved","closed"].includes(i.status));
  const criticalIncidents=incidentRows.filter(i=>["high","critical"].includes(i.severity)&&!["resolved","closed"].includes(i.status));
  const pendingReviews=reviewRows.filter(r=>r.review_status==="pending"||r.review_status==="change_required");
  const overdueReviews=reviewRows.filter(r=>r.due_date&&new Date(r.due_date).getTime()<Date.now()&&!["approved","revoked"].includes(r.review_status));

  const controls=[
    ["RLS","Activo","Tablas públicas relevantes con Row Level Security"],
    ["Admin Auth","Activo",String(profiles||0)+" perfiles administrativos"],
    ["Allowlist","Activo",String(allowlist||0)+" accesos permitidos"],
    ["Rate limiting","Activo",String(rateRows||0)+" registros de control"],
    ["Audit trail","Activo",String(adminEvents||0)+" eventos administrativos"],
    ["Production baseline","Protegido","main · 8eb878e"],
    ["Preview isolation","Activo","Master Admin fuera de producción"],
    ["Secrets","Servidor","Claves sensibles fuera del cliente"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · SEGURIDAD</span><h1>Seguridad</h1><p>Incidentes, revisiones de acceso y controles técnicos existentes.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Incidentes abiertos</small><strong>{openIncidents.length}</strong><span>{criticalIncidents.length} high/critical</span></article>
      <article><small>Access reviews</small><strong>{pendingReviews.length}</strong><span>{overdueReviews.length} overdue</span></article>
      <article><small>Admins</small><strong>{(profiles||0).toLocaleString()}</strong><span>Provisionados</span></article>
      <article><small>Audit events</small><strong>{(adminEvents||0).toLocaleString()}</strong><span>Trazabilidad</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>INCIDENT REGISTER</span><h2>Incidentes de seguridad</h2></div><p>Registro persistente y privado; empieza vacío hasta que exista un incidente real que documentar.</p></section>
    <section className={styles.grid}>
      {incidentRows.map((i:any)=><article key={i.id} className={styles.card}>
        <div className={styles.cardTop}><span className={["resolved","closed"].includes(i.status)?styles.badgeActive:styles.badgePlanned}>{String(i.status).toUpperCase()}</span><em>{i.severity}</em></div>
        <h3>{i.title}</h3><p>{i.incident_code} · {i.category}<br/>{new Date(i.detected_at).toLocaleString("es-US")}<br/>{i.summary||"Sin resumen"}</p>
      </article>)}
      {!incidentRows.length&&<article className={styles.card}><h3>Sin incidentes registrados</h3><p>No se han creado incidentes ficticios.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ACCESS REVIEWS</span><h2>Revisiones de acceso</h2></div></section>
    <section className={styles.grid}>
      {reviewRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}><span className={r.review_status==="approved"?styles.badgeActive:styles.badgePlanned}>{String(r.review_status).toUpperCase()}</span><em>{r.risk_level}</em></div>
        <h3>{r.subject_name||r.subject_ref}</h3><p>{r.subject_type}<br/>{r.due_date?"Due: "+r.due_date:"Sin due date"}<br/>{r.notes||"Sin notas"}</p>
      </article>)}
      {!reviewRows.length&&<article className={styles.card}><h3>Sin revisiones pendientes</h3><p>Las revisiones se registrarán solo cuando exista una necesidad real de control.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createIncident} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO INCIDENTE</span><h2>Registrar incidente</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="incident_code" required placeholder="sec-2026-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Severidad<select name="severity" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Categoría<select name="category" defaultValue="other">
            <option value="auth">Auth</option><option value="data">Data</option><option value="application">Application</option><option value="infrastructure">Infrastructure</option>
            <option value="vendor">Vendor</option><option value="abuse">Abuse</option><option value="availability">Availability</option><option value="malware">Malware</option>
            <option value="phishing">Phishing</option><option value="privacy">Privacy</option><option value="other">Other</option>
          </select></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar incidente</button>
      </form>

      <form action={createAccessReview} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA REVIEW</span><h2>Registrar revisión de acceso</h2></div>
        <div className={styles.formGrid}>
          <label>Tipo<select name="subject_type" defaultValue="admin_user"><option value="admin_user">Admin user</option><option value="service_account">Service account</option><option value="integration">Integration</option><option value="vendor">Vendor</option><option value="other">Other</option></select></label>
          <label>Referencia<input name="subject_ref" required placeholder="email / id / provider"/></label>
          <label>Nombre<input name="subject_name"/></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Due date<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar review</button>
      </form>
    </section>

    <section className={styles.sectionHead}><div><span>SECURITY CONTROL PLANE</span><h2>Controles existentes</h2></div><p>Señales técnicas separadas del registro de incidentes.</p></section>
    <section className={styles.grid}>
      {controls.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{state.toUpperCase()}</span><em>SEGURIDAD</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
