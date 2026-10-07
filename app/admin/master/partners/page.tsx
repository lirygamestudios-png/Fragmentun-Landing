import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function partnerEstadoLabel(value:string){
  const map:Record<string,string>={prospect:"PROSPECTO",active:"ACTIVO",paused:"PAUSADO",inactive:"INACTIVO",ended:"FINALIZADO"};
  return map[value]||String(value||"").toUpperCase();
}

function dealEstadoLabel(value:string){
  const map:Record<string,string>={pipeline:"EN PROCESO",qualified:"CALIFICADO",negotiation:"NEGOCIACIÓN",contracting:"CONTRATACIÓN",active:"ACTIVO",expired:"VENCIDO",lost:"PERDIDO",canceled:"CANCELADO"};
  return map[value]||String(value||"").toUpperCase();
}

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

async function requireAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createOrganización(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const name=String(formData.get("name")||"").trim();
  const partnerType=String(formData.get("partner_type")||"other");
  const contactName=String(formData.get("contact_name")||"").trim()||null;
  const contactEmail=String(formData.get("contact_email")||"").trim()||null;
  const territory=String(formData.get("territory")||"").trim()||null;
  const website=String(formData.get("website")||"").trim()||null;
  const allowed=new Set(["publisher","platform","distributor","licensor","licensee","co_dev","marketing","media","retail","strategic","other"]);
  if(!name||!allowed.has(partnerType)) throw new Error("invalid_partner");
  const{error}=await supabase.from("partner_organizations").insert({name,partner_type:partnerType,contact_name:contactName,contact_email:contactEmail,territory,website,created_by:user.id});
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/partners");
}

