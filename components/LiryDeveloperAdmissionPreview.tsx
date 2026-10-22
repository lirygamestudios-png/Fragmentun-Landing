"use client";
import {useRef,useState} from "react";
import {LiryDeveloperIdentityPreview} from "./LiryDeveloperIdentityPreview";
import {developerProgressNotice} from "../lib/games/liry-developer-progress-notice";
import {assessDeveloperWorkflow} from "../lib/games/liry-developer-workflow-assessment";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
type Model="premium"|"freemium";
export function LiryDeveloperAdmissionPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerAdmission;
 const [model,setModel]=useState<Model|null>(null);
 const [activeStep,setActiveStep]=useState(0);
 const stepHeading=useRef<HTMLHeadingElement>(null);
 const navigateStep=(next:number)=>{setActiveStep(next);requestAnimationFrame(()=>stepHeading.current?.focus({preventScroll:true}));};
 const [rights,setRights]=useState(false);
 const [executable,setExecutable]=useState(false);
 const [disclosure,setDisclosure]=useState(false);
 const [content,setContent]=useState(false);
 const [review,setReview]=useState(false);
 const confirmed=[rights,executable,disclosure,content,review].filter(Boolean).length;
 const ready=model!==null&&confirmed===5;
 const canReset=model!==null||confirmed>0;
 const steps=[
  {title:locale==="es"?"Modelo comercial":"Business model",done:model!==null,enabled:true},
  {title:locale==="es"?"Declaraciones obligatorias":"Required declarations",done:ready,enabled:model!==null},
  {title:locale==="es"?"Verificación de identidad":"Identity verification",done:false,enabled:ready},
  {title:locale==="es"?"Revisión documental y de derechos":"Document and IP review",done:false,enabled:false},
  {title:locale==="es"?"Validación bancaria para pagos":"Bank payout verification",done:false,enabled:false},
  {title:locale==="es"?"Aprobación LIRYGAMES":"LIRYGAMES approval",done:false,enabled:false}
 ];
 const completed=steps.filter(step=>step.done).length;
 const nextAllowed=activeStep===0?model!==null:activeStep===1?ready:false;
 // No dossier is saved or submitted: the safe initial state is always pending.
 const dossierNotice=developerProgressNotice("not_submitted","pending",locale);
 const workflowPreview=assessDeveloperWorkflow({documentStatus:"not_submitted",reminderStatus:"pending",expiresAt:null,now:"2026-10-21T00:00:00Z",warningDays:null,legalHold:false,lastReminderAt:null,reminderCount:0});
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="admission-preview-title">
  <h2 id="admission-preview-title" className={styles.developerWizardTitle}>{copy.title}</h2>
  <div className={styles.developerWizardCompact} role="group" aria-label={locale==="es"?"Progreso de solicitud":"Application progress"}>
   <div className={styles.developerWizardTopline}>
    <span>{locale==="es"?"PASO":"STEP"} {activeStep+1} / 6</span>
    <span role="status" aria-live="polite">{locale==="es"?"Preparación: "+completed+" de 6 etapas completadas":"Preparation: "+completed+" of 6 steps completed"}</span>
   </div>
   <progress value={completed} max={6} aria-label={locale==="es"?"Etapas completadas":"Completed steps"} />
   <ol className={styles.developerWizardDots} aria-label={locale==="es"?"Seis etapas":"Six stages"}>
    {steps.map((step,index)=><li key={step.title} title={step.title} aria-current={index===activeStep?"step":undefined} aria-label={step.title} className={index===activeStep?styles.developerWizardDotActive:step.done?styles.developerWizardDotDone:styles.developerWizardDotLocked}><span aria-hidden="true">{step.done?"✓":index+1}</span></li>)}
   </ol>
  </div>
  <div className={styles.developerWizardStage} aria-labelledby="liry-developer-wizard-step-title">
   <h3 ref={stepHeading} tabIndex={-1} id="liry-developer-wizard-step-title">{steps[activeStep].title}</h3>
  {activeStep===0&&<fieldset><legend>{copy.modelLegend}</legend>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="premium"} onChange={()=>setModel("premium")}/> {copy.models[0]}</label>
   <label><input type="radio" name="liry-developer-model-preview" checked={model==="freemium"} onChange={()=>setModel("freemium")}/> {copy.models[1]}</label>
  </fieldset>}
  {activeStep===1&&<fieldset disabled={model===null}><legend>{copy.requirementsLegend}</legend>
   <label><input type="checkbox" checked={rights} onChange={event=>setRights(event.target.checked)}/> {copy.requirements[0]}</label>
   <label><input type="checkbox" checked={executable} onChange={event=>setExecutable(event.target.checked)}/> {copy.requirements[1]}</label>
   <label><input type="checkbox" checked={disclosure} onChange={event=>setDisclosure(event.target.checked)}/> {copy.requirements[2]}</label>
   <label><input type="checkbox" checked={content} onChange={event=>setContent(event.target.checked)}/> {copy.requirements[3]}</label>
   <label><input type="checkbox" checked={review} onChange={event=>setReview(event.target.checked)}/> {copy.requirements[4]}</label>
  </fieldset>}
  {activeStep===1&&<p role="status" aria-live="polite">{ready?copy.ready:copy.pending}</p>}
  {activeStep===1&&<p className={styles.accountIntro} aria-live="polite">{locale==="es"?`Requisitos declarados: ${confirmed} de 5. ${model===null?"Selecciona el modelo comercial.":"Modelo comercial seleccionado."} Las declaraciones no verifican identidad ni propiedad intelectual.`:`Declared requirements: ${confirmed} of 5. ${model===null?"Choose a business model.":"Business model selected."} These declarations do not verify identity or intellectual property ownership.`}</p>}
  {activeStep===1&&<button type="button" className={styles.previewReset} disabled={!canReset} onClick={()=>{setActiveStep(0);setModel(null);setRights(false);setExecutable(false);setDisclosure(false);setContent(false);setReview(false)}}>{copy.reset}</button>}
  {activeStep===1&&!ready&&<p className={styles.accountIntro}>{locale==="es"?`Pendiente: ${model===null?"seleccionar modalidad comercial; ":""}${5-confirmed} declaraciones por confirmar.`:`Pending: ${model===null?"choose a commercial model; ":""}${5-confirmed} declarations to confirm.`}</p>}
  {activeStep===1&&<p className={styles.accountIntro} role="note">{locale==="es"?"Estas declaraciones son únicamente una preparación de la solicitud. La admisión y la publicación requieren revisión de derechos de propiedad intelectual, seguridad, clasificación de edad y aprobación expresa de LIRYGAMES. No se envía ninguna solicitud real.":"These declarations only prepare a preliminary application. Admission and publication require intellectual-property, security and age-rating reviews, plus explicit LIRYGAMES approval. No actual application is submitted."}</p>}
  {activeStep===2&&(ready?<LiryDeveloperIdentityPreview locale={locale} />:<p className={styles.accountIntro} role="note">{locale==="es"?"La información sobre identidad se desbloqueará tras completar las declaraciones. No existe verificación biométrica activa.":"Identity guidance unlocks after completing the declarations. No biometric verification is active."}</p>)}
  {activeStep>=3&&<p className={styles.accountIntro} role="note">{activeStep===3?(locale==="es"?"La revisión documental y de derechos requiere personal autorizado.":"Document and rights review requires authorized staff."):activeStep===4?(locale==="es"?"La validación de cuenta bancaria requiere el estado de cuenta más reciente y revisión segura.":"Bank validation requires the most recent bank statement and secure review."):(locale==="es"?"La aprobación final corresponde exclusivamente a LIRYGAMES.":"Final approval belongs exclusively to LIRYGAMES.")}</p>}
  </div>
  <div className={styles.developerWizardActions}>
   <button type="button" className={styles.previewReset} disabled={activeStep===0} onClick={()=>navigateStep(Math.max(0,activeStep-1))}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button>
   <button type="button" className={styles.previewReset} disabled={!nextAllowed} onClick={()=>navigateStep(Math.min(2,activeStep+1))}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button>
  </div>
  <small className={styles.developerWizardFootnote}>{locale==="es"?"Vista previa: documentación pendiente; sin solicitud registrada, avisos enviados ni verificación biométrica activa.":"Preview only: documentation pending; no registered application, sent notices, or live biometric verification."} {copy.inactive}</small>
 </section>;
}
