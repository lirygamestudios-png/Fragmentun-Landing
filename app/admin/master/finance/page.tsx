import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

export default async function MasterFinancePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:orders},
    {data:commerce},
    {count:products},
    {count:fulfilled}
  ]=await Promise.all([
    supabase.from("shop_orders").select("total_cents,payment_fee_cents,supplier_cost_cents,shipping_cost_cents,margin_cents,currency,payment_status,fulfillment_status,created_at").order("created_at",{ascending:false}).limit(500),
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,default_payment_provider,tax_mode,tax_registration_status").eq("id","default").maybeSingle(),
    supabase.from("shop_products").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("fulfillment_status","fulfilled")
  ]);

  const rows=(orders||[]) as any[];
  const paid=rows.filter(o=>o.payment_status==="paid");
  const revenue=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const fees=paid.reduce((a,o)=>a+Number(o.payment_fee_cents||0),0);
  const supplier=paid.reduce((a,o)=>a+Number(o.supplier_cost_cents||0),0);
  const shipping=paid.reduce((a,o)=>a+Number(o.shipping_cost_cents||0),0);
  const margin=paid.reduce((a,o)=>a+Number(o.margin_cents||0),0);
  const currency=paid[0]?.currency||"USD";

  const readiness=[
    {name:"Pedidos",value:rows.length>0?"Operativo":"Sin ventas aún",detail:"shop_orders"},
    {name:"Productos activos",value:String(products||0),detail:"shop_products"},
    {name:"Pagos",value:commerce?.default_payment_provider||"auto",detail:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"Proveedor habilitable":"Aún no habilitado"},
    {name:"Impuestos",value:commerce?.tax_registration_status||"not_configured",detail:commerce?.tax_mode||"manual"},
    {name:"Ledger contable",value:"Pendiente",detail:"Se añadirá como capa financiera separada"},
    {name:"Reconciliación",value:"Preparada",detail:"Pedidos + costes + fees + margen ya modelados"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · FINANZAS</span><h1>Finanzas & Revenue Control</h1><p>Control financiero-comercial inicial conectado a la arquitectura de tienda.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Ingresos pagados</small><strong>{money(revenue,currency)}</strong><span>{paid.length} órdenes pagadas</span></article>
      <article><small>Margen registrado</small><strong>{money(margin,currency)}</strong><span>Después de costes modelados</span></article>
      <article><small>Fees de pago</small><strong>{money(fees,currency)}</strong><span>Coste de procesamiento</span></article>
      <article><small>Fulfilled</small><strong>{(fulfilled||0).toLocaleString()}</strong><span>Órdenes completadas</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FINANCE READINESS</span><h2>Estado financiero-operativo</h2></div>
      <p>El sistema ya puede capturar ingresos, fees, costes de proveedor, shipping y margen. El ledger contable formal se implementará como siguiente capa financiera.</p>
    </section>

    <section className={styles.grid}>
      {readiness.map(item=><article key={item.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONTROL</span><em>FINANZAS</em></div>
        <h3>{item.name}</h3>
        <p><strong>{item.value}</strong><br/>{item.detail}</p>
      </article>)}
    </section>

    <section className={styles.sectionHead}>
      <div><span>ECONOMÍA COMERCIAL</span><h2>Costes modelados</h2></div>
      <p>Estas cifras permanecen en cero hasta que existan ventas reales; no se simulan resultados.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Proveedor</small><strong>{money(supplier,currency)}</strong><span>supplier_cost_cents</span></article>
      <article><small>Shipping</small><strong>{money(shipping,currency)}</strong><span>shipping_cost_cents</span></article>
      <article><small>Procesamiento</small><strong>{money(fees,currency)}</strong><span>payment_fee_cents</span></article>
      <article><small>Margen</small><strong>{money(margin,currency)}</strong><span>margin_cents</span></article>
    </section>
  </main>;
}
