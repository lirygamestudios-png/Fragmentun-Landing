"use client";
import {useState} from "react";
import {analyticsAttribution} from "../lib/analytics-client";
import type {Locale} from "../lib/i18n";

export function ProductShareButton({locale,product,sku,anchor}:{locale:Locale;product:string;sku?:string;anchor:string}){
  const[copied,setCopied]=useState(false);
  async function track(method:string){
    try{
      const attribution=analyticsAttribution();
      await fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({event_name:"share_click",locale,path:window.location.pathname,...attribution,metadata:{placement:"shop_product",product,sku,method}}),keepalive:true});
    }catch{}
  }
  async function share(){
    const url=window.location.origin+window.location.pathname+"#"+anchor;
    const title=product+" · FRAGMENTUN";
    const text=locale==="es"?"Descubre este producto del universo FRAGMENTUN.":"Discover this product from the FRAGMENTUN universe.";
    try{
      if(navigator.share){await navigator.share({title,text,url});await track("native");return;}
      await navigator.clipboard.writeText(url);setCopied(true);await track("clipboard");window.setTimeout(()=>setCopied(false),1800);
    }catch{}
  }
  const label=locale==="es"?"Compartir "+product:"Share "+product;
  return <button type="button" className="fragmentunProductShare" onClick={share} aria-label={label} title={locale==="es"?"Compartir producto":"Share product"}>
    <span aria-hidden="true">↗</span>{copied?(locale==="es"?"Enlace copiado":"Link copied"):(locale==="es"?"Compartir":"Share")}
  </button>;
}