"use client";
import {useState} from "react";
import {LIRY_AVATAR_OPTIONS,LIRY_INTERFACE_THEMES,type LiryAvatarOption,type LiryInterfaceTheme} from "../lib/games/liry-gamer-profile-preferences";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
export function MiLiryIdentityPreview(){
 const [avatar,setAvatar]=useState<LiryAvatarOption>("orb");
 const [theme,setTheme]=useState<LiryInterfaceTheme>("navy");
 const [notifications,setNotifications]=useState(false);
 return <section className={styles.identityPreview} aria-label="Simulador local de preferencias, sin almacenamiento">
  <h3>PREVISUALIZAR MI ESTILO</h3>
  <p>Explora opciones visuales sin crear una cuenta ni guardar información.</p>
  <div className={styles.previewAvatar} aria-label="Avatar de ejemplo">{avatar==="orb"?"◇":avatar==="shield"?"⬡":"✦"}</div>
  <p className={styles.previewLabel}>AVATAR</p>
  <div className={styles.previewChoices}>{LIRY_AVATAR_OPTIONS.map(item=><button key={item} type="button" aria-pressed={avatar===item} onClick={()=>setAvatar(item)}>{item==="orb"?"ORBE":item==="shield"?"ESCUDO":"ESTRELLA"}</button>)}</div>
  <p className={styles.previewLabel}>ACENTO VISUAL</p>
  <div className={styles.previewChoices}>{LIRY_INTERFACE_THEMES.map(item=><button key={item} type="button" aria-pressed={theme===item} onClick={()=>setTheme(item)}>{item==="navy"?"NAVY":item==="cyan"?"CIAN":"VIOLETA"}</button>)}</div>
  <label className={styles.previewOption}><input type="checkbox" checked={notifications} onChange={e=>setNotifications(e.target.checked)}/> Vista previa de preferencia de notificaciones</label>
  <p className={styles.previewNote}>Estilo elegido solo en esta ventana: {theme.toUpperCase()}. Ningún ajuste se guarda ni activa notificaciones.</p>
 </section>;
}
