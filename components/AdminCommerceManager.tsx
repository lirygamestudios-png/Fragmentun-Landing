"use client";
import {useEffect,useMemo,useState} from "react";

type Product={id:string;sku:string|null;name_es:string;name_en:string|null;mode:string;payment_provider:string;external_url:string|null;price_cents:number|null;currency:string;active:boolean;featured:boolean;stock_status:string};
type Order={id:string;order_number:string;customer_email:string|null;payment_provider:string|null;payment_status:string;fulfillment_status:string;refund_status:string;total_cents:number;currency:string;created_at:string;notes:string|null};
type Fulfillment={id:string;order_id:string;supplier:string|null;carrier:string|null;service:string|null;tracking_number:string|null;tracking_url:string|null;shipment_status:string;package_weight_grams:number|null;package_dimensions:{length_cm?:number;width_cm?:number;height_cm?:number}|null;label_provider:string|null;shipping_label_url:string|null;shipping_label_format:string|null;label_cost_cents:number;label_created_at:string|null};

const emptyProduct={sku:"",name_es:"",name_en:"",mode:"interest",payment_provider:"auto",external_url:"",price_cents:"",currency:"USD",active:false,featured:false,stock_status:"unknown"};

export function AdminCommerceManager(){
  const[products,setProducts]=useState<Product[]>([]);
  const[orders,setOrders]=useState<Order[]>([]);
  const[fulfillments,setFulfillments]=useState<Fulfillment[]>([]);
  const[draft,setDraft]=useState<any>(emptyProduct);
  const[msg,setMsg]=useState("");
  const[busy,setBusy]=useState(false);

  const load=async()=>{
    const r=await fetch("/api/admin/commerce/manage",{cache:"no-store"});
    const j=await r.json().catch(()=>({}));
    if(r.ok){setProducts(j.products||[]);setOrders(j.orders||[]);setFulfillments(j.fulfillments||[])}
  };
  useEffect(()=>{load()},[]);

  const paid=useMemo(()=>orders.filter(o=>o.payment_status==="paid").length,[orders]);
  const pending=useMemo(()=>orders.filter(o=>["unfulfilled","processing","partially_fulfilled"].includes(o.fulfillment_status)).length,[orders]);

  async function createProduct(){
    if(!draft.name_es.trim()){setMsg("El nombre ES es obligatorio.");return}
    setBusy(true);setMsg("Creando producto…");
    const r=await fetch("/api/admin/commerce/manage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entity:"product",...draft})});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMsg(j.error||"No fue posible crear el producto.");return}
    setDraft(emptyProduct);setMsg("GUARDADO SATISFACTORIAMENTE");await load();
  }

  function patchProduct(id:string,patch:Partial<Product>){
    setProducts(v=>v.map(p=>p.id===id?{...p,...patch}:p));
  }

  async function saveProduct(p:Product,patch:Partial<Product>={}){
    setBusy(true);
    const r=await fetch("/api/admin/commerce/manage",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({entity:"product",...p,...patch})});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMsg(j.error||"No fue posible actualizar el producto.");return}
    setMsg("GUARDADO SATISFACTORIAMENTE");await load();
  }

  async function saveOrder(o:Order,patch:Partial<Order>={}){
    setBusy(true);
    const r=await fetch("/api/admin/commerce/manage",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({entity:"order",...o,...patch})});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMsg(j.error||"No fue posible actualizar la orden.");return}
    setMsg("GUARDADO SATISFACTORIAMENTE");await load();
  }

  async function createFulfillment(orderId:string){
    setBusy(true);
    const r=await fetch("/api/admin/commerce/manage",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({entity:"fulfillment",order_id:orderId})});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMsg(j.error||"No fue posible crear fulfillment.");return}
    setMsg("GUARDADO SATISFACTORIAMENTE");await load();
  }

  async function saveFulfillment(f:Fulfillment){
    setBusy(true);
    const r=await fetch("/api/admin/commerce/manage",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({entity:"fulfillment",...f})});
    const j=await r.json().catch(()=>({}));
    setBusy(false);
    if(!r.ok){setMsg(j.error||"No fue posible actualizar fulfillment.");return}
    setMsg("GUARDADO SATISFACTORIAMENTE");await load();
  }

  return <div className="adminShopModule">
    <section className="card">
      <div className="adminPanelHeader"><div><div className="kicker">CATÁLOGO</div><h2>Productos de la franquicia</h2><p className="note">Catálogo operativo sin límite artificial. Los destacados de Home siguen siendo una selección visual.</p></div><span className="adminPanelBadge">{products.length} PRODUCTOS</span></div>
      <div className="adminShopControlGrid">
        <label><span>SKU</span><input value={draft.sku} onChange={e=>setDraft({...draft,sku:e.target.value})}/></label>
        <label><span>Nombre ES</span><input value={draft.name_es} onChange={e=>setDraft({...draft,name_es:e.target.value})}/></label>
        <label><span>Nombre EN</span><input value={draft.name_en} onChange={e=>setDraft({...draft,name_en:e.target.value})}/></label>
        <label><span>Modo</span><select value={draft.mode} onChange={e=>setDraft({...draft,mode:e.target.value})}><option value="interest">Interés</option><option value="external">Externo</option><option value="internal">Checkout FRAGMENTUN</option></select></label>
        <label><span>Procesador</span><select value={draft.payment_provider} onChange={e=>setDraft({...draft,payment_provider:e.target.value})}><option value="auto">Automático</option><option value="both">Stripe + PayPal</option><option value="stripe">Stripe</option><option value="paypal">PayPal</option></select></label>
        <label><span>Precio (centavos)</span><input type="number" min="0" value={draft.price_cents} onChange={e=>setDraft({...draft,price_cents:e.target.value})}/></label>
        <label><span>Moneda</span><input maxLength={3} value={draft.currency} onChange={e=>setDraft({...draft,currency:e.target.value.toUpperCase()})}/></label>
        <label className="wide"><span>URL externa</span><input type="url" value={draft.external_url} onChange={e=>setDraft({...draft,external_url:e.target.value})}/></label>
      </div>
      <div className="adminShopActions"><button className="btn btnPrimary" type="button" disabled={busy} onClick={createProduct}>+ Crear producto</button><span className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</span></div>

      <div className="adminShopProducts">
        {products.map(p=><div className="adminShopProductEditor" key={p.id}>
          <div className="wide">
            <strong>{p.name_es||"Producto sin nombre"}</strong>
            <div className="note">{p.sku||"Sin SKU"} · {p.mode} · {p.payment_provider}</div>
          </div>

          <div className="adminSaleMode wide">
            <span className="adminSaleModeLabel">MODALIDAD DE VENTA</span>
            <div className="adminSaleModeChoices" role="group" aria-label="Modalidad de venta del producto">
              <button type="button" className={p.mode==="internal"?"active":""} aria-pressed={p.mode==="internal"} onClick={()=>patchProduct(p.id,{mode:"internal"})}>
                <strong>COBRAR EN FRAGMENTUN</strong>
                <small>Factura propia · pedido al suplidor</small>
              </button>
              <button type="button" className={p.mode==="external"?"active":""} aria-pressed={p.mode==="external"} onClick={()=>patchProduct(p.id,{mode:"external"})}>
                <strong>ENVIAR AL PROVEEDOR</strong>
                <small>Redirección a tienda externa</small>
              </button>
              <button type="button" className={p.mode==="interest"?"active secondary":""} aria-pressed={p.mode==="interest"} onClick={()=>patchProduct(p.id,{mode:"interest"})}>
                <strong>PRÓXIMAMENTE</strong>
                <small>Captar interés · sin venta</small>
              </button>
            </div>
          </div>

          <label><span>SKU</span><input value={p.sku||""} onChange={e=>patchProduct(p.id,{sku:e.target.value})}/></label>
          <label><span>Nombre ES</span><input value={p.name_es||""} onChange={e=>patchProduct(p.id,{name_es:e.target.value})}/></label>
          <label><span>Nombre EN</span><input value={p.name_en||""} onChange={e=>patchProduct(p.id,{name_en:e.target.value})}/></label>
          <label><span>Procesador</span><select value={p.payment_provider} onChange={e=>patchProduct(p.id,{payment_provider:e.target.value})}><option value="auto">Automático</option><option value="both">Stripe + PayPal</option><option value="stripe">Stripe</option><option value="paypal">PayPal</option></select></label>
          <label><span>Precio (centavos)</span><input type="number" min="0" value={p.price_cents??""} onChange={e=>patchProduct(p.id,{price_cents:e.target.value===""?null:Number(e.target.value)})}/></label>
          <label><span>Moneda</span><input maxLength={3} value={p.currency||"USD"} onChange={e=>patchProduct(p.id,{currency:e.target.value.toUpperCase()})}/></label>
          <label className="wide"><span>URL externa</span><input type="url" value={p.external_url||""} disabled={p.mode!=="external"} onChange={e=>patchProduct(p.id,{external_url:e.target.value})} placeholder={p.mode==="external"?"https://proveedor…":"Disponible cuando la modalidad es ENVIAR AL PROVEEDOR"}/></label>
          <label><span>Stock</span><select value={p.stock_status} onChange={e=>patchProduct(p.id,{stock_status:e.target.value})}><option value="unknown">Sin definir</option><option value="in_stock">Disponible</option><option value="out_of_stock">Agotado</option><option value="preorder">Preorden</option><option value="unlimited">Ilimitado</option></select></label>
          <label><span>Activo</span><select value={p.active?"yes":"no"} onChange={e=>patchProduct(p.id,{active:e.target.value==="yes"})}><option value="no">No</option><option value="yes">Sí</option></select></label>
          <label><span>Destacado</span><select value={p.featured?"yes":"no"} onChange={e=>patchProduct(p.id,{featured:e.target.value==="yes"})}><option value="no">No</option><option value="yes">Sí</option></select></label>
          <div className="adminShopActions wide">
            <button className="btn btnPrimary" type="button" disabled={busy} onClick={()=>saveProduct(p)}>Guardar producto</button>
          </div>
        </div>)}
        {products.length===0&&<p className="note">Todavía no hay productos en el catálogo operativo.</p>}
      </div>
    </section>

    <section className="card">
      <div className="adminPanelHeader"><div><div className="kicker">ÓRDENES</div><h2>Administración de pedidos</h2></div><span className="adminPanelBadge">{orders.length} · {paid} PAGADAS · {pending} PENDIENTES</span></div>
      {orders.length===0?<p className="note">No existen órdenes todavía. Aparecerán aquí cuando se habilite el checkout interno.</p>:orders.map(o=><div className="adminShopProductEditor" key={o.id}>
        <div><strong>{o.order_number}</strong><div className="note">{o.customer_email||"Sin email"} · {(o.total_cents/100).toFixed(2)} {o.currency}</div></div>
        <label><span>Pago</span><select value={o.payment_status} onChange={e=>saveOrder(o,{payment_status:e.target.value})}><option>pending</option><option>authorized</option><option>paid</option><option>failed</option><option>refunded</option><option>partially_refunded</option><option>canceled</option></select></label>
        <label><span>Fulfillment</span><select value={o.fulfillment_status} onChange={e=>saveOrder(o,{fulfillment_status:e.target.value})}><option>unfulfilled</option><option>processing</option><option>partially_fulfilled</option><option>fulfilled</option><option>delivered</option><option>returned</option><option>canceled</option></select></label>
        <button className="btn btnGhost" type="button" onClick={()=>createFulfillment(o.id)}>Crear envío</button>
      </div>)}
    </section>

    <section className="card">
      <div className="adminPanelHeader"><div><div className="kicker">FULFILLMENT</div><h2>Tracking y etiquetas de envío</h2><p className="note">La etiqueta puede ser generada externamente y almacenada aquí; más adelante podremos integrar un proveedor automático.</p></div><span className="adminPanelBadge">{fulfillments.length} ENVÍOS</span></div>
      {fulfillments.length===0?<p className="note">No hay envíos creados todavía.</p>:fulfillments.map(f=><div className="adminShopProductEditor" key={f.id}>
        <label><span>Transportista</span><input value={f.carrier||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,carrier:e.target.value}:x))}/></label>
        <label><span>Servicio</span><input value={f.service||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,service:e.target.value}:x))}/></label>
        <label><span>Tracking</span><input value={f.tracking_number||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,tracking_number:e.target.value}:x))}/></label>
        <label><span>Estado</span><select value={f.shipment_status} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,shipment_status:e.target.value}:x))}><option>pending</option><option>label_created</option><option>shipped</option><option>in_transit</option><option>delivered</option><option>exception</option><option>returned</option><option>canceled</option></select></label>
        <label><span>Peso (g)</span><input type="number" min="0" value={f.package_weight_grams??""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,package_weight_grams:e.target.value===""?null:Number(e.target.value)}:x))}/></label>
        <label><span>Largo (cm)</span><input type="number" min="0" step="0.1" value={f.package_dimensions?.length_cm??""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,package_dimensions:{...(x.package_dimensions||{}),length_cm:e.target.value===""?undefined:Number(e.target.value)}}:x))}/></label>
        <label><span>Ancho (cm)</span><input type="number" min="0" step="0.1" value={f.package_dimensions?.width_cm??""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,package_dimensions:{...(x.package_dimensions||{}),width_cm:e.target.value===""?undefined:Number(e.target.value)}}:x))}/></label>
        <label><span>Alto (cm)</span><input type="number" min="0" step="0.1" value={f.package_dimensions?.height_cm??""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,package_dimensions:{...(x.package_dimensions||{}),height_cm:e.target.value===""?undefined:Number(e.target.value)}}:x))}/></label>
        <label className="wide"><span>URL tracking</span><input type="url" value={f.tracking_url||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,tracking_url:e.target.value}:x))}/></label>
        <label className="wide"><span>URL etiqueta de envío</span><input type="url" value={f.shipping_label_url||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,shipping_label_url:e.target.value}:x))}/></label>
        <label><span>Formato</span><input value={f.shipping_label_format||""} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,shipping_label_format:e.target.value}:x))} placeholder="PDF / PNG / ZPL"/></label>
        <label><span>Costo etiqueta (¢)</span><input type="number" min="0" value={f.label_cost_cents||0} onChange={e=>setFulfillments(v=>v.map(x=>x.id===f.id?{...x,label_cost_cents:Number(e.target.value)}:x))}/></label>
        <div className="adminShopActions">
          <button className="btn btnPrimary" type="button" disabled={busy} onClick={()=>saveFulfillment(f)}>Guardar envío</button>
          {f.shipping_label_url&&<a className="btn btnGhost" href={f.shipping_label_url} target="_blank" rel="noreferrer">Abrir / Reimprimir etiqueta ↗</a>}
          {f.tracking_url&&<a className="btn btnGhost" href={f.tracking_url} target="_blank" rel="noreferrer">Abrir tracking ↗</a>}
        </div>
      </div>)}
    </section>
  </div>;
}
