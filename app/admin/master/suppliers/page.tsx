import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createVendor(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const name=String(formData.get("name")||"").trim();
  const vendorType=String(formData.get("vendor_type")||"other");
  const contactName=String(formData.get("contact_name")||"").trim()||null;
  const contactEmail=String(formData.get("contact_email")||"").trim()||null;
  const country=String(formData.get("country")||"").trim()||null;
  const paymentTerms=String(formData.get("payment_terms")||"").trim()||null;
  const risk=String(formData.get("risk_rating")||"medium");
  const preferred=String(formData.get("preferred")||"false")==="true";
  const allowedType=new Set(["manufacturing","fulfillment","software","hosting","professional_services","marketing","art","audio","qa","localization","legal","finance","other"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  if(!name||!allowedType.has(vendorType)||!allowedRisk.has(risk)) throw new Error("invalid_vendor");
  const{error}=await supabase.from("vendor_master").insert({
    name,vendor_type:vendorType,contact_name:contactName,contact_email:contactEmail,country,payment_terms:paymentTerms,risk_rating:risk,preferred,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/suppliers");
}

export default async function MasterSuppliersPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[
    {data:vendors},
    {data:products},
    {data:fulfillments},
    {count:orders}
  ]=await Promise.all([
    supabase.from("vendor_master").select("id,name,vendor_type,status,contact_name,contact_email,country,payment_terms,risk_rating,preferred,created_at").order("name",{ascending:true}),
    supabase.from("shop_products").select("supplier,supplier_product_id,sku,name_es,mode,active").order("sort_order",{ascending:true}).limit(250),
    supabase.from("shop_fulfillments").select("supplier,shipment_status,label_cost_cents,created_at").order("created_at",{ascending:false}).limit(250),
    supabase.from("shop_orders").select("*",{count:"exact",head:true})
  ]);

  const vendorRows=(vendors||[]) as any[];
  const productRows=(products||[]) as any[];
  const fulfillmentRows=(fulfillments||[]) as any[];
  const highRisk=vendorRows.filter(v=>["high","critical"].includes(v.risk_rating)).length;
  const preferred=vendorRows.filter(v=>v.preferred).length;
  const legacySupplierNames=[...new Set([...productRows.map(p=>p.supplier),...fulfillmentRows.map(f=>f.supplier)].filter(Boolean))];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PROVEEDORES</span><h1>Proveedores</h1><p>Vendor Master persistente separado de las referencias de supplier presentes en productos y fulfillment.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Vendors</small><strong>{vendorRows.length}</strong><span>vendor_master</span></article>
      <article><small>Preferred</small><strong>{preferred}</strong><span>Proveedores preferidos</span></article>
      <article><small>High/Critical risk</small><strong>{highRisk}</strong><span>Requieren atención</span></article>
      <article><small>Órdenes</small><strong>{(orders||0).toLocaleString()}</strong><span>Demanda comercial</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>VENDOR MASTER</span><h2>Proveedores registrados</h2></div></section>
    <section className={styles.grid}>
      {vendorRows.map((v:any)=><article key={v.id} className={styles.card}>
        <div className={styles.cardTop}><span className={v.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(v.status).toUpperCase()}</span><em>{v.risk_rating}</em></div>
        <h3>{v.name}</h3><p>{v.vendor_type} · {v.country||"País pendiente"}<br/>{v.contact_name||"Sin contacto"} · {v.contact_email||"Sin email"}<br/>{v.payment_terms||"Payment terms pendientes"}{v.preferred?" · Preferred":""}</p>
      </article>)}
      {!vendorRows.length&&<article className={styles.card}><h3>Vendor Master preparado</h3><p>No se han cargado proveedores formales todavía.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createVendor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO VENDOR</span><h2>Registrar proveedor</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="vendor_type" defaultValue="other">
            <option value="manufacturing">Manufacturing</option><option value="fulfillment">Fulfillment</option><option value="software">Software</option>
            <option value="hosting">Hosting</option><option value="professional_services">Professional Services</option><option value="marketing">Marketing</option>
            <option value="art">Art</option><option value="audio">Audio</option><option value="qa">QA</option><option value="localization">Localization</option>
            <option value="legal">Legal</option><option value="finance">Finance</option><option value="other">Other</option>
          </select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Email<input type="email" name="contact_email"/></label>
          <label>País<input name="country"/></label>
          <label>Payment terms<input name="payment_terms" placeholder="Net 30"/></label>
          <label>Riesgo<select name="risk_rating" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Preferred<select name="preferred" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar proveedor</button>
      </form>
    </section>

    <section className={styles.sectionHead}><div><span>LEGACY REFERENCES</span><h2>Suppliers detectados en comercio</h2></div><p>Estas referencias no sustituyen al Vendor Master hasta ser formalizadas.</p></section>
    <section className={styles.grid}>
      {legacySupplierNames.map(name=><article key={String(name)} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>REFERENCIA</span><em>COMMERCE</em></div>
        <h3>{String(name)}</h3>
        <p>{productRows.filter(p=>p.supplier===name).length} productos · {fulfillmentRows.filter(f=>f.supplier===name).length} fulfillments</p>
      </article>)}
      {!legacySupplierNames.length&&<article className={styles.card}><h3>Sin referencias legacy</h3><p>No existen suppliers derivados del catálogo o fulfillment.</p></article>}
    </section>
  </main>;
}