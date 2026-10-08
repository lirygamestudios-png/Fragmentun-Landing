import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function narrativeEstadoLabel(value:string){
  const map:Record<string,string>={draft:"BORRADOR",review:"EN REVISIÓN",active:"ACTIVA",archived:"ARCHIVADA"};
  return map[value]||String(value||"").toUpperCase();
}

function campaignEstadoLabel(value:string){
  const map:Record<string,string>={planned:"PLANIFICADA",active:"ACTIVA",paused:"PAUSADA",completed:"COMPLETADA",canceled:"CANCELADA"};
  return map[value]||String(value||"").toUpperCase();
}

function campaignTypeLabel(value:string){
  const map:Record<string,string>={brand:"MARCA",pr:"PRENSA Y RELACIONES PÚBLICAS",launch:"LANZAMIENTO",community:"COMUNIDAD",investor:"INVERSIONISTAS",reputation:"REPUTACIÓN",crisis:"CRISIS",content:"CONTENIDO",other:"OTRO"};
  return map[value]||String(value||"").toUpperCase();
}

async function requireBrandEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
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


async function updateNarrative(formData:FormData){
  "use server";
  const {supabase}=await requireBrandEditor();
  const id=String(formData.get("narrative_id")||"").trim();
  const status=String(formData.get("status")||"review");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const audience=String(formData.get("audience")||"").trim()||null;
  const pillar=String(formData.get("message_pillar")||"").trim()||null;
  const keyMessage=String(formData.get("key_message")||"").trim()||null;
  const proofPoints=String(formData.get("proof_points")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["draft","review","active","archived"]);
  if(!id||!allowedEstado.has(status)) throw new Error("invalid_narrative_update");
  const patch:any={status,owner_user_id:ownerUserId,audience,notes,updated_at:new Date().toISOString()};
  if(pillar) patch.message_pillar=pillar;
  if(keyMessage) patch.key_message=keyMessage;
  if(proofPoints.length) patch.proof_points=proofPoints;
  const{error}=await supabase.from("brand_narratives").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/brand");
}

