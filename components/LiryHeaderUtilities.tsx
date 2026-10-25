"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Locale="es"|"en";
const targets=[
 {es:"Catálogo de videojuegos",en:"Game catalog",href:"#mundos",tags:"juegos videojuegos games worlds mundos catálogo"},
 {es:"Liry ADN",en:"Liry DNA",href:"#liry-dna",tags:"adn dna afinidad personality"},
 {es:"Mi perfil de jugador",en:"My gamer profile",href:"#perfil-gamer",tags:"perfil jugador avatar gamer"},
 {es:"Comunidad",en:"Community",href:"#comunidad",tags:"social comunidad community"},
 {es:"LiryBoost",en:"LiryBoost",href:"#liryboost",tags:"beta compartir ranking"},
 {es:"Tienda",en:"Store",href:"#tienda",tags:"tienda skins shop store"},
] as const;
export function LiryHeaderUtilities({locale,searchLabel,noticeLabel}:{locale:Locale;searchLabel:string;noticeLabel:string}){
 const [section,setSection]=useState<"search"|"notice">("search");
 const [term,setTerm]=useState("");
 const dialog=useRef<HTMLDialogElement>(null);
 const origin=useRef<HTMLButtonElement|null>(null);
 const input=useRef<HTMLInputElement>(null);
 const firstResult=useRef<HTMLAnchorElement>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const open=(kind:"search"|"notice",button:HTMLButtonElement)=>{if(!dialog.current||dialog.current.open)return;origin.current=button;if(kind==="search")setTerm("");setSection(kind);dialog.current.showModal();requestAnimationFrame(()=>{const target=kind==="search"?input.current:closeButton.current;if(dialog.current?.open&&target?.isConnected)target.focus({preventScroll:true})})};
 const close=()=>dialog.current?.close();
 const normalize=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase();
 const results=targets.filter(t=>!term.trim()||normalize(`${t.es} ${t.en} ${t.tags}`).includes(normalize(term.trim())));
 return <>
 <button className={styles.navSearch} type="button" aria-label={searchLabel} title={searchLabel} aria-haspopup="dialog" onClick={e=>open("search",e.currentTarget)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></button>
 <button className={styles.navNotice} type="button" aria-label={noticeLabel} title={noticeLabel} aria-haspopup="dialog" onClick={e=>open("notice",e.currentTarget)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></button>
 <dialog ref={dialog} className={styles.headerUtilityDialog} aria-label={section==="search"?(locale==="es"?"Buscar en LIRYGAMES":"Search LIRYGAMES"):(locale==="es"?"Centro de avisos":"Notification center")} onClose={()=>{if(origin.current?.isConnected)origin.current.focus({preventScroll:true});origin.current=null}} onClick={e=>{if(e.target===dialog.current)close()}}>
  <div className={styles.headerUtilityBody}>
   <div className={styles.headerUtilityTop}><h2>{section==="search"?(locale==="es"?"Buscar en LIRYGAMES":"Search LIRYGAMES"):(locale==="es"?"Centro de avisos":"Notification center")}</h2><button type="button" ref={closeButton} className={styles.headerUtilityClose} onClick={close} aria-label={locale==="es"?"Cerrar":"Close"}>×</button></div>
   {section==="search"?<><label className={styles.headerUtilityLabel}>{locale==="es"?"Buscar secciones públicas":"Search public sections"}<input ref={input} type="search" enterKeyHint="search" autoComplete="off" value={term} onChange={e=>setTerm(e.target.value)} onKeyDown={e=>{if(e.key==="ArrowDown"&&results.length>0){e.preventDefault();firstResult.current?.focus({preventScroll:true})}else if(e.key==="Enter"&&results.length>0){e.preventDefault();firstResult.current?.click()}}} placeholder={locale==="es"?"Juegos, tienda, comunidad…":"Games, store, community…"} maxLength={100} /></label><p className={styles.headerUtilityCount} role="status" aria-live="polite" aria-atomic="true">{locale==="es"?`${results.length} ${results.length===1?"sección encontrada":"secciones encontradas"}`:`${results.length} ${results.length===1?"section found":"sections found"}`}</p>{term.trim()&&<button type="button" className={styles.headerUtilityClear} onClick={()=>{setTerm("");input.current?.focus({preventScroll:true})}}>{locale==="es"?"Limpiar búsqueda":"Clear search"}</button>}<p>{locale==="es"?"Resultados de secciones disponibles; no se muestran títulos privados ni juegos no publicados.":"Available public sections only; private titles and unreleased games are not shown."}</p><div className={styles.headerUtilityResults}>{results.length?results.map((item,index)=><a ref={index===0?firstResult:undefined} key={item.href+item.es} href={item.href} onClick={()=>{origin.current=null;close();requestAnimationFrame(()=>{const target=document.getElementById(item.href.slice(1));if(!target)return;if(!target.hasAttribute("tabindex"))target.setAttribute("tabindex","-1");target.focus({preventScroll:true})})}}>{item[locale]} →</a>):<p role="status">{locale==="es"?"Sin coincidencias en las secciones públicas.":"No matching public sections."}</p>}</div></>:<><p role="status">{locale==="es"?"No hay notificaciones de jugador disponibles. Todavía no se ha habilitado una cuenta verificada.":"No player notifications available. Verified accounts have not been enabled yet."}</p><p>{locale==="es"?"Cuando haya avisos auténticos de lanzamientos, betas o seguridad, aparecerán aquí. No se muestran mensajes ficticios.":"When authentic launch, beta, or security notices become available, they will appear here. No fictional messages are shown."}</p></>}
  </div>
 </dialog></>;
}
