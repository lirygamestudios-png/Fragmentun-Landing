"use client";
import {useState} from "react";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
import {LIRY_PLAYER_AUTH_RELEASE,LIRY_ACCOUNT_SECURITY_CHECKLIST} from "../lib/games/liry-player-account-security";
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
 const [privateProfile,setPrivateProfile]=useState(true);
 const resetPreview=()=>{setNotices(false);setReduceMotion(false);setPrivateProfile(true)};
 const active=sections.indexOf(selected);
 return <section aria-labelledby="liry-account-center-heading" className={styles.accountCenter}>
  <h2 id="liry-account-center-heading" className={styles.accountHeading}>{copy.heading}</h2>
  <p className={styles.accountIntro}>{copy.intro}</p>
  <div role="group" aria-label={copy.heading} className={styles.accountTabs}>
   {sections.map((section,i)=><button key={section} type="button" aria-pressed={selected===section} onClick={()=>setSelected(section)} className={styles.accountTab}>{copy.sections[i]}</button>)}
  </div>
  <div role="region" aria-label={copy.sections[active]} className={styles.accountPanel}>
   {selected==="perfil"&&<><h3>{copy.sections[0]}</h3><p>{copy.alias}: <strong>{copy.aliasValue}</strong></p><p>{copy.avatar}: ◇</p><small>{copy.pending}</small></>}
   {selected==="configuracion"&&<><h3>{copy.sections[1]}</h3><p>{copy.language}: <strong>{locale.toUpperCase()}</strong></p><label className={styles.accountToggle}><input type="checkbox" checked={notices} onChange={e=>setNotices(e.target.checked)}/>{copy.notifications}</label><label className={styles.accountToggle}><input type="checkbox" checked={reduceMotion} onChange={e=>setReduceMotion(e.target.checked)}/>{copy.motion}</label><p aria-live="polite" className={styles.accountSummary}>{locale==="es"?`Avisos: ${notices?"seleccionados":"no seleccionados"} · Animaciones: ${reduceMotion?"reducidas":"normales"}`:`Notices: ${notices?"selected":"not selected"} · Motion: ${reduceMotion?"reduced":"normal"}`}</p><small>{copy.save}</small></>}
   {selected==="seguridad"&&<><h3>{copy.sections[2]}</h3><p>{copy.password} · {copy.reset} · {copy.sessions}</p><p>{copy.disabled}</p><ul style={{paddingLeft:22,lineHeight:1.8}}>{(locale==="es"?LIRY_ACCOUNT_SECURITY_CHECKLIST:["Independent Liry ID authentication","Email verification","Sign-in safeguards and attempt limits","Time-limited password recovery links","Password change with verified session","Server-side session revocation","Security audit trail and personal data protection"]).map(item=><li key={item}>{item}</li>)}</ul><small aria-live="polite">{LIRY_PLAYER_AUTH_RELEASE.enabled?copy.pendingAction:copy.disabled}</small></>}
   {selected==="privacidad"&&<><h3>{copy.privacy}</h3><p>{copy.privacyInfo}</p><label className={styles.accountToggle}><input type="checkbox" checked={privateProfile} onChange={e=>setPrivateProfile(e.target.checked)}/>{locale==="es"?"Mantener el perfil privado (vista preliminar)":"Keep profile private (preview)"}</label><p className={styles.accountSummary} aria-live="polite">{locale==="es"?(privateProfile?"Preferencia temporal: perfil privado":"Preferencia temporal: perfil visible"):(privateProfile?"Temporary preference: private profile":"Temporary preference: visible profile")}</p><small>{copy.save}</small></>}
   {selected==="compras"&&<><h3>{copy.purchases}</h3><p>{copy.purchasesInfo}</p></>}
   {(selected==="configuracion"||selected==="privacidad")&&<button type="button" className={styles.accountReset} onClick={resetPreview}>{locale==="es"?"Restablecer preferencias temporales":"Reset temporary preferences"}</button>}
  </div>
 </section>;
}
