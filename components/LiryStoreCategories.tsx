"use client";
import {Fragment,useEffect,useRef,useState} from "react";
import {LiryShareEntry} from "./LiryShareEntry";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";


type PublicStoreItem={id:string;name:string;category:string;price:number;currency:string;available:boolean};
const normalizeSearch=(value:string)=>value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLocaleLowerCase().trim();
export function LiryStoreCategories({locale="es",products=[]}:{locale?:LiryFrontdeskLocale;products?:readonly PublicStoreItem[]}){
 const copy=liryFrontdeskStrings(locale).store;
 const collections=copy.categories.map(item=>({...item,tone:item.id}));

 const [selected,setSelected]=useState<(typeof collections)[number]>(collections[0]);
 const [term,setTerm]=useState("");
 const [category,setCategory]=useState("all");
 const [availability,setAvailability]=useState("all");
 const [sortBy,setSortBy]=useState("name");
 const [page,setPage]=useState(1);
 const filtered=products.filter(item=>(category==="all"||item.category===category)&&(availability==="all"||(availability==="available"?item.available:!item.available))&&normalizeSearch(`${item.name} ${collections.find(entry=>entry.id===item.category)?.name??""}`).includes(normalizeSearch(term))).sort((a,b)=>{const byName=a.name.localeCompare(b.name,locale)||a.id.localeCompare(b.id);return sortBy==="price-asc"?(a.price-b.price)||byName:sortBy==="price-desc"?(b.price-a.price)||byName:byName});
 const pages=Math.max(1,Math.ceil(filtered.length/12));
 const currentPage=Math.min(page,pages);
 const pageItems=filtered.slice((currentPage-1)*12,currentPage*12);
 const resultStatus=useRef<HTMLParagraphElement>(null);
 const focusAfterPageChange=useRef(false);
 useEffect(()=>{if(focusAfterPageChange.current){focusAfterPageChange.current=false;resultStatus.current?.focus({preventScroll:true})}},[currentPage]);
 const navigatePage=(next:number)=>{if(next===currentPage)return;focusAfterPageChange.current=true;setPage(next);resultStatus.current?.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"})};
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement|null>(null);
 const [dialogOpen,setDialogOpen]=useState(false);
 return <>
  <div className={styles.storeCategories} aria-label={copy.categoriesAria}>
   {collections.map(item=><button type="button" key={item.name} className={styles.storeCategory} aria-haspopup="dialog" aria-expanded={dialogOpen&&selected.id===item.id} aria-controls="liry-store-category-dialog" onClick={event=>{if(dialogRef.current&&!dialogRef.current.open){setSelected(item);triggerRef.current=event.currentTarget;dialogRef.current.showModal();setDialogOpen(true)}}}>
     <span className={`${styles.storeCategoryVisual} ${styles[`storeTone_${item.tone}` ]}`} aria-hidden="true"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{item.tone==="wear"?<path d="m8 4 4 2 4-2 5 4-3 4-2-1v9H8v-9l-2 1-3-4 5-4Z"/>:item.tone==="accessories"?<><circle cx="12" cy="12" r="7"/><path d="M8 5V3h8v2M9 12l3 4 3-4-3-4-3 4Z"/></>:item.tone==="collectibles"?<><path d="m12 2 8 5v10l-8 5-8-5V7l8-5Z"/><path d="m4 7 8 5 8-5M12 12v10"/></>:item.tone==="art"?<><rect x="4" y="3" width="16" height="18" rx="2"/><path d="m7 16 4-5 3 3 2-2 2 4M8 7h.01"/></>:<><rect x="3" y="7" width="18" height="11" rx="5"/><path d="M8 10v5M5.5 12.5h5M16 11h.01M18 14h.01"/></>}</svg></span><strong>{item.name}</strong><span className={styles.storeCategoryLine}/>
   </button>)}
  </div>
  <section className={styles.liryStoreListing} aria-label={locale==="es"?"Productos publicados":"Published products"}><h3>{locale==="es"?"Productos de la tienda":"Store products"}</h3><div className={styles.liryStoreFilters}><label>{locale==="es"?"Buscar producto":"Search product"}<input type="search" value={term} onChange={e=>{setTerm(e.target.value);setPage(1)}} placeholder={locale==="es"?"Nombre o categoría":"Name or category"} maxLength={100} /></label><label>{locale==="es"?"Categoría":"Category"}<select value={category} onChange={e=>{setCategory(e.target.value);setPage(1)}}><option value="all">{locale==="es"?"Todas":"All"}</option>{collections.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>{locale==="es"?"Disponibilidad":"Availability"}<select value={availability} onChange={e=>{setAvailability(e.target.value);setPage(1)}}><option value="all">{locale==="es"?"Todas":"All"}</option><option value="available">{locale==="es"?"Disponibles":"Available"}</option><option value="unavailable">{locale==="es"?"No disponibles":"Unavailable"}</option></select></label><label>{locale==="es"?"Ordenar por":"Sort by"}<select value={sortBy} onChange={e=>{setSortBy(e.target.value);setPage(1)}}><option value="name">{locale==="es"?"Nombre A–Z":"Name A–Z"}</option><option value="price-asc">{locale==="es"?"Menor precio":"Lowest price"}</option><option value="price-desc">{locale==="es"?"Mayor precio":"Highest price"}</option></select></label><button type="button" disabled={term===""&&category==="all"&&availability==="all"&&sortBy==="name"} onClick={()=>{setTerm("");setCategory("all");setAvailability("all");setSortBy("name");setPage(1)}}>{locale==="es"?"Limpiar filtros":"Clear filters"}</button></div><p ref={resultStatus} tabIndex={-1} aria-live="polite" aria-atomic="true">{locale==="es"?`${filtered.length} productos publicados · Página ${currentPage} de ${pages}`:`${filtered.length} published products · Page ${currentPage} of ${pages}`}</p>{pageItems.length?<div className={styles.liryStoreProducts}>{pageItems.map(item=><article key={item.id} className={styles.liryStoreProduct}><h4>{item.name}</h4><LiryShareEntry name={item.name} locale={locale} /><p>{item.available?(locale==="es"?"Disponible":"Available"):(locale==="es"?"No disponible":"Unavailable")}</p><p>{new Intl.NumberFormat(locale==="es"?"es-US":"en-US",{style:"currency",currency:item.currency}).format(item.price)}</p></article>)}</div>:<div role="status"><p>{locale==="es"?"Todavía no hay productos publicados que coincidan con estos filtros.":"No published products match these filters yet."}</p>{(term!==""||category!=="all"||availability!=="all"||sortBy!=="name")&&<button type="button" onClick={()=>{setTerm("");setCategory("all");setAvailability("all");setSortBy("name");setPage(1)}}>{locale==="es"?"Mostrar todos los productos":"Show all products"}</button>}</div>}{pages>1&&<nav className={styles.liryStorePages} aria-label={locale==="es"?"Páginas de productos":"Product pages"}><button type="button" aria-label={locale==="es"?"Anterior página de productos":"Previous product page"} disabled={currentPage===1} onClick={()=>navigatePage(Math.max(1,currentPage-1))}>{locale==="es"?"Anterior":"Previous"}</button>{Array.from(new Set([1,pages,currentPage-1,currentPage,currentPage+1].filter(n=>n>=1&&n<=pages))).sort((a,b)=>a-b).map((n,i,visible)=><Fragment key={n}>{i>0&&n-visible[i-1]>1&&<span aria-hidden="true">…</span>}<button type="button" aria-current={currentPage===n?"page":undefined} aria-label={locale==="es"?`Página ${n} de ${pages}`:`Page ${n} of ${pages}`} onClick={()=>navigatePage(n)}>{n}</button></Fragment>)}<button type="button" aria-label={locale==="es"?"Siguiente página de productos":"Next product page"} disabled={currentPage===pages} onClick={()=>navigatePage(Math.min(pages,currentPage+1))}>{locale==="es"?"Siguiente":"Next"}</button></nav>}</section>
    <dialog id="liry-store-category-dialog" ref={dialogRef} className={styles.gamerInfoDialog} aria-labelledby="liry-store-detail-title" onClose={()=>{setDialogOpen(false);triggerRef.current?.focus({preventScroll:true})}} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label={copy.closeAria}>×</button></form>
    <p className={styles.gamerInfoEyebrow}>{copy.eyebrow}</p>
    <h3 id="liry-store-detail-title">{selected.name}</h3>
    <p>{selected.message}</p><p>{copy.unavailable}</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>{copy.acknowledge}</button></form>
   </div>
  </dialog>
 </>;
}
