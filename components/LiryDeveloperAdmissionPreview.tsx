"use client";
import {useState} from "react";
import {LiryDeveloperIdentityPreview} from "./LiryDeveloperIdentityPreview";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
type Model="premium"|"freemium";
export function LiryDeveloperAdmissionPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerAdmission;
 const [model,setModel]=useState<Model|null>(null);
 const [rights,setRights]=useState(false);
 const [executable,setExecutable]=useState(false);
 const [disclosure,setDisclosure]=useState(false);
 const [content,setContent]=useState(false);
 const [review,setReview]=useState(false);
 const confirmed=[rights,executable,disclosure,content,review].filter(Boolean).length;
 const ready=model!==null&&confirmed===5;
 const canReset=model!==null||confirmed>0;
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="admission-preview-title">
  <h2 id="admission-preview-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <fieldset><legend>{copy.modelLegend}</legend>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="premium"} onChange={()=>setModel("premium")}/> {copy.models[0]}</label>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="freemium"} onChange={()=>setModel("freemium")}/> {copy.models[1]}</label>
  </fieldset>
  <fieldset><legend>{copy.requirementsLegend}</legend>
   <label><input type="checkbox" checked={rights} onChange={event=>setRights(event.target.checked)}/> {copy.requirements[0]}</label>
   <label><input type="checkbox" checked={executable} onChange={event=>setExecutable(event.target.checked)}/> {copy.requirements[1]}</label>
   <label><input type="checkbox" checked={disclosure} onChange={event=>setDisclosure(event.target.checked)}/> {copy.requirements[2]}</label>
   <label><input type="checkbox" checked={content} onChange={event=>setContent(event.target.checked)}/> {copy.requirements[3]}</label>
   <label><input type="checkbox" checked={review} onChange={event=>setReview(event.target.checked)}/> {copy.requirements[4]}</label>
  </fieldset>
  <p role="status" aria-live="polite">{ready?copy.ready:copy.pending}</p>
  <p className={styles.accountIntro} aria-live="polite">{locale==="es"?`Requisitos declarados: ${confirmed} de 5. ${model===null?"Selecciona el modelo comercial.":"Modelo comercial seleccionado."} Las declaraciones no verifican identidad ni propiedad intelectual.`:`Declared requirements: ${confirmed} of 5. ${model===null?"Choose a business model.":"Business model selected."} These declarations do not verify identity or intellectual property ownership.`}</p>
  <button type="button" className={styles.previewReset} disabled={!canReset} onClick={()=>{setModel(null);setRights(false);setExecutable(false);setDisclosure(false);setContent(false);setReview(false)}}>{copy.reset}</button>
  {!ready&&<p className={styles.accountIntro}>{locale==="es"?`Pendiente: ${model===null?"seleccionar modalidad comercial; ":""}${5-confirmed} declaraciones por confirmar.`:`Pending: ${model===null?"choose a commercial model; ":""}${5-confirmed} declarations to confirm.`}</p>}
  <p className={styles.accountIntro} role="note">{locale==="es"?"Estas declaraciones son únicamente una preparación de la solicitud. La admisión y la publicación requieren revisión de derechos de propiedad intelectual, seguridad, clasificación de edad y aprobación expresa de LIRYGAMES. No se envía ninguna solicitud real.":"These declarations only prepare a preliminary application. Admission and publication require intellectual-property, security and age-rating reviews, plus explicit LIRYGAMES approval. No actual application is submitted."}</p>
  <LiryDeveloperIdentityPreview locale={locale} />
  <p>{copy.inactive}</p>
 </section>;
}
