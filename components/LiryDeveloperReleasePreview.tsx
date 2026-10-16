"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const copy=liryFrontdeskStrings("es").developerRelease;
const checkpoints=copy.checkpoints;
export function LiryDeveloperReleasePreview(){
 const [selected,setSelected]=useState(0);
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="liry-release-title">
  <h2 id="liry-release-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <fieldset><legend>{copy.legend}</legend>
   {checkpoints.map((step,index)=><label key={step.id}><input type="radio" name="developer-release-step-preview" checked={selected===index} onChange={()=>setSelected(index)}/>{index+1}. {step.name}</label>)}
  </fieldset>
  <div role="status" aria-live="polite"><strong>{checkpoints[selected].name}</strong><p>{checkpoints[selected].detail}</p></div>
  <p>{copy.security}</p>
  <p>{copy.inactive}</p>
 </section>;
}
