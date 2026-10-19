"use client";
import {useEffect,useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Item={label:string;href:string};
export function LiryMobileNav({ariaLabel,items,locale="es"}:{ariaLabel:string;items:Item[];locale?:"es"|"en"}){
 const [open,setOpen]=useState(false);
 const root=useRef<HTMLDivElement>(null);
 useEffect(()=>{
  if(!open)return;
  const closeOutside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setOpen(false)};
  const closeEscape=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
  const closeOnNavigation=()=>setOpen(false);
  document.addEventListener("pointerdown",closeOutside);
  document.addEventListener("keydown",closeEscape);
  window.addEventListener("hashchange",closeOnNavigation);
  return ()=>{document.removeEventListener("pointerdown",closeOutside);document.removeEventListener("keydown",closeEscape);window.removeEventListener("hashchange",closeOnNavigation)};
 },[open]);
 return <div className={styles.navMenu} ref={root}>
  <button type="button" className={styles.navMenuToggle} aria-label={open?(locale==="es"?"Cerrar menú":"Close menu"):ariaLabel} aria-expanded={open} aria-controls="liry-mobile-nav" onClick={()=>setOpen(value=>!value)}>
   {open?<span aria-hidden="true" className={styles.navMenuX}>×</span>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>}
  </button>
  {open&&<nav id="liry-mobile-nav" className={styles.navMenuPanel} aria-label={ariaLabel}>
    {items.map(item=><a key={item.href} href={item.href} onClick={()=>setOpen(false)}>{item.label}</a>)}
   </nav>}
 </div>;
}
