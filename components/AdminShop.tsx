"use client";
import {useEffect,useMemo,useState} from "react";
import {createSupabaseBrowserClient} from "../lib/supabase/browser";

type ShopMode="external"|"internal"|"interest";
type Product={name:string;url?:string;image_url:string;price_label:string;mode?:ShopMode;external_url?:string;sku?:string;price_cents?:number;currency?:string;supplier?:string;supplier_product_id?:string;interest_cta?:string};
type LangContent={
  enabled?:boolean;eyebrow?:string;title?:string;body?:string;cta?:string;
  shop_url?:string;provider?:string;banner_url?:string;campaign?:string;
  featured_products?:Product[];
};

const emptyProduct=():Product=>({name:"",url:"",image_url:"",price_label:"",mode:"interest",external_url:"",sku:"",currency:"USD",supplier:"",supplier_product_id:"",interest_cta:""});
function productMode(p:Product):ShopMode{return p.mode==="external"||p.mode==="internal"||p.mode==="interest"?p.mode:(p.external_url||p.url?"external":"interest")}
function productReady(p:Product){if(!p.name?.trim())return false;const mode=productMode(p);return mode!=="external"||!!(p.external_url||p.url||"").trim()}

export function AdminShop(){
  const[es,setEs]=useState<LangContent|null>(null);
  const[en,setEn]=useState<LangContent|null>(null);
  const[statusEs,setStatusEs]=useState("published");
  const[statusEn,setStatusEn]=useState("published");
  const[media,setMedia]=useState<any[]>([]);
  const[msg,setMsg]=useState("");
  const[saving,setSaving]=useState(false);
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);

  useEffect(()=>{
    Promise.all([fetch("/api/admin/content"),fetch("/api/admin/media")])
      .then(async([a,b])=>[await a.json(),await b.json()])
      .then(([content,assets])=>{
        const row=(content.data||[]).find((x:any)=>x.content_key==="home.shop");
        setEs(row?.es||{enabled:false,featured_products:[]});
        setEn(row?.en||{enabled:false,featured_products:[]});
        setStatusEs(row?.status_es||"published");
        setStatusEn(row?.status_en||"published");
        setMedia((assets.data||[]).filter((x:any)=>x.public_visible&&x.kind==="image"));
      });
  },[]);

  function mediaUrl(asset:any){
    if(!asset?.storage_path)return "";
    if(asset.storage_path.startsWith("/")||/^https?:\/\//i.test(asset.storage_path))return asset.storage_path;
    const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
    return base?`${base}/storage/v1/object/public/${asset.storage_path}`:"";
  }
  function update(lang:"es"|"en",field:keyof LangContent,value:any){
    if(lang==="es")setEs(v=>({...v,[field]:value}));
    else setEn(v=>({...v,[field]:value}));
  }
  function products(lang:"es"|"en"){
    const src=lang==="es"?es:en;
    return Array.isArray(src?.featured_products)?src!.featured_products!:[] as Product[];
  }
  function setProduct(lang:"es"|"en",index:number,field:keyof Product,value:any){
    const next=[...products(lang)];
    while(next.length<=index)next.push(emptyProduct());
    next[index]={...next[index],[field]:value};
    update(lang,"featured_products",next);
  }
  function removeProduct(lang:"es"|"en",index:number){
    update(lang,"featured_products",products(lang).filter((_,i)=>i!==index));
  }
  function syncCommercialFields(){
    if(!es||!en)return;
    setEn(v=>({...v,
      enabled:!!es.enabled,
      shop_url:es.shop_url||"",
      provider:es.provider||"",
      banner_url:es.banner_url||"",
      campaign:es.campaign||"merch_launch"
    }));
    setMsg("Configuración comercial sincronizada ES → EN.");
  }
  async function save(){
    if(!es||!en)return;
    if(es.enabled&&!(es.shop_url||"").trim()){
      setMsg("Para activar la tienda debes indicar una URL principal de compra.");
      return;
    }
    if(en.enabled&&!(en.shop_url||"").trim()){
      setMsg("La versión EN está activa pero no tiene URL de tienda.");
      return;
    }
    setSaving(true);setMsg("Guardando tienda…");
    const r=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      content_key:"home.shop",es,en,status_es:statusEs,status_en:statusEn
    })});
    const j=await r.json().catch(()=>({}));
    setSaving(false);
    if(!r.ok){setMsg(j.error||"No fue posible guardar.");return}
    setEs(j.data.es);setEn(j.data.en);setMsg("GUARDADO SATISFACTORIAMENTE");
  }

  if(!es||!en)return <p>Cargando Tienda FRAGMENTUN…</p>;
  const active=!!es.enabled&&(!!(es.shop_url||"").trim()||products("es").some(productReady));
  const modeCounts=products("es").reduce((a,p)=>{a[productMode(p)]++;return a},{external:0,internal:0,interest:0});

  return <div className="adminShopModule">
    <section className="card adminShopStatus">
      <div className="adminPanelHeader">
        <div><div className="kicker">COMERCIO</div><h2>Tienda FRAGMENTUN</h2><p className="note">Controla la presencia comercial pública sin tocar código.</p></div>
        <span className={active?"adminShopLive":"adminShopOffline"}>{active?"TIENDA ACTIVA":"TIENDA INACTIVA"}</span>
      </div>
      <div className="adminShopStatusGrid">
        <div><span>Visibilidad pública</span><strong>{active?"Visible":"Oculta"}</strong></div>
        <div><span>Proveedor</span><strong>{es.provider||"Sin configurar"}</strong></div>
        <div><span>Productos destacados</span><strong>{products("es").filter(p=>p.name&&p.url).length}</strong></div>
        <div><span>Seguimiento</span><strong>merch_click</strong></div>
      </div>
    </section>

    <section className="card adminShopControl">
      <div className="adminPanelHeader"><div><div className="kicker">CONFIGURACIÓN COMERCIAL</div><h2>Activación general</h2></div></div>
      <div className="adminShopControlGrid">
        <label className="adminShopToggle">
          <span>Activar tienda en FrontDesk</span>
          <input type="checkbox" checked={!!es.enabled} onChange={e=>{update("es","enabled",e.target.checked);update("en","enabled",e.target.checked)}}/>
          <b>{es.enabled?"ACTIVA":"INACTIVA"}</b>
        </label>
        <label><span>Proveedor global opcional</span><input value={es.provider||""} onChange={e=>update("es","provider",e.target.value)} placeholder="Shopify, Fourthwall, Spring, Amazon…"/></label>
        <label className="wide"><span>URL global opcional</span><input type="url" value={es.shop_url||""} onChange={e=>update("es","shop_url",e.target.value)} placeholder="Opcional: https://…"/></label>
        <label><span>Campaña analítica</span><input value={es.campaign||"merch_launch"} onChange={e=>update("es","campaign",e.target.value)}/></label>
        <label><span>Banner / imagen de fondo</span>
          <select value={es.banner_url||""} onChange={e=>{update("es","banner_url",e.target.value);update("en","banner_url",e.target.value)}}>
            <option value="">— Sin banner —</option>
            {media.map(m=><option key={m.id} value={mediaUrl(m)}>{m.slug}</option>)}
          </select>
        </label>
      </div>
      <div className="adminShopActions">
        <button className="btn btnGhost" type="button" onClick={syncCommercialFields}>Sincronizar configuración ES → EN</button>
        {active&&<a className="btn btnGhost" href="/es#tienda" target="_blank" rel="noreferrer">Ver tienda pública ↗</a>}
      </div>
    </section>

    <section className="adminShopLanguageGrid">
      {(["es","en"] as const).map(lang=>{
        const data=lang==="es"?es:en;
        return <article className="card adminShopLanguage" key={lang}>
          <div className="adminShopLanguageHead"><span>{lang.toUpperCase()}</span><h2>{lang==="es"?"Español":"English"}</h2></div>
          <label><span>Encabezado corto</span><input value={data.eyebrow||""} onChange={e=>update(lang,"eyebrow",e.target.value)}/></label>
          <label><span>Título</span><input value={data.title||""} onChange={e=>update(lang,"title",e.target.value)}/></label>
          <label><span>Descripción</span><textarea value={data.body||""} onChange={e=>update(lang,"body",e.target.value)}/></label>
          <label><span>Texto del botón</span><input value={data.cta||""} onChange={e=>update(lang,"cta",e.target.value)}/></label>
          <label><span>URL global opcional para este idioma</span><input type="url" value={data.shop_url||""} onChange={e=>update(lang,"shop_url",e.target.value)}/></label>
          <label><span>Estado editorial</span><select value={lang==="es"?statusEs:statusEn} onChange={e=>lang==="es"?setStatusEs(e.target.value):setStatusEn(e.target.value)}><option value="draft">Borrador</option><option value="review">Revisión</option><option value="published">Publicado</option></select></label>

          <div className="adminShopProducts">
            <div className="adminPanelHeader"><div><div className="kicker">PRODUCTOS HÍBRIDOS</div><h3>Productos</h3></div><button type="button" className="btn btnGhost" onClick={()=>update(lang,"featured_products",[...products(lang),emptyProduct()])}>+ Añadir producto</button></div>
            {products(lang).length===0?<p className="note">No hay productos destacados todavía.</p>:products(lang).map((p,i)=><div className="adminShopProductEditor" key={i}>
              <label><span>Nombre</span><input value={p.name||""} onChange={e=>setProduct(lang,i,"name",e.target.value)}/></label>
              <label><span>Modo de venta</span><select value={productMode(p)} onChange={e=>setProduct(lang,i,"mode",e.target.value as ShopMode)}><option value="external">Proveedor externo</option><option value="internal">Checkout FRAGMENTUN (futuro)</option><option value="interest">Captar interés / Próximamente</option></select></label>
              <label><span>Precio / etiqueta</span><input value={p.price_label||""} onChange={e=>setProduct(lang,i,"price_label",e.target.value)} placeholder="$29.99 / Próximamente"/></label>
              <label><span>SKU</span><input value={p.sku||""} onChange={e=>setProduct(lang,i,"sku",e.target.value)} placeholder="FRG-..."/></label>
              {productMode(p)==="external"&&<>
                <label className="wide"><span>URL del proveedor</span><input type="url" value={p.external_url||p.url||""} onChange={e=>setProduct(lang,i,"external_url",e.target.value)} placeholder="https://…"/></label>
                <label><span>Proveedor</span><input value={p.supplier||""} onChange={e=>setProduct(lang,i,"supplier",e.target.value)} placeholder="Fourthwall, Amazon…"/></label>
                <label><span>ID producto proveedor</span><input value={p.supplier_product_id||""} onChange={e=>setProduct(lang,i,"supplier_product_id",e.target.value)}/></label>
              </>}
              {productMode(p)==="internal"&&<>
                <label><span>Precio interno (centavos)</span><input type="number" min="0" value={p.price_cents??""} onChange={e=>setProduct(lang,i,"price_cents",e.target.value===""?undefined:Number(e.target.value))} placeholder="2999"/></label>
                <label><span>Moneda</span><input value={p.currency||"USD"} onChange={e=>setProduct(lang,i,"currency",e.target.value.toUpperCase())} maxLength={3}/></label>
                <p className="note wide">Checkout FRAGMENTUN permanece desactivado hasta configurar Stripe, webhooks y órdenes.</p>
              </>}
              {productMode(p)==="interest"&&<label className="wide"><span>CTA de interés</span><input value={p.interest_cta||""} onChange={e=>setProduct(lang,i,"interest_cta",e.target.value)} placeholder={lang==="es"?"Quiero recibir novedades":"Notify me about this product"}/></label>}
              <label><span>Imagen</span><select value={p.image_url||""} onChange={e=>setProduct(lang,i,"image_url",e.target.value)}><option value="">— Sin imagen —</option>{media.map(m=><option key={m.id} value={mediaUrl(m)}>{m.slug}</option>)}</select></label>
              <button type="button" className="adminShopRemove" onClick={()=>removeProduct(lang,i)}>Eliminar</button>
            </div>)}
          </div>
        </article>
      })}
    </section>

    <section className="card adminShopPreview">
      <div className="adminPanelHeader">
        <div><div className="kicker">VISTA PREVIA</div><h2>Así se verá la tienda en el FrontDesk</h2><p className="note">Esta previsualización no activa la tienda pública.</p></div>
        <span className="adminPanelBadge">PREVIEW</span>
      </div>
      <div className="adminShopPreviewViewport">
        <section className="fragmentunShopSection adminEmbeddedShopPreview">
          {es.banner_url&&<div className="fragmentunShopBackdrop" aria-hidden="true"><img src={es.banner_url} alt=""/></div>}
          <div className="container fragmentunShopInner">
            <div className="fragmentunShopCopy">
              <div className="kicker">{es.eyebrow||"TIENDA FRAGMENTUN"}</div>
              <h2>{es.title||"Objetos del universo"}</h2>
              <p className="lead">{es.body||"Arte, ropa, coleccionables y ediciones especiales inspiradas en FRAGMENTUN."}</p>
              <span className="btn btnPrimary">{es.cta||"Explorar tienda"} →</span>
            </div>
            <div className="fragmentunProductGrid">
              {(products("es").filter(p=>p.name).length?products("es").filter(p=>p.name).slice(0,4):[
                {name:"Edición de Colección",price_label:"Próximamente",url:"",image_url:"/fragmentun-i-cover-es.jpg"},
                {name:"Arte de Lumen",price_label:"Próximamente",url:"",image_url:"/lumen-ciudad-oficial.webp"},
                {name:"Coleccionable FRAGMENTUN",price_label:"Próximamente",url:"",image_url:"/elyon-hero.jpg"},
                {name:"Edición Especial",price_label:"Próximamente",url:"",image_url:"/fragmentun-mark.png"}
              ]).map((p:any,index:number)=><div className="fragmentunProductCard adminPreviewProduct" key={(p.name||"producto")+index}>
                {p.image_url&&<img src={p.image_url} alt={p.name||""}/>}
                <span><strong>{p.name}</strong>{p.price_label&&<small>{p.price_label}</small>}<small>{productMode(p)==="external"?"Proveedor externo":productMode(p)==="internal"?"Checkout FRAGMENTUN · Futuro":"Captar interés / Próximamente"}</small></span>
              </div>)}
            </div>
          </div>
        </section>
      </div>
    </section>

    <section className="card adminShopSave">
      <div><strong>{active?"La tienda aparecerá en el menú y en el FrontDesk.":"La tienda permanecerá oculta hasta activarla y configurar al menos una URL o producto válido."}</strong><span className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</span></div>
      <button className="btn btnPrimary" type="button" onClick={save} disabled={saving}>{saving?"Guardando…":"Guardar Tienda"}</button>
    </section>
  </div>;
}
