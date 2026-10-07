import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
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

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · COMERCIO</span><h1>Comercio</h1><p>Pedidos, pagos, fulfillment y devoluciones sobre la arquitectura real de tienda.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Pedidos</small><strong>{rows.length.toLocaleString()}</strong><span>{(products||0).toLocaleString()} productos registrados</span></article>
      <article><small>Pagado</small><strong>{money(totalPaid,currency)}</strong><span>{paid.length} órdenes pagadas</span></article>
      <article><small>Pendientes</small><strong>{open.length}</strong><span>Fulfillment abierto</span></article>
      <article><small>Refunds</small><strong>{refunds.length}</strong><span>Con devolución/reembolso</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>COMMERCE READINESS</span><h2>Configuración</h2></div>
      <p>Pagos y shipping permanecen bajo control hasta su activación comercial.</p>
    </section>
    <section className={styles.grid}>
      {[
        ["Stripe",settings?.stripe_enabled?"Habilitado":"Deshabilitado"],
        ["PayPal",settings?.paypal_enabled?"Habilitado":"Deshabilitado"],
        ["Proveedor por defecto",settings?.default_payment_provider||"auto"],
        ["Tax mode",settings?.tax_mode||"manual"],
        ["Shipping labels",settings?.shipping_label_mode||"manual"],
        ["Fulfillments",String(fulfillments||0)]
      ].map(([name,value])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>COMERCIO</span><em>CONTROL</em></div>
        <h3>{name}</h3><p><strong>{value}</strong></p>
      </article>)}
    </section>

    <section className={styles.sectionHead}><div><span>ÓRDENES</span><h2>Actividad reciente</h2></div></section>
    <section className={styles.grid}>
      {rows.slice(0,12).map((o:any)=><article key={o.order_number} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{String(o.payment_status).toUpperCase()}</span><em>{o.fulfillment_status}</em></div>
        <h3>{o.order_number}</h3>
        <p>{money(o.total_cents,o.currency||"USD")} · {o.customer_email||"cliente"}<br/>{new Date(o.created_at).toLocaleString("es-US")}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin órdenes aún</h3><p>La infraestructura está preparada y permanecerá en cero hasta que existan ventas reales.</p></article>}
    </section>
  </main>;
}
