"use client";

import {useEffect,useState} from "react";
import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

type Props={
  locale:Locale;
  news:any;
  shareReward:any;
};

export function NewsConversionCards({locale,news,shareReward}:Props){
  const[rewardOpen,setRewardOpen]=useState(false);

  useEffect(()=>{
    if(!rewardOpen)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setRewardOpen(false)};
    window.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
  },[rewardOpen]);
  const[rewardReady,setRewardReady]=useState(false);
  const[shareStatus,setShareStatus]=useState<"idle"|"prompting"|"sharing"|"preparing"|"unsupported"|"error">("idle");

  async function shareAndUnlock(){
    const url=window.location.href;
    const text=locale==="es"
      ?"Descubre FRAGMENTUN, una saga de ciencia ficción emocional."
      :"Discover FRAGMENTUN, an emotional science-fiction saga.";

    if(typeof navigator.share!=="function"){
      setShareStatus("unsupported");
      return;
    }

    try{

    setRewardReady(false);
    setRewardOpen(false);

    // Stage 1: FRAGMENTUN owns the interaction before the native share sheet opens.
    setShareStatus("prompting");
    await new Promise<void>(resolve=>window.setTimeout(resolve,3000));
    setShareStatus("sharing");
    await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));

    // Stage 2: hand control to the browser/OS share surface.
    await navigator.share({title:"FRAGMENTUN",text,url});

    // Stage 3: once control returns to FRAGMENTUN, show a second branded state.
    // Keep it on screen for a deliberate minimum interval; only after it is
    // completely unmounted can the thank-you card appear.
    setShareStatus("preparing");
    await new Promise<void>(resolve=>window.setTimeout(resolve,3000));
      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        event_name:"share_reward_unlock",
        locale,
        path:window.location.pathname,
        metadata:{placement:"news",result:"completed_after_share_closed"}
      }),keepalive:true}).catch(()=>{});

      setRewardReady(true);
      setShareStatus("idle");
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));
      setRewardOpen(true);
    }catch(error){
      const aborted=error instanceof DOMException&&error.name==="AbortError";
      if(!aborted){
        fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
          event_name:"share_reward_error",
          locale,
          path:window.location.pathname,
          metadata:{placement:"news"}
        }),keepalive:true}).catch(()=>{});
      }
      setRewardReady(false);
      setRewardOpen(false);
      setShareStatus(aborted?"idle":"error");
    }
  }

  return <>
    <article className="newsCard newsRewardCard">
      <div className="newsVisual rewardNews">
        <img src={news?.card_share_image||shareReward?.art_url||"/elyon-hero.jpg"} alt=""/>
      </div>
      <div className="newsCopy">
        <span>{news?.card_share_label||(locale==="es"?"RECOMPENSA":"REWARD")}</span>
        <h3>{news?.card_share_title||(locale==="es"?"Arte conceptual gratis":"Free concept art")}</h3>
        <p>{news?.card_share_body||(locale==="es"
          ?"Comparte FRAGMENTUN y desbloquea una pieza de arte conceptual del universo."
          :"Share FRAGMENTUN and unlock a piece of concept art from the universe.")}</p>
        {(shareStatus==="idle"||shareStatus==="unsupported"||shareStatus==="error")&&<button type="button" className="newsLink newsActionButton" onClick={shareAndUnlock}>
          {news?.card_share_cta||(locale==="es"?"Compartir y desbloquear arte →":"Share and unlock art →")}
        </button>}
        {shareStatus==="unsupported"&&<small className="shareRewardStatus">
          {locale==="es"
            ?"Este navegador no permite verificar una operación de compartir completada."
            :"This browser cannot verify a completed share operation."}
        </small>}
        {shareStatus==="error"&&<small className="shareRewardStatus">
          {locale==="es"
            ?"No pudimos confirmar que la operación se completara. La recompensa sigue bloqueada."
            :"We could not confirm that sharing was completed. The reward remains locked."}
        </small>}
      </div>
    </article>

    <article className="newsCard newsExpansionCard">
      <div className="newsVisual expansionNews">
        <img src={news?.card_expand_image||"/lumen-ciudad-oficial.webp"} alt=""/>
      </div>
      <div className="newsCopy">
        <span>{news?.card_expand_label||(locale==="es"?"EXPANSIÓN":"EXPANSION")}</span>
        <h3>{news?.card_expand_title||(locale==="es"?"FRAGMENTUN hacia nuevas pantallas":"FRAGMENTUN toward new screens")}</h3>
        <p>{news?.card_expand_body||(locale==="es"
          ?"Acompaña el crecimiento del universo hacia nuevas historias, experiencias audiovisuales y videojuegos."
          :"Follow the universe as it grows into new stories, audiovisual experiences and video games.")}</p>
        <TrackLink
          className="newsLink"
          href="#comunidad-publica"
          eventName="community_click"
          locale={locale}
          metadata={{placement:"news_expansion"}}
        >
          {news?.card_expand_cta||(locale==="es"?"Únete al universo →":"Join the universe →")}
        </TrackLink>
      </div>
    </article>

    {(shareStatus==="prompting"||shareStatus==="preparing")&&<FragmentunProcessOverlay
      state="processing"
      title={shareStatus==="prompting"
        ?(locale==="es"?"SELECCIONA UNA OPCIÓN PARA COMPARTIR":"PLEASE SELECT A SHARING OPTION")
        :(locale==="es"?"TU ARTE CONCEPTUAL SE ESTÁ PREPARANDO…":"PREPARING YOUR CONCEPT ART…")}
      detail={shareStatus==="prompting"
        ?(locale==="es"?"La ventana para compartir se abrirá a continuación.":"The sharing window will open next.")
        :(locale==="es"?"ESPERA…":"PLEASE WAIT…")}
    />}\n\n    {rewardOpen&&<div className="shareRewardBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setRewardOpen(false)}}>
      <section className="shareRewardModal" role="dialog" aria-modal="true" aria-label={shareReward?.thank_you||(locale==="es"?"Gracias por compartir este universo":"Thank you for sharing this universe")}>
        <button className="shareRewardClose" type="button" aria-label={locale==="es"?"Cerrar":"Close"} onClick={()=>setRewardOpen(false)}>×</button>
        <div className="shareRewardArt">
          <img src={shareReward?.art_url||"/elyon-hero.jpg"} alt={locale==="es"?"Arte conceptual gratuito de FRAGMENTUN":"Free FRAGMENTUN concept art"}/>
        </div>
        <div className="shareRewardCopy">
          <div className="kicker">{locale==="es"?"RECOMPENSA DESBLOQUEADA":"REWARD UNLOCKED"}</div>
          <h2>{shareReward?.thank_you||(locale==="es"?"GRACIAS POR COMPARTIR ESTE UNIVERSO":"THANK YOU FOR SHARING THIS UNIVERSE")}</h2>
          <p>{locale==="es"
            ?"Tu pieza de arte conceptual de FRAGMENTUN está lista."
            :"Your FRAGMENTUN concept art is ready."}</p>
          {rewardReady&&<a
            className="btn btnPrimary"
            href={shareReward?.art_url||"/elyon-hero.jpg"}
            download
            onClick={()=>fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
              event_name:"share_reward_download",
              locale,
              path:window.location.pathname,
              metadata:{placement:"news"}
            }),keepalive:true}).catch(()=>{})}
          >{shareReward?.reward_label||(locale==="es"?"Descargar arte conceptual":"Download concept art")}</a>}
        </div>
      </section>
    </div>}
  </>;
}
