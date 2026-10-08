import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";


function lifecycleLabel(value:string){
  const map:Record<string,string>={subscriber:"SUSCRIPTOR",lead:"CONTACTO",mql:"INTERESADO",sql:"CONTACTO CALIFICADO",opportunity:"OPORTUNIDAD",customer:"CLIENTE",advocate:"PROMOTOR",inactive:"INACTIVO"};
  return map[value]||String(value||"").toUpperCase();
}

function contactStatusLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",nurturing:"EN SEGUIMIENTO",qualified:"CALIFICADO",contacted:"CONTACTADO",won:"CONVERTIDO",lost:"PERDIDO",unsubscribed:"BAJA",suppressed:"BLOQUEADO"};
  return map[value]||String(value||"").toUpperCase();
}

function activityLabel(value:string){
  const map:Record<string,string>={note:"NOTA",email:"CORREO",call:"LLAMADA",dm:"MENSAJE DIRECTO",meeting:"REUNIÓN",form:"FORMULARIO",test:"PRUEBA",share:"COMPARTIDO",amazon_click:"CLIC AMAZON",purchase:"COMPRA",status_change:"CAMBIO DE ESTADO",score_change:"CAMBIO DE PRIORIDAD",other:"OTRO"};
  return map[value]||String(value||"").toUpperCase();
}

async function requireGrowthEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor","marketing"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function updateContact(formData:FormData){
  "use server";
  const {supabase,user}=await requireGrowthEditor();
  const contactId=String(formData.get("contact_id")||"").trim();
  const lifecycle=String(formData.get("lifecycle_stage")||"lead");
  const status=String(formData.get("status")||"active");
  const score=Number(formData.get("score")||0);
  const notes=String(formData.get("notes")||"").trim()||null;
  const nextAction=String(formData.get("next_action_at")||"").trim()||null;
  const allowedEtapa=new Set(["subscriber","lead","mql","sql","opportunity","customer","advocate","inactive"]);
  const allowedStatus=new Set(["active","nurturing","qualified","contacted","won","lost","unsubscribed","suppressed"]);
  if(!contactId||!allowedEtapa.has(lifecycle)||!allowedStatus.has(status)||!Number.isFinite(score)||!Number.isInteger(score)||score<0||score>100) throw new Error("invalid_contact_update");

  const{data:before,error:beforeError}=await supabase.from("crm_contacts").select("lifecycle_stage,status,score,notes").eq("id",contactId).maybeSingle();
  if(beforeError) throw new Error(beforeError.message);
  if(!before) throw new Error("contact_not_found");
  const{error}=await supabase.from("crm_contacts").update({
    lifecycle_stage:lifecycle,status,score,notes,next_action_at:nextAction,updated_at:new Date().toISOString()
  }).eq("id",contactId);
  if(error) throw new Error(error.message);

  const changes:string[]=[];
  if(before?.lifecycle_stage!==lifecycle) changes.push("lifecycle "+before?.lifecycle_stage+" → "+lifecycle);
  if(before?.status!==status) changes.push("status "+before?.status+" → "+status);
  if(before?.score!==score) changes.push("score "+String(before?.score??"—")+" → "+String(score));
  if(changes.length){
    const{error:activityError}=await supabase.from("crm_activities").insert({
      contact_id:contactId,activity_type:"status_change",direction:"system",
      subject:"Seguimiento actualizado",body:changes.join(" · "),created_by:user.id
    });
    if(activityError) throw new Error(activityError.message);
  }
  revalidatePath("/admin/master/growth");
}

