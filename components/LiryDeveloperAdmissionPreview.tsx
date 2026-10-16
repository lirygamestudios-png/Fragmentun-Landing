"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").developerAdmission;
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
  <button type="button" className={styles.previewReset} onClick={()=>{setModel(null);setRights(false);setExecutable(false);setDisclosure(false);setContent(false);setReview(false)}}>{copy.reset}</button>
  <p>{copy.inactive}</p>
 </section>;
}
