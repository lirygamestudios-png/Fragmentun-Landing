"use client";
import {useState} from "react";
import {LIRY_AVATAR_OPTIONS,LIRY_INTERFACE_THEMES,type LiryAvatarOption,type LiryInterfaceTheme} from "../lib/games/liry-gamer-profile-preferences";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

export function MiLiryIdentityPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).miLiryIdentity;
 const [avatar,setAvatar]=useState<LiryAvatarOption>("orb");
 const [theme,setTheme]=useState<LiryInterfaceTheme>("navy");
 const [notifications,setNotifications]=useState(false);
 const canReset=avatar!=="orb"||theme!=="navy"||notifications;
 return <section className={styles.identityPreview} aria-label={copy.previewAria}>
  <h3>{copy.previewTitle}</h3>
  <p>{copy.previewIntro}</p>
  <div className={styles.previewAvatar} data-accent={theme} aria-label={copy.exampleAvatarAria}>{avatar==="orb"?"◇":avatar==="shield"?"⬡":"✦"}</div>
  <p className={styles.previewLabel} id="liry-preview-avatar-label">{copy.avatar}</p>
  <div className={styles.previewChoices} role="group" aria-labelledby="liry-preview-avatar-label">{LIRY_AVATAR_OPTIONS.map(item=><button key={item} type="button" aria-pressed={avatar===item} onClick={()=>setAvatar(item)}>{item==="orb"?copy.avatars[0]:item==="shield"?copy.avatars[1]:copy.avatars[2]}</button>)}</div>
  <p className={styles.previewLabel} id="liry-preview-theme-label">{copy.visualAccent}</p>
  <div className={styles.previewChoices} role="group" aria-labelledby="liry-preview-theme-label">{LIRY_INTERFACE_THEMES.map(item=><button key={item} type="button" aria-pressed={theme===item} onClick={()=>setTheme(item)}>{item==="navy"?copy.themes[0]:item==="cyan"?copy.themes[1]:copy.themes[2]}</button>)}</div>
  <label className={styles.previewOption}><input type="checkbox" checked={notifications} onChange={e=>setNotifications(e.target.checked)}/> {copy.notifications}</label>
  <button type="button" className={styles.previewReset} disabled={!canReset} onClick={()=>{setAvatar("orb");setTheme("navy");setNotifications(false);}}>{copy.reset}</button>
  <p className={styles.previewNote}>{copy.previewNote}</p>
  <p className={styles.previewNote} role="status" aria-live="polite" aria-atomic="true">{copy.styleOnly}: {theme.toUpperCase()}.</p>
 </section>;
}
