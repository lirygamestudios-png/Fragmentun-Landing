"use client";
import {useRef,useState} from "react";
import {LIRY_AVATAR_OPTIONS,LIRY_INTERFACE_THEMES,type LiryAvatarOption,type LiryInterfaceTheme} from "../lib/games/liry-gamer-profile-preferences";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

export function MiLiryIdentityPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).miLiryIdentity;
 const [stage,setStage]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const navigate=(next:number)=>{setStage(next);requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));};
 const [avatar,setAvatar]=useState<LiryAvatarOption>("orb");
 const [theme,setTheme]=useState<LiryInterfaceTheme>("navy");
 const [notifications,setNotifications]=useState(false);
 const canReset=avatar!=="orb"||theme!=="navy"||notifications;
 return <section className={styles.identityPreview} aria-label={copy.previewAria}>
  <h3>{copy.previewTitle}</h3>
  <div className={styles.developerWizardCompact}><div className={styles.developerWizardTopline}><span>{locale==="es"?"PASO":"STEP"} {stage+1} / 3</span><span>{locale==="es"?"Preferencias temporales":"Temporary preferences"}</span></div><progress value={stage+1} max={3} aria-label={locale==="es"?"Pasos de preferencias":"Preference steps"}/></div>
  <div className={styles.developerWizardStage}><h4 ref={heading} tabIndex={-1}>{(locale==="es"?["Avatar","Apariencia","Avisos"]:["Avatar","Appearance","Notices"])[stage]}</h4>
  {stage===0&&<><p>{copy.previewIntro}</p>
  <div className={styles.previewAvatar} data-accent={theme} aria-label={copy.exampleAvatarAria}>{avatar==="orb"?"◇":avatar==="shield"?"⬡":"✦"}</div>
  <p className={styles.previewLabel} id="liry-preview-avatar-label">{copy.avatar}</p>
  <div className={styles.previewChoices} role="group" aria-labelledby="liry-preview-avatar-label">{LIRY_AVATAR_OPTIONS.map(item=><button key={item} type="button" aria-pressed={avatar===item} onClick={()=>setAvatar(item)}>{item==="orb"?copy.avatars[0]:item==="shield"?copy.avatars[1]:copy.avatars[2]}</button>)}</div>
  </>}
  {stage===1&&<><p className={styles.previewLabel} id="liry-preview-theme-label">{copy.visualAccent}</p>
  <div className={styles.previewChoices} role="group" aria-labelledby="liry-preview-theme-label">{LIRY_INTERFACE_THEMES.map(item=><button key={item} type="button" aria-pressed={theme===item} onClick={()=>setTheme(item)}>{item==="navy"?copy.themes[0]:item==="cyan"?copy.themes[1]:copy.themes[2]}</button>)}</div>
  </>}
  {stage===2&&<label className={styles.previewOption}><input type="checkbox" checked={notifications} onChange={e=>setNotifications(e.target.checked)}/> {copy.notifications}</label>}
  </div>
  <nav className={styles.developerWizardActions} aria-label={locale==="es"?"Navegación de preferencias":"Preference navigation"}><button type="button" disabled={stage===0} onClick={()=>navigate(Math.max(0,stage-1))}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button><span className={styles.developerWizardStepCount}>{stage+1} / 3</span><button type="button" disabled={stage===2} onClick={()=>navigate(Math.min(2,stage+1))}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button></nav>
  <button type="button" className={styles.previewReset} disabled={!canReset} onClick={()=>{setAvatar("orb");setTheme("navy");setNotifications(false);}}>{copy.reset}</button>
  <p className={styles.previewNote}>{copy.previewNote}</p>
  <p className={styles.previewNote} role="status" aria-live="polite" aria-atomic="true">{copy.styleOnly}: {theme.toUpperCase()}.</p>
 </section>;
}
