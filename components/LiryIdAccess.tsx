"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Mode="entrar"|"registro"|"recuperar";
const modes:{id:Mode;label:string;heading:string;description:string}[]=[
{id:"entrar",label:"INICIAR SESIÓN",heading:"ACCEDE A TU LIRY ID",description:"La autenticación estará disponible cuando se habiliten las cuentas gamer."},
{id:"registro",label:"CREAR CUENTA",heading:"TU IDENTIDAD LIRY",description:"El registro permitirá guardar tu identidad gamer y sus preferencias autorizadas."},
{id:"recuperar",label:"RECUPERAR ACCESO",heading:"RECUPERA TU LIRY ID",description:"Aquí podrás recuperar el acceso de forma segura cuando se active el servicio."}
];
export function LiryIdAccess(){
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement>(null);
 const [mode,setMode]=useState<Mode>("entrar");
 const current=modes.find(x=>x.id===mode)!;
 return <>
  <button type="button" ref={triggerRef} className={styles.gamerCardAction} aria-haspopup="dialog" onClick={()=>{setMode("entrar");dialogRef.current?.showModal()}}>LIRY ID · ACCESO <span aria-hidden="true">→</span></button>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label="Liry ID: acceso a cuenta" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar Liry ID">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · IDENTIDAD ÚNICA</p>
    <h3>{current.heading}</h3>
    <div style={{display:"flex",flexWrap:"wrap",gap:8,margin:"12px 0"}} role="group" aria-label="Opciones de acceso Liry ID">
     {modes.map(x=><button type="button" key={x.id} aria-pressed={mode===x.id} onClick={()=>setMode(x.id)} style={{border:"1px solid "+(mode===x.id?"#6be8ff":"#315a72"),borderRadius:8,padding:"9px 10px",background:mode===x.id?"#103f5a":"#081b30",color:"#e4f9ff",fontSize:11,cursor:"pointer"}}>{x.label}</button>)}
    </div>
    <p aria-live="polite">{current.description}</p>
    <p style={{fontSize:12,color:"#a6d2e6"}}>Modalidad seleccionada: {current.label}. No se recopilan credenciales.</p>
    <div style={{padding:"15px",border:"1px solid #2f657f",borderRadius:9,background:"#0a2036"}}>
     <strong style={{color:"#79e6ff"}}>PRÓXIMAMENTE · ACCESO DESACTIVADO</strong>
     <p style={{marginBottom:0}}>Esta es una vista informativa. No solicita correo ni contraseña y no registra usuarios. Podrás explorar el FrontDesk sin crear una cuenta.</p>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
