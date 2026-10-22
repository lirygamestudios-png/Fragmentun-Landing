"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
export function LiryDeveloperReleasePreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerRelease;
 const checkpoints=copy.checkpoints;
 const [selected,setSelected]=useState(0);
 const stageHeading=useRef<HTMLHeadingElement>(null);
 const changeStage=(next:number)=>{setSelected(next);requestAnimationFrame(()=>stageHeading.current?.focus({preventScroll:true}));};
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="liry-release-title">
  <h2 id="liry-release-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <div className={styles.developerWizardCompact} role="group" aria-label={copy.legend}>
   <div className={styles.developerWizardTopline}><span>{locale==="es"?"ETAPA":"STAGE"} {selected+1} / {checkpoints.length}</span><span>{locale==="es"?"Solo demostración":"Preview only"}</span></div>
   <progress value={selected+1} max={checkpoints.length} aria-label={copy.legend}/>
  </div>
  <div className={styles.developerWizardStage} role="region" aria-labelledby="liry-release-stage-heading">
   <h3 ref={stageHeading} tabIndex={-1} id="liry-release-stage-heading">{checkpoints[selected].name}</h3>
   <p>{checkpoints[selected].detail}</p>
  </div>
  <nav className={styles.developerWizardActions} aria-label={copy.legend}>
   <button type="button" disabled={selected===0} onClick={()=>changeStage(Math.max(0,selected-1))}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button>
   <span className={styles.developerWizardStepCount}>{selected+1} / {checkpoints.length}</span>
   <button type="button" disabled={selected===checkpoints.length-1} onClick={()=>changeStage(Math.min(checkpoints.length-1,selected+1))}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button>
  </nav>
  <p className={styles.accountIntro}>{locale==="es"?"Esta selección solo muestra una etapa del proceso. No modifica el estado de ningún videojuego, no aprueba su publicación y no ejecuta verificaciones de IP, seguridad o clasificación.":"This selection only previews a workflow stage. It does not change any game status, approve publication, or perform IP, security or age-rating checks."}</p>
  <p className={styles.accountIntro} role="note">{locale==="es"?"REQUISITOS PREVIOS A PUBLICAR: revisión de derechos de propiedad intelectual, comprobaciones de seguridad, verificación de clasificación de edad y aprobación expresa de LIRYGAMES. Seleccionar una etapa aquí no cumple esos requisitos ni autoriza el lanzamiento.":"REQUIREMENTS BEFORE PUBLICATION: intellectual-property rights review, security checks, age-rating verification and explicit LIRYGAMES approval. Selecting a stage here does not complete these requirements or authorize release."}</p>
  <p>{copy.security}</p>
  <p>{copy.inactive}</p>
 </section>;
}
