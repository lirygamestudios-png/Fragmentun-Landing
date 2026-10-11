"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
const networks=["Instagram","TikTok","YouTube","Facebook"] as const;
type Network=(typeof networks)[number];
export function LiryOfficialNetworks(){
 const [selected,setSelected]=useState<Network>("Instagram");
 const dialog=useRef<HTMLDialogElement>(null);
 const lastTrigger=useRef<HTMLButtonElement|null>(null);
 function open(name:Network,trigger:HTMLButtonElement){setSelected(name);lastTrigger.current=trigger;dialog.current?.showModal();}
 return <>
  <div className={styles.socialNetworkLabels} aria-label="Redes sociales oficiales pendientes de conexión">
   {networks.map(name=><button key={name} type="button" aria-label={`${name}: perfil oficial pendiente de verificación`} title={`${name} · próximamente`} onClick={event=>open(name,event.currentTarget)}>
     {name==="Instagram"?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg>:name==="TikTok"?<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2c.3 2.5 1.7 4.1 4.5 4.3v3.5a10 10 0 0 1-4.5-1.3v7.2c0 4.2-3 6.7-6.6 6.3-3.8-.4-5.8-4.1-4.4-7.5 1.1-2.7 3.5-4 6.7-3.7v3.6c-2-.4-3.3.8-3.3 2.3 0 1.5 1.3 2.4 2.7 2.1 1.1-.2 1.5-1.1 1.5-2.5V2h4.4Z"/></svg>:name==="YouTube"?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none"/></svg>:<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.2 22v-8.8h3L17.7 9h-3.5V6.3c0-1.2.4-2 2-2H18V.5C17.7.2 16.4 0 15 0c-3.4 0-5.7 2.1-5.7 5.9V9H6v4.2h3.3V22h4.9Z"/></svg>}
   </button>)}
  </div>
  <dialog ref={dialog} className={styles.gamerInfoDialog} aria-label={`Perfil oficial de ${selected}`} onClose={()=>lastTrigger.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
    <div className={styles.gamerInfoDialogInside}><form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar">×</button></form>
      <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · REDES SOCIALES</p>
      <h3>{selected.toUpperCase()}</h3><p>Estamos pendientes de verificar el enlace de nuestro perfil oficial. Este acceso se habilitará cuando esté confirmado; no te dirigiremos a cuentas no verificadas.</p>
      <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
    </div>
  </dialog>
 </>;
}
