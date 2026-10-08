import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import {MasterActionForm} from "../../../../components/MasterActionForm";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
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

function paymentProviderLabel(value:string|undefined){
  const map:Record<string,string>={stripe:"Stripe",paypal:"PayPal",manual:"Manual",external:"Proveedor externo",none:"Sin proveedor"};
  if(!value)return "Proveedor por definir";
  return map[value]||String(value).replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

export default async function MasterMonetizationPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:products},
    {data:orders},
    {count:amazonClicks},
    {count:merchClicks},
    {data:games},
    {data:virtualItems},
    {data:virtualOffers},
    {data:gamePurchases},
    {data:entitlements},
    {data:engagement}
  ]=await Promise.all([
    supabase.from("shop_products").select("sku,name_es,name_en,price_cents,currency,mode,payment_provider,active,featured,stock_status").order("sort_order",{ascending:true}).limit(100),
    supabase.from("shop_orders").select("total_cents,margin_cents,currency,payment_status").limit(500),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","merch_click"),
    supabase.from("game_titles").select("id,name,slug").order("name",{ascending:true}),
    supabase.from("game_virtual_items").select("id,game_id,sku,name,item_type,rarity,grant_type,duration_seconds,active,created_at").order("created_at",{ascending:false}).limit(250),
    supabase.from("game_virtual_item_offers").select("id,item_id,platform,currency,price_cents,active,created_at").order("created_at",{ascending:false}).limit(500),
    supabase.from("game_purchase_events").select("id,game_id,item_id,player_ref,platform,provider,quantity,gross_cents,fee_cents,tax_cents,net_cents,currency,status,source_channel,purchased_at").order("purchased_at",{ascending:false}).limit(2000),
    supabase.from("game_entitlements").select("id,game_id,player_ref,item_id,purchase_id,quantity,status,granted_at,expires_at,created_at").order("created_at",{ascending:false}).limit(2000),
    supabase.from("game_engagement_daily").select("metric_date,game_id,platform,active_players,new_players,sessions,session_minutes").order("metric_date",{ascending:false}).limit(500)
  ]);

  const productRows=(products||[]) as any[];
  const orderRows=(orders||[]) as any[];
  const paid=orderRows.filter(o=>o.payment_status==="paid");
  const revenue=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const margin=paid.reduce((a,o)=>a+Number(o.margin_cents||0),0);
  const currency=paid[0]?.currency||productRows[0]?.currency||"USD";
  const active=productRows.filter(p=>p.active);
  const featured=productRows.filter(p=>p.featured);
  const gameRows=(games||[]) as any[];
  const virtualItemRows=(virtualItems||[]) as any[];
  const virtualOfferRows=(virtualOffers||[]) as any[];
  const purchaseRows=(gamePurchases||[]) as any[];
  const entitlementRows=(entitlements||[]) as any[];
  const engagementRows=(engagement||[]) as any[];
  const paidGamePurchases=purchaseRows.filter(p=>p.status==="paid");
  const inGameGross=paidGamePurchases.reduce((a,p)=>a+Number(p.gross_cents||0),0);
  const inGameNet=paidGamePurchases.reduce((a,p)=>a+Number(p.net_cents??(Number(p.gross_cents||0)-Number(p.fee_cents||0)-Number(p.tax_cents||0))),0);
  const inGameCurrency=paidGamePurchases[0]?.currency||virtualOfferRows[0]?.currency||"USD";
  const payingPlayers=new Set(paidGamePurchases.map(p=>p.player_ref).filter(Boolean));
  const arppu=payingPlayers.size?Math.round(inGameGross/payingPlayers.size):0;
  const latestMetricDate=engagementRows[0]?.metric_date||null;
  const latestActivePlayers=latestMetricDate?engagementRows.filter(r=>r.metric_date===latestMetricDate).reduce((a,r)=>a+Number(r.active_players||0),0):0;
  const latestPayers=latestMetricDate?new Set(paidGamePurchases.filter(p=>String(p.purchased_at||"").slice(0,10)===latestMetricDate).map(p=>p.player_ref)).size:0;
  const payerConversion=latestActivePlayers?((latestPayers/latestActivePlayers)*100):0;
  const pendingEntitlements=entitlementRows.filter(e=>["pending","failed"].includes(e.status));
  const gameName=(id:string)=>gameRows.find(g=>g.id===id)?.name||"Juego";
  const itemName=(id:string|null|undefined)=>virtualItemRows.find(i=>i.id===id)?.name||"Artículo";

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleMonetization}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · MONETIZACIÓN</span><h1>Monetización</h1><p>Precios, ofertas, catálogo e ingresos reales sin simular resultados.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">MN</span>
      <div className={styles.moduleStripCopy}><small>INGRESOS Y OFERTAS</small><strong>Monetización del ecosistema</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Ingresos basados en datos reales</span>
        <span>Sin resultados simulados</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Productos activos</small><strong>{active.length}</strong><span>{featured.length} destacados</span></article>
      <article><small>Ingresos cobrados</small><strong className={styles.kpiLongValue}>{money(revenue,currency)}</strong><span>Solo órdenes reales</span></article>
      <article><small>Margen</small><strong className={styles.kpiLongValue}>{money(margin,currency)}</strong><span>Solo órdenes reales</span></article>
      <article><small>Interacciones externas</small><strong>{((amazonClicks||0)+(merchClicks||0)).toLocaleString()}</strong><span>Amazon + tienda</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · VIDEOJUEGOS</span><h2>Economía in-game</h2></div>
      <p>Ingresos, compradores y entrega digital provenientes del backend de los juegos. Las ventas no se crean manualmente desde el Admin.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Artículos virtuales activos</small><strong>{virtualItemRows.filter(i=>i.active).length}</strong><span>{virtualOfferRows.filter(o=>o.active).length} ofertas activas</span></article>
      <article><small>Ingresos in-game brutos</small><strong className={styles.kpiLongValue}>{money(inGameGross,inGameCurrency)}</strong><span>{paidGamePurchases.length} compras pagadas</span></article>
      <article><small>Ingresos in-game netos</small><strong className={styles.kpiLongValue}>{money(inGameNet,inGameCurrency)}</strong><span>Después de comisiones e impuestos registrados</span></article>
      <article><small>Jugadores pagadores</small><strong>{payingPlayers.size}</strong><span>ARPPU {money(arppu,inGameCurrency)}</span></article>
      <article><small>Conversión diaria</small><strong>{payerConversion.toFixed(2)}%</strong><span>{latestMetricDate?latestPayers+" de "+latestActivePlayers+" jugadores activos":"Sin telemetría diaria"}</span></article>
      <article className={pendingEntitlements.length?styles.kpiAttention:undefined}><small>Entregas digitales pendientes</small><strong>{pendingEntitlements.length}</strong><span>{pendingEntitlements.length?"Requieren revisión":"Sin incidencias de entrega"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>CATÁLOGO VIRTUAL</span><h2>Artículos y ofertas in-game</h2></div>
      <p>Skins, cosméticos, consumibles, pases y otros bienes digitales por videojuego.</p>
    </section>

    <section className={styles.grid}>
      {virtualItemRows.slice(0,12).map((i:any)=><article key={i.id} className={`${styles.card} ${!i.active?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={i.active?styles.badgeActive:styles.badgePlanned}>{i.active?"ACTIVO":"INACTIVO"}</span><em>{String(i.item_type||"virtual").replaceAll("_"," ").toUpperCase()}</em></div>
        <h3>{i.name}</h3>
        <p>{gameName(i.game_id)} · {i.sku}<br/>{String(i.grant_type||"durable").replaceAll("_"," ").toUpperCase()} · {String(i.rarity||"standard").toUpperCase()}<br/>{virtualOfferRows.filter(o=>o.item_id===i.id&&o.active).length} ofertas activas</p>
      </article>)}
      {!virtualItemRows.length&&<article className={styles.card}><h3>Catálogo FREEMIUM preparado</h3><p>Cuando se registren los videojuegos reales, aquí aparecerán sus artículos virtuales y ofertas por plataforma.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>COMPRAS IN-GAME</span><h2>Transacciones y entrega digital</h2></div>
      <p>Vista operativa de compras recibidas desde juegos/plataformas y del entitlement entregado al jugador.</p>
    </section>

    <section className={styles.grid}>
      {purchaseRows.slice(0,12).map((p:any)=><article key={p.id} className={`${styles.card} ${["failed","chargeback"].includes(p.status)?styles.cardAttention:p.status==="pending"?styles.cardWarning:""}`}>
        <div className={styles.cardTop}><span className={p.status==="paid"?styles.badgeActive:styles.badgePlanned}>{String(p.status).replaceAll("_"," ").toUpperCase()}</span><em>{String(p.platform||"").toUpperCase()}</em></div>
        <h3>{itemName(p.item_id)}</h3>
        <p>{gameName(p.game_id)} · {money(p.gross_cents,p.currency||"USD")} bruto · {money(p.net_cents??0,p.currency||"USD")} neto<br/>Jugador: {String(p.player_ref||"").slice(0,10)}… · {p.provider}</p>
      </article>)}
      {!purchaseRows.length&&<article className={styles.card}><h3>Sin compras in-game todavía</h3><p>Esta sección se alimentará automáticamente cuando los videojuegos comiencen a procesar compras reales.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>CATÁLOGO</span><h2>Ofertas y productos</h2></div>
      <p>Soporta redirección a proveedores, venta directa y captación de interés según el modelo comercial de LIRYGAMES.</p>
    </section>

    <section className={styles.grid}>
      {productRows.map((p:any,i:number)=><article key={p.sku||i} className={`${styles.card} ${!p.active?styles.cardMuted:p.stock_status==="out_of_stock"?styles.cardAttention:["preorder","backorder","limited"].includes(p.stock_status)?styles.cardWarning:""}`}>
        <div className={styles.cardTop}><span className={p.active?styles.badgeActive:styles.badgePlanned}>{p.active?"ACTIVO":"INACTIVO"}</span><em>{modeLabel(p.mode)}</em></div>
        <h3>{p.name_es||p.name_en||p.sku||"Producto"}</h3>
        <p>{p.price_cents!=null?money(p.price_cents,p.currency||"USD"):"Precio por definir"} · {paymentProviderLabel(p.payment_provider)}<br/>Disponibilidad: {stockLabel(p.stock_status)}</p>
      </article>)}
      {!productRows.length&&<article className={styles.card}><h3>Catálogo aún vacío</h3><p>La estructura de monetización está lista para cargar productos cuando corresponda.</p></article>}
    </section>
  </main>;
}
