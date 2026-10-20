"use client";
import {Fragment,useEffect,useRef,useState} from "react";
import type {PublicThirdPartyCard} from "../lib/games/liry-developer-publication";
import {LiryShareEntry} from "./LiryShareEntry";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


const normalizePublicSearch=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
/** Solo recibe fichas públicas previamente autorizadas. No activa transacciones. */
export function LiryThirdPartyCatalog({games,locale="es"}:{games:readonly PublicThirdPartyCard[],locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).thirdPartyCatalog;

 const [selected,setSelected]=useState<PublicThirdPartyCard|null>(null);
 const [page,setPage]=useState(1);
 const [query,setQuery]=useState("");
 const [model,setModel]=useState("all");
 const [linkedHash,setLinkedHash]=useState("");
 const [navigationCount,setNavigationCount]=useState(0);
 const filtered=games.filter(game=>(model==="all"||game.model===model)&&normalizePublicSearch(`${game.title} ${game.description}`).includes(normalizePublicSearch(query)));
 const totalPages=Math.max(1,Math.ceil(filtered.length/12));
 const currentPage=Math.min(page,totalPages);
 const visibleGames=filtered.slice((currentPage-1)*12,currentPage*12);
 const resultStatus=useRef<HTMLParagraphElement>(null);
 const focusAfterPageChange=useRef(false);
 useEffect(()=>{if(focusAfterPageChange.current){focusAfterPageChange.current=false;resultStatus.current?.focus({preventScroll:true})}},[currentPage]);
 const navigatePage=(next:number)=>{if(next===currentPage)return;focusAfterPageChange.current=true;setPage(next)};
 useEffect(()=>{
  const revealLinkedGame=(event?:Event)=>{
   const selectedSlug=event instanceof CustomEvent&&typeof event.detail?.slug==="string"?event.detail.slug:null;
   const hash=selectedSlug?`liry-third-party-${selectedSlug}`:window.location.hash.slice(1);
   const index=games.findIndex(game=>`liry-third-party-${game.slug}`===hash);
   if(index<0)return;
   setLinkedHash(hash);
   setNavigationCount(count=>count+1);
   setQuery("");setModel("all");setPage(Math.ceil((index+1)/12));
  };
  revealLinkedGame();
  window.addEventListener("hashchange",revealLinkedGame);
  window.addEventListener("liry:external-game-link",revealLinkedGame);
  return ()=>{window.removeEventListener("hashchange",revealLinkedGame);window.removeEventListener("liry:external-game-link",revealLinkedGame)};
 },[games]);
 useEffect(()=>{
  const hash=linkedHash;
  const index=games.findIndex(game=>`liry-third-party-${game.slug}`===hash);
  if(index<0||!visibleGames.some(game=>`liry-third-party-${game.slug}`===hash))return;
  const target=document.getElementById(hash);
  if(!target)return;
  const frame=requestAnimationFrame(()=>{target.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"center"});target.focus({preventScroll:true})});
  return ()=>cancelAnimationFrame(frame);
 },[games,currentPage,query,model,linkedHash,navigationCount]);
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
  <div className={styles.thirdPartyFilters}><label>{locale==="es"?"Buscar videojuegos públicos":"Search public games"}<input type="search" value={query} onChange={e=>{setQuery(e.target.value);setPage(1)}} placeholder={locale==="es"?"Nombre o descripción":"Name or description"} maxLength={100}/></label><label>{locale==="es"?"Modalidad":"Model"}<select value={model} onChange={e=>{setModel(e.target.value);setPage(1)}}><option value="all">{locale==="es"?"Todas":"All"}</option><option value="freemium">Freemium</option><option value="premium">Premium</option></select></label><button type="button" disabled={query===""&&model==="all"} onClick={()=>{setQuery("");setModel("all");setPage(1)}}>{locale==="es"?"Limpiar filtros":"Clear filters"}</button></div><p ref={resultStatus} tabIndex={-1} aria-live="polite" aria-atomic="true">{locale==="es"?`${filtered.length} videojuegos públicos encontrados · Página ${currentPage} de ${totalPages}`:`${filtered.length} public games found · Page ${currentPage} of ${totalPages}`}</p>
  <div className={styles.thirdPartyGrid}>
   {visibleGames.map(game=><article key={game.slug} id={`liry-third-party-${game.slug}`} tabIndex={-1} className={styles.thirdPartyCard}>
    <div className={styles.thirdPartyCardArt} aria-hidden="true"><span>✧</span></div>
    <div className={styles.thirdPartyCardBody}>
     <span className={styles.thirdPartyCardModel}>{game.model==="premium"?"PREMIUM":"FREEMIUM"}</span>
     <h4>{game.title}</h4><LiryShareEntry name={game.title} locale={locale} />
     <span className={styles.thirdPartyAvailability}>{copy.listingNotice}</span>
     <p>{game.description}</p>
     <button type="button" className={styles.thirdPartyDetailButton} aria-haspopup="dialog" aria-label={`${copy.detailAria} ${game.title}`} onClick={event=>open(game,event.currentTarget)}>{copy.detailButton} →</button>
    </div>
   </article>)}
  </div>
  {filtered.length===0&&<div role="status"><p>{locale==="es"?"No hay videojuegos públicos que coincidan con estos filtros.":"No public games match these filters."}</p><button type="button" className={styles.thirdPartyDetailButton} onClick={()=>{setQuery("");setModel("all");setPage(1)}}>{locale==="es"?"Mostrar todos los videojuegos":"Show all games"}</button></div>}
  {totalPages>1&&<nav className={styles.thirdPartyPagination} aria-label={locale==="es"?"Páginas del catálogo externo":"External catalog pages"}><button type="button" aria-label={locale==="es"?"Anterior página de videojuegos":"Previous game page"} disabled={currentPage===1} onClick={()=>navigatePage(Math.max(1,currentPage-1))}>{locale==="es"?"Anterior":"Previous"}</button>{Array.from(new Set([1,totalPages,currentPage-1,currentPage,currentPage+1].filter(n=>n>=1&&n<=totalPages))).sort((a,b)=>a-b).map((n,i,visible)=><Fragment key={n}>{i>0&&n-visible[i-1]>1&&<span aria-hidden="true">…</span>}<button type="button" aria-current={currentPage===n?"page":undefined} aria-label={locale==="es"?`Página ${n} de ${totalPages}`:`Page ${n} of ${totalPages}`} onClick={()=>navigatePage(n)}>{n}</button></Fragment>)}<button type="button" aria-label={locale==="es"?"Siguiente página de videojuegos":"Next game page"} disabled={currentPage===totalPages} onClick={()=>navigatePage(Math.min(totalPages,currentPage+1))}>{locale==="es"?"Siguiente":"Next"}</button></nav>}
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
