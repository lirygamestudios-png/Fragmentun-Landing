"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Locale="es"|"en";
const targets=[
 {es:"Catálogo de videojuegos",en:"Game catalog",href:"#mundos",tags:"juegos videojuegos games worlds mundos catálogo"},
 {es:"Liry DNA",en:"Liry DNA",href:"#liry-dna",tags:"adn dna afinidad personality"},
 {es:"Mi perfil de jugador",en:"My gamer profile",href:"#perfil-gamer",tags:"perfil jugador avatar gamer"},
 {es:"Comunidad",en:"Community",href:"#comunidad",tags:"social comunidad community"},
 {es:"Liryboost",en:"Liryboost",href:"#liryboost",tags:"beta compartir ranking"},
 {es:"Tienda",en:"Store",href:"#tienda",tags:"tienda skins shop store"},
 {es:"Liry Developers",en:"Liry Developers",href:"#comunidad",tags:"desarrolladores developers"}
] as const;
export function LiryHeaderUtilities({locale,searchLabel,noticeLabel}:{locale:Locale;searchLabel:string;noticeLabel:string}){
 const [section,setSection]=useState<"search"|"notice">("search");
 const [term,setTerm]=useState("");
 const dialog=useRef<HTMLDialogElement>(null);
 const origin=useRef<HTMLButtonElement|null>(null);
 const input=useRef<HTMLInputElement>(null);
 const open=(kind:"search"|"notice",button:HTMLButtonElement)=>{origin.current=button;setSection(kind);dialog.current?.showModal();if(kind==="search")requestAnimationFrame(()=>input.current?.focus({preventScroll:true}))};
 const close=()=>dialog.current?.close();
 const results=targets.filter(t=>!term.trim()||(`${t.es} ${t.en} ${t.tags}`).toLocaleLowerCase().includes(term.trim().toLocaleLowerCase()));
 return <>
 <button className={styles.navSearch} type="button" aria-label={searchLabel} title={searchLabel} aria-haspopup="dialog" onClick={e=>open("search",e.currentTarget)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></button>
 <button className={styles.navNotice} type="button" aria-label={noticeLabel} title={noticeLabel} aria-haspopup="dialog" onClick={e=>open("notice",e.currentTarget)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></button>
 <dialog ref={dialog} className={styles.headerUtilityDialog} aria-label={section==="search"?(locale==="es"?"Buscar en LIRYGAMES":"Search LIRYGAMES"):(locale==="es"?"Centro de avisos":"Notification center")} onClose={()=>origin.current?.focus({preventScroll:true})} onClick={e=>{if(e.target===dialog.current)close()}}>
  <div className={styles.headerUtilityBody}>
   <div className={styles.headerUtilityTop}><h2>{section==="search"?(locale==="es"?"Buscar en LIRYGAMES":"Search LIRYGAMES"):(locale==="es"?"Centro de avisos":"Notification center")}</h2><button type="button" className={styles.headerUtilityClose} onClick={close} aria-label={locale==="es"?"Cerrar":"Close"}>×</button></div>
   {section==="search"?<><label className={styles.headerUtilityLabel}>{locale==="es"?"Buscar secciones públicas":"Search public sections"}<input ref={input} value={term} onChange={e=>setTerm(e.target.value)} placeholder={locale==="es"?"Juegos, tienda, comunidad…":"Games, store, community…"} /></label><p>{locale==="es"?"Resultados de secciones disponibles; no se muestran títulos privados ni juegos no publicados.":"Available public sections only; private titles and unreleased games are not shown."}</p><div className={styles.headerUtilityResults}>{results.length?results.map(item=><a key={item.href+item.es} href={item.href} onClick={close}>{item[locale]} →</a>):<p role="status">{locale==="es"?"Sin coincidencias en las secciones públicas.":"No matching public sections."}</p>}</div></>:<><p role="status">{locale==="es"?"No hay notificaciones de jugador disponibles. Todavía no se ha habilitado una cuenta verificada.":"No player notifications available. Verified accounts have not been enabled yet."}</p><p>{locale==="es"?"Cuando haya avisos auténticos de lanzamientos, betas o seguridad, aparecerán aquí. No se muestran mensajes ficticios.":"When authentic launch, beta, or security notices become available, they will appear here. No fictional messages are shown."}</p></>}
  </div>
 </dialog></>;
}
