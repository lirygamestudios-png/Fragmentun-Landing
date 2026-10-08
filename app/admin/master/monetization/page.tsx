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

async function requireMonetizationEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createVirtualItem(formData:FormData){
  "use server";
  const{supabase,user}=await requireMonetizationEditor();
  const gameId=String(formData.get("game_id")||"").trim();
  const sku=String(formData.get("sku")||"").trim();
  const name=String(formData.get("name")||"").trim();
  const itemType=String(formData.get("item_type")||"cosmetic");
  const rarity=String(formData.get("rarity")||"standard");
  const grantType=String(formData.get("grant_type")||"durable");
  const description=String(formData.get("description")||"").trim()||null;
  const durationRaw=String(formData.get("duration_seconds")||"").trim();
  const durationSeconds=durationRaw?Number(durationRaw):null;
  const allowedItemTypes=new Set(["skin","cosmetic","attack_item","booster","consumable","currency_pack","battle_pass","expansion","premium_access","subscription","other"]);
  const allowedRarity=new Set(["standard","common","uncommon","rare","epic","legendary","exclusive"]);
  const allowedGrant=new Set(["durable","consumable","timed"]);
  if(!gameId||!sku||!name||!allowedItemTypes.has(itemType)||!allowedRarity.has(rarity)||!allowedGrant.has(grantType)) throw new Error("invalid_virtual_item");
  if(grantType==="timed"&&(!durationSeconds||!Number.isSafeInteger(durationSeconds)||durationSeconds<=0)) throw new Error("timed_duration_required");
  const{error}=await supabase.from("game_virtual_items").insert({
    game_id:gameId,sku,name,description,item_type:itemType,rarity,grant_type:grantType,
    duration_seconds:grantType==="timed"?Math.trunc(durationSeconds as number):null,active:true,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/monetization");
}

async function createVirtualOffer(formData:FormData){
  "use server";
  const{supabase,user}=await requireMonetizationEditor();
  const itemId=String(formData.get("item_id")||"").trim();
  const platform=String(formData.get("platform")||"").trim();
  const externalSku=String(formData.get("external_sku")||"").trim()||null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const price=Number(formData.get("price")||0);
  const regions=String(formData.get("region_scope")||"").split(",").map(v=>v.trim()).filter(Boolean);
  if(!itemId||!platform||!Number.isFinite(price)||price<0||price>99999999||Math.round(price*100)/100!==price||!/^[A-Z]{3}$/.test(currency)) throw new Error("invalid_virtual_offer");
  const{error}=await supabase.from("game_virtual_item_offers").insert({
    item_id:itemId,platform,external_sku:externalSku,currency,price_cents:Math.round(price*100),region_scope:regions,active:true,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/monetization");
}

export default async function MasterMonetizationPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:products,error:productsError},
    {data:orders,error:ordersError},
    {count:amazonClicks,error:amazonClicksError},
    {count:merchClicks,error:merchClicksError},
    {data:games,error:gamesError},
    {data:virtualItems,error:virtualItemsError},
    {data:virtualOffers,error:virtualOffersError},
    {data:gamePurchases,error:gamePurchasesError},
    {data:entitlements,error:entitlementsError},
    {data:engagement,error:engagementError}
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

  const externalClicksAvailable=!amazonClicksError&&!merchClicksError;
  const productsAvailable=!productsError;
  const ordersAvailable=!ordersError;
  const productRows=(products||[]) as any[];
  const orderRows=(orders||[]) as any[];
  const paid=orderRows.filter(o=>o.payment_status==="paid");
  const revenue=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const margin=paid.reduce((a,o)=>a+Number(o.margin_cents||0),0);
  const currency=paid[0]?.currency||productRows[0]?.currency||"USD";
  const active=productRows.filter(p=>p.active);
  const featured=productRows.filter(p=>p.featured);
  const gamesAvailable=!gamesError;
  const gameRows=(games||[]) as any[];
  const virtualItemRows=(virtualItems||[]) as any[];
  const virtualOfferRows=(virtualOffers||[]) as any[];
  const purchaseRows=(gamePurchases||[]) as any[];
  const entitlementRows=(entitlements||[]) as any[];
  const engagementRows=(engagement||[]) as any[];
  const purchaseDataAvailable=!gamePurchasesError;
  const itemDataAvailable=!virtualItemsError;
  const offerDataAvailable=!virtualOffersError;
  const deliveryDataAvailable=!entitlementsError;
  const engagementDataAvailable=!engagementError;
  const paidGamePurchases=purchaseRows.filter(p=>p.status==="paid");
  // Los importes de distintas monedas no se suman ni se convierten implícitamente.
  const inGameCurrency=paidGamePurchases[0]?.currency||virtualOfferRows[0]?.currency||"USD";
  const paidPurchasesInCurrency=paidGamePurchases.filter(p=>p.currency===inGameCurrency);
  const{count:allPaidCount,error:allPaidError}=await supabase.from("game_purchase_events").select("*",{count:"exact",head:true}).eq("status","paid").eq("currency",inGameCurrency);
  const multipleGameCurrencies=new Set(paidGamePurchases.map(p=>p.currency).filter(Boolean)).size>1;
  const inGameGross=paidPurchasesInCurrency.reduce((a,p)=>a+Number(p.gross_cents||0),0);
  const inGameNet=paidPurchasesInCurrency.reduce((a,p)=>a+Number(p.net_cents??(Number(p.gross_cents||0)-Number(p.fee_cents||0)-Number(p.tax_cents||0))),0);
  const payingPlayers=new Set(paidPurchasesInCurrency.map(p=>p.player_ref).filter(Boolean));
  const arppu=payingPlayers.size?Math.round(inGameGross/payingPlayers.size):null;
  const latestMetricDate=engagementRows[0]?.metric_date||null;
  // Solo comparar compras y jugadores activos de un mismo juego, plataforma y día.
  // Con datos truncados se indica que la conversión es una muestra, no una tasa global.
  const currentMetrics=latestMetricDate?engagementRows.filter(r=>r.metric_date===latestMetricDate):[];
  const currentPayers=new Set(paidGamePurchases.filter(p=>
    latestMetricDate&&String(p.purchased_at||"").slice(0,10)===latestMetricDate&&
    currentMetrics.some(m=>m.game_id===p.game_id&&m.platform===p.platform)
  ).map(p=>[p.game_id,p.platform,p.player_ref].join("|")));
  const latestActivePlayers=currentMetrics.reduce((a,r)=>a+Number(r.active_players||0),0);
  const payerConversion=latestActivePlayers&&currentMetrics.length?100*currentPayers.size/latestActivePlayers:null;
  const conversionExceedsPopulation=payerConversion!==null&&payerConversion>100;
  const purchaseSampleLimited=purchaseRows.length>=2000;
  const metricSampleLimited=engagementRows.length>=500;
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
      <article><small>Productos activos</small><strong>{productsAvailable?active.length:"NO DISPONIBLE"}</strong><span>{productsAvailable?featured.length+" destacados":"No se pudo consultar el catálogo"}</span></article>
      <article><small>Ingresos cobrados</small><strong className={styles.kpiLongValue}>{ordersAvailable?money(revenue,currency):"NO DISPONIBLE"}</strong><span>Solo órdenes reales de la muestra consultada</span></article>
      <article><small>Margen</small><strong className={styles.kpiLongValue}>{ordersAvailable?money(margin,currency):"NO DISPONIBLE"}</strong><span>Solo órdenes reales de la muestra consultada</span></article>
      <article><small>Interacciones externas</small><strong>{externalClicksAvailable?((amazonClicks||0)+(merchClicks||0)).toLocaleString():"NO DISPONIBLE"}</strong><span>{externalClicksAvailable?"Amazon + tienda · Recuento real":"No se pudieron consultar las interacciones externas"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · VIDEOJUEGOS</span><h2>Economía in-game</h2></div>
      <p>Ingresos, compradores y entrega digital provenientes del backend de los juegos. Las ventas no se crean manualmente desde el Admin.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Artículos virtuales activos</small><strong>{itemDataAvailable?virtualItemRows.filter(i=>i.active).length:"NO DISPONIBLE"}</strong><span>{offerDataAvailable?virtualOfferRows.filter(o=>o.active).length+" ofertas activas":"Ofertas: datos no disponibles"}</span></article>
      <article><small>Compras pagadas acumuladas</small><strong>{allPaidError?"NO DISPONIBLE":(allPaidCount??0).toLocaleString()}</strong><span>Recuento completo de compras pagadas en {inGameCurrency}; no representa ingresos totales</span></article>
      <article><small>Ingresos in-game brutos (muestra)</small><strong className={styles.kpiLongValue}>{purchaseDataAvailable?money(inGameGross,inGameCurrency):"NO DISPONIBLE"}</strong><span>{paidPurchasesInCurrency.length} compras pagadas · {inGameCurrency}{multipleGameCurrencies?" · Existen otras monedas":""} · Últimas 2,000 compras consultadas</span></article>
      <article><small>Ingresos in-game netos (muestra)</small><strong className={styles.kpiLongValue}>{purchaseDataAvailable?money(inGameNet,inGameCurrency):"NO DISPONIBLE"}</strong><span>Después de comisiones e impuestos registrados · {inGameCurrency}{multipleGameCurrencies?" · Otras monedas excluidas":""} · Máximo 2,000 compras recientes</span></article>
      <article><small>Jugadores pagadores (muestra)</small><strong>{purchaseDataAvailable?payingPlayers.size:"NO DISPONIBLE"}</strong><span>{arppu===null?"ARPPU sin compradores":"ARPPU de muestra "+money(arppu,inGameCurrency)} · {inGameCurrency} · Máximo 2,000 compras recientes</span></article>
      <article><small>Conversión diaria (muestra)</small><strong>{!purchaseDataAvailable||!engagementDataAvailable?"NO DISPONIBLE":payerConversion===null?"SIN DATOS":conversionExceedsPopulation?"REVISAR":payerConversion.toFixed(2)+"%"}</strong><span>{payerConversion===null?"Sin datos comparables por juego y plataforma":currentPayers.size+" combinaciones de jugador/juego/plataforma frente a "+latestActivePlayers+" jugadores activos · "+latestMetricDate+(conversionExceedsPopulation?" · Muestras incompatibles: revisar fuentes":"")}{purchaseSampleLimited||metricSampleLimited?" · Lectura parcial por límite de consulta":""}</span></article>
      <article className={pendingEntitlements.length?styles.kpiAttention:undefined}><small>Entregas digitales pendientes</small><strong>{deliveryDataAvailable?pendingEntitlements.length:"NO DISPONIBLE"}</strong><span>{!deliveryDataAvailable?"No se pudo consultar el estado de las entregas":pendingEntitlements.length?"Requieren revisión":"Sin incidencias en los últimos 2,000 registros consultados"}</span></article>
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Gestionar catálogo FREEMIUM</summary>
      <p className={styles.advancedHint}>Aquí se define qué se vende. Las compras y entregas llegan automáticamente desde el backend de cada videojuego.</p>
      <section className={styles.adminForms}>
        <MasterActionForm action={createVirtualItem} className={styles.adminForm} successText="Artículo virtual registrado correctamente.">
          <div className={styles.formTitle}><span>CATÁLOGO VIRTUAL</span><h2>Registrar artículo</h2></div>
          <div className={styles.formGrid}>
            <label>Juego<select name="game_id" required defaultValue=""><option value="" disabled>Seleccionar juego</option>{gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
            <label>SKU<input name="sku" required placeholder="skin-001"/></label>
            <label>Nombre<input name="name" required placeholder="Nombre del artículo"/></label>
            <label>Tipo<select name="item_type" defaultValue="skin">
              <option value="skin">Skin</option>
              <option value="cosmetic">Cosmético</option>
              <option value="attack_item">Elemento de ataque</option>
              <option value="booster">Booster</option>
              <option value="consumable">Consumible</option>
              <option value="currency_pack">Paquete de moneda</option>
              <option value="battle_pass">Battle Pass</option>
              <option value="expansion">Expansión</option>
              <option value="premium_access">Acceso premium</option>
              <option value="subscription">Suscripción</option>
              <option value="other">Otro</option>
            </select></label>
            <label>Rareza<select name="rarity" defaultValue="standard">
              <option value="standard">Estándar</option><option value="common">Común</option><option value="uncommon">Poco común</option>
              <option value="rare">Raro</option><option value="epic">Épico</option><option value="legendary">Legendario</option><option value="exclusive">Exclusivo</option>
            </select></label>
            <label>Entrega<select name="grant_type" defaultValue="durable">
              <option value="durable">Permanente</option><option value="consumable">Consumible</option><option value="timed">Temporal</option>
            </select></label>
            <label>Duración (segundos)<input type="number" min="1" name="duration_seconds" placeholder="Solo para temporal"/></label>
            <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
          </div>
          <MasterSubmitButton className={styles.formButton} disabled={!gamesAvailable||!gameRows.length} disabledReason={gamesAvailable?"Primero registra al menos un videojuego real.":"No se pudo consultar la lista de videojuegos."}>Registrar artículo</MasterSubmitButton>
        </MasterActionForm>

        <MasterActionForm action={createVirtualOffer} className={styles.adminForm} successText="Oferta virtual registrada correctamente.">
          <div className={styles.formTitle}><span>PRECIO POR PLATAFORMA</span><h2>Registrar oferta</h2></div>
          <div className={styles.formGrid}>
            <label>Artículo<select name="item_id" required defaultValue=""><option value="" disabled>Seleccionar artículo</option>{virtualItemRows.map((i:any)=><option key={i.id} value={i.id}>{gameName(i.game_id)} · {i.name}</option>)}</select></label>
            <label>Plataforma<input name="platform" required placeholder="Steam / PlayStation / Xbox / Web"/></label>
            <label>SKU externo<input name="external_sku" placeholder="SKU de plataforma"/></label>
            <label>Precio<input type="number" min="0" step="0.01" name="price" required placeholder="4.99"/></label>
            <label>Moneda<input name="currency" defaultValue="USD" maxLength={3}/></label>
            <label>Regiones<input name="region_scope" placeholder="US, DO, MX"/></label>
          </div>
          <MasterSubmitButton className={styles.formButton} disabled={!itemDataAvailable||!virtualItemRows.length} disabledReason={itemDataAvailable?"Primero registra un artículo virtual.":"No se pudo consultar el catálogo virtual."}>Registrar oferta</MasterSubmitButton>
        </MasterActionForm>
      </section>
    </details>}

    <section className={styles.sectionHead}>
      <div><span>CATÁLOGO VIRTUAL</span><h2>Artículos y ofertas in-game</h2></div>
      <p>Skins, cosméticos, consumibles, pases y otros bienes digitales por videojuego.</p>
    </section>

    <section className={styles.grid}>
      {virtualItemRows.slice(0,12).map((i:any)=><article key={i.id} className={`${styles.card} ${!i.active?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={i.active?styles.badgeActive:styles.badgePlanned}>{i.active?"ACTIVO":"INACTIVO"}</span><em>{String(i.item_type||"virtual").replaceAll("_"," ").toUpperCase()}</em></div>
        <h3>{i.name}</h3>
        <p>{gameName(i.game_id)} · {i.sku}<br/>{String(i.grant_type||"durable").replaceAll("_"," ").toUpperCase()} · {String(i.rarity||"standard").toUpperCase()}<br/>{offerDataAvailable?virtualOfferRows.filter(o=>o.item_id===i.id&&o.active).length+" ofertas activas":"Ofertas no disponibles"}</p>
      </article>)}
      {!virtualItemRows.length&&<article className={styles.card}><h3>{itemDataAvailable?"Catálogo FREEMIUM preparado":"Catálogo no disponible"}</h3><p>{itemDataAvailable?"Cuando se registren los videojuegos reales, aquí aparecerán sus artículos virtuales y ofertas por plataforma.":"No se pudieron consultar los artículos virtuales. Vuelve a intentarlo más tarde."}</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>COMPRAS IN-GAME</span><h2>Transacciones y entrega digital</h2></div>
      <p>Vista operativa de compras recibidas desde juegos/plataformas y del entitlement entregado al jugador.</p>
    </section>

    <section className={styles.grid}>
      {purchaseRows.slice(0,12).map((p:any)=><article key={p.id} className={`${styles.card} ${["failed","chargeback"].includes(p.status)?styles.cardAttention:p.status==="pending"?styles.cardWarning:""}`}>
        <div className={styles.cardTop}><span className={p.status==="paid"?styles.badgeActive:styles.badgePlanned}>{String(p.status).replaceAll("_"," ").toUpperCase()}</span><em>{String(p.platform||"").toUpperCase()}</em></div>
        <h3>{itemName(p.item_id)}</h3>
        <p>{gameName(p.game_id)} · {money(p.gross_cents,p.currency||"USD")} bruto · {money(p.net_cents??(Number(p.gross_cents||0)-Number(p.fee_cents||0)-Number(p.tax_cents||0)),p.currency||"USD")} neto<br/>Jugador: {String(p.player_ref||"").slice(0,10)}… · {p.provider}</p>
      </article>)}
      {!purchaseRows.length&&<article className={styles.card}><h3>{purchaseDataAvailable?"Sin compras in-game todavía":"Compras no disponibles"}</h3><p>{purchaseDataAvailable?"Esta sección se alimentará automáticamente cuando los videojuegos comiencen a procesar compras reales.":"No se pudo consultar el historial de compras. No significa que las ventas sean cero."}</p></article>}
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
      {!productRows.length&&<article className={styles.card}><h3>{productsAvailable?"Catálogo aún vacío":"Catálogo no disponible"}</h3><p>{productsAvailable?"La estructura de monetización está lista para cargar productos cuando corresponda.":"No se pudo consultar el catálogo comercial; intenta nuevamente más tarde."}</p></article>}
    </section>
  </main>;
}
