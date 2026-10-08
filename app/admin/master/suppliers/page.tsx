import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function vendorEstadoLabel(value:string){
  const map:Record<string,string>={prospect:"PROSPECTO",active:"ACTIVO",on_hold:"EN PAUSA",inactive:"INACTIVO",terminated:"FINALIZADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function riskLabel(value:string){
  const map:Record<string,string>={low:"BAJO",medium:"MEDIO",high:"ALTO",critical:"CRÍTICO"};
  return map[value]||String(value||"").toUpperCase();
}

function vendorTypeLabel(value:string){
  const map:Record<string,string>={manufacturing:"FABRICACIÓN",fulfillment:"ENTREGAS",software:"SOFTWARE",hosting:"ALOJAMIENTO",professional_services:"SERVICIOS PROFESIONALES",marketing:"MARKETING",art:"ARTE",audio:"AUDIO",qa:"PRUEBAS",localization:"LOCALIZACIÓN",legal:"LEGAL",finance:"FINANZAS",other:"OTRO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createProveedor(formData:FormData){
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


async function updateProveedor(formData:FormData){
  "use server";
  const {supabase}=await requireAdmin();
  const id=String(formData.get("vendor_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const risk=String(formData.get("risk_rating")||"medium");
  const preferred=String(formData.get("preferred")||"false")==="true";
  const contactName=String(formData.get("contact_name")||"").trim()||null;
  const contactEmail=String(formData.get("contact_email")||"").trim()||null;
  const country=String(formData.get("country")||"").trim()||null;
  const paymentTerms=String(formData.get("payment_terms")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["prospect","active","on_hold","inactive","terminated"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  if(!id||!allowedEstado.has(status)||!allowedRisk.has(risk)) throw new Error("invalid_vendor_update");
  const{error}=await supabase.from("vendor_master").update({
    status,risk_rating:risk,preferred,contact_name:contactName,contact_email:contactEmail,
    country,payment_terms:paymentTerms,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
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
    supabase.from("vendor_master").select("id,name,vendor_type,status,contact_name,contact_email,country,payment_terms,risk_rating,preferred,notes,created_at").order("name",{ascending:true}),
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
      <div><span className={styles.eyebrow}>LIRYGAMES · PROVEEDORES</span><h1>Proveedores</h1><p>Registro formal de proveedores separado de las referencias existentes en productos y entregas.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Proveedores</small><strong>{vendorRows.length}</strong><span>Registrados</span></article>
      <article><small>Preferidos</small><strong>{preferred}</strong><span>Proveedores preferidos</span></article>
      <article><small>Riesgo alto o crítico</small><strong>{highRisk}</strong><span>Requieren atención</span></article>
      <article><small>Órdenes</small><strong>{(orders||0).toLocaleString()}</strong><span>Demanda comercial</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>PROVEEDORES</span><h2>Proveedores registrados</h2></div></section>
    <section className={styles.grid}>
      {vendorRows.map((v:any)=><article key={v.id} className={styles.card}>
        <div className={styles.cardTop}><span className={v.status==="active"?styles.badgeActivo:styles.badgePlanned}>{vendorEstadoLabel(v.status)}</span><em>{riskLabel(v.risk_rating)}</em></div>
        <h3>{v.name}</h3><p>{vendorTypeLabel(v.vendor_type)} · {v.country||"País pendiente"}<br/>{v.contact_name||"Sin contacto"} · {v.contact_email||"Sin correo"}<br/>{v.payment_terms||"Condiciones de pago pendientes"}{v.preferred?" · Preferidos":""}</p>
      </article>)}
      {!vendorRows.length&&<article className={styles.card}><h3>Registro de proveedores preparado</h3><p>No se han cargado proveedores formales todavía.</p></article>}
    </section>

    <details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar proveedores manualmente.</p>
        <section className={styles.adminForms}>
      <form action={createProveedor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO PROVEEDOR</span><h2>Registrar proveedor</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required/></label>
          <label>Tipo<select name="vendor_type" defaultValue="other">
            <option value="manufacturing">Fabricación</option><option value="fulfillment">Entregas</option><option value="software">Software</option>
            <option value="hosting">Alojamiento</option><option value="professional_services">Servicios profesionales</option><option value="marketing">Mercadeo</option>
            <option value="art">Arte</option><option value="audio">Audio</option><option value="qa">Control de calidad</option><option value="localization">Localización</option>
            <option value="legal">Legal</option><option value="finance">Finanzas</option><option value="other">Otro</option>
          </select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Correo<input type="email" name="contact_email"/></label>
          <label>País<input name="country"/></label>
          <label>Condiciones de pago<input name="payment_terms" placeholder="Pago a 30 días"/></label>
          <label>Riesgo<select name="risk_rating" defaultValue="medium"><option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option><option value="critical">Crítico</option></select></label>
          <label>Preferido<select name="preferred" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar proveedor</MasterSubmitButton>
      </form>
    </section>


    <section className={styles.adminForms}>
      <form action={updateProveedor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR PROVEEDOR</span><h2>Actualizar proveedor</h2></div>
        <div className={styles.formGrid}>
          <label>Proveedor<select name="vendor_id" required defaultValue=""><option value="" disabled>Seleccionar proveedor</option>{vendorRows.map((v:any)=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="prospect">Prospecto</option><option value="active">Activo</option><option value="on_hold">En pausa</option><option value="inactive">Inactivo</option><option value="terminated">Finalizado</option></select></label>
          <label>Riesgo<select name="risk_rating" defaultValue="medium"><option value="low">Bajo</option><option value="medium">Medio</option><option value="high">Alto</option><option value="critical">Crítico</option></select></label>
          <label>Preferidos<select name="preferred" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Contacto<input name="contact_name"/></label>
          <label>Email<input type="email" name="contact_email"/></label>
          <label>País<input name="country"/></label>
          <label>Condiciones de pago<input name="payment_terms"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!vendorRows.length} disabledReason="No hay proveedores registrados para actualizar.">Actualizar proveedor</MasterSubmitButton>
      </form>
      </section>
    </details>

    <section className={styles.sectionHead}><div><span>REFERENCIAS EXISTENTES</span><h2>Proveedores detectados en comercio</h2></div><p>Estas referencias no sustituyen al registro formal hasta ser validadas.</p></section>
    <section className={styles.grid}>
      {legacySupplierNames.map(name=><article key={String(name)} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>REFERENCIA</span><em>COMERCIO</em></div>
        <h3>{String(name)}</h3>
        <p>{productRows.filter(p=>p.supplier===name).length} productos · {fulfillmentRows.filter(f=>f.supplier===name).length} entregas</p>
      </article>)}
      {!legacySupplierNames.length&&<article className={styles.card}><h3>Sin referencias anteriores</h3><p>No existen proveedores derivados del catálogo o las entregas.</p></article>}
    </section>
  </main>;
}