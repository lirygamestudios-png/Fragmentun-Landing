import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireBrandEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor","marketing"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createNarrative(formData:FormData){
  "use server";
  const {supabase,user}=await requireBrandEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const audience=String(formData.get("audience")||"").trim()||null;
  const pillar=String(formData.get("message_pillar")||"").trim();
  const keyMessage=String(formData.get("key_message")||"").trim();
  const proofPoints=String(formData.get("proof_points")||"").split(",").map(x=>x.trim()).filter(Boolean);
  if(!code||!name||!pillar||!keyMessage) throw new Error("invalid_narrative");
  const{error}=await supabase.from("brand_narratives").insert({
    code,name,audience,message_pillar:pillar,key_message:keyMessage,proof_points:proofPoints,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/brand");
}

async function createCommunicationCampaign(formData:FormData){
  "use server";
  const {supabase,user}=await requireBrandEditor();
  const name=String(formData.get("name")||"").trim();
  const type=String(formData.get("campaign_type")||"brand");
  const audience=String(formData.get("audience")||"").trim()||null;
  const channels=String(formData.get("channel_scope")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const objective=String(formData.get("objective")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const allowed=new Set(["brand","pr","launch","community","investor","reputation","crisis","content","other"]);
  if(!name||!allowed.has(type)) throw new Error("invalid_campaign");
  const{error}=await supabase.from("communication_campaigns").insert({
    name,campaign_type:type,audience,channel_scope:channels,objective,start_date:startDate,end_date:endDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/brand");
}

export default async function MasterBrandPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:narratives},
    {data:commCampaigns},
    {count:content},
    {count:media},
    {count:campaigns},
    {count:reviews},
    {count:shareClicks}
  ]=await Promise.all([
    supabase.from("brand_narratives").select("id,code,name,audience,message_pillar,key_message,proof_points,status,created_at").order("created_at",{ascending:false}),
    supabase.from("communication_campaigns").select("id,name,campaign_type,status,audience,channel_scope,objective,start_date,end_date,created_at").order("created_at",{ascending:false}),
    supabase.from("localized_content").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("reviews").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click")
  ]);

  const narrativeRows=(narratives||[]) as any[];
  const commRows=(commCampaigns||[]) as any[];
  const activeNarratives=narrativeRows.filter(n=>n.status==="active").length;
  const activeComms=commRows.filter(c=>c.status==="active").length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · MARCA</span><h1>Marca & Comunicaciones</h1><p>Narrativa corporativa y campañas de comunicación persistentes, separadas del contenido operativo de cada IP.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Narrativas activas</small><strong>{activeNarratives}</strong><span>{narrativeRows.length} registradas</span></article>
      <article><small>Campañas comunicación</small><strong>{activeComms}</strong><span>{commRows.length} registradas</span></article>
      <article><small>Contenido localizado</small><strong>{(content||0).toLocaleString()}</strong><span>ES/EN operativo</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets existentes</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>MESSAGE HOUSE</span><h2>Narrativa corporativa</h2></div><p>Pilares, audiencias, mensajes y proof points del estudio.</p></section>
    <section className={styles.grid}>
      {narrativeRows.map((n:any)=><article key={n.id} className={styles.card}>
        <div className={styles.cardTop}><span className={n.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(n.status).toUpperCase()}</span><em>{n.message_pillar}</em></div>
        <h3>{n.name}</h3><p>{n.audience||"Audiencia general"}<br/>{n.key_message}<br/>{(n.proof_points||[]).length?(n.proof_points||[]).join(" · "):"Sin proof points"}</p>
      </article>)}
      {!narrativeRows.length&&<article className={styles.card}><h3>Message House preparado</h3><p>No se han cargado narrativas corporativas todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>COMMS CALENDAR</span><h2>Campañas de comunicación</h2></div></section>
    <section className={styles.grid}>
      {commRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(c.status).toUpperCase()}</span><em>{c.campaign_type}</em></div>
        <h3>{c.name}</h3><p>{c.audience||"Audiencia general"}<br/>{(c.channel_scope||[]).length?(c.channel_scope||[]).join(" · "):"Canales por definir"}<br/>{c.start_date||"sin inicio"} → {c.end_date||"abierta"}</p>
      </article>)}
      {!commRows.length&&<article className={styles.card}><h3>Calendario preparado</h3><p>Las campañas corporativas se registrarán aquí.</p></article>}
    </section>

    {["admin","editor","marketing"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createNarrative} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA NARRATIVA</span><h2>Registrar message pillar</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lirygames-core"/></label>
          <label>Nombre<input name="name" required placeholder="Narrativa corporativa"/></label>
          <label>Audiencia<input name="audience" placeholder="Jugadores / inversores / prensa"/></label>
          <label>Pilar<input name="message_pillar" required placeholder="Innovación / IP / comunidad"/></label>
          <label className={styles.span2}>Mensaje clave<textarea name="key_message" required rows={3}/></label>
          <label className={styles.span2}>Proof points<input name="proof_points" placeholder="Dato 1, dato 2, dato 3"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar narrativa</button>
      </form>

      <form action={createCommunicationCampaign} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA CAMPAÑA</span><h2>Registrar comunicación</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="campaign_type" defaultValue="brand">
            <option value="brand">Brand</option><option value="pr">PR</option><option value="launch">Launch</option><option value="community">Community</option>
            <option value="investor">Investor</option><option value="reputation">Reputation</option><option value="crisis">Crisis</option><option value="content">Content</option><option value="other">Other</option>
          </select></label>
          <label>Audiencia<input name="audience"/></label>
          <label>Canales<input name="channel_scope" placeholder="YouTube, Instagram, PR"/></label>
          <label className={styles.span2}>Objetivo<input name="objective"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar campaña</button>
      </form>
    </section>}

    <section className={styles.sectionHead}><div><span>EXISTING SIGNALS</span><h2>Activos de comunicación actuales</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Campañas Growth</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Separadas de Comms</span></article>
      <article><small>Reviews</small><strong>{(reviews||0).toLocaleString()}</strong><span>Prueba social</span></article>
      <article><small>Shares</small><strong>{(shareClicks||0).toLocaleString()}</strong><span>Eventos acumulados</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Admin / editor / marketing</span></article>
    </section>
  </main>;
}