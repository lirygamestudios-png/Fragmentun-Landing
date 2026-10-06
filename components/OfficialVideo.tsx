"use client";

import {useEffect,useMemo,useRef,useState} from "react";
import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";

type VideoContent={
  eyebrow?:string;
  title?:string;
  body?:string;
  play_label?:string;
  youtube_url?:string;
  poster_url?:string;
  poster_alt?:string;
  after_title?:string;
  amazon_label?:string;
  chapter_label?:string;
};

function youtubeEmbed(url:string){
  try{
    const u=new URL(url);
    if(u.hostname.includes("youtu.be")) return u.pathname.slice(1);
    if(u.hostname.includes("youtube.com")){
      if(u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2]||"";
      if(u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2]||"";
      return u.searchParams.get("v")||"";
    }
  }catch{}
  return "";
}

export function OfficialVideo({
  locale,
  content,
  amazonUrl
}:{
  locale:Locale;
  content:VideoContent;
  amazonUrl:string|null;
}){
  const[open,setOpen]=useState(false);
  const modalRef=useRef<HTMLElement|null>(null);
  const videoId=useMemo(()=>youtubeEmbed(content.youtube_url||""),[content.youtube_url]);
  const poster=content.poster_url||"/elyon-hero.jpg";
  const enabled=!!videoId;

  useEffect(()=>{
    if(!open)return;
    const onKey=(e:KeyboardEvent)=>{if(e.key==="Escape")setOpen(false)};
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",onKey);
    requestAnimationFrame(()=>modalRef.current?.focus());
    return()=>{document.body.style.overflow="";window.removeEventListener("keydown",onKey)};
  },[open]);

  if(!enabled)return null;

  function openVideo(){
    if(!enabled)return;
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"official_video_open",locale,path:window.location.pathname,metadata:{video:"fragmentun-i"}
    }),keepalive:true}).catch(()=>{});
    setOpen(true);
  }

  return <>
    <section className="officialVideoSection" id="video-oficial">
      <div className="container">
        <button
          type="button"
          className={"officialVideoPoster "+(enabled?"isActive":"isPending")}
          onClick={openVideo}
          aria-disabled={!enabled}
        >
          <img src={poster} alt={content.poster_alt||(locale==="es"?"Video oficial de FRAGMENTUN I":"Official FRAGMENTUN I video")}/>
          <span className="officialVideoShade"/>
          <span className="officialVideoCopy">
            <span className="kicker">{content.eyebrow||(locale==="es"?"VIDEO OFICIAL · FRAGMENTUN I":"OFFICIAL VIDEO · FRAGMENTUN I")}</span>
            <strong>{content.title||(locale==="es"?"Entra en Lumen":"Enter Lumen")}</strong>
            <small>{content.body||(locale==="es"
              ?"Descubre el universo de FRAGMENTUN I: El Despertar Emocional."
              :"Discover the universe of FRAGMENTUN I: The Emotional Awakening.")}</small>
            <span className="officialVideoPlay">
              <b>▶</b>
              {enabled
                ?(content.play_label||(locale==="es"?"VER VIDEO OFICIAL":"WATCH OFFICIAL VIDEO"))
                :(locale==="es"?"VIDEO OFICIAL · PRÓXIMAMENTE":"OFFICIAL VIDEO · COMING SOON")}
            </span>
          </span>
        </button>
      </div>
    </section>

    {open&&enabled&&<div className="officialVideoBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false)}}>
      <section ref={modalRef} tabIndex={-1} className="officialVideoModal" role="dialog" aria-modal="true" aria-label={content.title||"FRAGMENTUN I"}>
        <button className="officialVideoClose" type="button" aria-label={locale==="es"?"Cerrar video":"Close video"} onClick={()=>setOpen(false)}>×</button>
        <div className="officialVideoFrame">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
            title={content.title||"FRAGMENTUN I"}
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
          />
        </div>
        <div className="officialVideoAfter">
          <div>
            <div className="kicker">{locale==="es"?"CONTINÚA EL VIAJE":"CONTINUE THE JOURNEY"}</div>
            <h3>{content.after_title||(locale==="es"?"¿Quieres entrar en Lumen?":"Do you want to enter Lumen?")}</h3>
          </div>
          <div className="officialVideoActions">
            {amazonUrl&&<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{placement:"official_video",book:"fragmentun-i"}} newTab>
              {content.amazon_label||(locale==="es"?"Comprar FRAGMENTUN I":"Buy FRAGMENTUN I")}
            </TrackLink>}
            <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale} metadata={{placement:"official_video"}}>
              {content.chapter_label||(locale==="es"?"Leer Capítulo 1":"Read Chapter 1")}
            </TrackLink>
          </div>
        </div>
      </section>
    </div>}
  </>;
}
