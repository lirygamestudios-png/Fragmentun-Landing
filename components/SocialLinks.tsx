"use client";
import {useEffect,useRef,useState} from "react";
import type { Locale } from "../lib/i18n";
import { TrackLink } from "./TrackLink";
import { analyticsAttribution } from "../lib/analytics-client";

type SocialItem={key:string;label:string;url:string};

export function SocialLinks({locale,items,placement="footer"}:{
  locale:Locale;
  items:SocialItem[];
  placement?:string;
}){
  const visible=items.filter(x=>x.url);
  const[shareOpen,setShareOpen]=useState(false);
  const[pageUrl,setPageUrl]=useState("");
  const[canNativeShare,setCanNativeShare]=useState(false);
  const shareRef=useRef<HTMLDivElement>(null);

  useEffect(()=>{
    setPageUrl(window.location.href);
    setCanNativeShare(typeof navigator.share==="function");
    const onPointer=(e:MouseEvent)=>{
      if(shareRef.current&&!shareRef.current.contains(e.target as Node)) setShareOpen(false);
    };
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setShareOpen(false)};
    document.addEventListener("mousedown",onPointer);
    document.addEventListener("keydown",onKey);
    return()=>{document.removeEventListener("mousedown",onPointer);document.removeEventListener("keydown",onKey)};
  },[]);

  const title=locale==="es"?"FRAGMENTUN I — El Despertar Emocional":"FRAGMENTUN I — The Emotional Awakening";
  const text=locale==="es"
    ?"Descubre FRAGMENTUN, el universo de ciencia ficción emocional de José Liranzo."
    :"Discover FRAGMENTUN, José Liranzo's emotional science-fiction universe.";

  function encoded(value:string){return encodeURIComponent(value)}
  async function nativeShare(){
    try{
      if(typeof navigator.share==="function"){
        await navigator.share({title,text,url:pageUrl});
        trackShare("native_share");
        return;
      }
    }catch{}
    setShareOpen(v=>!v);
  }
  function trackShare(network:string){
    const attribution=analyticsAttribution();
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"share_click",locale,path:window.location.pathname,
      ...attribution,
      metadata:{network,placement}
    }),keepalive:true}).catch(()=>{});
    setShareOpen(false);
  }

  const shares=[
    {key:"facebook",label:"Facebook",href:`https://www.facebook.com/sharer/sharer.php?u=${encoded(pageUrl)}`},
    {key:"x",label:"X",href:`https://twitter.com/intent/tweet?url=${encoded(pageUrl)}&text=${encoded(text)}`},
    {key:"linkedin",label:"LinkedIn",href:`https://www.linkedin.com/sharing/share-offsite/?url=${encoded(pageUrl)}`},
    {key:"whatsapp",label:"WhatsApp",href:`https://wa.me/?text=${encoded(text+" "+pageUrl)}`},
    {key:"telegram",label:"Telegram",href:`https://t.me/share/url?url=${encoded(pageUrl)}&text=${encoded(text)}`},
    {key:"email",label:locale==="es"?"Correo":"Email",href:`mailto:?subject=${encoded(title)}&body=${encoded(text+"\n\n"+pageUrl)}`}
  ];

  return <div className="socialLinksWrap">
    {visible.length>0&&<div className="socialLinks" aria-label={locale==="es"?"Redes sociales de FRAGMENTUN":"FRAGMENTUN social media"}>
      {visible.map(item=>
        <TrackLink
          key={item.key}
          className="socialLink"
          href={item.url}
          eventName="community_click"
          locale={locale}
          metadata={{network:item.key,placement}}
          newTab
        >
          {item.label}
        </TrackLink>
      )}
    </div>}
    <div className="shareMenu" ref={shareRef}>
      <button
        type="button"
        className="socialLink shareButton"
        aria-haspopup="menu"
        aria-expanded={shareOpen}
        onClick={()=>setShareOpen(v=>!v)}
      >
        ↗ {locale==="es"?"Compartir":"Share"}
      </button>
      {shareOpen&&<div className="shareDropdown" role="menu">
        <button type="button" className="shareCloseButton" aria-label={locale==="es"?"Cerrar compartir":"Close share"} onClick={()=>setShareOpen(false)}>×</button>
        <strong>{locale==="es"?"Compartir FRAGMENTUN":"Share FRAGMENTUN"}</strong>
        <small>{locale==="es"?"El enlace mostrará la tarjeta social de FRAGMENTUN cuando la plataforma lo permita.":"The link will show FRAGMENTUN's social preview card when supported."}</small>
        <div className="shareGrid">
          {shares.map(item=><a
            key={item.key}
            href={item.href}
            target={item.key==="email"?undefined:"_blank"}
            rel={item.key==="email"?undefined:"noreferrer"}
            role="menuitem"
            onClick={()=>trackShare(item.key)}
          >{item.label}</a>)}
          <button type="button" role="menuitem" onClick={async()=>{
            try{await navigator.clipboard.writeText(pageUrl);trackShare("copy_link")}catch{}
          }}>{locale==="es"?"Copiar enlace":"Copy link"}</button>
          {canNativeShare&&<button type="button" role="menuitem" onClick={nativeShare}>
            {locale==="es"?"Más opciones…":"More options…"}
          </button>}
        </div>
      </div>}
    </div>
  </div>;
}
