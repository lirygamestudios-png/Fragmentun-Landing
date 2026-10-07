import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

async function requireOpsEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createWorkItem(formData:FormData){
  "use server";
  const {supabase,user}=await requireOpsEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const workType=String(formData.get("work_type")||"task");
  const priority=String(formData.get("priority")||"medium");
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const nextAction=String(formData.get("next_action")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedType=new Set(["task","issue","decision","follow_up","incident_followup","launch","review","other"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!code||!title||!domain||!allowedType.has(workType)||!allowedPriority.has(priority)) throw new Error("invalid_work_item");
  const{error}=await supabase.from("ops_work_items").insert({
    code,title,domain,work_type:workType,priority,due_date:dueDate,next_action:nextAction,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/operations");
}

async function createDecision(formData:FormData){
  "use server";
  const {supabase,user}=await requireOpsEditor();
  const code=String(formData.get("decision_code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const decision=String(formData.get("decision")||"").trim()||null;
  const rationale=String(formData.get("rationale")||"").trim()||null;
  const reviewDate=String(formData.get("review_date")||"").trim()||null;
  if(!code||!title||!domain) throw new Error("invalid_decision");
  const{error}=await supabase.from("ops_decisions").insert({
    decision_code:code,title,domain,decision,rationale,review_date:reviewDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/operations");
}


async function updateWorkItem(formData:FormData){
  "use server";
  const {supabase}=await requireOpsEditor();
  const id=String(formData.get("work_id")||"").trim();
  const status=String(formData.get("status")||"open");
  const priority=String(formData.get("priority")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const nextAction=String(formData.get("next_action")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["open","in_progress","blocked","waiting","completed","canceled"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!id||!allowedStatus.has(status)||!allowedPriority.has(priority)) throw new Error("invalid_work_update");
  const{error}=await supabase.from("ops_work_items").update({
    status,priority,owner_user_id:ownerUserId,due_date:dueDate,next_action:nextAction,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/operations");
}

async function updateDecision(formData:FormData){
  "use server";
  const {supabase,user}=await requireOpsEditor();
  const id=String(formData.get("decision_id")||"").trim();
  const status=String(formData.get("status")||"proposed");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const decision=String(formData.get("decision")||"").trim()||null;
  const rationale=String(formData.get("rationale")||"").trim()||null;
  const reviewDate=String(formData.get("review_date")||"").trim()||null;
  const allowedStatus=new Set(["proposed","approved","rejected","superseded","implemented"]);
  if(!id||!allowedStatus.has(status)) throw new Error("invalid_decision_update");
  const patch:any={
    status,owner_user_id:ownerUserId,decision,rationale,review_date:reviewDate,updated_at:new Date().toISOString()
  };
  if(["approved","implemented"].includes(status)){
    patch.approved_by=user.id;
    patch.decision_date=new Date().toISOString().slice(0,10);
  }
  const{error}=await supabase.from("ops_decisions").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/operations");
}

export default async function MasterOperationsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:workItems},
    {data:decisions},
    {count:leads},
    {count:media},
    {count:books},
    {count:characters},
    {data:latestLead},
    {data:latestEvent},
    {data:owners}
  ]=await Promise.all([
    supabase.from("ops_work_items").select("id,code,title,domain,work_type,status,priority,owner_user_id,due_date,next_action,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("ops_decisions").select("id,decision_code,title,domain,status,owner_user_id,approved_by,decision,rationale,decision_date,review_date,created_at").order("created_at",{ascending:false}),
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("leads").select("created_at,email").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("analytics_events").select("created_at,event_name").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const workRows=(workItems||[]) as any[];
  const decisionRows=(decisions||[]) as any[];
  const open=workRows.filter(w=>!["completed","canceled"].includes(w.status));
  const blocked=workRows.filter(w=>w.status==="blocked"||w.priority==="critical");
  const pendingDecisions=decisionRows.filter(d=>d.status==="proposed");
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";
  const workStatusLabel=(value:string)=>{
    if(value==="open") return "ABIERTO";
    if(value==="in_progress") return "EN CURSO";
    if(value==="blocked") return "BLOQUEADO";
    if(value==="waiting") return "EN ESPERA";
    if(value==="completed") return "COMPLETADO";
    if(value==="canceled") return "CANCELADO";
    return String(value||"").toUpperCase();
  };
  const priorityLabel=(value:string)=>{
    if(value==="low") return "Baja";
    if(value==="medium") return "Media";
    if(value==="high") return "Alta";
    if(value==="critical") return "Crítica";
    return value;
  };
  const workTypeLabel=(value:string)=>{
    if(value==="task") return "Tarea";
    if(value==="issue") return "Problema";
    if(value==="decision") return "Decisión";
    if(value==="follow_up") return "Seguimiento";
    if(value==="incident_followup") return "Seguimiento de incidente";
    if(value==="launch") return "Lanzamiento";
    if(value==="review") return "Revisión";
    return "Otro";
  };
  const decisionStatusLabel=(value:string)=>{
    if(value==="proposed") return "PROPUESTA";
    if(value==="approved") return "APROBADA";
    if(value==="rejected") return "RECHAZADA";
    if(value==="superseded") return "REEMPLAZADA";
    if(value==="implemented") return "IMPLEMENTADA";
    return String(value||"").toUpperCase();
  };

  const checks=[
    {name:"Landing FRAGMENTUN",status:"Protegida",detail:"main · baseline 8eb878e"},
    {name:"Panel LIRYGAMES",status:"Versión de prueba",detail:"work/master-admin-implementation"},
    {name:"Supabase",status:"Conectado",detail:"Auth + datos operativos"},
    {name:"Analytics",status:latestEvent?"Activo":"Pendiente",detail:latestEvent?("Último: "+latestEvent.event_name):"Sin eventos"},
    {name:"Contactos",status:latestLead?"Activo":"Pendiente",detail:latestLead?"Último registro disponible":"Sin leads"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · OPERACIONES</span><h1>Operaciones</h1><p>Trabajo pendiente, decisiones y continuidad operativa del estudio.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Trabajos abiertos</small><strong>{open.length}</strong><span>{blocked.length} bloqueados o críticos</span></article>
      <article><small>Decisiones pendientes</small><strong>{pendingDecisions.length}</strong><span>{decisionRows.length} registradas</span></article>
      <article><small>Contactos</small><strong>{(leads||0).toLocaleString()}</strong><span>Base actual</span></article>
      <article><small>Recursos multimedia</small><strong>{(media||0).toLocaleString()}</strong><span>Biblioteca</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>TRABAJO</span><h2>Trabajo pendiente</h2></div><p>Tareas, problemas, seguimientos, revisiones y lanzamientos pendientes.</p></section>
    <section className={styles.grid}>
      {workRows.map((w:any)=><article key={w.id} className={styles.card}>
        <div className={styles.cardTop}><span className={w.status==="completed"?styles.badgeActive:styles.badgePlanned}>{workStatusLabel(w.status)}</span><em>{priorityLabel(w.priority)}</em></div>
        <h3>{w.title}</h3><p>{w.domain} · {workTypeLabel(w.work_type)}<br/>Responsable: {ownerName(w.owner_user_id)}<br/>{w.due_date?"Fecha límite: "+w.due_date:"Sin fecha límite"}<br/>{w.next_action||"Próxima acción pendiente"}</p>
      </article>)}
      {!workRows.length&&<article className={styles.card}><h3>Registro de trabajo preparado</h3><p>Todavía no hay trabajos registrados.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>DECISIONES</span><h2>Decisiones</h2></div><p>Registro de decisiones operativas y estratégicas con motivo y fecha de revisión.</p></section>
    <section className={styles.grid}>
      {decisionRows.map((d:any)=><article key={d.id} className={styles.card}>
        <div className={styles.cardTop}><span className={d.status==="implemented"?styles.badgeActive:styles.badgePlanned}>{decisionStatusLabel(d.status)}</span><em>{d.domain}</em></div>
        <h3>{d.title}</h3><p>Responsable: {ownerName(d.owner_user_id)}<br/>{d.decision||"Decisión pendiente"}<br/>{d.rationale||"Motivo pendiente"}<br/>{d.review_date?"Revisión: "+d.review_date:"Sin fecha de revisión"}</p>
      </article>)}
      {!decisionRows.length&&<article className={styles.card}><h3>Sin decisiones registradas</h3><p>Las decisiones formales aparecerán aquí.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o editar trabajo y decisiones manualmente.</p>
      <section className={styles.adminForms}>
      <form action={createWorkItem} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO TRABAJO</span><h2>Registrar trabajo</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="ops-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Área<input name="domain" required placeholder="Juegos / Finanzas / Crecimiento"/></label>
          <label>Tipo<select name="work_type" defaultValue="task"><option value="task">Tarea</option><option value="issue">Problema</option><option value="decision">Decisión</option><option value="follow_up">Seguimiento</option><option value="incident_followup">Seguimiento de incidente</option><option value="launch">Lanzamiento</option><option value="review">Revisión</option><option value="other">Otro</option></select></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar trabajo</MasterSubmitButton>
      </form>

      <form action={createDecision} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA DECISIÓN</span><h2>Registrar decisión</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="decision_code" required placeholder="dec-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Área<input name="domain" required/></label>
          <label>Fecha de revisión<input type="date" name="review_date"/></label>
          <label className={styles.span2}>Decisión<textarea name="decision" rows={3}/></label>
          <label className={styles.span2}>Motivo<textarea name="rationale" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar decisión</MasterSubmitButton>
      </form>
      </section>

      <section className={styles.adminForms}>
      <form action={updateWorkItem} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR TRABAJO</span><h2>Actualizar trabajo</h2></div>
        <div className={styles.formGrid}>
          <label>Trabajo<select name="work_id" required defaultValue=""><option value="" disabled>Seleccionar</option>{workRows.map((w:any)=><option key={w.id} value={w.id}>{w.code} · {w.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="in_progress"><option value="open">Abierto</option><option value="in_progress">En curso</option><option value="blocked">Bloqueado</option><option value="waiting">En espera</option><option value="completed">Completado</option><option value="canceled">Cancelado</option></select></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!workRows.length}>Actualizar trabajo</MasterSubmitButton>
      </form>

      <form action={updateDecision} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR DECISIÓN</span><h2>Actualizar decisión</h2></div>
        <div className={styles.formGrid}>
          <label>Decisión<select name="decision_id" required defaultValue=""><option value="" disabled>Seleccionar</option>{decisionRows.map((d:any)=><option key={d.id} value={d.id}>{d.decision_code} · {d.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="proposed"><option value="proposed">Propuesta</option><option value="approved">Aprobada</option><option value="rejected">Rechazada</option><option value="superseded">Reemplazada</option><option value="implemented">Implementada</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha de revisión<input type="date" name="review_date"/></label>
          <label className={styles.span2}>Decisión<textarea name="decision" rows={3}/></label>
          <label className={styles.span2}>Motivo<textarea name="rationale" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!decisionRows.length}>Actualizar decisión</MasterSubmitButton>
      </form>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>ESTADO DEL SISTEMA</span><h2>Estado general</h2></div></section>
    <section className={styles.grid}>
      {checks.map(c=><article key={c.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{c.status.toUpperCase()}</span><em>OPERACIÓN</em></div>
        <h3>{c.name}</h3><p>{c.detail}</p>
      </article>)}
    </section>

    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Catálogo</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Universo IP</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Administración protegida</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>Sitio público intacto</span></article>
    </section>
  </main>;
}