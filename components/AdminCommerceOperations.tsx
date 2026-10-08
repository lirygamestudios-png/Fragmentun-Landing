"use client";
import {useEffect,useState} from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

type Settings={
  default_payment_provider:"stripe"|"paypal"|"both"|"auto";
  tax_mode:"manual"|"stripe_tax"|"external_tax";
  seller_legal_name:string|null;
  seller_country:string|null;
  seller_region:string|null;
  tax_registration_status:"not_configured"|"review"|"configured";
  returns_policy_url:string|null;
  shipping_label_mode:"manual"|"provider"|"shippo"|"easypost";
  stripe_enabled:boolean;
  paypal_enabled:boolean;
};
type Stats={products:number;active_products:number;orders:number;paid_orders:number;pending_fulfillment:number;shipping_labels:number};
type ProcessorStatus={stripe_configured:boolean;paypal_configured:boolean};

function commerceSettingsError(code:string){
  const map:Record<string,string>={
    mfa_required:"Completa la verificación en dos pasos antes de guardar.",
    forbidden:"Tu usuario no tiene permiso para modificar la configuración comercial.",
    stripe_credentials_missing:"No se puede activar Stripe porque faltan sus credenciales seguras.",
    paypal_credentials_missing:"No se puede activar PayPal porque faltan sus credenciales seguras.",
    seller_identity_required:"Completa el nombre legal y el país del vendedor antes de marcar la configuración fiscal como lista.",
    invalid_provider:"El proveedor de pago seleccionado no es válido.",
    invalid_tax_mode:"El modo fiscal seleccionado no es válido.",
    invalid_shipping_mode:"El método de etiquetas seleccionado no es válido."
  };
  return map[code]||"No fue posible guardar la configuración comercial.";
}

