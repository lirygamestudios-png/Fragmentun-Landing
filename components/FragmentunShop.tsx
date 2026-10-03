"use client";

import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";

type ShopProduct={
  name?:string;
  url?:string;
  image_url?:string;
  price_label?:string;
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

export function FragmentunShop({locale,content}:{locale:Locale;content?:ShopContent}){
  if(!content?.enabled||!content.shop_url)return null;
  const products=Array.isArray(content.featured_products)?content.featured_products.filter(p=>p?.name&&p?.url).slice(0,4):[];

  return <section className="fragmentunShopSection" id="tienda">
    {content.banner_url&&<div className="fragmentunShopBackdrop" aria-hidden="true">
      <img src={content.banner_url} alt=""/>
    </div>}
    <div className="container fragmentunShopInner">
      <div className="fragmentunShopCopy">
        <div className="kicker">{content.eyebrow||(locale==="es"?"TIENDA FRAGMENTUN":"FRAGMENTUN STORE")}</div>
        <h2>{content.title||(locale==="es"?"Objetos del universo":"Objects from the universe")}</h2>
        <p className="lead">{content.body||(locale==="es"
          ?"Arte, ropa, coleccionables y ediciones especiales inspiradas en FRAGMENTUN."
          :"Art, apparel, collectibles and special editions inspired by FRAGMENTUN.")}</p>
        <TrackLink
          className="btn btnPrimary"
          href={content.shop_url}
          eventName="merch_click"
          locale={locale}
          metadata={{placement:"shop_section",provider:content.provider||"external",campaign:content.campaign||"merch_launch"}}
          newTab
        >
          {content.cta||(locale==="es"?"Explorar tienda":"Explore store")} →
        </TrackLink>
      </div>

      {products.length>0&&<div className="fragmentunProductGrid">
        {products.map((product,index)=><TrackLink
          key={product.name||index}
          className="fragmentunProductCard"
          href={product.url!}
          eventName="merch_click"
          locale={locale}
          metadata={{placement:"featured_product",product:product.name,provider:content.provider||"external",campaign:content.campaign||"merch_launch"}}
          newTab
        >
          {product.image_url&&<img src={product.image_url} alt={product.name||""}/>}
          <span>
            <strong>{product.name}</strong>
            {product.price_label&&<small>{product.price_label}</small>}
          </span>
        </TrackLink>)}
      </div>}
    </div>
  </section>;
}
