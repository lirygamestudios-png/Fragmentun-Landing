"use client";
import {useState} from "react";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

type Section="perfil"|"configuracion"|"seguridad"|"privacidad"|"compras";
const labels={
 es:{heading:"CENTRO DE CUENTA",intro:"Organiza tu experiencia como jugador. Las preferencias de esta vista son temporales; aún no existe una cuenta autenticada.",sections:["Mi perfil","Configuración","Seguridad","Privacidad","Mis compras"],alias:"Nombre público",aliasValue:"Visitante",avatar:"Avatar",pending:"Sin cuenta verificada",language:"Idioma de presentación",notifications:"Avisos de la plataforma (vista preliminar)",motion:"Reducir animaciones en esta vista",save:"Preferencias temporales: no se guardan en el servidor",password:"Cambio de contraseña",reset:"Recuperación de acceso",sessions:"Sesiones y dispositivos",disabled:"Disponible cuando se habiliten cuentas Liry ID verificadas. No introduzcas contraseñas aquí.",privacy:"Control de visibilidad",privacyInfo:"La visibilidad pública, los consentimientos y la gestión de datos se activarán con cuentas reales.",purchases:"Historial de compras e inventario",purchasesInfo:"Sin compras registradas ni pasarelas activas. No mostramos transacciones ficticias.",pendingAction:"Función pendiente de activación"},
 en:{heading:"ACCOUNT CENTER",intro:"Organize your player experience. Preferences on this screen are temporary; there is no authenticated account yet.",sections:["My profile","Settings","Security","Privacy","My purchases"],alias:"Public name",aliasValue:"Visitor",avatar:"Avatar",pending:"No verified account",language:"Display language",notifications:"Platform notifications (preview)",motion:"Reduce motion in this preview",save:"Temporary preferences: not saved to a server",password:"Change password",reset:"Recover access",sessions:"Sessions and devices",disabled:"Available when verified Liry ID accounts are enabled. Do not enter passwords here.",privacy:"Visibility controls",privacyInfo:"Public visibility, consent and data controls will be enabled with real accounts.",purchases:"Purchase history and inventory",purchasesInfo:"No recorded purchases or active payment gateways. No fictional transactions are shown.",pendingAction:"Feature not yet enabled"}
} as const;
const sections:readonly Section[]=["perfil","configuracion","seguridad","privacidad","compras"];

export function LiryPlayerAccountCenter({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=labels[locale];
 const [selected,setSelected]=useState<Section>("perfil");
 const [notices,setNotices]=useState(false);
 const [reduceMotion,setReduceMotion]=useState(false);
 const active=sections.indexOf(selected);
 return <section aria-labelledby="liry-account-center-heading" style={{marginTop:24,border:"1px solid #315678",borderRadius:12,background:"#091b31",padding:"clamp(16px,3vw,28px)"}}>
  <h2 id="liry-account-center-heading" style={{color:"#d7bb68",letterSpacing:".08em"}}>{copy.heading}</h2>
  <p style={{color:"#bdcee2",lineHeight:1.6}}>{copy.intro}</p>
  <div role="group" aria-label={copy.heading} style={{display:"flex",flexWrap:"wrap",gap:8,margin:"18px 0"}}>
   {sections.map((section,i)=><button key={section} type="button" aria-pressed={selected===section} onClick={()=>setSelected(section)} style={{border:selected===section?"1px solid #d7bb68":"1px solid #315678",borderRadius:7,padding:"10px 12px",background:selected===section?"#193956":"#0b2139",color:"#f1f6ff",cursor:"pointer"}}>{copy.sections[i]}</button>)}
  </div>
  <div role="region" aria-label={copy.sections[active]} style={{borderTop:"1px solid #315678",paddingTop:16,color:"#e6f0fc",minHeight:135}}>
   {selected==="perfil"&&<><h3>{copy.sections[0]}</h3><p>{copy.alias}: <strong>{copy.aliasValue}</strong></p><p>{copy.avatar}: ◇</p><small>{copy.pending}</small></>}
   {selected==="configuracion"&&<><h3>{copy.sections[1]}</h3><p>{copy.language}: <strong>{locale.toUpperCase()}</strong></p><label style={{display:"flex",gap:10,margin:"12px 0"}}><input type="checkbox" checked={notices} onChange={e=>setNotices(e.target.checked)}/>{copy.notifications}</label><label style={{display:"flex",gap:10,margin:"12px 0"}}><input type="checkbox" checked={reduceMotion} onChange={e=>setReduceMotion(e.target.checked)}/>{copy.motion}</label><p aria-live="polite" style={{border:"1px solid #315678",padding:10,borderRadius:7}}>{locale==="es"?`Avisos: ${notices?"seleccionados":"no seleccionados"} · Animaciones: ${reduceMotion?"reducidas":"normales"}`:`Notices: ${notices?"selected":"not selected"} · Motion: ${reduceMotion?"reduced":"normal"}`}</p><small>{copy.save}</small></>}
   {selected==="seguridad"&&<><h3>{copy.sections[2]}</h3><p>{copy.password} · {copy.reset} · {copy.sessions}</p><p>{copy.disabled}</p><small>{copy.pendingAction}</small></>}
   {selected==="privacidad"&&<><h3>{copy.privacy}</h3><p>{copy.privacyInfo}</p><small>{copy.pendingAction}</small></>}
   {selected==="compras"&&<><h3>{copy.purchases}</h3><p>{copy.purchasesInfo}</p></>}
  </div>
 </section>;
}
