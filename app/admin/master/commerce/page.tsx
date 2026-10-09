import { redirect } from "next/navigation";
import {paymentProviders,REAL_PAYMENTS_ENABLED} from "../../../../lib/payments/provider-contract";
import {LiryPaymentSimulation} from "../../../../components/LiryPaymentSimulation";
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

export default async function MasterCommercePage({searchParams}:{searchParams:Promise<{period?:string;game?:string;provider?:string;exportPage?:string}>}){
  const params=await searchParams;
  const period=["all","7d","30d","90d"].includes(params.period||"")?params.period:"30d";
  const gameFilter=String(params.game||"all").slice(0,120);
  const providerFilter=String(params.provider||"all").slice(0,60);
  const exportPageRaw=Number(params.exportPage||"1");
  const exportPage=Number.isSafeInteger(exportPageRaw)&&exportPageRaw>=1&&exportPageRaw<=10000?exportPageRaw:1;
  const exportQuery="period="+encodeURIComponent(period||"30d")+"&game="+encodeURIComponent(gameFilter)+"&provider="+encodeURIComponent(providerFilter);
  const commerceQuery="/admin/master/commerce?"+exportQuery;
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:orders},
    {count:products},
    {count:fulfillments},
    {data:settings},
    {data:gameEvents},
    {data:entitlements}
  ]=await Promise.all([
    supabase.from("shop_orders").select("order_number,total_cents,currency,payment_status,fulfillment_status,refund_status,customer_email,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("shop_products").select("*",{count:"exact",head:true}),
    supabase.from("shop_fulfillments").select("*",{count:"exact",head:true}),
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,default_payment_provider,tax_mode,shipping_label_mode").eq("id","default").maybeSingle(),
    supabase.from("game_purchase_events").select("id,game_id,item_id,player_ref,platform,provider,gross_cents,net_cents,currency,status,purchased_at").order("purchased_at",{ascending:false}).limit(500),
    supabase.from("game_entitlements").select("id,game_id,item_id,purchase_id,status,granted_at,expires_at,created_at").order("created_at",{ascending:false}).limit(500)
  ]);

  const rows=(orders||[]) as any[];
  const paid=rows.filter(o=>o.payment_status==="paid");
  const open=rows.filter(o=>!["fulfilled","delivered","canceled"].includes(o.fulfillment_status));
  const refunds=rows.filter(o=>o.refund_status&&o.refund_status!=="none");
  const totalPaid=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const currency=paid[0]?.currency||"USD";
  const gameEventRows=(gameEvents||[]) as any[];
  const entitlementRows=(entitlements||[]) as any[];
  const gamePaid=gameEventRows.filter(e=>e.status==="paid");
  const gameRevenue=gamePaid.reduce((a,e)=>a+Number(e.gross_cents||0),0);
  const gameCurrency=gamePaid[0]?.currency||"USD";
  const gamePaymentIssues=gameEventRows.filter(e=>["failed","chargeback"].includes(e.status));
  const entitlementIssues=entitlementRows.filter(e=>["pending","failed"].includes(e.status));
  const periodStart=period==="all"?0:Date.now()-Number.parseInt(period||"30",10)*86400000;
  const filteredGameEvents=gameEventRows.filter(e=>
    (period==="all"||(e.purchased_at&&new Date(e.purchased_at).getTime()>=periodStart))&&
    (gameFilter==="all"||String(e.game_id)===gameFilter)&&
    (providerFilter==="all"||String(e.provider)===providerFilter)
  );
  const gameOptions=[...new Set(gameEventRows.map(e=>String(e.game_id||"")).filter(Boolean))];
  const providerOptions=[...new Set(gameEventRows.map(e=>String(e.provider||"")).filter(Boolean))];
  const confirmedGameEvents=filteredGameEvents.filter(e=>e.status==="paid"||e.status==="refunded"||e.status==="partially_refunded");
  const revenueGroups=new Map<string,{label:string;currency:string;provider:string;game:string;count:number;gross:number;net:number;refunds:number}>();
  for(const e of confirmedGameEvents){
    const curr=String(e.currency||"USD");
    const prov=String(e.provider||"Sin proveedor");
    const game=String(e.game_id||"Sin videojuego");
    const key=JSON.stringify([game,prov,curr]);
    const group=revenueGroups.get(key)||{label:game+" · "+providerLabel(prov),currency:curr,provider:prov,game,count:0,gross:0,net:0,refunds:0};
    group.count+=1;
    group.gross+=Number(e.gross_cents||0);
    group.net+=Number(e.net_cents||0);
    if(e.status!=="paid")group.refunds+=1;
    revenueGroups.set(key,group);
  }
  const revenueSummary=[...revenueGroups.values()].sort((a,b)=>b.gross-a.gross);
  // Cierre informativo de la muestra consultada, no cierre contable certificado.
  // La fuente carece de campos separados para comisiones y reembolsos.
  const periodSummary=new Map<string,{currency:string;gross:number;net:number;paid:number;refundEvents:number;difference:number}>();
  for(const event of confirmedGameEvents){
    const currency=String(event.currency||"USD");
    const row=periodSummary.get(currency)||{currency,gross:0,net:0,paid:0,refundEvents:0,difference:0};
    const gross=Number(event.gross_cents||0),net=Number(event.net_cents||0);
    if(!Number.isSafeInteger(gross)||!Number.isSafeInteger(net))continue;
    row.gross+=gross;row.net+=net;
    if(event.status==="paid")row.paid++;else row.refundEvents++;
    row.difference=row.gross-row.net;
    periodSummary.set(currency,row);
  }
  const periodRows=[...periodSummary.values()].sort((a,b)=>a.currency.localeCompare(b.currency));


  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleCommerce}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · COMERCIO</span><h1>Comercio</h1><p>Pedidos, pagos, entregas y devoluciones sobre la tienda real.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <nav aria-label="Accesos rápidos de Comercio" className={styles.adminForms}>
      <a className={styles.formButton} href="#comercio-pagos">Pasarelas y pruebas ↓</a>
      <a className={styles.formButton} href="#comercio-reportes">Reportes y descargas ↓</a>
      <a className={styles.formButton} href="#comercio-conciliacion">Conciliación bancaria ↓</a>
      <a className={styles.formButton} href="#comercio-operaciones">Historial e incidencias ↓</a>
    </nav>
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
      <article><small>Pagado</small><strong className={styles.kpiLongValue}>{money(totalPaid,currency)}</strong><span>{paid.length} pedidos pagados</span></article>
      <article className={open.length?styles.kpiAttention:undefined}><small>Pendientes</small><strong>{open.length}</strong><span>{open.length?"Pedidos por completar":"Sin pedidos pendientes"}</span></article>
      <article className={refunds.length?styles.kpiAttention:undefined}><small>Reembolsos</small><strong>{refunds.length}</strong><span>{refunds.length?"Con devolución/reembolso":"Sin reembolsos registrados"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · VIDEOJUEGOS</span><h2>Compras y entrega digital</h2></div>
      <p>Operación de bienes virtuales separada del fulfillment físico. Las compras llegan desde los juegos y plataformas.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Compras in-game</small><strong>{gamePaid.length}</strong><span>{money(gameRevenue,gameCurrency)} bruto registrado</span></article>
      <article className={gamePaymentIssues.length?styles.kpiAttention:undefined}><small>Pagos con incidencia</small><strong>{gamePaymentIssues.length}</strong><span>{gamePaymentIssues.length?"Fallidos o chargeback":"Sin incidencias"}</span></article>
      <article className={entitlementIssues.length?styles.kpiAttention:undefined}><small>Entregas digitales</small><strong>{entitlementIssues.length}</strong><span>{entitlementIssues.length?"Pendientes o fallidas":"Sin incidencias"}</span></article>
      <article><small>Canal</small><strong className={styles.kpiCompactValue}>AUTOMÁTICO</strong><span>Backend firmado</span></article>
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
      <div id="comercio-pagos"><span>ARQUITECTURA MULTIPASARELA</span><h2>Cuatro opciones de pago</h2></div>
      <p>Empresa estadounidense en constitución. Ninguna cuenta ni cobro real activado. Proveedores sujetos a contratación y verificación.</p>
    </section>
    <section className={styles.grid}>
      {paymentProviders.map(provider=><article className={styles.card} key={provider.id}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>OPCIÓN {provider.priority}</span><em>{REAL_PAYMENTS_ENABLED?"REVISAR":"NO ACTIVA"}</em></div>
        <h3>{provider.displayName}</h3>
        <p>{provider.proposedGateway}</p>
        <p>Documentación empresarial y aprobación del proveedor pendientes.</p>
      </article>)}
    </section>
    <details className={styles.advancedPanel}><summary>Laboratorio de pagos (solo pruebas)</summary>
    <LiryPaymentSimulation />
    </details>
    <details className={styles.advancedPanel}><summary>Configuración comercial y controles técnicos</summary>
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

    </details>
    <section className={styles.sectionHead}>
      <div id="comercio-reportes"><span>CONSULTAR INGRESOS</span><h2>Filtros financieros</h2></div>
      <p>Los filtros operan sobre los últimos 500 eventos recuperados; no equivalen a una consulta histórica completa.</p>
    </section>
    <form method="get" action="/admin/master/commerce" className={styles.adminForms}>
      <article className={styles.adminForm}>
        <label>Período<select name="period" defaultValue={period}><option value="7d">Últimos 7 días</option><option value="30d">Últimos 30 días</option><option value="90d">Últimos 90 días</option><option value="all">Todos los eventos consultados</option></select></label>
        <label>Videojuego<select name="game" defaultValue={gameFilter}><option value="all">Todos</option>{gameOptions.map(v=><option value={v} key={v}>{v}</option>)}</select></label>
        <label>Procesador<select name="provider" defaultValue={providerFilter}><option value="all">Todos</option>{providerOptions.map(v=><option key={v} value={v}>{providerLabel(v)}</option>)}</select></label>
        <button className={styles.formButton} type="submit">Aplicar filtros</button>
      </article>
    </form>
    <section className={styles.sectionHead}><div><span>EXPORTACIÓN DE DATOS</span><h2>Descargar reportes por páginas</h2></div><p>Hasta 200 registros por archivo CSV; los filtros seleccionados se mantienen.</p></section>
    <div className={styles.adminForms}>
      <article className={styles.adminForm}>
        <p>Archivo seleccionado: página {exportPage} · hasta 200 movimientos.</p>
        <a className={styles.formButton} href={"/api/lirygames/reports/payments?"+exportQuery+"&page="+exportPage}>Descargar página {exportPage} (CSV) ↓</a>
        <p>
          {exportPage>1&&<a href={commerceQuery+"&exportPage="+(exportPage-1)}>← Página anterior</a>}
          {" · "}
          {exportPage<10000&&<a href={commerceQuery+"&exportPage="+(exportPage+1)}>Página siguiente →</a>}
        </p>
        <p>Una página posterior puede estar vacía si no existen más transacciones. Las simulaciones nunca se incluyen como ventas.</p>
      </article>
    </div>
    <details className={styles.advancedPanel}><summary>Conciliación, liquidaciones e incidencias bancarias</summary>
    <section className={styles.sectionHead}>
      <div id="comercio-conciliacion"><span>CONCILIACIÓN POR PROCESADOR</span><h2>Movimientos pendientes de verificar</h2></div>
      <p>Vista preparatoria basada en eventos existentes; no acredita que el proveedor haya transferido fondos al banco. Todavía faltan referencias de liquidación y estados bancarios.</p>
    </section>
    <section className={styles.grid}>
      {paymentProviders.map(provider=>{
        const records=filteredGameEvents.filter((e:any)=>e.provider===provider.id);
        const paidRecords=records.filter((e:any)=>e.status==="paid");
        const currencies=[...new Set(records.map((e:any)=>String(e.currency||"USD")))];
        return <article key={provider.id} className={styles.card}>
          <div className={styles.cardTop}><span className={styles.badgePlanned}>{provider.displayName}</span><em>NO CONCILIADO</em></div>
          <h3>{records.length} registros consultados</h3>
          <p>{paidRecords.length} eventos con estado pagado · {records.length-paidRecords.length} de otros estados.</p>
          {currencies.map(currency=>{
            const matches=paidRecords.filter((e:any)=>String(e.currency||"USD")===currency);
            return <p key={currency}>Bruto registrado ({currency}): {money(matches.reduce((sum:number,e:any)=>sum+Number(e.gross_cents||0),0),currency)}</p>;
          })}
          <p>Liquidación bancaria: no verificada · Comisiones efectivas: sin confirmar.</p>
        </article>;
      })}
    </section>
    <section className={styles.sectionHead}>
      <div><span>INCIDENCIAS BANCARIAS</span><h2>Control de diferencias y depósitos</h2></div>
      <p>Clasificación preparada: depósito insuficiente, depósito superior, comprobantes pendientes o referencias ausentes. Los resultados se calcularán únicamente cuando existan lotes verificados.</p>
    </section>
    <section className={styles.grid}>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>SIN DATOS VERIFICADOS</span><em>NO CONCILIADO</em></div>
        <h3>Incidencias de conciliación</h3>
        <p>Sin liquidaciones bancarias registradas en este módulo. No existe evidencia para declarar diferencias ni depósitos confirmados.</p>
        <p>Al conectar el registro bancario podrán detectarse importes distintos, comprobantes faltantes y casos para revisión humana.</p>
      </article>
    </section>
    <section className={styles.sectionHead}>
      <div><span>REGISTRO DE LIQUIDACIONES</span><h2>Seguimiento bancario</h2></div>
      <p>El registro bancario persistente está diseñado, pero todavía no se ha instalado la tabla ni conectado a los extractos. Ningún depósito se considera verificado.</p>
    </section>
    <section className={styles.grid}>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>PENDIENTE DE ACTIVACIÓN</span><em>SIN DEPÓSITOS CONCILIADOS</em></div>
        <h3>Liquidaciones bancarias</h3>
        <p>Faltan cuenta bancaria de la empresa estadounidense, credenciales de procesadores, pruebas en ambiente aislado y comprobantes de depósito.</p>
        <p>Las cifras anteriores son movimientos registrados; no representan efectivo confirmado en el banco.</p>
      </article>
    </section>
    <section className={styles.sectionHead}>
      <div><span>CIERRE INFORMATIVO · PERÍODO SELECCIONADO</span><h2>Resumen de ventas y ajustes registrados</h2></div>
      <p>Información parcial de la muestra consultada: no es un cierre contable certificado. La fuente no separa comisiones de reembolsos en importes específicos.</p>
    </section>
    <section className={styles.grid}>
      {periodRows.map(period=><article key={period.currency} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{period.currency}</span><em>{String(params.period||"30d").toUpperCase()}</em></div>
        <h3>Resumen por moneda</h3>
        <p>Ventas registradas: {period.paid} · Eventos de devolución: {period.refundEvents}</p>
        <p>Bruto registrado: <strong>{money(period.gross,period.currency)}</strong></p>
        <p>Neto registrado: <strong>{money(period.net,period.currency)}</strong></p>
        <p>Diferencia bruto-neto: {money(period.difference,period.currency)} · <strong>Sin desglose confirmado entre comisiones, devoluciones e impuestos.</strong></p>
      </article>)}
      {!periodRows.length&&<article className={styles.card}><h3>Sin movimientos para el período</h3><p>Los cierres no incluyen transacciones de demostración. No se muestran valores inventados.</p></article>}
    </section>
    <section className={styles.sectionHead}>
      <div><span>RESUMEN FINANCIERO</span><h2>Ingresos por videojuego y procesador</h2></div>
      <p>Resumen de los últimos 500 eventos consultados; importes agrupados por moneda sin mezclar divisas. No incluye simulaciones.</p>
    </section>
    <section className={styles.grid}>
      {revenueSummary.map(group=><article className={styles.card} key={JSON.stringify([group.game,group.provider,group.currency])}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{providerLabel(group.provider)}</span><em>{group.currency}</em></div>
        <h3>{group.game}</h3>
        <p>Registros: {group.count} · Eventos de devolución: {group.refunds}</p>
        <p>Bruto registrado: <strong>{money(group.gross,group.currency)}</strong></p>
        <p>Neto registrado: <strong>{money(group.net,group.currency)}</strong></p>
      </article>)}
      {!revenueSummary.length&&<article className={styles.card}><h3>Sin ingresos registrados</h3><p>El reporte se alimentará de eventos reales registrados. No contabiliza el laboratorio de pagos.</p></article>}
    </section>
    </details>
    <details className={styles.advancedPanel}><summary>Historial de compras virtuales e incidencias de entrega</summary>
    <section className={styles.sectionHead}>
      <div id="comercio-operaciones"><span>AUDITORÍA DE VIDEOJUEGOS</span><h2>Historial de compras virtuales</h2></div>
      <p>Eventos registrados en el backend. Las simulaciones no se contabilizan como ingresos ni compras reales.</p>
    </section>
    <section className={styles.grid}>
      {gameEventRows.slice(0,18).map((event:any)=><article key={event.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{paymentLabel(event.status)}</span><em>{providerLabel(event.provider)}</em></div>
        <h3>Transacción {String(event.id).slice(0,8)}</h3>
        <p>Videojuego: {event.game_id||"No registrado"} · Artículo: {event.item_id||"No registrado"}</p>
        <p>Bruto: {money(Number(event.gross_cents||0),event.currency||"USD")} · Neto registrado: {money(Number(event.net_cents||0),event.currency||"USD")}</p>
        <p>Canal: {event.platform||"No registrado"} · Jugador: {event.player_ref?"Identificador registrado":"No registrado"}</p>
        <p>Fecha: {event.purchased_at?new Date(event.purchased_at).toLocaleString("es-US"):"No registrada"}</p>
      </article>)}
      {!gameEventRows.length&&<article className={styles.card}><h3>Sin transacciones virtuales registradas</h3><p>Los movimientos aparecerán cuando se reciban datos válidos de videojuegos y pasarelas. Las pruebas permanecen separadas.</p></article>}
    </section>
    <section className={styles.sectionHead}>
      <div><span>INCIDENCIAS DIGITALES</span><h2>Entregas que requieren revisión</h2></div>
      <p>Identifica artículos pendientes o con errores sin modificar automáticamente el inventario de los jugadores.</p>
    </section>
    <section className={styles.grid}>
      {entitlementRows.filter((ent:any)=>["pending","failed"].includes(ent.status)).slice(0,12).map((ent:any)=><article key={ent.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{ent.status==="failed"?"FALLIDA":"PENDIENTE"}</span><em>REVISIÓN</em></div>
        <h3>Entrega {String(ent.id).slice(0,8)}</h3>
        <p>Videojuego: {ent.game_id} · Artículo: {ent.item_id}</p>
        <p>Compra: {ent.purchase_id||"No asociada"} · Fecha: {ent.created_at?new Date(ent.created_at).toLocaleString("es-US"):"No registrada"}</p>
      </article>)}
      {!entitlementIssues.length&&<article className={styles.card}><h3>Sin incidencias registradas</h3><p>No hay entregas pendientes o fallidas entre los registros consultados.</p></article>}
    </section>
    </details>
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
