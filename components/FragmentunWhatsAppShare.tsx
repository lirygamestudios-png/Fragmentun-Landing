"use client";

import {useEffect,useState} from "react";

type Props={title:string;locale:"es"|"en"};

/** Share only the currently opened, public article route, never a draft. */
export default function FragmentunWhatsAppShare({title,locale}:Props){
 const [href,setHref]=useState<string|null>(null);
 useEffect(()=>{
   const url=new URL(window.location.href);
   // Keep canonical locale and slug while discarding tracking parameters.
   const canonical=`${url.origin}${url.pathname}`;
   const message=`${title}\n${canonical}`;
   setHref(`https://wa.me/?text=${encodeURIComponent(message)}`);
 },[title]);
 const label=locale==="es"?"Compartir por WhatsApp":"Share via WhatsApp";
 return <div style={{display:"flex",justifyContent:"flex-start",margin:"24px 0 28px"}}>
  {href?<a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} style={{display:"inline-flex",alignItems:"center",gap:10,padding:"12px 18px",borderRadius:12,background:"#155e50",border:"1px solid #328c74",color:"#ffffff",fontWeight:650,textDecoration:"none",fontSize:14}}><span aria-hidden="true" style={{fontSize:18}}>✆</span>{label}</a>
  :<span aria-label={label} style={{display:"inline-flex",alignItems:"center",padding:"12px 18px",borderRadius:12,border:"1px solid #365b57",opacity:.55,fontSize:14}}>{label}</span>}
 </div>;
}
