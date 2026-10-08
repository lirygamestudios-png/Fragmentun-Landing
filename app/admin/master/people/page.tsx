import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function validPercent(value:number){
  return Number.isInteger(value)&&value>=0&&value<=100;
}
function invalidDateRange(start:string|null,end:string|null){
  return Boolean(start&&end&&end<start);
}
async function ensureAssignmentCapacity(supabase:any,memberId:string,allocation:number,excludeId?:string){
  const[{data:member},{data:assignments}]=await Promise.all([
    supabase.from("people_members").select("allocation_percent,status").eq("id",memberId).maybeSingle(),
    supabase.from("people_assignments").select("id,allocation_percent").eq("member_id",memberId).eq("status","active")
  ]);
  if(!member||member.status!=="active") throw new Error("member_not_active");
  const committed=(assignments||[])
    .filter((a:any)=>!excludeId||a.id!==excludeId)
    .reduce((sum:number,a:any)=>sum+Number(a.allocation_percent||0),0);
  const capacity=Number(member.allocation_percent??100);
  if(committed+allocation>capacity) throw new Error("member_allocation_exceeded");
}

function memberStatusLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",on_leave:"LICENCIA",inactive:"INACTIVO",ended:"FINALIZADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function employmentTypeLabel(value:string){
  const map:Record<string,string>={founder:"FUNDADOR",employee:"EMPLEADO",contractor:"CONTRATISTA",advisor:"ASESOR",partner:"SOCIO",intern:"PASANTE",other:"OTRO"};
  return map[value]||String(value||"").toUpperCase();
}

function assignmentStatusLabel(value:string){
  const map:Record<string,string>={planned:"PLANIFICADA",active:"ACTIVA",paused:"PAUSADA",completed:"COMPLETADA",canceled:"CANCELADA"};
  return map[value]||String(value||"").toUpperCase();
}

function priorityLabel(value:string){
  const map:Record<string,string>={low:"BAJA",medium:"MEDIA",high:"ALTA",critical:"CRÍTICA"};
  return map[value]||String(value||"").toUpperCase();
}

