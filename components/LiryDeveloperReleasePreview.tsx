"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
const checkpoints=[
 {name:"Admisión del desarrollador",detail:"Identidad, derechos y modalidad Premium/Freemium verificados."},
 {name:"Carga privada",detail:"El futuro archivo se recibirá en almacenamiento aislado, nunca en el catálogo público."},
 {name:"Controles técnicos",detail:"Comprobación de tipo, tamaño, integridad y análisis de seguridad de cada versión."},
 {name:"Revisión LIRYGAMES",detail:"Un responsable autoriza exactamente la versión y la ficha aprobadas."},
 {name:"Publicación",detail:"Solo una versión autorizada podrá mostrarse y comercializarse."}
] as const;
export function LiryDeveloperReleasePreview(){
 const [selected,setSelected]=useState(0);
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="liry-release-title">
  <h2 id="liry-release-title">CARGA PRIVADA Y REVISIÓN · VISTA PREVIA</h2>
  <p>Conoce el recorrido de una versión antes de publicarse. Esta demostración no acepta archivos ni cambia estados reales.</p>
  <fieldset><legend>Etapas de publicación</legend>
   {checkpoints.map((step,index)=><label key={step.name}><input type="radio" name="developer-release-step-preview" checked={selected===index} onChange={()=>setSelected(index)}/>{index+1}. {step.name}</label>)}
  </fieldset>
  <div role="status" aria-live="polite"><strong>{checkpoints[selected].name}</strong><p>{checkpoints[selected].detail}</p></div>
  <p>SEGURIDAD: el desarrollador puede preparar la versión, pero no aprobar su publicación. Las actualizaciones también requieren verificación.</p>
  <p>PROGRAMA INACTIVO · Sin cargas, escaneo, publicación ni conexión a cuentas reales.</p>
 </section>;
}
