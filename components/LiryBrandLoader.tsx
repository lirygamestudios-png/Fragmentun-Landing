"use client";
import styles from "./LiryBrandLoader.module.css";

type Props={mode?:"page"|"section"|"inline";label?:string};
export function LiryBrandLoader({mode="section",label="Cargando…"}:Props){
 return <div className={styles.loader} data-mode={mode} role="status" aria-live="polite" aria-label={label}>
  <img src="/lirygames-brand-icon.svg" alt="" width={52} height={52} className={styles.emblem}/>
  <span className={styles.label}>{label}</span>
 </div>;
}
