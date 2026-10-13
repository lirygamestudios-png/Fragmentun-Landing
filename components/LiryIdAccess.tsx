"use client";
import {useRef,useState} from "react";
import {LIRY_ID_PUBLIC_ACCESS} from "../lib/games/liry-id-public-access";
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
  <dialog ref={dialogRef} className={styles.liryStandaloneDialog} aria-label="Liry ID: acceso a cuenta" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.liryStandaloneContent}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar Liry ID">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · IDENTIDAD ÚNICA</p>
    <h3>{current.heading}</h3>
    <div className={styles.liryAccessTabs} role="group" aria-label="Opciones de acceso Liry ID">
     {modes.map(x=><button type="button" key={x.id} aria-pressed={mode===x.id} onClick={()=>setMode(x.id)} className={styles.liryAccessTab}>{x.label}</button>)}
    </div>
    <p className={styles.liryCompactDescription} aria-live="polite">{current.description}</p>
    <div className={styles.liryCompactNotice}>
     <strong style={{color:"#79e6ff"}}>PRÓXIMAMENTE · ACCESO DESACTIVADO</strong>
     <p>{LIRY_ID_PUBLIC_ACCESS.message} No solicitamos datos ni contraseñas.</p>
    </div>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