export function AdminCommerceOperations(){
  const[settings,setSettings]=useState<Settings|null>(null);
  const[stats,setStats]=useState<Stats|null>(null);
  const[msg,setMsg]=useState("");
  const[msgType,setMsgType]=useState<"info"|"success"|"error">("info");
  const[processorStatus,setProcessorStatus]=useState<ProcessorStatus>({stripe_configured:false,paypal_configured:false});
  const[saving,setSaving]=useState(false);
  const[loadError,setLoadError]=useState(false);

  useEffect(()=>{
    fetch("/api/admin/commerce",{cache:"no-store"}).then(async r=>{
      const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(j?.error||"load_failed");
      setSettings(j.settings);setStats(j.stats);setProcessorStatus(j.processor_status||{stripe_configured:false,paypal_configured:false});
    }).catch(()=>setLoadError(true));
  },[]);

  if(loadError)return <section className="card"><p className="adminSaveFeedback error">No fue posible cargar la configuración comercial.</p><button type="button" className="btn btnGhost" onClick={()=>window.location.reload()}>Reintentar</button></section>;
  if(!settings||!stats)return <section className="card"><FragmentunProcessOverlay compact state="loading" title="CARGANDO CONFIGURACIÓN…"/></section>;

  const patch=(key:keyof Settings,value:any)=>setSettings(v=>v?{...v,[key]:value}:v);
  const save=async()=>{
    setSaving(true);setMsgType("info");setMsg("Guardando…");
    try{
      const r=await fetch("/api/admin/commerce",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(settings)});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){setMsgType("error");setMsg(commerceSettingsError(String(j.error||"")));return}
      setSettings(j.data);setMsgType("success");setMsg("Configuración comercial guardada correctamente.");
    }catch{
      setMsgType("error");setMsg("No fue posible guardar. Revisa la conexión e inténtalo nuevamente.");
    }finally{
      setSaving(false);
    }
  };

  return <section className="card adminCommerceOps">
    {saving&&<FragmentunProcessOverlay compact state="processing" title="GUARDANDO CONFIGURACIÓN…"/>}
    <div className="adminPanelHeader">
      <div><div className="kicker">OPERACIÓN COMERCIAL</div><h2>Pagos, impuestos y fulfillment</h2><p className="note">Preparación administrativa. No activa cobros reales.</p></div>
      <span className="adminPanelBadge">PRE-CHECKOUT</span>
    </div>

    <div className="adminShopStatusGrid">
      <div><span>Catálogo</span><strong>{stats.products}</strong></div>
      <div><span>Productos activos</span><strong>{stats.active_products}</strong></div>
      <div><span>Órdenes</span><strong>{stats.orders}</strong></div>
      <div><span>Etiquetas creadas</span><strong>{stats.shipping_labels}</strong></div>
    </div>

    <div className="adminShopLanguageGrid" style={{marginTop:18}}>
      <article className="card">
        <div className="kicker">PAGOS</div><h3>Stripe + PayPal</h3>
        <div className="adminShopControlGrid">
          <label className="adminShopToggle"><span>Activar Stripe</span><input type="checkbox" checked={settings.stripe_enabled} disabled={!processorStatus.stripe_configured} onChange={e=>patch("stripe_enabled",e.target.checked)}/><b>{settings.stripe_enabled?"ACTIVO":processorStatus.stripe_configured?"INACTIVO":"SIN CREDENCIALES"}</b></label>
          <label className="adminShopToggle"><span>Activar PayPal</span><input type="checkbox" checked={settings.paypal_enabled} disabled={!processorStatus.paypal_configured} onChange={e=>patch("paypal_enabled",e.target.checked)}/><b>{settings.paypal_enabled?"ACTIVO":processorStatus.paypal_configured?"INACTIVO":"SIN CREDENCIALES"}</b></label>
        </div>
        <label><span>Política predeterminada</span><select value={settings.default_payment_provider} onChange={e=>patch("default_payment_provider",e.target.value)}>
          <option value="auto">Automático</option><option value="both">Mostrar Stripe + PayPal</option><option value="stripe">Preferir Stripe</option><option value="paypal">Preferir PayPal</option>
        </select></label>
        <p className="note">Los interruptores solo se habilitan cuando las credenciales del procesador existen en el entorno seguro. Tener credenciales no activa cobros automáticamente.</p>
      </article>

      <article className="card">
        <div className="kicker">IMPUESTOS</div><h3>Configuración fiscal</h3>
        <label><span>Modo fiscal</span><select value={settings.tax_mode} onChange={e=>patch("tax_mode",e.target.value)}>
          <option value="manual">Manual / revisión contable</option><option value="stripe_tax">Stripe Tax (futuro)</option><option value="external_tax">Motor fiscal externo (futuro)</option>
        </select></label>
        <label><span>Estado de registros</span><select value={settings.tax_registration_status} onChange={e=>patch("tax_registration_status",e.target.value)}>
          <option value="not_configured">No configurado</option><option value="review">En revisión</option><option value="configured">Configurado</option>
        </select></label>
      </article>

      <article className="card">
        <div className="kicker">VENDEDOR</div><h3>Entidad comercial</h3>
        <label><span>Nombre legal</span><input value={settings.seller_legal_name||""} onChange={e=>patch("seller_legal_name",e.target.value)}/></label>
        <label><span>País</span><input value={settings.seller_country||""} onChange={e=>patch("seller_country",e.target.value)}/></label>
        <label><span>Estado / región</span><input value={settings.seller_region||""} onChange={e=>patch("seller_region",e.target.value)}/></label>
      </article>

      <article className="card">
        <div className="kicker">FULFILLMENT</div><h3>Etiquetas de envío</h3>
        <label><span>Método de etiqueta</span><select value={settings.shipping_label_mode} onChange={e=>patch("shipping_label_mode",e.target.value)}>
          <option value="manual">Manual</option><option value="provider">Proveedor / POD</option><option value="shippo">Shippo (futuro)</option><option value="easypost">EasyPost (futuro)</option>
        </select></label>
        <p className="note">Cada fulfillment puede guardar transportista, servicio, tracking, URL de seguimiento, costo, formato y URL de la etiqueta.</p>
      </article>
    </div>

    <div className="adminShopControlGrid" style={{marginTop:18}}>
      <label className="wide"><span>Política de devoluciones</span><input type="url" value={settings.returns_policy_url||""} onChange={e=>patch("returns_policy_url",e.target.value)} placeholder="https://…"/></label>
    </div>

    <div className="adminShopActions">
      <button className="btn btnPrimary" type="button" onClick={save} disabled={saving} aria-busy={saving}>{saving?"Guardando…":"Guardar administración comercial"}</button>
      <span role={msgType==="error"?"alert":"status"} aria-live="polite" className={`adminSaveFeedback ${msgType==="success"?"success":msgType==="error"?"error":""}`}>{msg}</span>
    </div>
  </section>;
}