async function createAcuerdo(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const partnerRaw=String(formData.get("partner_id")||"").trim();
  const partnerId=partnerRaw||null;
  const dealName=String(formData.get("deal_name")||"").trim();
  const ipName=String(formData.get("ip_name")||"").trim()||null;
  const dealType=String(formData.get("deal_type")||"license");
  const territory=String(formData.get("territory")||"").trim()||null;
  const exclusivity=String(formData.get("exclusivity")||"unknown");
  const value=Number(formData.get("value")||0);
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const royalty=String(formData.get("royalty_percent")||"").trim();
  const royaltyBps=royalty?Math.round(Number(royalty)*100):null;
  const allowedAcuerdo=new Set(["license","distribution","publishing","co_development","marketing","merchandising","adaptation","other"]);
  const allowedEx=new Set(["exclusive","non_exclusive","shared","unknown"]);
  if(!dealName||!allowedAcuerdo.has(dealType)||!allowedEx.has(exclusivity)||!Number.isFinite(value)||(royaltyBps!==null&&!Number.isFinite(royaltyBps))) throw new Error("invalid_deal");
  const{error}=await supabase.from("licensing_deals").insert({
    partner_id:partnerId,deal_name:dealName,ip_name:ipName,deal_type:dealType,territory,exclusivity,
    value_cents:Math.max(0,Math.round(value*100)),currency,royalty_bps:royaltyBps,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/partners");
}


async function updateOrganización(formData:FormData){
  "use server";
  const {supabase}=await requireAdmin();
  const id=String(formData.get("partner_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const contactName=String(formData.get("contact_name")||"").trim()||null;
  const contactEmail=String(formData.get("contact_email")||"").trim()||null;
  const territory=String(formData.get("territory")||"").trim()||null;
  const website=String(formData.get("website")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["prospect","active","paused","inactive","ended"]);
  if(!id||!allowedEstado.has(status)) throw new Error("invalid_partner_update");
  const{error}=await supabase.from("partner_organizations").update({
    status,contact_name:contactName,contact_email:contactEmail,territory,website,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/partners");
}

async function updateAcuerdo(formData:FormData){
  "use server";
  const {supabase}=await requireAdmin();
  const id=String(formData.get("deal_id")||"").trim();
  const status=String(formData.get("status")||"pipeline");
  const territory=String(formData.get("territory")||"").trim()||null;
  const exclusivity=String(formData.get("exclusivity")||"unknown");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const valueRaw=String(formData.get("value")||"").trim();
  const valueCents=valueRaw?Math.round(Number(valueRaw)*100):null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const royaltyRaw=String(formData.get("royalty_percent")||"").trim();
  const royaltyBps=royaltyRaw?Math.round(Number(royaltyRaw)*100):null;
  const nextAction=String(formData.get("next_action")||"").trim()||null;
  const nextActionAt=String(formData.get("next_action_at")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["pipeline","qualified","negotiation","contracting","active","expired","lost","canceled"]);
  const allowedEx=new Set(["exclusive","non_exclusive","shared","unknown"]);
  if(!id||!allowedEstado.has(status)||!allowedEx.has(exclusivity)) throw new Error("invalid_deal_update");
  if(valueCents!==null&&(!Number.isFinite(valueCents)||valueCents<0)) throw new Error("invalid_value");
  if(royaltyBps!==null&&(!Number.isFinite(royaltyBps)||royaltyBps<0||royaltyBps>10000)) throw new Error("invalid_royalty");
  const patch:any={
    status,territory,exclusivity,start_date:startDate,end_date:endDate,currency,
    next_action:nextAction,next_action_at:nextActionAt,notes,updated_at:new Date().toISOString()
  };
  if(valueCents!==null) patch.value_cents=valueCents;
  if(royaltyBps!==null) patch.royalty_bps=royaltyBps;
  const{error}=await supabase.from("licensing_deals").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/partners");
}

export default async function MasterOrganizacionesPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[
    {data:partners},
    {data:deals},
    {count:editions},
    {count:campaigns}
  ]=await Promise.all([
    supabase.from("partner_organizations").select("id,name,partner_type,status,contact_name,contact_email,territory,website,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("licensing_deals").select("id,partner_id,deal_name,ip_name,deal_type,status,territory,exclusivity,start_date,end_date,value_cents,currency,royalty_bps,next_action,next_action_at,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("book_editions").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true})
  ]);

  const partnerRows=(partners||[]) as any[];
  const dealRows=(deals||[]) as any[];
  const activeAcuerdos=dealRows.filter(d=>d.status==="active");
  const pipelineAcuerdos=dealRows.filter(d=>["pipeline","qualified","negotiation","contracting"].includes(d.status));
  const pipelineValue=pipelineAcuerdos.reduce((a,d)=>a+Number(d.value_cents||0),0);
  const currency=pipelineAcuerdos[0]?.currency||dealRows[0]?.currency||"USD";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · ALIANZAS Y LICENCIAS</span><h1>Alianzas y Licencias</h1><p>Registro de organizaciones aliadas y acuerdos/licencias.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Organizaciones</small><strong>{partnerRows.length}</strong><span>Organizaciones registradas</span></article>
      <article><small>Acuerdos activos</small><strong>{activeAcuerdos.length}</strong><span>Licencias / distribución</span></article>
      <article><small>Acuerdos en proceso</small><strong>{pipelineAcuerdos.length}</strong><span>{money(pipelineValue,currency)}</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Señal editorial</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>ORGANIZACIONES</span><h2>Organizaciones</h2></div></section>
    <section className={styles.grid}>
      {partnerRows.map((p:any)=><article key={p.id} className={styles.card}>
        <div className={styles.cardTop}><span className={p.status==="active"?styles.badgeActivo:styles.badgePlanned}>{partnerEstadoLabel(p.status)}</span><em>{p.partner_type}</em></div>
        <h3>{p.name}</h3><p>{p.contact_name||"Sin contacto"} · {p.contact_email||"Sin email"}<br/>{p.territory||"Territorio pendiente"}</p>
      </article>)}
      {!partnerRows.length&&<article className={styles.card}><h3>Registro de organizaciones preparado</h3><p>No se han cargado organizaciones reales todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ACUERDOS Y LICENCIAS</span><h2>Licencias y acuerdos</h2></div></section>
    <section className={styles.grid}>
      {dealRows.map((d:any)=><article key={d.id} className={styles.card}>
        <div className={styles.cardTop}><span className={d.status==="active"?styles.badgeActivo:styles.badgePlanned}>{dealEstadoLabel(d.status)}</span><em>{d.deal_type}</em></div>
        <h3>{d.deal_name}</h3><p>{d.ip_name||"IP por definir"} · {d.territory||"Sin territorio"}<br/>{money(d.value_cents,d.currency)} · {d.royalty_bps!=null?(d.royalty_bps/100).toFixed(2)+"% regalía":"Regalía no registrada"}</p>
      </article>)}
      {!dealRows.length&&<article className={styles.card}><h3>Registro de acuerdos vacío</h3><p>Los acuerdos reales se registrarán aquí.</p></article>}
    </section>

    <details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar organizaciones, acuerdos y licencias manualmente.</p>
        <section className={styles.adminForms}>
      <form action={createOrganización} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA ORGANIZACIÓN</span><h2>Registrar organización</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="partner_type" defaultValue="other">
            <option value="publisher">Editorial</option><option value="platform">Plataforma</option><option value="distributor">Distribuidor</option>
            <option value="licensor">Licenciante</option><option value="licensee">Licenciatario</option><option value="co_dev">Codesarrollo</option>
            <option value="marketing">Marketing</option><option value="media">Medios</option><option value="retail">Venta minorista</option><option value="strategic">Estratégico</option><option value="other">Otro</option>
          </select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Email<input type="email" name="contact_email"/></label>
          <label>Territorio<input name="territory"/></label>
          <label>Web<input name="website"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar organización</button>
      </form>

      <form action={createAcuerdo} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO ACUERDO</span><h2>Registrar acuerdo</h2></div>
        <div className={styles.formGrid}>
          <label>Organización<select name="partner_id" defaultValue=""><option value="">Sin organización</option>{partnerRows.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>Nombre<input name="deal_name" required/></label>
          <label>IP<input name="ip_name"/></label>
          <label>Tipo<select name="deal_type" defaultValue="license">
            <option value="license">Licencia</option><option value="distribution">Distribución</option><option value="publishing">Publicación</option>
            <option value="co_development">Codesarrolloelopment</option><option value="marketing">Marketing</option><option value="merchandising">Merchandising</option><option value="adaptation">Adaptación</option><option value="other">Otro</option>
          </select></label>
          <label>Territorio<input name="territory"/></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="unknown"><option value="exclusive">Exclusivo</option><option value="non_exclusive">No exclusivo</option><option value="shared">Compartido</option><option value="unknown">Desconocido</option></select></label>
          <label>Valor<input type="number" min="0" step="0.01" name="value" defaultValue="0"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Regalía %<input type="number" min="0" max="100" step="0.01" name="royalty_percent"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar acuerdo</button>
      </form>
    </section>


    <section className={styles.adminForms}>
      <form action={updateOrganización} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR ORGANIZACIÓN</span><h2>Actualizar relación</h2></div>
        <div className={styles.formGrid}>
          <label>Organización<select name="partner_id" required defaultValue=""><option value="" disabled>Seleccionar organización</option>{partnerRows.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="prospect">Prospecto</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="inactive">Inactivo</option><option value="ended">Finalizado</option></select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Email<input type="email" name="contact_email"/></label>
          <label>Territorio<input name="territory"/></label>
          <label>Web<input name="website"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!partnerRows.length}>Actualizar organización</button>
      </form>

      <form action={updateAcuerdo} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR ACUERDO</span><h2>Actualizar acuerdo/licencia</h2></div>
        <div className={styles.formGrid}>
          <label>Acuerdo<select name="deal_id" required defaultValue=""><option value="" disabled>Seleccionar acuerdo</option>{dealRows.map((d:any)=><option key={d.id} value={d.id}>{d.deal_name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="qualified"><option value="pipeline">En proceso</option><option value="qualified">Calificado</option><option value="negotiation">Negociación</option><option value="contracting">Contratación</option><option value="active">Activo</option><option value="expired">Vencido</option><option value="lost">Perdido</option><option value="canceled">Cancelado</option></select></label>
          <label>Territorio<input name="territory"/></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="unknown"><option value="exclusive">Exclusivo</option><option value="non_exclusive">No exclusivo</option><option value="shared">Compartido</option><option value="unknown">Desconocido</option></select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label>Valor<input type="number" min="0" step="0.01" name="value"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Regalía %<input type="number" min="0" max="100" step="0.01" name="royalty_percent"/></label>
          <label>Fecha próxima acción<input type="datetime-local" name="next_action_at"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!dealRows.length}>Actualizar acuerdo</button>
      </form>
      </section>
    </details>

    <section className={styles.sectionHead}><div><span>CONTEXTO COMERCIAL</span><h2>Contexto comercial</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Salida al mercado</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo</span></article>
      <article><small>Acceso</small><strong>ADMINISTRADOR</strong><span>RLS restringido</span></article>
      <article><small>Contratos</small><strong>SEPARADOS</strong><span>Legal e IP</span></article>
    </section>
  </main>;
}