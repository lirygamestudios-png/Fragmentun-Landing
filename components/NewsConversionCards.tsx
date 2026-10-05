"use client";

import {useState} from "react";
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
  const[rewardReady,setRewardReady]=useState(false);
  const[shareStatus,setShareStatus]=useState<"idle"|"sharing"|"returning"|"unsupported"|"error">("idle");

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
      setShareStatus("sharing");

      // Let React paint the branded COMPARTIENDO state before the OS share sheet takes control.
      await new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve())));

      await navigator.share({title:"FRAGMENTUN",text,url});

      // Native share behavior differs by browser/OS. Once navigator.share()
      // resolves, immediately move into the branded FRAGMENTUN processing state.
      // Then wait for the page to be visibly active for a short stable window,
      // with a hard fallback so the UI can never remain stuck on "Compartiendo…".
      setShareStatus("returning");

      await new Promise<void>(resolve=>{
        let stableTimer:number|undefined;
        let hardTimer:number|undefined;
        let poll:number|undefined;
        let done=false;

        const finish=()=>{
          if(done)return;
          done=true;
          if(stableTimer!==undefined)window.clearTimeout(stableTimer);
          if(hardTimer!==undefined)window.clearTimeout(hardTimer);
          if(poll!==undefined)window.clearInterval(poll);
          resolve();
        };

        const evaluate=()=>{
          const active=document.visibilityState==="visible"&&document.hasFocus();
          if(active&&stableTimer===undefined){
            stableTimer=window.setTimeout(finish,1100);
          }else if(!active&&stableTimer!==undefined){
            window.clearTimeout(stableTimer);
            stableTimer=undefined;
          }
        };

        poll=window.setInterval(evaluate,120);
        hardTimer=window.setTimeout(finish,4200);
        evaluate();
      });

      setShareStatus("returning");

      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        event_name:"share_reward_unlock",
        locale,
        path:window.location.pathname,
        metadata:{placement:"news",result:"completed_after_share_closed"}
      }),keepalive:true}).catch(()=>{});

      setRewardReady(true);
      setRewardOpen(true);
      setShareStatus("idle");
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
        <button type="button" className="newsLink newsActionButton" disabled={shareStatus==="sharing"} onClick={shareAndUnlock}>
          {news?.card_share_cta||(locale==="es"?"Compartir y desbloquear arte →":"Share and unlock art →")}
        </button>
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

    {(shareStatus==="sharing"||shareStatus==="returning")&&<FragmentunProcessOverlay
      state="processing"
      title={shareStatus==="sharing"
        ?(locale==="es"?"COMPARTIENDO…":"SHARING…")
        :(locale==="es"?"PROCESANDO…":"PROCESSING…")}
      detail={shareStatus==="sharing"
        ?(locale==="es"?"Compartiendo FRAGMENTUN":"Sharing FRAGMENTUN")
        :(locale==="es"?"Verificando tu regreso a FRAGMENTUN":"Verifying your return to FRAGMENTUN")}
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
