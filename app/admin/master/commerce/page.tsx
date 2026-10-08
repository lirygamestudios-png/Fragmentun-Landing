import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

function paymentLabel(value:string){
  const map:Record<string,string>={paid:"PAGADO",pending:"PENDIENTE",failed:"FALLIDO",refunded:"REEMBOLSADO",partially_refunded:"REEMBOLSO PARCIAL",canceled:"CANCELADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function deliveryLabel(value:string){
  const map:Record<string,string>={unfulfilled:"PENDIENTE",processing:"PREPARANDO",fulfilled:"ENVIADO",shipped:"EN CAMINO",delivered:"ENTREGADO",canceled:"CANCELADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function simpleModeLabel(value:string){
  const map:Record<string,string>={manual:"MANUAL",auto:"AUTOMÁTICO",automatic:"AUTOMÁTICO",included:"INCLUIDO",external:"EXTERNO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function providerLabel(value:string|undefined){
  const map:Record<string,string>={stripe:"Stripe",paypal:"PayPal",manual:"Manual",auto:"Automático",automatic:"Automático"};
  if(!value)return "Automático";
  return map[value]||String(value).replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

export default async function MasterCommercePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:orders},
    {count:products},
    {count:fulfillments},
    {data:settings}
  ]=await Promise.all([
    supabase.from("shop_orders").select("order_number,total_cents,currency,payment_status,fulfillment_status,refund_status,customer_email,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("shop_products").select("*",{count:"exact",head:true}),
    supabase.from("shop_fulfillments").select("*",{count:"exact",head:true}),
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,default_payment_provider,tax_mode,shipping_label_mode").eq("id","default").maybeSingle()
  ]);

  const rows=(orders||[]) as any[];
  const paid=rows.filter(o=>o.payment_status==="paid");
  const open=rows.filter(o=>!["fulfilled","delivered","canceled"].includes(o.fulfillment_status));
  const refunds=rows.filter(o=>o.refund_status&&o.refund_status!=="none");
  const totalPaid=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const currency=paid[0]?.currency||"USD";

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleCommerce}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · COMERCIO</span><h1>Comercio</h1><p>Pedidos, pagos, entregas y devoluciones sobre la tienda real.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">CM</span>
      <div className={styles.moduleStripCopy}><small>COMERCIO Y OPERACIÓN</small><strong>Pedidos, pagos y entregas</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Tienda conectada al ecosistema</span>
        <span>Activación comercial controlada</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Pedidos</small><strong>{rows.length.toLocaleString()}</strong><span>{(products||0).toLocaleString()} productos registrados</span></article>
      <article><small>Pagado</small><strong>{money(totalPaid,currency)}</strong><span>{paid.length} pedidos pagados</span></article>
      <article className={open.length?styles.kpiAttention:undefined}><small>Pendientes</small><strong>{open.length}</strong><span>{open.length?"Pedidos por completar":"Sin pedidos pendientes"}</span></article>
      <article className={refunds.length?styles.kpiAttention:undefined}><small>Reembolsos</small><strong>{refunds.length}</strong><span>{refunds.length?"Con devolución/reembolso":"Sin reembolsos registrados"}</span></article>
    </section>

    <details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Accede a las herramientas reales de gestión comercial.</p>
      <section className={styles.adminForms}>
        <article className={styles.adminForm}>
          <div className={styles.formTitle}><span>TIENDA</span><h2>Productos, pedidos y devoluciones</h2></div>
          <p>Gestiona el catálogo, pedidos, devoluciones y reportes de la tienda.</p>
          <a className={styles.formButton} href="/admin/tienda">Gestionar tienda y productos</a>
        </article>
        <article className={styles.adminForm}>
          <div className={styles.formTitle}><span>CONEXIONES</span><h2>Pagos e integraciones</h2></div>
          <p>Revisa o configura las conexiones necesarias para pagos y servicios externos.</p>
          <a className={styles.formButton} href="/admin/integrations">Ver integraciones</a>
        </article>
      </section>
      <section className={styles.adminForms}>
        <article className={styles.adminForm}>
          <div className={styles.formTitle}><span>REPORTES</span><h2>Resultados comerciales</h2></div>
          <p>Consulta los reportes disponibles del ecosistema administrativo.</p>
          <a className={styles.formButton} href="/admin/reportes">Ver reportes</a>
        </article>
      </section>
    </details>

    <section className={styles.sectionHead}>
      <div><span>PREPARACIÓN COMERCIAL</span><h2>Configuración</h2></div>
      <p>Pagos y envíos permanecen bajo control hasta su activación comercial.</p>
    </section>
    <section className={styles.grid}>
      {[
        ["Stripe",settings?.stripe_enabled?"Habilitado":"Deshabilitado"],
        ["PayPal",settings?.paypal_enabled?"Habilitado":"Deshabilitado"],
        ["Proveedor por defecto",providerLabel(settings?.default_payment_provider)],
        ["Impuestos",simpleModeLabel(settings?.tax_mode||"manual")],
        ["Etiquetas de envío",simpleModeLabel(settings?.shipping_label_mode||"manual")],
        ["Entregas registradas",String(fulfillments||0)]
      ].map(([name,value])=><article key={name} className={`${styles.card} ${value==="Deshabilitado"?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>COMERCIO</span><em>CONTROL</em></div>
        <h3>{name}</h3><p><strong>{value}</strong></p>
      </article>)}
    </section>

    <section className={styles.sectionHead}><div><span>ÓRDENES</span><h2>Actividad reciente</h2></div></section>
    <section className={styles.grid}>
      {rows.slice(0,12).map((o:any)=><article key={o.order_number} className={`${styles.card} ${o.payment_status==="failed"?styles.cardAttention:o.payment_status==="pending"||["unfulfilled","processing"].includes(o.fulfillment_status)?styles.cardWarning:""}`}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{paymentLabel(o.payment_status)}</span><em>{deliveryLabel(o.fulfillment_status)}</em></div>
        <h3>{o.order_number}</h3>
        <p>{money(o.total_cents,o.currency||"USD")} · {o.customer_email||"cliente"}<br/>{new Date(o.created_at).toLocaleString("es-US")}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin órdenes aún</h3><p>La infraestructura está preparada y permanecerá en cero hasta que existan ventas reales.</p></article>}
    </section>
  </main>;
}
