import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

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

async function createPartner(formData:FormData){
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

async function createDeal(formData:FormData){
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
  const allowedDeal=new Set(["license","distribution","publishing","co_development","marketing","merchandising","adaptation","other"]);
  const allowedEx=new Set(["exclusive","non_exclusive","shared","unknown"]);
  if(!dealName||!allowedDeal.has(dealType)||!allowedEx.has(exclusivity)||!Number.isFinite(value)||(royaltyBps!==null&&!Number.isFinite(royaltyBps))) throw new Error("invalid_deal");
  const{error}=await supabase.from("licensing_deals").insert({
    partner_id:partnerId,deal_name:dealName,ip_name:ipName,deal_type:dealType,territory,exclusivity,
    value_cents:Math.max(0,Math.round(value*100)),currency,royalty_bps:royaltyBps,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/partners");
}

export default async function MasterPartnersPage(){
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
    supabase.from("partner_organizations").select("id,name,partner_type,status,contact_name,contact_email,territory,website,created_at").order("created_at",{ascending:false}),
    supabase.from("licensing_deals").select("id,partner_id,deal_name,ip_name,deal_type,status,territory,exclusivity,start_date,end_date,value_cents,currency,royalty_bps,next_action,created_at").order("created_at",{ascending:false}),
    supabase.from("book_editions").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true})
  ]);

  const partnerRows=(partners||[]) as any[];
  const dealRows=(deals||[]) as any[];
  const activeDeals=dealRows.filter(d=>d.status==="active");
  const pipelineDeals=dealRows.filter(d=>["pipeline","qualified","negotiation","contracting"].includes(d.status));
  const pipelineValue=pipelineDeals.reduce((a,d)=>a+Number(d.value_cents||0),0);
  const currency=pipelineDeals[0]?.currency||dealRows[0]?.currency||"USD";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PARTNERS</span><h1>Partners & Licensing</h1><p>Registro maestro de partners y pipeline de acuerdos/licencias.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Partners</small><strong>{partnerRows.length}</strong><span>Organizaciones registradas</span></article>
      <article><small>Deals activos</small><strong>{activeDeals.length}</strong><span>Licensing / distribution</span></article>
      <article><small>Pipeline deals</small><strong>{pipelineDeals.length}</strong><span>{money(pipelineValue,currency)}</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Señal editorial</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>PARTNER MASTER</span><h2>Organizaciones</h2></div></section>
    <section className={styles.grid}>
      {partnerRows.map((p:any)=><article key={p.id} className={styles.card}>
        <div className={styles.cardTop}><span className={p.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(p.status).toUpperCase()}</span><em>{p.partner_type}</em></div>
        <h3>{p.name}</h3><p>{p.contact_name||"Sin contacto"} · {p.contact_email||"Sin email"}<br/>{p.territory||"Territorio pendiente"}</p>
      </article>)}
      {!partnerRows.length&&<article className={styles.card}><h3>Partner Master preparado</h3><p>No se han cargado organizaciones reales todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>DEAL PIPELINE</span><h2>Licensing & acuerdos</h2></div></section>
    <section className={styles.grid}>
      {dealRows.map((d:any)=><article key={d.id} className={styles.card}>
        <div className={styles.cardTop}><span className={d.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(d.status).toUpperCase()}</span><em>{d.deal_type}</em></div>
        <h3>{d.deal_name}</h3><p>{d.ip_name||"IP por definir"} · {d.territory||"Sin territorio"}<br/>{money(d.value_cents,d.currency)} · {d.royalty_bps!=null?(d.royalty_bps/100).toFixed(2)+"% royalty":"Royalty no registrado"}</p>
      </article>)}
      {!dealRows.length&&<article className={styles.card}><h3>Pipeline vacío</h3><p>Los acuerdos reales se registrarán aquí.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createPartner} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO PARTNER</span><h2>Registrar organización</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="partner_type" defaultValue="other">
            <option value="publisher">Publisher</option><option value="platform">Platform</option><option value="distributor">Distributor</option>
            <option value="licensor">Licensor</option><option value="licensee">Licensee</option><option value="co_dev">Co-dev</option>
            <option value="marketing">Marketing</option><option value="media">Media</option><option value="retail">Retail</option><option value="strategic">Strategic</option><option value="other">Other</option>
          </select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Email<input type="email" name="contact_email"/></label>
          <label>Territorio<input name="territory"/></label>
          <label>Web<input name="website"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar partner</button>
      </form>

      <form action={createDeal} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO DEAL</span><h2>Registrar acuerdo</h2></div>
        <div className={styles.formGrid}>
          <label>Partner<select name="partner_id" defaultValue=""><option value="">Sin partner</option>{partnerRows.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>
          <label>Nombre<input name="deal_name" required/></label>
          <label>IP<input name="ip_name"/></label>
          <label>Tipo<select name="deal_type" defaultValue="license">
            <option value="license">License</option><option value="distribution">Distribution</option><option value="publishing">Publishing</option>
            <option value="co_development">Co-development</option><option value="marketing">Marketing</option><option value="merchandising">Merchandising</option><option value="adaptation">Adaptation</option><option value="other">Other</option>
          </select></label>
          <label>Territorio<input name="territory"/></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="unknown"><option value="exclusive">Exclusive</option><option value="non_exclusive">Non-exclusive</option><option value="shared">Shared</option><option value="unknown">Unknown</option></select></label>
          <label>Valor<input type="number" min="0" step="0.01" name="value" defaultValue="0"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Royalty %<input type="number" min="0" max="100" step="0.01" name="royalty_percent"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar deal</button>
      </form>
    </section>

    <section className={styles.sectionHead}><div><span>EXISTING SIGNALS</span><h2>Contexto comercial</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Go-to-market</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo</span></article>
      <article><small>Acceso</small><strong>ADMIN</strong><span>RLS restringido</span></article>
      <article><small>Contracts</small><strong>SEPARADOS</strong><span>Legal & IP</span></article>
    </section>
  </main>;
}