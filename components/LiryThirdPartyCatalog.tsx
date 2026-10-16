"use client";
import {useRef,useState} from "react";
import type {PublicThirdPartyCard} from "../lib/games/liry-developer-publication";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").thirdPartyCatalog;

/** Solo recibe fichas públicas previamente autorizadas. No activa transacciones. */
export function LiryThirdPartyCatalog({games}:{games:readonly PublicThirdPartyCard[]}){
 const [selected,setSelected]=useState<PublicThirdPartyCard|null>(null);
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
   {games.map(game=><article key={game.slug} className={styles.thirdPartyCard}>
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