async function addActivity(formData:FormData){
  "use server";
  const {supabase,user}=await requireGrowthEditor();
  const contactId=String(formData.get("contact_id")||"").trim();
  const type=String(formData.get("activity_type")||"note");
  const subject=String(formData.get("subject")||"").trim()||null;
  const body=String(formData.get("body")||"").trim()||null;
  const allowed=new Set(["note","email","call","dm","meeting","form","test","share","amazon_click","purchase","status_change","score_change","other"]);
  if(!contactId||!allowed.has(type)) throw new Error("invalid_activity");
  const{error}=await supabase.from("crm_activities").insert({
    contact_id:contactId,activity_type:type,direction:"outbound",subject,body,created_by:user.id
  });
  if(error) throw new Error(error.message);
  const{error:touchError}=await supabase.from("crm_contacts").update({
    last_activity_at:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",contactId);
  if(touchError) throw new Error(touchError.message);
  revalidatePath("/admin/master/growth");
}

export default async function MasterGrowthPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since30=new Date(Date.now()-30*86400000).toISOString();
  const[
    {count:views},
    {count:leads},
    {count:amazonClicks},
    {count:shareClicks},
    {count:campaigns},
    {data:contacts},
    {data:activities}
  ]=await Promise.all([
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since30),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click").gte("created_at",since30),
    supabase.from("campaigns").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("crm_contacts").select("id,lead_id,lifecycle_stage,status,score,next_action_at,last_activity_at,tags,notes,updated_at,leads(name,email,locale,source,medium,campaign,consent_marketing,mailerlite_status,emotional_profile,created_at)").order("score",{ascending:false}),
    supabase.from("crm_activities").select("id,contact_id,activity_type,subject,body,occurred_at").order("occurred_at",{ascending:false}).limit(30)
  ]);

  const leadRate=(views||0)>0?((leads||0)/(views||1))*100:0;
  const amazonCtr=(views||0)>0?((amazonClicks||0)/(views||1))*100:0;
  const shareRate=(views||0)>0?((shareClicks||0)/(views||1))*100:0;
  const contactRows=(contacts||[]) as any[];
  const activityRows=(activities||[]) as any[];
  const qualified=contactRows.filter(x=>["mql","sql","opportunity","customer"].includes(x.lifecycle_stage)).length;
  const customers=contactRows.filter(x=>x.lifecycle_stage==="customer"||x.status==="won").length;
  const avgPrioridad=contactRows.length?contactRows.reduce((a,x)=>a+Number(x.score||0),0)/contactRows.length:0;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CRECIMIENTO</span><h1>Crecimiento</h1><p>Captación, conversión y seguimiento de contactos conectados al embudo real de FRAGMENTUN.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Visitas 30 días</small><strong>{(views||0).toLocaleString()}</strong><span>Entrada al embudo</span></article>
      <article><small>Contactos 30 días</small><strong>{(leads||0).toLocaleString()}</strong><span>{leadRate.toFixed(1)}% conversión</span></article>
      <article><small>Paso a Amazon</small><strong>{amazonCtr.toFixed(1)}%</strong><span>{(amazonClicks||0).toLocaleString()} clics</span></article>
      <article><small>Compartidos</small><strong>{shareRate.toFixed(1)}%</strong><span>{(shareClicks||0).toLocaleString()} compartidos</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>CONTACTOS</span><h2>Contactos y etapas</h2></div>
      <p>{(campaigns||0).toLocaleString()} campañas activas · {qualified} contactos cualificados · {customers} clientes · prioridad promedio {avgPrioridad.toFixed(0)}/100.</p>
    </section>

    <section className={styles.grid}>
      {contactRows.map((contact:any)=><article key={contact.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={["customer","advocate"].includes(contact.lifecycle_stage)?styles.badgeActive:styles.badgePlanned}>{lifecycleLabel(contact.lifecycle_stage)}</span>
          <em>Prioridad {contact.score}</em>
        </div>
        <h3>{contact.leads?.name||contact.leads?.email||"Contacto"}</h3>
        <p>{contact.leads?.email}<br/>{[contact.leads?.source,contact.leads?.medium,contact.leads?.campaign].filter(Boolean).join(" · ")||"Directo / sin atribución"}<br/>Estado: {contactStatusLabel(contact.status)}</p>
      </article>)}
      {!contactRows.length&&<article className={styles.card}><h3>Sin contactos</h3><p>Los contactos captados se incorporarán automáticamente aquí.</p></article>}
    </section>

    {["admin","editor","marketing"].includes(profile.role)&&contactRows.length>0&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para actualizar contactos o registrar interacciones manualmente.</p>
      <section className={styles.adminForms}>
      <form action={updateContact} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIÓN DE CONTACTOS</span><h2>Actualizar contacto</h2></div>
        <div className={styles.formGrid}>
          <label>Contacto<select name="contact_id" required defaultValue="">
            <option value="" disabled>Seleccionar contacto</option>
            {contactRows.map((x:any)=><option key={x.id} value={x.id}>{x.leads?.name||x.leads?.email}</option>)}
          </select></label>
          <label>Etapa<select name="lifecycle_stage" defaultValue="lead">
            <option value="subscriber">Suscriptor</option><option value="lead">Contacto</option>
            <option value="mql">Interesado</option><option value="sql">Contacto calificado</option>
            <option value="opportunity">Oportunidad</option><option value="customer">Cliente</option>
            <option value="advocate">Promotor</option><option value="inactive">Inactivo</option>
          </select></label>
          <label>Estado<select name="status" defaultValue="active">
            <option value="active">Activo</option><option value="nurturing">En seguimiento</option>
            <option value="qualified">Calificado</option><option value="contacted">Contactado</option>
            <option value="won">Convertido</option><option value="lost">Perdido</option>
            <option value="unsubscribed">Baja</option><option value="suppressed">Bloqueado</option>
          </select></label>
          <label>Prioridad<input type="number" min="0" max="100" name="score" defaultValue="0"/></label>
          <label>Próxima acción<input type="datetime-local" name="next_action_at"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3} placeholder="Notas internas del contacto"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Guardar contacto</MasterSubmitButton>
      </form>

      <form action={addActivity} className={styles.adminForm}>
        <div className={styles.formTitle}><span>ACTIVIDAD</span><h2>Registrar interacción</h2></div>
        <div className={styles.formGrid}>
          <label>Contacto<select name="contact_id" required defaultValue="">
            <option value="" disabled>Seleccionar contacto</option>
            {contactRows.map((x:any)=><option key={x.id} value={x.id}>{x.leads?.name||x.leads?.email}</option>)}
          </select></label>
          <label>Tipo<select name="activity_type" defaultValue="note">
            <option value="note">Nota</option><option value="email">Correo</option><option value="call">Llamada</option>
            <option value="dm">Mensaje directo</option><option value="meeting">Reunión</option><option value="other">Otro</option>
          </select></label>
          <label className={styles.span2}>Asunto<input name="subject" placeholder="Seguimiento"/></label>
          <label className={styles.span2}>Detalle<textarea name="body" rows={4} placeholder="Detalle de la interacción"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar actividad</MasterSubmitButton>
      </form>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>ACTIVIDAD</span><h2>Actividad reciente</h2></div><p>Historial de interacciones y cambios del contacto.</p></section>
    <section className={styles.grid}>
      {activityRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{activityLabel(a.activity_type)}</span><em>{new Date(a.occurred_at).toLocaleString("es-US")}</em></div>
        <h3>{a.subject||"Actividad del contacto"}</h3><p>{a.body||"Sin detalle"}</p>
      </article>)}
      {!activityRows.length&&<article className={styles.card}><h3>Sin actividad registrada todavía</h3><p>Las actualizaciones y contactos se registrarán aquí.</p></article>}
    </section>
  </main>;
}
