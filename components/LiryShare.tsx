"use client";
import {useState} from "react";

export function LiryShare(){
 const[copied,setCopied]=useState(false);
 function pageUrl(){return window.location.href.split("#")[0];}
 async function copyLink(){
   try{await navigator.clipboard.writeText(pageUrl());setCopied(true);}
   catch{setCopied(false);}
 }
 function shareTo(provider:"whatsapp"|"facebook"|"x"){
   const url=encodeURIComponent(pageUrl());
   const title=encodeURIComponent("LIRYGAMES STUDIOS · 9 Worlds");
   const dest=provider==="whatsapp"?"https://api.whatsapp.com/send?text="+title+"%20"+url:
     provider==="facebook"?"https://www.facebook.com/sharer/sharer.php?u="+url:
     "https://twitter.com/intent/tweet?text="+title+"&url="+url;
   window.open(dest,"_blank","noopener,noreferrer");
 }
 return <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:24}}>
   <button type="button" onClick={copyLink} style={buttonStyle}>{copied?"ENLACE COPIADO ✓":"COPIAR ENLACE"}</button>
   <button type="button" onClick={()=>shareTo("whatsapp")} style={buttonStyle}>WHATSAPP ↗</button>
   <button type="button" onClick={()=>shareTo("facebook")} style={buttonStyle}>FACEBOOK ↗</button>
   <button type="button" onClick={()=>shareTo("x")} style={buttonStyle}>X ↗</button>
 </div>;
}
const buttonStyle:React.CSSProperties={padding:"12px 18px",border:"1px solid #57a9df88",borderRadius:8,background:"linear-gradient(120deg,#152b55,#192044)",color:"#dff5ff",cursor:"pointer",fontSize:12,fontWeight:700,letterSpacing:".04em"};
