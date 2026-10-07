import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

function modeLabel(value:string){
  const map:Record<string,string>={external:"REDIRECCIÓN EXTERNA",internal:"VENTA DIRECTA",interest:"CAPTACIÓN DE INTERÉS"};
  return map[value]||String(value||"").toUpperCase();
}

function stockLabel(value:string){
  const map:Record<string,string>={in_stock:"DISPONIBLE",out_of_stock:"AGOTADO",preorder:"PREVENTA",backorder:"BAJO PEDIDO",limited:"LIMITADO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

export default async function MasterMonetizationPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:products},
    {data:orders},
    {count:amazonClicks},
    {count:merchClicks}
  ]=await Promise.all([
    supabase.from("shop_products").select("sku,name_es,name_en,price_cents,currency,mode,payment_provider,active,featured,stock_status").order("sort_order",{ascending:true}).limit(100),
    supabase.from("shop_orders").select("total_cents,margin_cents,currency,payment_status").limit(500),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","merch_click")
  ]);

  const productRows=(products||[]) as any[];
  const orderRows=(orders||[]) as any[];
  const paid=orderRows.filter(o=>o.payment_status==="paid");
  const revenue=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const margin=paid.reduce((a,o)=>a+Number(o.margin_cents||0),0);
  const currency=paid[0]?.currency||productRows[0]?.currency||"USD";
  const active=productRows.filter(p=>p.active);
  const featured=productRows.filter(p=>p.featured);

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · MONETIZACIÓN</span><h1>Monetización</h1><p>Precios, ofertas, catálogo e ingresos reales sin simular resultados.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Productos activos</small><strong>{active.length}</strong><span>{featured.length} destacados</span></article>
      <article><small>Ingresos cobrados</small><strong>{money(revenue,currency)}</strong><span>Solo órdenes reales</span></article>
      <article><small>Margen</small><strong>{money(margin,currency)}</strong><span>Solo órdenes reales</span></article>
      <article><small>Intentos externos</small><strong>{((amazonClicks||0)+(merchClicks||0)).toLocaleString()}</strong><span>Amazon + tienda</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>CATÁLOGO</span><h2>Ofertas y productos</h2></div>
      <p>Soporta redirección a proveedores, venta directa y captación de interés según el modelo comercial de LIRYGAMES.</p>
    </section>

    <section className={styles.grid}>
      {productRows.map((p:any,i:number)=><article key={p.sku||i} className={styles.card}>
        <div className={styles.cardTop}><span className={p.active?styles.badgeActive:styles.badgePlanned}>{p.active?"ACTIVO":"INACTIVO"}</span><em>{modeLabel(p.mode)}</em></div>
        <h3>{p.name_es||p.name_en||p.sku||"Producto"}</h3>
        <p>{p.price_cents!=null?money(p.price_cents,p.currency||"USD"):"Precio por definir"} · {p.payment_provider||"Proveedor por definir"}<br/>Disponibilidad: {stockLabel(p.stock_status)}</p>
      </article>)}
      {!productRows.length&&<article className={styles.card}><h3>Catálogo aún vacío</h3><p>La estructura de monetización está lista para cargar productos cuando corresponda.</p></article>}
    </section>
  </main>;
}
