"use client";

import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";

type ShopMode="external"|"internal"|"interest";

type ShopProduct={
  id?:string;
  name?:string;
  url?:string;
  image_url?:string;
  price_label?:string;
  mode?:ShopMode;
  external_url?:string;
  sku?:string;
  price_cents?:number;
  currency?:string;
  supplier?:string;
  supplier_product_id?:string;
  interest_cta?:string;
};

type ShopContent={
  enabled?:boolean;
  eyebrow?:string;
  title?:string;
  body?:string;
  cta?:string;
  shop_url?:string;
  provider?:string;
  banner_url?:string;
  campaign?:string;
  featured_products?:ShopProduct[];
};

function modeOf(product:ShopProduct):ShopMode{
  if(product.mode==="external"||product.mode==="internal"||product.mode==="interest")return product.mode;
  return product.external_url||product.url?"external":"interest";
}

function usable(product:ShopProduct){
  if(!product?.name)return false;
  const mode=modeOf(product);
  return mode!=="external"||!!(product.external_url||product.url);
}

function modeText(locale:Locale,mode:ShopMode){
  if(mode==="external")return locale==="es"?"Proveedor externo":"External provider";
  if(mode==="internal")return locale==="es"?"Checkout FRAGMENTUN · Próximamente":"FRAGMENTUN checkout · Coming soon";
  return locale==="es"?"Próximamente · Quiero saber más":"Coming soon · Keep me posted";
}

export function FragmentunShop({locale,content}:{locale:Locale;content?:ShopContent}){
  const products=Array.isArray(content?.featured_products)
    ?content!.featured_products!.filter(usable).slice(0,4)
    :[];
  const hasGlobalUrl=!!content?.shop_url;
  if(!content?.enabled||(!hasGlobalUrl&&products.length===0))return null;

  return <section className="fragmentunShopSection" id="tienda">
    {content.banner_url&&<div className="fragmentunShopBackdrop" aria-hidden="true"><img src={content.banner_url} alt=""/></div>}
    <div className="container fragmentunShopInner">
      <div className="fragmentunShopCopy">
        <div className="kicker">{content.eyebrow||(locale==="es"?"TIENDA FRAGMENTUN":"FRAGMENTUN STORE")}</div>
        <h2>{content.title||(locale==="es"?"Objetos del universo":"Objects from the universe")}</h2>
        <p className="lead">{content.body||(locale==="es"
          ?"Arte, ropa, coleccionables y ediciones especiales inspiradas en FRAGMENTUN."
          :"Art, apparel, collectibles and special editions inspired by FRAGMENTUN.")}</p>
        {hasGlobalUrl
          ?<TrackLink className="btn btnPrimary" href={content.shop_url!} eventName="merch_click" locale={locale}
              metadata={{placement:"shop_section",mode:"external",provider:content.provider||"external",campaign:content.campaign||"merch_launch"}} newTab>
              {content.cta||(locale==="es"?"Explorar tienda":"Explore store")} →
            </TrackLink>
          :products.length>0&&<a className="btn btnPrimary" href="#productos-fragmentun">{content.cta||(locale==="es"?"Explorar productos":"Explore products")} →</a>}
      </div>

      {products.length>0&&<div className="fragmentunProductGrid" id="productos-fragmentun">
        {products.map((product,index)=>{
          const mode=modeOf(product);
          const image=product.image_url&&<img src={product.image_url} alt={product.name||""}/>;
          const details=<span><strong>{product.name}</strong>{product.price_label&&<small>{product.price_label}</small>}<small>{modeText(locale,mode)}</small></span>;

          if(mode==="external"){
            return <TrackLink key={product.id||product.name||index} className="fragmentunProductCard"
              href={(product.external_url||product.url)!} eventName="merch_click" locale={locale}
              metadata={{placement:"featured_product",product:product.name,mode,supplier:product.supplier||content.provider||"external",supplier_product_id:product.supplier_product_id,sku:product.sku,campaign:content.campaign||"merch_launch"}} newTab>
              {image}{details}
            </TrackLink>;
          }

          if(mode==="interest"){
            return <TrackLink key={product.id||product.name||index} className="fragmentunProductCard"
              href="#capitulo" eventName="merch_click" locale={locale}
              metadata={{placement:"featured_product_interest",product:product.name,mode,sku:product.sku,campaign:content.campaign||"merch_launch"}}>
              {image}<span><strong>{product.name}</strong>{product.price_label&&<small>{product.price_label}</small>}<small>{product.interest_cta||(locale==="es"?"Quiero recibir novedades":"Notify me about this product")}</small></span>
            </TrackLink>;
          }

          return <div key={product.id||product.name||index} className="fragmentunProductCard" aria-disabled="true">
            {image}{details}
          </div>;
        })}
      </div>}
    </div>
  </section>;
}
