"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Visibility="private"|"friends"|"public";
export function LiryPrivacyPreview(){
 const ref=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement>(null);
 const [visibility,setVisibility]=useState<Visibility>("private");
 const [language,setLanguage]=useState<"es"|"en">("es");
 const [marketing,setMarketing]=useState(false);
 const [tab,setTab]=useState<"privacidad"|"avisos">("privacidad");
 function reset(){setVisibility("private");setLanguage("es");setMarketing(false);setTab("privacidad");}
 return <>
  <button type="button" ref={trigger} className={styles.gamerCardAction} aria-haspopup="dialog" onClick={()=>{reset();ref.current?.showModal()}}>PRIVACIDAD Y PREFERENCIAS <span aria-hidden="true">→</span></button>
  <dialog ref={ref} className={styles.liryStandaloneDialog} aria-label="Preferencias de perfil en preparación" onClose={()=>trigger.current?.focus({preventScroll:true})} onClick={e=>{if(e.target===ref.current)ref.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar preferencias">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · LIRY ID</p>
    <h3>PREFERENCIAS DE TU PERFIL</h3>
    <p className={styles.liryCompactDescription}>Prueba las opciones sin guardar ni enviar información.</p>
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:7}} role="group" aria-label="Apartados">
     <button type="button" className={styles.gamerInfoDone} aria-pressed={tab==="privacidad"} onClick={()=>setTab("privacidad")}>PRIVACIDAD</button>
     <button type="button" className={styles.gamerInfoDone} aria-pressed={tab==="avisos"} onClick={()=>setTab("avisos")}>PREFERENCIAS</button>
    </div>
    {tab==="privacidad"?<fieldset style={{border:"1px solid #315a72",borderRadius:8,padding:14}}>
      <legend>Visibilidad prevista</legend>
      {([["private","Solo yo"],["friends","Amigos"],["public","Público"]] as const).map(([value,label])=><label key={value} style={{display:"flex",alignItems:"center",gap:9,margin:"11px 0"}}><input type="radio" name="liry-visibility" checked={visibility===value} onChange={()=>setVisibility(value)}/>{label}</label>)}
      <small>Privado por defecto. Nada se publica en esta vista.</small>
    </fieldset>:<div style={{display:"grid",gap:9}}>
      <label className={styles.liryLanguageRow}><span>Idioma previsto</span><select value={language} onChange={e=>setLanguage(e.target.value as "es"|"en")} className={styles.liryLanguageSelect}><option value="es">Español</option><option value="en">English</option></select></label>
      <label className={styles.liryMarketingRow}><input type="checkbox" checked={marketing} onChange={e=>setMarketing(e.target.checked)}/> Promociones futuras</label>
      <small>No activa ninguna suscripción. Avisos del servicio por separado.</small>
    </div>}
    <p aria-live="polite" className={styles.liryCompactStatus}>{tab==="privacidad"?`Visibilidad: ${visibility==="private"?"Privado":visibility==="friends"?"Amigos":"Público"}`:`Idioma: ${language==="es"?"Español":"English"} · Promociones: ${marketing?"Sí":"No"}`} · Sin guardar.</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>CERRAR SIN GUARDAR</button></form>
   </div>
  </dialog>
 </>;
}
