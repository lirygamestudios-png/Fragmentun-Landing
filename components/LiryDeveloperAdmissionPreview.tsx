"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
type Model="premium"|"freemium";
export function LiryDeveloperAdmissionPreview(){
 const [model,setModel]=useState<Model|null>(null);
 const [rights,setRights]=useState(false);
 const [executable,setExecutable]=useState(false);
 const [disclosure,setDisclosure]=useState(false);
 const [content,setContent]=useState(false);
 const [review,setReview]=useState(false);
 const ready=model!==null&&rights&&executable&&disclosure&&content&&review;
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="admission-preview-title">
  <h2 id="admission-preview-title">SOLICITUD DE PUBLICACIÓN · VISTA PREVIA</h2>
  <p>Este cuestionario demuestra el primer filtro de admisión. No se envían ni almacenan datos.</p>
  <fieldset><legend>1. Selecciona el modelo comercial obligatorio</legend>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="premium"} onChange={()=>setModel("premium")}/> Premium · el jugador compra el videojuego</label>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="freemium"} onChange={()=>setModel("freemium")}/> Freemium · acceso gratuito con compras opcionales</label>
  </fieldset>
  <fieldset><legend>2. Confirma los requisitos iniciales</legend>
   <label><input type="checkbox" checked={rights} onChange={event=>setRights(event.target.checked)}/> Soy titular de los derechos comerciales o tengo licencia suficiente</label>
   <label><input type="checkbox" checked={executable} onChange={event=>setExecutable(event.target.checked)}/> Dispongo de un videojuego ejecutable, terminado o cercano a su versión final</label>
   <label><input type="checkbox" checked={disclosure} onChange={event=>setDisclosure(event.target.checked)}/> Puedo declarar contenido generado con IA y licencias de materiales de terceros, cuando corresponda</label>
   <label><input type="checkbox" checked={content} onChange={event=>setContent(event.target.checked)}/> Puedo declarar clasificación por edad, contenido y compras integradas</label>
   <label><input type="checkbox" checked={review} onChange={event=>setReview(event.target.checked)}/> Acepto que LIRYGAMES revisará y deberá aprobar la publicación</label>
  </fieldset>
  <p role="status" aria-live="polite">{ready?"Lista preliminar completa. La admisión real requiere documentación, verificación y aprobación humana.":"Completa los requisitos para conocer si puedes solicitar una revisión cuando se abra el programa."}</p>
  <button type="button" className={styles.previewReset} onClick={()=>{setModel(null);setRights(false);setExecutable(false);setDisclosure(false);setContent(false);setReview(false)}}>RESTABLECER VISTA PREVIA</button>
  <p>PROGRAMA INACTIVO · No hay botón de envío, carga de juegos, registro ni cobros.</p>
 </section>;
}
