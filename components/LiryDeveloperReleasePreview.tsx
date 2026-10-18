"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
export function LiryDeveloperReleasePreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerRelease;
 const checkpoints=copy.checkpoints;
 const [selected,setSelected]=useState(0);
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="liry-release-title">
  <h2 id="liry-release-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <fieldset><legend>{copy.legend}</legend>
   {checkpoints.map((step,index)=><label key={step.id}><input type="radio" name="developer-release-step-preview" checked={selected===index} onChange={()=>setSelected(index)}/>{index+1}. {step.name}</label>)}
  </fieldset>
  <div role="status" aria-live="polite"><strong>{checkpoints[selected].name}</strong><p>{checkpoints[selected].detail}</p></div>
  <p className={styles.accountIntro}>{locale==="es"?"Esta selección solo muestra una etapa del proceso. No modifica el estado de ningún videojuego, no aprueba su publicación y no ejecuta verificaciones de IP, seguridad o clasificación.":"This selection only previews a workflow stage. It does not change any game status, approve publication, or perform IP, security or age-rating checks."}</p>
  <p>{copy.security}</p>
  <p>{copy.inactive}</p>
 </section>;
}
