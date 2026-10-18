"use client";
import {useEffect,useRef,useState} from "react";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
import {LIRY_PLAYER_AUTH_RELEASE,LIRY_ACCOUNT_SECURITY_CHECKLIST} from "../lib/games/liry-player-account-security";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {validateTemporaryGamerAvatar,validateTemporaryGamerAvatarContent} from "../lib/games/liry-avatar-validation";
import {isValidLiryDisplayName} from "../lib/games/liry-display-name-validation";

type Section="perfil"|"configuracion"|"seguridad"|"privacidad"|"compras";
const labels={
 es:{heading:"CENTRO DE CUENTA",intro:"Organiza tu experiencia como jugador. Las preferencias de esta vista son temporales; aún no existe una cuenta autenticada.",sections:["Mi perfil","Configuración","Seguridad","Privacidad","Mis compras"],alias:"Nombre público",aliasValue:"Visitante",avatar:"Avatar",pending:"Sin cuenta verificada",language:"Idioma de presentación",notifications:"Avisos de la plataforma (vista preliminar)",motion:"Reducir animaciones en esta vista",largeText:"Ampliar texto en esta vista",save:"Preferencias temporales: no se guardan en el servidor",password:"Cambio de contraseña",reset:"Recuperación de acceso",sessions:"Sesiones y dispositivos",disabled:"Disponible cuando se habiliten cuentas Liry ID verificadas. No introduzcas contraseñas aquí.",privacy:"Control de visibilidad",privacyInfo:"La visibilidad pública, los consentimientos y la gestión de datos se activarán con cuentas reales.",purchases:"Historial de compras e inventario",purchasesInfo:"Sin compras registradas ni pasarelas activas. No mostramos transacciones ficticias.",pendingAction:"Función pendiente de activación"},
 en:{heading:"ACCOUNT CENTER",intro:"Organize your player experience. Preferences on this screen are temporary; there is no authenticated account yet.",sections:["My profile","Settings","Security","Privacy","My purchases"],alias:"Public name",aliasValue:"Visitor",avatar:"Avatar",pending:"No verified account",language:"Display language",notifications:"Platform notifications (preview)",motion:"Reduce motion in this preview",largeText:"Larger text in this preview",save:"Temporary preferences: not saved to a server",password:"Change password",reset:"Recover access",sessions:"Sessions and devices",disabled:"Available when verified Liry ID accounts are enabled. Do not enter passwords here.",privacy:"Visibility controls",privacyInfo:"Public visibility, consent and data controls will be enabled with real accounts.",purchases:"Purchase history and inventory",purchasesInfo:"No recorded purchases or active payment gateways. No fictional transactions are shown.",pendingAction:"Feature not yet enabled"}
} as const;
const sections:readonly Section[]=["perfil","configuracion","seguridad","privacidad","compras"];