async function updateCommunicationCampaign(formData:FormData){
  "use server";
  const {supabase}=await requireBrandEditor();
  const id=String(formData.get("campaign_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const audience=String(formData.get("audience")||"").trim()||null;
  const channels=String(formData.get("channel_scope")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const objective=String(formData.get("objective")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["planned","active","paused","completed","canceled"]);
  if(!id||!allowedEstado.has(status)) throw new Error("invalid_comms_update");
  const{error}=await supabase.from("communication_campaigns").update({
    status,owner_user_id:ownerUserId,audience,channel_scope:channels,objective,start_date:startDate,end_date:endDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
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
    {count:shareClicks},
    {data:owners}
  ]=await Promise.all([
    supabase.from("brand_narratives").select("id,code,name,audience,message_pillar,key_message,proof_points,status,owner_user_id,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("communication_campaigns").select("id,name,campaign_type,status,audience,channel_scope,objective,start_date,end_date,owner_user_id,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("localized_content").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("reviews").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click"),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const narrativeRows=(narratives||[]) as any[];
  const commRows=(commCampaigns||[]) as any[];
  const activeNarratives=narrativeRows.filter(n=>n.status==="active").length;
  const activeComms=commRows.filter(c=>c.status==="active").length;
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · MARCA Y COMUNICACIONES</span><h1>Marca y Comunicaciones</h1><p>Narrativa corporativa y campañas de comunicación persistentes, separadas del contenido operativo de cada IP.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Narrativas activas</small><strong>{activeNarratives}</strong><span>{narrativeRows.length} registradas</span></article>
      <article><small>Campañas comunicación</small><strong>{activeComms}</strong><span>{commRows.length} registradas</span></article>
      <article><small>Contenido localizado</small><strong>{(content||0).toLocaleString()}</strong><span>Español e inglés</span></article>
      <article><small>Multimedia</small><strong>{(media||0).toLocaleString()}</strong><span>Activos existentes</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>NARRATIVA CORPORATIVA</span><h2>Narrativa corporativa</h2></div><p>Pilares, audiencias, mensajes y evidencias de respaldo del estudio.</p></section>
    <section className={styles.grid}>
      {narrativeRows.map((n:any)=><article key={n.id} className={styles.card}>
        <div className={styles.cardTop}><span className={n.status==="active"?styles.badgeActive:styles.badgePlanned}>{narrativeEstadoLabel(n.status)}</span><em>{n.message_pillar}</em></div>
        <h3>{n.name}</h3><p>Responsable: {ownerName(n.owner_user_id)}<br/>{n.audience||"Audiencia general"}<br/>{n.key_message}<br/>{(n.proof_points||[]).length?(n.proof_points||[]).join(" · "):"Sin evidencias de respaldo"}</p>
      </article>)}
      {!narrativeRows.length&&<article className={styles.card}><h3>Narrativa corporativa preparada</h3><p>No se han cargado narrativas corporativas todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CALENDARIO DE COMUNICACIÓN</span><h2>Campañas de comunicación</h2></div></section>
    <section className={styles.grid}>
      {commRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="active"?styles.badgeActive:styles.badgePlanned}>{campaignEstadoLabel(c.status)}</span><em>{campaignTypeLabel(c.campaign_type)}</em></div>
        <h3>{c.name}</h3><p>Responsable: {ownerName(c.owner_user_id)}<br/>{c.audience||"Audiencia general"}<br/>{(c.channel_scope||[]).length?(c.channel_scope||[]).join(" · "):"Canales por definir"}<br/>{c.start_date||"sin inicio"} → {c.end_date||"abierta"}</p>
      </article>)}
      {!commRows.length&&<article className={styles.card}><h3>Calendario preparado</h3><p>Las campañas corporativas se registrarán aquí.</p></article>}
    </section>

    {["admin","editor","marketing"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar narrativas y campañas de comunicación manualmente.</p>
      <section className={styles.adminForms}>
      <form action={createNarrative} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA NARRATIVA</span><h2>Registrar narrativa</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lirygames-core"/></label>
          <label>Nombre<input name="name" required placeholder="Narrativa corporativa"/></label>
          <label>Audiencia<input name="audience" placeholder="Jugadores / inversores / prensa"/></label>
          <label>Pilar<input name="message_pillar" required placeholder="Innovación / IP / comunidad"/></label>
          <label className={styles.span2}>Mensaje clave<textarea name="key_message" required rows={3}/></label>
          <label className={styles.span2}>Evidencias de respaldo<input name="proof_points" placeholder="Dato 1, dato 2, dato 3"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar narrativa</MasterSubmitButton>
      </form>

      <form action={createCommunicationCampaign} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA CAMPAÑA</span><h2>Registrar comunicación</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="campaign_type" defaultValue="brand">
            <option value="brand">Marca</option><option value="pr">Prensa y relaciones públicas</option><option value="launch">Lanzamiento</option><option value="community">Comunidad</option>
            <option value="investor">Inversionistas</option><option value="reputation">Reputación</option><option value="crisis">Crisis</option><option value="content">Contenido</option><option value="other">Otro</option>
          </select></label>
          <label>Audiencia<input name="audience"/></label>
          <label>Canales<input name="channel_scope" placeholder="YouTube, Instagram, prensa"/></label>
          <label className={styles.span2}>Objetivo<input name="objective"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar campaña</MasterSubmitButton>
      </form>
      </section>

      <section className={styles.adminForms}>
      <form action={updateNarrative} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR NARRATIVA</span><h2>Actualizar narrativa</h2></div>
        <div className={styles.formGrid}>
          <label>Narrativa<select name="narrative_id" required defaultValue=""><option value="" disabled>Seleccionar narrativa</option>{narrativeRows.map((n:any)=><option key={n.id} value={n.id}>{n.code} · {n.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="review"><option value="draft">Borrador</option><option value="review">En revisión</option><option value="active">Activa</option><option value="archived">Archivada</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Audiencia<input name="audience"/></label>
          <label>Pilar<input name="message_pillar"/></label>
          <label className={styles.span2}>Mensaje clave<textarea name="key_message" rows={3}/></label>
          <label className={styles.span2}>Evidencias de respaldo<input name="proof_points"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!narrativeRows.length} disabledReason="No hay narrativas registradas para actualizar.">Actualizar narrativa</MasterSubmitButton>
      </form>

      <form action={updateCommunicationCampaign} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR COMUNICACIÓN</span><h2>Actualizar campaña</h2></div>
        <div className={styles.formGrid}>
          <label>Campaña<select name="campaign_id" required defaultValue=""><option value="" disabled>Seleccionar campaña</option>{commRows.map((x:any)=><option key={x.id} value={x.id}>{x.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="planned">Planificada</option><option value="active">Activa</option><option value="paused">Pausada</option><option value="completed">Completada</option><option value="canceled">Cancelada</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Audiencia<input name="audience"/></label>
          <label>Canales<input name="channel_scope"/></label>
          <label className={styles.span2}>Objetivo<input name="objective"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!commRows.length} disabledReason="No hay campañas de comunicación registradas para actualizar.">Actualizar campaña</MasterSubmitButton>
      </form>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>ACTIVOS ACTUALES</span><h2>Activos de comunicación actuales</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Campañas de crecimiento</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Separadas de comunicación</span></article>
      <article><small>Reseñas</small><strong>{(reviews||0).toLocaleString()}</strong><span>Prueba social</span></article>
      <article><small>Compartidos</small><strong>{(shareClicks||0).toLocaleString()}</strong><span>Eventos acumulados</span></article>
      <article><small>Acceso a datos</small><strong>PROTEGIDO</strong><span>Administración, edición y marketing</span></article>
    </section>
  </main>;
}