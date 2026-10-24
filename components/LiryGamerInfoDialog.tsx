"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {LIRY_GAME_LINKS_PENDING} from "../lib/games/liry-game-link-contract";
import {LIRY_VISITOR_IDENTITY} from "../lib/games/liry-id-contract";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";



type Topic="perfil"|"journey"|"logros"|"mundos"|"logros-lista";


export function LiryGamerInfoDialog({topic,locale="es"}:{topic:Topic,locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).gamerInfo;
 const stages=liryFrontdeskStrings(locale).identityStages;
 const panels=copy.panels;

  const dialogRef=useRef<HTMLDialogElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const navigatingToDna=useRef(false);
  const [selectedWorld,setSelectedWorld]=useState<number|null>(null);
  const worldLinks=LIRY_GAME_LINKS_PENDING;
  const data=panels[topic];
  return <>
    <button type="button" ref={triggerRef} className={styles.gamerCardAction} onClick={()=>{setSelectedWorld(null);dialogRef.current?.showModal()}} aria-haspopup="dialog">{data.title} <span aria-hidden="true">→</span></button>
    <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label={data.title} onClose={()=>{setSelectedWorld(null);if(!navigatingToDna.current)triggerRef.current?.focus({preventScroll:true});navigatingToDna.current=false}} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
      <div className={styles.gamerInfoDialogInside}>
        <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.close}>×</button></form>
        <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
        <h3>{data.title}</h3>
        <p>{data.paragraph}</p>
        {topic==="mundos"&&<><ol className={styles.gamerInfoModalList}>{worldLinks.map((link,index)=><li key={link.publicGameCode}><button type="button" className={styles.gamerWorldChoice} aria-pressed={selectedWorld===index} onClick={()=>setSelectedWorld(index)}>{link.publicGameCode} <span>{copy.viewLink} →</span></button></li>)}</ol>{selectedWorld!==null&&<div className={styles.gamerWorldStatus} role="status"><strong>{worldLinks[selectedWorld].publicGameCode}</strong><p>{copy.connection}: {worldLinks[selectedWorld].status==="not_connected"?copy.statuses[0]:worldLinks[selectedWorld].status==="pending_verification"?copy.statuses[1]:copy.statuses[2]}</p><small>{copy.worldNote}</small></div>}</>}
        {topic==="logros-lista"&&<ul className={styles.gamerInfoModalList}>{copy.goals.map(([title,description])=><li key={title}><span>{title}</span><small>{description} · {copy.pending}</small></li>)}</ul>}
        {topic==="perfil"&&<><div className={styles.liryIdentityStages} aria-label={stages.label}><div><strong>01 · {stages.visitor}</strong><span>{LIRY_VISITOR_IDENTITY.kind==="visitor"?stages.current:"—"}</span><p>{stages.visitorDescription}</p></div><div><strong>02 · {stages.account}</strong><span>{stages.unavailable}</span><p>{stages.accountDescription}</p></div><div><strong>03 · {stages.player}</strong><span>{stages.unavailable}</span><p>{stages.playerDescription}</p></div></div><p><a href="#liry-dna" onClick={()=>{navigatingToDna.current=true;dialogRef.current?.close();requestAnimationFrame(()=>{const target=document.getElementById("liry-dna");if(!target)return;if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");target.focus({preventScroll:true})})}}>{stages.exploreDna} →</a></p></>}
        <small>{data.notice}</small>
        <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.close}</button></form>
      </div>
    </dialog>
  </>;
}
