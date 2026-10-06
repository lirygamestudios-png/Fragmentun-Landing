"use client";
import {useEffect,useMemo,useState} from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

type ReportData={summary:any;by_provider:Record<string,{orders:number;revenue_cents:number}>;by_product:Array<{name:string;sku:string|null;quantity:number;revenue_cents:number;tax_cents:number;supplier_cost_cents:number}>;fulfillment_status:Record<string,number>;orders:any[]};

function money(cents:number,currency="USD"){return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((Number(cents||0))/100)}
function csvCell(v:any){const s=String(v??"");return '"'+s.replace(/"/g,'""')+'"'}

export function AdminCommerceReports(){
  const[data,setData]=useState<ReportData|null>(null);
  const[from,setFrom]=useState("");
  const[to,setTo]=useState("");
  const[msg,setMsg]=useState("");
  const[loading,setLoading]=useState(false);

  async function load(){
    setLoading(true);setMsg("");
    const q=new URLSearchParams();if(from)q.set("from",from);if(to)q.set("to",to);
    const r=await fetch("/api/admin/commerce/reports?"+q.toString(),{cache:"no-store"});
    const j=await r.json().catch(()=>({}));setLoading(false);
    if(!r.ok){setMsg(j.error||"No fue posible generar el reporte.");return}setData(j);
  }
  useEffect(()=>{load()},[]);

  const maxProvider=useMemo(()=>data?Math.max(1,...Object.values(data.by_provider).map(v=>v.revenue_cents)):1,[data]);

  function exportCsv(){
    if(!data)return;
    const rows=[["Orden","Fecha","Cliente","Procesador","Pago","Fulfillment","Subtotal","Impuesto","Envío","Total","Comisión","Costo proveedor","Costo envío","Margen","Moneda"],
      ...data.orders.map(o=>[o.order_number,o.created_at,o.customer_email||"",o.payment_provider||"",o.payment_status,o.fulfillment_status,o.subtotal_cents/100,o.tax_cents/100,o.shipping_cents/100,o.total_cents/100,o.payment_fee_cents/100,o.supplier_cost_cents/100,o.shipping_cost_cents/100,o.margin_cents/100,o.currency])];
    const csv="\ufeff"+rows.map(r=>r.map(csvCell).join(",")).join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});const url=URL.createObjectURL(blob);const a=document.createElement("a");
    a.href=url;a.download="fragmentun-reporte-tienda-"+(from||"inicio")+"-"+(to||"actualidad")+".csv";document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url);
  }

  if(loading&&!data)return <section className="card adminStoreReport"><FragmentunProcessOverlay compact state="loading" title="GENERANDO REPORTE…"/></section>;
  if(!data&&!loading)return <section className="card adminStoreReport"><p className="adminSaveFeedback error">{msg||"No fue posible cargar reportes."}</p></section>;

  return <section className="card adminStoreReport" id="reporte-tienda">
    <div className="adminPanelHeader noPrint"><div><div className="kicker">REPORTES DE TIENDA</div><h2>Ventas, impuestos y operación</h2><p className="note">Dashboard visual y reporte imprimible para administración de la franquicia.</p></div><span className="adminPanelBadge">REPORTING</span></div>
    <div className="adminReportToolbar noPrint">
      <label><span>Desde</span><input type="date" value={from} onChange={e=>setFrom(e.target.value)}/></label>
      <label><span>Hasta</span><input type="date" value={to} onChange={e=>setTo(e.target.value)}/></label>
      <button className="btn btnPrimary" type="button" onClick={load} disabled={loading}>{loading?"Generando…":"Aplicar período"}</button>
      <button className="btn btnGhost" type="button" onClick={()=>window.print()}>Imprimir / PDF</button>
      <button className="btn btnGhost" type="button" onClick={exportCsv}>Exportar CSV</button>
    </div>
    <div className="printOnly adminReportPrintHead"><div className="kicker">FRAGMENTUN · REPORTE DE TIENDA</div><h1>Informe comercial</h1><p>Período: {from||"inicio"} — {to||"actualidad"}</p></div>
    {data&&<>
      <div className="adminReportKpis">
        <div><span>Ventas brutas</span><strong>{money(data.summary.gross_sales_cents)}</strong><small>{data.summary.paid_orders} órdenes pagadas</small></div>
        <div><span>Impuestos</span><strong>{money(data.summary.tax_cents)}</strong><small>Cobrados en el período</small></div>
        <div><span>Costos</span><strong>{money(data.summary.supplier_cost_cents+data.summary.shipping_cost_cents+data.summary.payment_fees_cents)}</strong><small>Proveedor + envío + comisiones</small></div>
        <div><span>Margen estimado</span><strong>{money(data.summary.margin_cents)}</strong><small>Según costos registrados</small></div>
      </div>
      <div className="adminReportGrid">
        <article className="adminReportPanel"><div className="kicker">PROCESADORES</div><h3>Stripe / PayPal</h3>
          {Object.keys(data.by_provider).length===0?<p className="note">Sin ventas todavía.</p>:Object.entries(data.by_provider).map(([name,v])=><div className="adminReportBarRow" key={name}><div><strong>{name.toUpperCase()}</strong><span>{v.orders} órdenes · {money(v.revenue_cents)}</span></div><div className="adminReportBar"><i style={{width:String(Math.max(4,(v.revenue_cents/maxProvider)*100))+"%"}}/></div></div>)}
        </article>
        <article className="adminReportPanel"><div className="kicker">FULFILLMENT</div><h3>Estado de envíos</h3>
          {Object.keys(data.fulfillment_status).length===0?<p className="note">Sin envíos todavía.</p>:<div className="adminReportStatusList">{Object.entries(data.fulfillment_status).map(([name,count])=><div key={name}><span>{name}</span><strong>{count}</strong></div>)}</div>}
          <div className="adminReportMiniKpis"><span>Etiquetas <b>{data.summary.labels}</b></span><span>Costo etiquetas <b>{money(data.summary.label_cost_cents)}</b></span></div>
        </article>
        <article className="adminReportPanel adminReportWide"><div className="kicker">RESULTADO</div><h3>Desglose financiero</h3><div className="adminReportLedger">
          <span>Subtotal <b>{money(data.summary.subtotal_cents)}</b></span><span>Descuentos <b>- {money(data.summary.discounts_cents)}</b></span><span>Envío cobrado <b>{money(data.summary.shipping_charged_cents)}</b></span><span>Impuestos <b>{money(data.summary.tax_cents)}</b></span>
          <span>Comisiones de pago <b>- {money(data.summary.payment_fees_cents)}</b></span><span>Costo proveedor <b>- {money(data.summary.supplier_cost_cents)}</b></span><span>Costo real de envío <b>- {money(data.summary.shipping_cost_cents)}</b></span><span className="total">Margen estimado <b>{money(data.summary.margin_cents)}</b></span>
        </div></article>
      </div>
      <div className="adminReportPanel adminReportProducts"><div className="adminPanelHeader"><div><div className="kicker">PRODUCTOS</div><h3>Rendimiento por producto</h3></div><span className="adminPanelBadge">{data.by_product.length} PRODUCTOS</span></div>
        <div className="adminReportTableWrap"><table className="adminReportTable"><thead><tr><th>Producto</th><th>SKU</th><th>Unidades</th><th>Ventas</th><th>Impuesto</th><th>Costo proveedor</th></tr></thead><tbody>
          {data.by_product.length===0?<tr><td colSpan={6}>Sin ventas registradas.</td></tr>:data.by_product.map(p=><tr key={p.sku||p.name}><td>{p.name}</td><td>{p.sku||"—"}</td><td>{p.quantity}</td><td>{money(p.revenue_cents)}</td><td>{money(p.tax_cents)}</td><td>{money(p.supplier_cost_cents)}</td></tr>)}
        </tbody></table></div>
      </div>
      <div className="adminReportPanel adminReportOrders"><div className="adminPanelHeader"><div><div className="kicker">DETALLE</div><h3>Órdenes del período</h3></div><span className="adminPanelBadge">{data.orders.length} ÓRDENES</span></div>
        <div className="adminReportTableWrap"><table className="adminReportTable"><thead><tr><th>Orden</th><th>Fecha</th><th>Procesador</th><th>Pago</th><th>Fulfillment</th><th>Total</th><th>Margen</th></tr></thead><tbody>
          {data.orders.length===0?<tr><td colSpan={7}>No hay órdenes para este período.</td></tr>:data.orders.map(o=><tr key={o.order_number}><td>{o.order_number}</td><td>{new Date(o.created_at).toLocaleDateString()}</td><td>{o.payment_provider||"—"}</td><td>{o.payment_status}</td><td>{o.fulfillment_status}</td><td>{money(o.total_cents,o.currency)}</td><td>{money(o.margin_cents,o.currency)}</td></tr>)}
        </tbody></table></div>
      </div>
      <p className="adminReportFoot">FRAGMENTUN · Reporte administrativo generado desde el Control Center.</p>
    </>}
    {msg&&<p className="note noPrint">{msg}</p>}
  </section>;
}