import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requirePeopleAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createMember(formData:FormData){
  "use server";
  const {supabase,user}=await requirePeopleAdmin();
  const displayName=String(formData.get("display_name")||"").trim();
  const email=String(formData.get("email")||"").trim()||null;
  const employmentType=String(formData.get("employment_type")||"employee");
  const title=String(formData.get("title")||"").trim()||null;
  const department=String(formData.get("department")||"").trim()||null;
  const location=String(formData.get("location")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const allocation=Math.max(0,Math.min(100,Number(formData.get("allocation_percent")||100)));
  const skills=String(formData.get("skills")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const allowed=new Set(["founder","employee","contractor","advisor","partner","intern","other"]);
  if(!displayName||!allowed.has(employmentType)||!Number.isFinite(allocation)) throw new Error("invalid_member");
  const{error}=await supabase.from("people_members").insert({
    display_name:displayName,email,employment_type:employmentType,title,department,location,
    start_date:startDate,allocation_percent:allocation,skills,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/people");
}

async function createAssignment(formData:FormData){
  "use server";
  const {supabase,user}=await requirePeopleAdmin();
  const memberId=String(formData.get("member_id")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const workstream=String(formData.get("workstream")||"").trim()||null;
  const allocation=Math.max(0,Math.min(100,Number(formData.get("allocation_percent")||0)));
  const priority=String(formData.get("priority")||"medium");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!memberId||!domain||!allowedPriority.has(priority)||!Number.isFinite(allocation)) throw new Error("invalid_assignment");
  const{error}=await supabase.from("people_assignments").insert({
    member_id:memberId,domain,workstream,allocation_percent:allocation,priority,start_date:startDate,end_date:endDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/people");
}


async function updateMember(formData:FormData){
  "use server";
  const {supabase}=await requirePeopleAdmin();
  const id=String(formData.get("member_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const title=String(formData.get("title")||"").trim()||null;
  const department=String(formData.get("department")||"").trim()||null;
  const managerRaw=String(formData.get("manager_id")||"").trim();
  const managerId=managerRaw||null;
  const location=String(formData.get("location")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const allocation=Math.max(0,Math.min(100,Number(formData.get("allocation_percent")||100)));
  const skills=String(formData.get("skills")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["active","on_leave","inactive","ended"]);
  if(!id||!allowedStatus.has(status)||!Number.isFinite(allocation)) throw new Error("invalid_member_update");
  const{error}=await supabase.from("people_members").update({
    status,title,department,manager_id:managerId,location,end_date:endDate,
    allocation_percent:Math.trunc(allocation),skills,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/people");
}

async function updateAssignment(formData:FormData){
  "use server";
  const {supabase}=await requirePeopleAdmin();
  const id=String(formData.get("assignment_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const allocation=Math.max(0,Math.min(100,Number(formData.get("allocation_percent")||0)));
  const priority=String(formData.get("priority")||"medium");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","active","paused","completed","canceled"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!id||!allowedStatus.has(status)||!allowedPriority.has(priority)||!Number.isFinite(allocation)) throw new Error("invalid_assignment_update");
  const{error}=await supabase.from("people_assignments").update({
    status,allocation_percent:Math.trunc(allocation),priority,start_date:startDate,end_date:endDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/people");
}

export default async function MasterPeoplePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:members},
    {data:assignments},
    {count:adminProfiles},
    {count:activity}
  ]=await Promise.all([
    supabase.from("people_members").select("id,display_name,email,employment_type,status,title,department,manager_id,location,start_date,end_date,allocation_percent,skills,notes,created_at").order("display_name",{ascending:true}),
    supabase.from("people_assignments").select("id,member_id,domain,workstream,allocation_percent,priority,status,start_date,end_date,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true})
  ]);

  const memberRows=(members||[]) as any[];
  const assignmentRows=(assignments||[]) as any[];
  const activeMembers=memberRows.filter(m=>m.status==="active");
  const activeAssignments=assignmentRows.filter(a=>a.status==="active");
  const committed=activeAssignments.reduce((a,x)=>a+Number(x.allocation_percent||0),0);
  const departments=new Set(activeMembers.map(m=>m.department).filter(Boolean));

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PERSONAS</span><h1>Personas</h1><p>Registro corporativo de equipo, capacidad y asignaciones, separado de los permisos del sistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Miembros activos</small><strong>{activeMembers.length}</strong><span>people_members</span></article>
      <article><small>Departamentos</small><strong>{departments.size}</strong><span>Estructura registrada</span></article>
      <article><small>Asignaciones activas</small><strong>{activeAssignments.length}</strong><span>{committed}% allocation acumulado</span></article>
      <article><small>Perfiles admin</small><strong>{(adminProfiles||0).toLocaleString()}</strong><span>Acceso al sistema, no headcount</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>PEOPLE MASTER</span><h2>Equipo registrado</h2></div>
      <p>El registro empieza vacío hasta cargar personas reales. admin_profiles sigue siendo únicamente una capa de autorización.</p>
    </section>

    <section className={styles.grid}>
      {memberRows.map((m:any)=><article key={m.id} className={styles.card}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(m.status).toUpperCase()}</span><em>{m.employment_type}</em></div>
        <h3>{m.display_name}</h3>
        <p>{m.title||"Rol por definir"} · {m.department||"Sin departamento"}<br/>{m.location||"Ubicación no registrada"} · {m.allocation_percent}% disponibilidad base<br/>{(m.skills||[]).length?(m.skills||[]).join(" · "):"Skills por registrar"}</p>
      </article>)}
      {!memberRows.length&&<article className={styles.card}><h3>People Master preparado</h3><p>No se han cargado miembros del equipo todavía; no se infiere headcount desde usuarios administrativos.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CAPACITY</span><h2>Asignaciones</h2></div><p>Distribución de capacidad por dominio o workstream.</p></section>
    <section className={styles.grid}>
      {assignmentRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={a.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(a.status).toUpperCase()}</span><em>{a.priority}</em></div>
        <h3>{a.domain}</h3>
        <p>{memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"} · {a.allocation_percent}%<br/>{a.workstream||"Workstream general"}<br/>{a.start_date||"Sin inicio"} → {a.end_date||"abierto"}</p>
      </article>)}
      {!assignmentRows.length&&<article className={styles.card}><h3>Sin asignaciones</h3><p>La capacidad se mostrará aquí cuando se distribuyan personas a dominios o proyectos reales.</p></article>}
    </section>

    {profile.role==="admin"&&<section className={styles.adminForms}>
      <form action={createMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO MIEMBRO</span><h2>Registrar persona</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="display_name" required placeholder="Nombre completo"/></label>
          <label>Email<input type="email" name="email" placeholder="correo@empresa.com"/></label>
          <label>Tipo<select name="employment_type" defaultValue="employee">
            <option value="founder">Founder</option><option value="employee">Employee</option><option value="contractor">Contractor</option>
            <option value="advisor">Advisor</option><option value="partner">Partner</option><option value="intern">Intern</option><option value="other">Other</option>
          </select></label>
          <label>Título<input name="title" placeholder="CEO / Producer / Developer"/></label>
          <label>Departamento<input name="department" placeholder="Publishing / Technology / Growth"/></label>
          <label>Ubicación<input name="location" placeholder="Ciudad / remoto"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="100"/></label>
          <label className={styles.span2}>Skills<input name="skills" placeholder="Unity, Marketing, Production"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar miembro</button>
      </form>

      <form action={createAssignment} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA ASIGNACIÓN</span><h2>Asignar capacidad</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue="">
            <option value="" disabled>Seleccionar miembro</option>
            {memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}
          </select></label>
          <label>Dominio<input name="domain" required placeholder="Games / Publishing / Growth"/></label>
          <label>Workstream<input name="workstream" placeholder="Vertical Slice / Launch / CRM"/></label>
          <label>Allocation %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="25"/></label>
          <label>Prioridad<select name="priority" defaultValue="medium">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!memberRows.length}>Registrar asignación</button>
      </form>
    </section>}


    {profile.role==="admin"&&<section className={styles.adminForms}>
      <form action={updateMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR PERSONA</span><h2>Actualizar miembro</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue=""><option value="" disabled>Seleccionar miembro</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="active"><option value="active">Active</option><option value="on_leave">On leave</option><option value="inactive">Inactive</option><option value="ended">Ended</option></select></label>
          <label>Título<input name="title"/></label>
          <label>Departamento<input name="department"/></label>
          <label>Manager<select name="manager_id" defaultValue=""><option value="">Sin manager</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}</select></label>
          <label>Ubicación<input name="location"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="100"/></label>
          <label className={styles.span2}>Skills<input name="skills" placeholder="Unity, Marketing, Production"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!memberRows.length}>Actualizar miembro</button>
      </form>

      <form action={updateAssignment} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR ASIGNACIÓN</span><h2>Actualizar capacidad</h2></div>
        <div className={styles.formGrid}>
          <label>Asignación<select name="assignment_id" required defaultValue=""><option value="" disabled>Seleccionar asignación</option>{assignmentRows.map((a:any)=><option key={a.id} value={a.id}>{memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"} · {a.domain}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="active"><option value="planned">Planned</option><option value="active">Active</option><option value="paused">Paused</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select></label>
          <label>Allocation %<input type="number" min="0" max="100" name="allocation_percent"/></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!assignmentRows.length}>Actualizar asignación</button>
      </form>
    </section>}

    <section className={styles.sectionHead}><div><span>GOVERNANCE</span><h2>Señales administrativas</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Admin activity</small><strong>{(activity||0).toLocaleString()}</strong><span>Audit trail</span></article>
      <article><small>Headcount inferred</small><strong>NO</strong><span>Solo datos explícitos</span></article>
      <article><small>Compensación</small><strong>NO CARGADA</strong><span>Capa separada futura</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Escritura solo Admin</span></article>
    </section>
  </main>;
}
