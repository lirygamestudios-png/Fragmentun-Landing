import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireCommunityEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor","marketing"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createMember(formData:FormData){
  "use server";
  const {supabase,user}=await requireCommunityEditor();
  const displayName=String(formData.get("display_name")||"").trim()||null;
  const email=String(formData.get("email")||"").trim()||null;
  const handle=String(formData.get("handle")||"").trim()||null;
  const source=String(formData.get("source")||"").trim()||null;
  const tier=String(formData.get("tier")||"member");
  const allowed=new Set(["member","engaged","advocate","beta_priority","moderator"]);
  if(!displayName&&!email) throw new Error("member_identity_required");
  if(!allowed.has(tier)) throw new Error("invalid_tier");
  const{error}=await supabase.from("community_members").insert({
    display_name:displayName,email,handle,source,tier,beta_priority:tier==="beta_priority",created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/community");
}

async function addAction(formData:FormData){
  "use server";
  const {supabase,user}=await requireCommunityEditor();
  const memberId=String(formData.get("member_id")||"").trim();
  const type=String(formData.get("action_type")||"other");
  const source=String(formData.get("source")||"").trim()||null;
  const description=String(formData.get("description")||"").trim()||null;
  const delta=Number(formData.get("points_delta")||0);
  const allowed=new Set(["share","referral","comment","event","survey","beta_signup","beta_feedback","purchase","community_join","other"]);
  if(!memberId||!allowed.has(type)||!Number.isFinite(delta)) throw new Error("invalid_action");
  const{error}=await supabase.from("community_actions").insert({
    member_id:memberId,action_type:type,source,description,points_delta:Math.trunc(delta),created_by:user.id
  });
  if(error) throw new Error(error.message);
  if(delta!==0){
    const{data:m}=await supabase.from("community_members").select("points").eq("id",memberId).maybeSingle();
    await supabase.from("community_members").update({
      points:Math.max(0,Number(m?.points||0)+Math.trunc(delta)),
      last_activity_at:new Date().toISOString(),updated_at:new Date().toISOString()
    }).eq("id",memberId);
  }
  revalidatePath("/admin/master/community");
}


async function updateMember(formData:FormData){
  "use server";
  const {supabase}=await requireCommunityEditor();
  const id=String(formData.get("member_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const tier=String(formData.get("tier")||"member");
  const source=String(formData.get("source")||"").trim()||null;
  const points=Math.max(0,Math.trunc(Number(formData.get("points")||0)));
  const betaPriority=String(formData.get("beta_priority")||"false")==="true";
  const tags=String(formData.get("tags")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["active","inactive","blocked","left"]);
  const allowedTier=new Set(["member","engaged","advocate","beta_priority","moderator"]);
  if(!id||!allowedStatus.has(status)||!allowedTier.has(tier)||!Number.isFinite(points)) throw new Error("invalid_member_update");
  const{error}=await supabase.from("community_members").update({
    status,tier,points,beta_priority:betaPriority||tier==="beta_priority",source,tags,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/community");
}

export default async function CommunityPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[{data:members},{data:actions},{count:crmContacts},{count:shareClicks}]=await Promise.all([
    supabase.from("community_members").select("id,display_name,handle,email,status,tier,points,beta_priority,source,joined_at,last_activity_at,tags,notes").order("points",{ascending:false}),
    supabase.from("community_actions").select("id,member_id,action_type,source,points_delta,description,occurred_at").order("occurred_at",{ascending:false}).limit(50),
    supabase.from("crm_contacts").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click")
  ]);

  const memberRows=(members||[]) as any[];
  const actionRows=(actions||[]) as any[];
  const active=memberRows.filter(m=>m.status==="active");
  const beta=memberRows.filter(m=>m.beta_priority||m.tier==="beta_priority");
  const advocates=memberRows.filter(m=>m.tier==="advocate");
  const totalPoints=memberRows.reduce((a,m)=>a+Number(m.points||0),0);

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · COMUNIDAD</span><h1>Clientes & Comunidad</h1><p>Miembros, participación, prioridad beta y señales de comunidad sin duplicar el CRM.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Miembros activos</small><strong>{active.length}</strong><span>{memberRows.length} registrados</span></article>
      <article><small>Beta priority</small><strong>{beta.length}</strong><span>Acceso prioritario</span></article>
      <article><small>Advocates</small><strong>{advocates.length}</strong><span>Comunidad avanzada</span></article>
      <article><small>Puntos</small><strong>{totalPoints.toLocaleString()}</strong><span>Participación acumulada</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>COMMUNITY MASTER</span><h2>Miembros</h2></div><p>El CRM conserva lifecycle comercial; este registro cubre relación comunitaria y participación.</p></section>
    <section className={styles.grid}>
      {memberRows.map((m:any)=><article key={m.id} className={styles.card}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(m.tier).toUpperCase()}</span><em>{m.points} pts</em></div>
        <h3>{m.display_name||m.handle||m.email||"Miembro"}</h3>
        <p>{m.handle||m.email||"Sin handle/email"}<br/>{m.source||"Fuente no registrada"}<br/>{m.beta_priority?"Beta prioritario":"Acceso beta estándar"}</p>
      </article>)}
      {!memberRows.length&&<article className={styles.card}><h3>Community Master preparado</h3><p>No se han creado miembros ficticios. El registro empieza vacío.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ACTIVITY</span><h2>Participación reciente</h2></div></section>
    <section className={styles.grid}>
      {actionRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{String(a.action_type).toUpperCase()}</span><em>{a.points_delta>=0?"+":""}{a.points_delta}</em></div>
        <h3>{memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"}</h3><p>{a.description||a.source||"Actividad registrada"}<br/>{new Date(a.occurred_at).toLocaleString("es-US")}</p>
      </article>)}
      {!actionRows.length&&<article className={styles.card}><h3>Sin actividad manual aún</h3><p>Shares, referrals, beta feedback y otras acciones podrán registrarse aquí.</p></article>}
    </section>

    {["admin","editor","marketing"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO MIEMBRO</span><h2>Registrar comunidad</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="display_name"/></label>
          <label>Email<input type="email" name="email"/></label>
          <label>Handle<input name="handle"/></label>
          <label>Fuente<input name="source" placeholder="LiryBoost / Discord / web"/></label>
          <label>Tier<select name="tier" defaultValue="member"><option value="member">Member</option><option value="engaged">Engaged</option><option value="advocate">Advocate</option><option value="beta_priority">Beta priority</option><option value="moderator">Moderator</option></select></label>
        </div>
        <button className={styles.formButton}>Registrar miembro</button>
      </form>

      <form action={addAction} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA ACTIVIDAD</span><h2>Registrar participación</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue=""><option value="" disabled>Seleccionar miembro</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name||m.handle||m.email}</option>)}</select></label>
          <label>Tipo<select name="action_type" defaultValue="share"><option value="share">Share</option><option value="referral">Referral</option><option value="comment">Comment</option><option value="event">Event</option><option value="survey">Survey</option><option value="beta_signup">Beta signup</option><option value="beta_feedback">Beta feedback</option><option value="purchase">Purchase</option><option value="community_join">Community join</option><option value="other">Other</option></select></label>
          <label>Puntos<input type="number" name="points_delta" defaultValue="0"/></label>
          <label>Fuente<input name="source"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!memberRows.length}>Registrar actividad</button>
      </form>
    </section>}


    {["admin","editor","marketing"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={updateMember} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR MIEMBRO</span><h2>Actualizar comunidad</h2></div>
        <div className={styles.formGrid}>
          <label>Miembro<select name="member_id" required defaultValue=""><option value="" disabled>Seleccionar miembro</option>{memberRows.map((m:any)=><option key={m.id} value={m.id}>{m.display_name||m.handle||m.email}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="active"><option value="active">Active</option><option value="inactive">Inactive</option><option value="blocked">Blocked</option><option value="left">Left</option></select></label>
          <label>Tier<select name="tier" defaultValue="member"><option value="member">Member</option><option value="engaged">Engaged</option><option value="advocate">Advocate</option><option value="beta_priority">Beta priority</option><option value="moderator">Moderator</option></select></label>
          <label>Beta priority<select name="beta_priority" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Puntos<input type="number" min="0" name="points" defaultValue="0"/></label>
          <label>Fuente<input name="source"/></label>
          <label className={styles.span2}>Tags<input name="tags" placeholder="beta, advocate, creator"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!memberRows.length}>Actualizar miembro</button>
      </form>
    </section>}

    <section className={styles.kpis}>
      <article><small>CRM contacts</small><strong>{(crmContacts||0).toLocaleString()}</strong><span>Lifecycle comercial separado</span></article>
      <article><small>Share clicks</small><strong>{(shareClicks||0).toLocaleString()}</strong><span>Analytics existente</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Admin/editor/marketing</span></article>
      <article><small>LiryBoost</small><strong>BASE LISTA</strong><span>Ranking puede conectarse después</span></article>
    </section>
  </main>;
}