export function LiryPlayerAccountCenter({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=labels[locale];
 const [selected,setSelected]=useState<Section>("perfil");
 const [publicName,setPublicName]=useState("");
 const [nameError,setNameError]=useState("");
 const updatePublicName=(name:string)=>{setPublicName(name);const valid=name===""||isValidLiryDisplayName(name);setNameError(valid?"":locale==="es"?"Usa de 2 a 40 caracteres, sin espacios al inicio o final.":"Use 2 to 40 characters without leading or trailing spaces.");window.dispatchEvent(new CustomEvent("liry:display-name-preview",{detail:{name:valid?name:""}}))};
 const [notices,setNotices]=useState(false);
 const [reduceMotion,setReduceMotion]=useState(false);
 const [largeText,setLargeText]=useState(false);
 const [privateProfile,setPrivateProfile]=useState(true);
 const [avatarUrl,setAvatarUrl]=useState<string|null>(null);
 const [avatarError,setAvatarError]=useState("");
 const [avatarLoading,setAvatarLoading]=useState(false);
 const nameInput=useRef<HTMLInputElement>(null);
 const avatarInput=useRef<HTMLInputElement>(null);
 const avatarUrlRef=useRef<string|null>(null);
 const avatarRequestRef=useRef(0);
 useEffect(()=>()=>{avatarRequestRef.current++;if(avatarUrlRef.current)URL.revokeObjectURL(avatarUrlRef.current)},[]);
 const cancelAvatarSelection=()=>{avatarRequestRef.current++;setAvatarLoading(false);setAvatarError("");if(avatarInput.current)avatarInput.current.value=""};
 const removeAvatar=()=>{avatarRequestRef.current++;setAvatarLoading(false);if(avatarUrlRef.current)URL.revokeObjectURL(avatarUrlRef.current);avatarUrlRef.current=null;setAvatarUrl(null);window.dispatchEvent(new CustomEvent("liry:avatar-preview",{detail:{url:null}}));setAvatarError("");if(avatarInput.current)avatarInput.current.value=""};
 const chooseAvatar=async(file?:File)=>{
  if(!file)return;
  const request=++avatarRequestRef.current;
  setAvatarError("");
  setAvatarLoading(true);
  const validation=validateTemporaryGamerAvatar(file);
  if(!validation.ok){if(request!==avatarRequestRef.current)return;setAvatarLoading(false);setAvatarError(locale==="es"?"Selecciona JPG, PNG o WebP de hasta 2 MB.":"Choose JPG, PNG or WebP up to 2 MB.");if(avatarInput.current)avatarInput.current.value="";return}
  if(!await validateTemporaryGamerAvatarContent(file).catch(()=>false)){if(request===avatarRequestRef.current){setAvatarLoading(false);setAvatarError(locale==="es"?"El contenido del archivo no es una imagen válida.":"The file content is not a valid image.");if(avatarInput.current)avatarInput.current.value=""}return}
  if(request!==avatarRequestRef.current)return;
  const next=URL.createObjectURL(file);
  const image=new Image();
  image.onload=()=>{
   if(request!==avatarRequestRef.current){URL.revokeObjectURL(next);return}
   if(image.naturalWidth===0||image.naturalHeight===0){URL.revokeObjectURL(next);setAvatarLoading(false);setAvatarError(locale==="es"?"La imagen no es válida.":"Invalid image.");if(avatarInput.current)avatarInput.current.value="";return}
   if(avatarUrlRef.current)URL.revokeObjectURL(avatarUrlRef.current);
   avatarUrlRef.current=next;setAvatarLoading(false);setAvatarUrl(next);window.dispatchEvent(new CustomEvent("liry:avatar-preview",{detail:{url:next}}));setAvatarError("");if(avatarInput.current)avatarInput.current.value="";
  };
  image.onerror=()=>{URL.revokeObjectURL(next);if(request!==avatarRequestRef.current)return;setAvatarLoading(false);setAvatarError(locale==="es"?"No se pudo abrir la imagen.":"Could not open the image.");if(avatarInput.current)avatarInput.current.value=""};
  image.src=next;
 };
 const resetIdentityPreview=()=>{updatePublicName("");removeAvatar();nameInput.current?.focus()};
 const resetPreview=()=>{setNotices(false);setReduceMotion(false);setLargeText(false);setPrivateProfile(true)};
 const active=sections.indexOf(selected);
 return <section aria-labelledby="liry-account-center-heading" className={`${styles.accountCenter} ${reduceMotion?styles.accountReducedMotion:""} ${largeText?styles.accountLargeText:""}`}>
  <h2 id="liry-account-center-heading" className={styles.accountHeading}>{copy.heading}</h2>
  <p className={styles.accountIntro}>{copy.intro}</p><p className={styles.accountSummary} role="status">{locale==="es"?"Estado del perfil: nombre, avatar y preferencias disponibles como vista previa. Seguridad y compras requieren una cuenta verificada y permanecen desactivadas.":"Profile status: name, avatar, and preferences are available as previews. Security and purchases require a verified account and remain disabled."}</p>
  <div role="group" aria-label={copy.heading} className={styles.accountTabs}>
   {sections.map((section,i)=><button key={section} type="button" aria-pressed={selected===section} aria-controls="liry-account-active-panel" onClick={()=>setSelected(section)} onKeyDown={event=>{const keys=["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Home","End"];if(!keys.includes(event.key))return;event.preventDefault();const next=event.key==="Home"?0:event.key==="End"?sections.length-1:(i+(event.key==="ArrowRight"||event.key==="ArrowDown"?1:-1)+sections.length)%sections.length;setSelected(sections[next]);const buttons=event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button");buttons?.[next]?.focus();}} className={styles.accountTab}>{selected===section?(locale==="es"?`Viendo: ${copy.sections[i]}`:`Viewing: ${copy.sections[i]}`):copy.sections[i]}</button>)}
  </div>
  <div id="liry-account-active-panel" role="region" aria-label={copy.sections[active]} className={styles.accountPanel}>
   {selected==="perfil"&&<><h3>{copy.sections[0]}</h3><label className={styles.accountNameLabel}>{copy.alias}<input ref={nameInput} className={styles.accountNameInput} type="text" maxLength={40} value={publicName} onChange={e=>updatePublicName(e.target.value)} placeholder={copy.aliasValue} aria-invalid={Boolean(nameError)} aria-describedby="liry-name-note" autoComplete="off"/></label><p className={styles.accountIntro} aria-live="off">{locale==="es"?`Caracteres: ${publicName.length} de 40`:`Characters: ${publicName.length} of 40`}</p>{publicName!==""&&<button type="button" className={styles.accountReset} onClick={()=>{updatePublicName("");nameInput.current?.focus()}}>{locale==="es"?"Restablecer nombre":"Reset name"}</button>}<p id="liry-name-note" role={nameError?"alert":"status"} aria-live={nameError?"assertive":"polite"} className={styles.accountIntro}>{nameError|| (locale==="es"?"Nombre provisional. No se guarda en una cuenta.":"Temporary name. Not saved to an account.")}</p><div className={styles.accountAvatarArea} aria-busy={avatarLoading}>
    <div className={styles.accountAvatarPicture}>{avatarUrl?<img src={avatarUrl} alt={locale==="es"?"Vista previa de tu avatar":"Your avatar preview"}/>:<span aria-hidden="true">◇</span>}</div>
    <div><p>{copy.avatar}</p><input ref={avatarInput} className={styles.accountAvatarInput} type="file" accept="image/jpeg,image/png,image/webp" aria-label={locale==="es"?"Seleccionar fotografía o avatar":"Choose photo or avatar"} aria-describedby="liry-avatar-help liry-avatar-status" onChange={event=>chooseAvatar(event.currentTarget.files?.[0])}/>
    <p id="liry-avatar-help" className={styles.accountIntro}>{locale==="es"?"JPG, PNG o WebP · máximo 2 MB · vista previa temporal":"JPG, PNG or WebP · 2 MB max · temporary preview"}</p>
    {(avatarUrl||avatarLoading)&&<button type="button" className={styles.accountReset} onClick={avatarLoading?cancelAvatarSelection:removeAvatar}>{avatarLoading?(locale==="es"?"Cancelar carga de fotografía":"Cancel photo selection"):(locale==="es"?"Quitar fotografía":"Remove photo")}</button>}
    <p id="liry-avatar-status" role={avatarError?"alert":"status"} aria-live={avatarError?"assertive":"polite"} className={styles.accountIntro}>{avatarLoading?(locale==="es"?"Comprobando imagen…":"Checking image…"):avatarError|| (avatarUrl?(locale==="es"?"Fotografía cargada solo para esta vista previa.":"Photo loaded for this preview only."):(locale==="es"?"No has seleccionado una fotografía.":"No photo selected."))}</p></div>
   </div><button type="button" className={styles.accountReset} onClick={resetIdentityPreview} disabled={!publicName&&!avatarUrl&&!avatarError&&!avatarLoading}>{locale==="es"?"Restablecer nombre y fotografía":"Reset name and photo"}</button><small>{copy.pending}</small></>}
   {selected==="configuracion"&&<><h3>{copy.sections[1]}</h3><p>{copy.language}: <strong>{locale.toUpperCase()}</strong></p><p className={styles.accountIntro}>{locale==="es"?"El idioma se cambia desde el selector ES/EN de la plataforma. Los ajustes de avisos, movimiento y lectura solo afectan esta vista previa; no modifican preferencias de una cuenta.":"Change language using the platform ES/EN selector. Notices, motion, and reading adjustments only affect this preview; they do not update any account preferences."}</p><label className={styles.accountToggle}><input type="checkbox" checked={notices} onChange={e=>setNotices(e.target.checked)}/>{copy.notifications}</label><p className={styles.accountIntro}>{locale==="es"?"La selección de avisos es únicamente una preferencia visual. No se enviarán correos ni notificaciones desde esta vista.":"Notices are only a visual preference here. This preview does not send emails or notifications."}</p><label className={styles.accountToggle}><input type="checkbox" checked={reduceMotion} onChange={e=>setReduceMotion(e.target.checked)}/>{copy.motion}</label><label className={styles.accountToggle}><input type="checkbox" checked={largeText} onChange={e=>setLargeText(e.target.checked)}/>{copy.largeText}</label><p aria-live="polite" className={styles.accountSummary}>{locale==="es"?`Avisos: ${notices?"seleccionados":"no seleccionados"} · Animaciones: ${reduceMotion?"reducidas":"normales"} · Texto: ${largeText?"ampliado":"normal"}`:`Notices: ${notices?"selected":"not selected"} · Motion: ${reduceMotion?"reduced":"normal"} · Text: ${largeText?"larger":"normal"}`}</p><small>{copy.save}</small></>}
   {selected==="seguridad"&&<><h3>{copy.sections[2]}</h3><p>{copy.password} · {copy.reset} · {copy.sessions}</p><p>{copy.disabled}</p><p role="status" className={styles.accountSummary}>{locale==="es"?"Estado de seguridad: acceso de jugador no habilitado. Sin sesión iniciada, no se pueden cambiar contraseñas, cerrar sesiones ni recuperar cuentas desde esta vista.":"Security status: player sign-in is not enabled. Without a signed-in session, passwords, sessions, and account recovery cannot be managed from this preview."}</p><ul style={{paddingLeft:22,lineHeight:1.8}}>{(locale==="es"?LIRY_ACCOUNT_SECURITY_CHECKLIST:["Independent Liry ID authentication","Email verification","Sign-in safeguards and attempt limits","Time-limited password recovery links","Password change with verified session","Server-side session revocation","Security audit trail and personal data protection"]).map(item=><li key={item}>{item}</li>)}</ul><small aria-live="polite">{LIRY_PLAYER_AUTH_RELEASE.enabled?copy.pendingAction:copy.disabled}</small></>}
   {selected==="privacidad"&&<><h3>{copy.privacy}</h3><p>{copy.privacyInfo}</p><p className={styles.accountIntro}>{locale==="es"?"La visibilidad elegida solo modifica esta vista previa. No publica tu nombre, avatar ni actividad y se restablece al cerrar Mi Liry.":"The selected visibility only affects this preview. It does not publish your name, avatar, or activity and resets when you leave Mi Liry."}</p><label className={styles.accountToggle}><input type="checkbox" checked={privateProfile} onChange={e=>setPrivateProfile(e.target.checked)}/>{locale==="es"?"Mantener el perfil privado (vista preliminar)":"Keep profile private (preview)"}</label><p className={styles.accountSummary} aria-live="polite">{locale==="es"?(privateProfile?"Preferencia temporal: perfil privado":"Preferencia temporal: perfil visible"):(privateProfile?"Temporary preference: private profile":"Temporary preference: visible profile")}</p><small>{copy.save}</small></>}
   {selected==="compras"&&<><h3>{copy.purchases}</h3><p>{copy.purchasesInfo}</p><p role="status" className={styles.accountSummary}>{locale==="es"?"Sin historial de compras: todavía no existe una cuenta de jugador verificada.":"No purchase history: a verified player account is not available yet."}</p><p className={styles.accountIntro}>{locale==="es"?"Las compras, los recibos y los artículos digitales solo se mostrarán cuando estén habilitados con datos reales. Esta pantalla no procesa pagos.":"Purchases, receipts, and digital items will appear only when enabled with real data. This screen does not process payments."}</p></>}
   {(selected==="configuracion"||selected==="privacidad")&&<button type="button" className={styles.accountReset} onClick={resetPreview} disabled={!notices&&!reduceMotion&&!largeText&&privateProfile}>{locale==="es"?"Restablecer preferencias temporales":"Reset temporary preferences"}</button>}
  </div>
 </section>;
}
