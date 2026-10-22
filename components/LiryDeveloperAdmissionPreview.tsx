"use client";
import {useState} from "react";
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
  <h2 id="admission-preview-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <div role="group" aria-label={locale==="es"?"Progreso de solicitud":"Application progress"} style={{border:"1px solid #286e98",borderRadius:12,background:"#061429",padding:16,margin:"16px 0"}}>
   <p role="status" aria-live="polite">{locale==="es"?"Preparación: "+completed+" de 6 etapas completadas":"Preparation: "+completed+" of 6 steps completed"}</p>
   <progress value={completed} max={6} aria-label={locale==="es"?"Etapas completadas":"Completed steps"} style={{width:"100%",accentColor:"#50cbf5"}} />
   <ol style={{listStyle:"none",padding:0,display:"grid",gridTemplateColumns:"repeat(3,minmax(0,1fr))",gap:6}}>
    {steps.map((step,index)=><li key={step.title} aria-current={step.enabled&&!step.done?"step":undefined} style={{display:"flex",alignItems:"center",gap:6,padding:"8px",fontSize:12,minWidth:0,borderRadius:8,border:"1px solid #286e98",background:step.done?"#0b2b42":"#08182c",color:step.enabled?"#eaf9ff":"#9caec3"}}>
     <span aria-hidden="true" style={{width:24,textAlign:"center",color:step.done?"#79e3c8":"#67cfff"}}>{step.done?"✓":step.enabled?String(index+1):"🔒"}</span>
     <span style={{flex:1}}>{step.title}</span>
     <small>{step.done?(locale==="es"?"Completado":"Completed"):step.enabled?(locale==="es"?"Disponible":"Available"):(locale==="es"?"Bloqueado":"Locked")}</small>
    </li>)}
   </ol>
   <small>{locale==="es"?"La verificación bancaria exigirá el estado de cuenta más reciente y cotejo del titular por un canal seguro. No se pueden subir documentos aquí.":"Bank verification will require a recent statement and beneficiary matching via a secure channel. Do not upload documents here."}</small>
   <div className={styles.accountIntro} role="group" aria-label={locale==="es"?"Estado documental informativo":"Informational document status"}>
    <p role="note">{locale==="es"?"Estado del expediente (vista previa): ":"Dossier status (preview): "}{dossierNotice.message}</p>
    <p>{locale==="es"?"Avisos: sin enviar ni programar":"Notices: none sent or scheduled"}</p>
    <p>{locale==="es"?"Vencimiento: política pendiente":"Expiry: policy pending"} · {workflowPreview.expiry==="policy_missing"?(locale==="es"?"Sin plazo establecido":"No deadline established"):""}</p>
    <small>{locale==="es"?"No hay solicitud registrada ni revisiones reales.":"No application is registered and no real reviews have started."}</small>
    <p><strong>{locale==="es"?"Tu siguiente acción":"Your next action"}:</strong> {model===null?(locale==="es"?"Selecciona Premium o Freemium.":"Select Premium or Freemium."):!ready?(locale==="es"?"Completa las cinco declaraciones disponibles.":"Complete the five available declarations."):(locale==="es"?"Has terminado la preparación. La verificación de identidad sigue inactiva hasta habilitar un proveedor seguro.":"Preparation is complete. Identity verification remains inactive until a secure provider is enabled.")}</p>
    <small>{locale==="es"?"No envíes documentos ni datos bancarios desde esta vista.":"Do not send documents or banking details from this preview."}</small>
   </div>
   <small>{locale==="es"?"Las etapas iniciales son declaraciones temporales, no una solicitud presentada ni identidad verificada.":"Initial steps are temporary declarations, not a submitted application or verified identity."}</small>
  </div>
  <div className={styles.developerWizardStage} aria-label={steps[activeStep].title}>
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
   <button type="button" className={styles.previewReset} disabled={activeStep===0} onClick={()=>setActiveStep(value=>Math.max(0,value-1))}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button>
   <button type="button" className={styles.previewReset} disabled={!nextAllowed} onClick={()=>setActiveStep(value=>Math.min(2,value+1))}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button>
  </div>
  <p>{copy.inactive}</p>
 </section>;
}
