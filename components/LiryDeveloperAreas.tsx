"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {LiryDeveloperAdmissionPreview} from "./LiryDeveloperAdmissionPreview";
import {LiryDeveloperGameListingPreview} from "./LiryDeveloperGameListingPreview";
import {LiryDeveloperReleasePreview} from "./LiryDeveloperReleasePreview";
import {LiryDeveloperFinancePreview} from "./LiryDeveloperFinancePreview";
const areas=[
 {id:"admission",label:"SOLICITUD DE ADMISIÓN",description:"Requisitos y elegibilidad Premium/Freemium."},
 {id:"listing",label:"FICHA DEL VIDEOJUEGO",description:"Descripción, modalidad, precio y clasificación."},
 {id:"release",label:"CARGA Y REVISIÓN",description:"Etapas de validación de cada versión."},
 {id:"finance",label:"VENTAS Y LIQUIDACIONES",description:"Ingresos verificables y comisiones."}
] as const;
type AreaId=(typeof areas)[number]["id"];
export function LiryDeveloperAreas(){
 const [selected,setSelected]=useState<AreaId>("admission");
 const [session,setSession]=useState(0);
 const modal=useRef<HTMLDialogElement>(null);
 const opener=useRef<HTMLButtonElement|null>(null);
 const close=useRef<HTMLButtonElement>(null);
 const open=(id:AreaId,trigger:HTMLButtonElement)=>{
  if(modal.current?.open)return;
  setSelected(id);opener.current=trigger;
  modal.current?.showModal();
  if(modal.current)modal.current.scrollTop=0;
  requestAnimationFrame(()=>{if(modal.current?.open)close.current?.focus({preventScroll:true})});
 };
 return <>
  <div className={styles.grid}>{areas.map(area=><article key={area.id} className={styles.card}>
   <h3>{area.label}</h3><p>{area.description}</p><small>VISTA PREPARATORIA</small>
   <button type="button" className={styles.areaLink} aria-haspopup="dialog" aria-label={`Abrir ${area.label}`} onClick={event=>open(area.id,event.currentTarget)}>ABRIR ÁREA →</button>
  </article>)}</div>
  <dialog className={styles.developerDialog} ref={modal} aria-labelledby="liry-developer-area-heading" onClose={()=>{setSession(value=>value+1);opener.current?.focus({preventScroll:true});opener.current=null}} onClick={event=>{if(event.target===modal.current)modal.current.close()}}>
   <div className={styles.developerDialogBody}>
    <form method="dialog"><button ref={close} className={styles.areaClose} type="submit" aria-label="Cerrar área y volver al panel desarrollador">×</button></form>
    <span className={styles.eyebrow}>LIRY DEVELOPER · ESPACIO PREPARATORIO</span>
    <h2 id="liry-developer-area-heading" className={styles.developerDialogHeading}>{areas.find(area=>area.id===selected)?.label}</h2>
    <div key={session}>
     {selected==="admission"&&<LiryDeveloperAdmissionPreview/>}
     {selected==="listing"&&<LiryDeveloperGameListingPreview/>}
     {selected==="release"&&<LiryDeveloperReleasePreview/>}
     {selected==="finance"&&<LiryDeveloperFinancePreview/>}
    </div>
   </div>
  </dialog>
 </>;
}
