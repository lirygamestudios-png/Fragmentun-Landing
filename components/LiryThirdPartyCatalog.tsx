"use client";
import {useEffect,useRef,useState} from "react";
import type {PublicThirdPartyCard} from "../lib/games/liry-developer-publication";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


/** Solo recibe fichas públicas previamente autorizadas. No activa transacciones. */
export function LiryThirdPartyCatalog({games,locale="es"}:{games:readonly PublicThirdPartyCard[],locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).thirdPartyCatalog;

 const [selected,setSelected]=useState<PublicThirdPartyCard|null>(null);
 const [visibleCount,setVisibleCount]=useState(12);
 const [linkedHash,setLinkedHash]=useState("");
 const visibleGames=games.slice(0,visibleCount);
 useEffect(()=>{
  const revealLinkedGame=()=>{
   const hash=window.location.hash.slice(1);
   setLinkedHash(hash);
   const index=games.findIndex(game=>`liry-third-party-${game.slug}`===hash);
   if(index>=0)setVisibleCount(current=>Math.max(current,Math.ceil((index+1)/12)*12));
  };
  revealLinkedGame();
  window.addEventListener("hashchange",revealLinkedGame);
  return ()=>window.removeEventListener("hashchange",revealLinkedGame);
 },[games]);
 useEffect(()=>{
  const hash=linkedHash;
  const index=games.findIndex(game=>`liry-third-party-${game.slug}`===hash);
  if(index<0||index>=visibleCount)return;
  const target=document.getElementById(hash);
  if(!target)return;
  const frame=requestAnimationFrame(()=>target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"}));
  return ()=>cancelAnimationFrame(frame);
 },[games,visibleCount,linkedHash]);
 const dialog=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 if(!games.length)return null;
 const open=(game:PublicThirdPartyCard,button:HTMLButtonElement)=>{
  if(dialog.current?.open)return;
  opener.current=button;
  setSelected(game);
  dialog.current?.showModal();
  if(dialog.current)dialog.current.scrollTop=0;
 };
 return <section className={styles.thirdPartySection} aria-labelledby="liry-third-party-title">
  <p className={styles.kicker}>{copy.eyebrow}</p>
  <h3 id="liry-third-party-title">{copy.title}</h3>
  <p>{copy.intro}</p>
  <div className={styles.thirdPartyGrid}>
   {visibleGames.map(game=><article key={game.slug} id={`liry-third-party-${game.slug}`} className={styles.thirdPartyCard}>
    <div className={styles.thirdPartyCardArt} aria-hidden="true"><span>✧</span></div>
    <div className={styles.thirdPartyCardBody}>
     <span className={styles.thirdPartyCardModel}>{game.model==="premium"?"PREMIUM":"FREEMIUM"}</span>
     <h4>{game.title}</h4>
     <span className={styles.thirdPartyAvailability}>{copy.listingNotice}</span>
     <p>{game.description}</p>
     <button type="button" className={styles.thirdPartyDetailButton} aria-haspopup="dialog" aria-label={`${copy.detailAria} ${game.title}`} onClick={event=>open(game,event.currentTarget)}>{copy.detailButton} →</button>
    </div>
   </article>)}
  </div>
  {games.length>visibleCount&&<div style={{display:"flex",justifyContent:"center",padding:"20px 0"}}><button type="button" className={styles.thirdPartyDetailButton} onClick={()=>setVisibleCount(count=>Math.min(count+12,games.length))} aria-label={locale==="es"?"Mostrar más videojuegos externos":"Show more third-party games"}>{locale==="es"?"VER MÁS VIDEOJUEGOS":"SHOW MORE GAMES"} ({visibleCount}/{games.length}) ↓</button></div>}
  <dialog ref={dialog} className={styles.thirdPartyDialog} aria-modal="true" aria-labelledby="third-party-dialog-title" onClose={()=>{setSelected(null);opener.current?.focus({preventScroll:true});opener.current=null}} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
   <div className={styles.thirdPartyDialogBody}>
    <form method="dialog"><button type="submit" className={styles.thirdPartyClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.kicker}>{copy.dialogEyebrow}</p>
    <h3 id="third-party-dialog-title">{selected?.title??copy.dialogFallback}</h3>
    <span className={styles.thirdPartyCardModel}>{selected?.model==="premium"?"PREMIUM":"FREEMIUM"}</span>
    <p className={styles.thirdPartyAvailability}>{copy.dialogAvailability}</p>
    <p>{selected?.description}</p>
    <p className={styles.thirdPartyNotice}>{selected?.model==="premium"?copy.premium:copy.freemium}</p>
    <p className={styles.thirdPartyNotice}>{copy.notice}</p>
   </div>
  </dialog>
 </section>;
}