async function requirePeopleAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
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
  const allocation=Number(formData.get("allocation_percent")||100);
  const skills=String(formData.get("skills")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const allowed=new Set(["founder","employee","contractor","advisor","partner","intern","other"]);
  if(!displayName||!allowed.has(employmentType)||!validPercent(allocation)) throw new Error("invalid_member");
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
  const allocation=Number(formData.get("allocation_percent")||0);
  const priority=String(formData.get("priority")||"medium");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!memberId||!domain||!allowedPriority.has(priority)||!validPercent(allocation)||invalidDateRange(startDate,endDate)) throw new Error("invalid_assignment");
  await ensureAssignmentCapacity(supabase,memberId,allocation);
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
  const allocation=Number(formData.get("allocation_percent")||100);
  const skills=String(formData.get("skills")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["active","on_leave","inactive","ended"]);
  const{data:existing}=await supabase.from("people_members").select("start_date").eq("id",id).maybeSingle();
  if(!id||!existing||!allowedStatus.has(status)||!validPercent(allocation)||invalidDateRange(existing.start_date,endDate)||managerId===id) throw new Error("invalid_member_update");
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
  const allocation=Number(formData.get("allocation_percent")||0);
  const priority=String(formData.get("priority")||"medium");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","active","paused","completed","canceled"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  const{data:existingAssignment}=await supabase.from("people_assignments").select("member_id").eq("id",id).maybeSingle();
  if(!id||!existingAssignment||!allowedStatus.has(status)||!allowedPriority.has(priority)||!validPercent(allocation)||invalidDateRange(startDate,endDate)) throw new Error("invalid_assignment_update");
  if(status==="active") await ensureAssignmentCapacity(supabase,existingAssignment.member_id,allocation,id);
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
      <div><span className={styles.eyebrow}>LIRYGAMES · PERSONAS</span><h1>Personas</h1><p>Equipo, disponibilidad y asignaciones, separado de los permisos del sistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Miembros activos</small><strong>{activeMembers.length}</strong><span>Equipo registrado</span></article>
      <article><small>Departamentos</small><strong>{departments.size}</strong><span>Estructura registrada</span></article>
      <article><small>Asignaciones activas</small><strong>{activeAssignments.length}</strong><span>{committed}% disponibilidad asignada</span></article>
      <article><small>Usuarios administrativos</small><strong>{(adminProfiles||0).toLocaleString()}</strong><span>Acceso al sistema, no personas del equipo</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>EQUIPO</span><h2>Equipo registrado</h2></div>
      <p>El registro empieza vacío hasta cargar personas reales. Los usuarios administrativos siguen siendo únicamente una capa de acceso.</p>
    </section>

    <section className={styles.grid}>
      {memberRows.map((m:any)=><article key={m.id} className={styles.card}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{memberStatusLabel(m.status)}</span><em>{employmentTypeLabel(m.employment_type)}</em></div>
        <h3>{m.display_name}</h3>
        <p>{m.title||"Rol por definir"} · {m.department||"Sin departamento"}<br/>{m.location||"Ubicación no registrada"} · {m.allocation_percent}% disponibilidad base<br/>{(m.skills||[]).length?(m.skills||[]).join(" · "):"Habilidades por registrar"}</p>
      </article>)}
      {!memberRows.length&&<article className={styles.card}><h3>Registro de equipo preparado</h3><p>No se han cargado miembros del equipo todavía; no se infiere el tamaño del equipo desde usuarios administrativos.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ASIGNACIONES</span><h2>Asignaciones</h2></div><p>Distribución de disponibilidad por área, proyecto o línea de trabajo.</p></section>
    <section className={styles.grid}>
      {assignmentRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={a.status==="active"?styles.badgeActive:styles.badgePlanned}>{assignmentStatusLabel(a.status)}</span><em>{priorityLabel(a.priority)}</em></div>
        <h3>{a.domain}</h3>
        <p>{memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"} · {a.allocation_percent}%<br/>{a.workstream||"Línea de trabajo general"}<br/>{a.start_date||"Sin inicio"} → {a.end_date||"abierto"}</p>
      </article>)}
      {!assignmentRows.length&&<article className={styles.card}><h3>Sin asignaciones</h3><p>La capacidad se mostrará aquí cuando se distribuyan personas a dominios o proyectos reales.</p></article>}
    </section>

    {profile.role==="admin"&&<details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      <form action={createMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO MIEMBRO</span><h2>Registrar persona</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="display_name" required placeholder="Nombre completo"/></label>
          <label>Correo<input type="email" name="email" placeholder="correo@empresa.com"/></label>
          <label>Tipo<select name="employment_type" defaultValue="employee">
            <option value="founder">Fundador</option><option value="employee">Empleado</option><option value="contractor">Contratista</option>
            <option value="advisor">Asesor</option><option value="partner">Socio</option><option value="intern">Pasante</option><option value="other">Otro</option>
          </select></label>
          <label>Título<input name="title" placeholder="Dirección / Productor / Desarrollador"/></label>
          <label>Departamento<input name="department" placeholder="Publicación / Tecnología / Crecimiento"/></label>
          <label>Ubicación<input name="location" placeholder="Ciudad / trabajo remoto"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="100"/></label>
          <label className={styles.span2}>Habilidades<input name="skills" placeholder="Unity, Marketing, Producción"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar miembro</MasterSubmitButton>
      </form>

      <form action={createAssignment} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA ASIGNACIÓN</span><h2>Asignar capacidad</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue="">
            <option value="" disabled>Seleccionar miembro</option>
            {memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}
          </select></label>
          <label>Dominio<input name="domain" required placeholder="Juegos / Publicación / Crecimiento"/></label>
          <label>Línea de trabajo<input name="workstream" placeholder="Demostración jugable / Lanzamiento / Seguimiento comercial"/></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="25"/></label>
          <label>Prioridad<select name="priority" defaultValue="medium">
            <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
          </select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!memberRows.length} disabledReason="Primero registra una persona para poder crear una asignación.">Registrar asignación</MasterSubmitButton>
      </form>
    </section>

    <section className={styles.adminForms}>
      <form action={updateMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR PERSONA</span><h2>Actualizar miembro</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue=""><option value="" disabled>Seleccionar miembro</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="active">Activo</option><option value="on_leave">Licencia</option><option value="inactive">Inactivo</option><option value="ended">Finalizado</option></select></label>
          <label>Título<input name="title"/></label>
          <label>Departamento<input name="department"/></label>
          <label>Responsable<select name="manager_id" defaultValue=""><option value="">Sin responsable</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name}</option>)}</select></label>
          <label>Ubicación<input name="location"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent" defaultValue="100"/></label>
          <label className={styles.span2}>Habilidades<input name="skills" placeholder="Unity, Marketing, Producción"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!memberRows.length} disabledReason="No hay personas registradas para actualizar.">Actualizar miembro</MasterSubmitButton>
      </form>

      <form action={updateAssignment} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR ASIGNACIÓN</span><h2>Actualizar capacidad</h2></div>
        <div className={styles.formGrid}>
          <label>Asignación<select name="assignment_id" required defaultValue=""><option value="" disabled>Seleccionar asignación</option>{assignmentRows.map((a:any)=><option key={a.id} value={a.id}>{memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"} · {a.domain}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="planned">Planificada</option><option value="active">Activa</option><option value="paused">Pausada</option><option value="completed">Completada</option><option value="canceled">Cancelada</option></select></label>
          <label>Disponibilidad %<input type="number" min="0" max="100" name="allocation_percent"/></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!assignmentRows.length} disabledReason="No hay asignaciones registradas para actualizar.">Actualizar asignación</MasterSubmitButton>
      </form>
    </section></details>}

    <section className={styles.sectionHead}><div><span>SEÑALES ADMINISTRATIVAS</span><h2>Señales administrativas</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Actividad administrativa</small><strong>{(activity||0).toLocaleString()}</strong><span>Historial de auditoría</span></article>
      <article><small>Equipo inferido</small><strong>NO</strong><span>Solo datos explícitos</span></article>
      <article><small>Compensación</small><strong>NO CARGADA</strong><span>Se gestionará en una capa separada</span></article>
      <article><small>Control de acceso</small><strong>ACTIVO</strong><span>Edición solo para administradores</span></article>
    </section>
  </main>;
}
