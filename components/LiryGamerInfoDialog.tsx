"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";

type Topic="perfil"|"journey"|"logros";
const panels={
  perfil:{title:"CÓMO ACTIVAR MI PERFIL",paragraph:"Tu perfil completo estará disponible cuando habilitemos las cuentas gamer. Por ahora puedes conocer tus afinidades con Liry ADN sin registrarte.",notice:"Sin cuenta activa no se guardan niveles, experiencia, partidas ni logros."},
  journey:{title:"CÓMO FUNCIONARÁ TU VIAJE",paragraph:"Cuando habilitemos las cuentas y los videojuegos, este recorrido mostrará los mundos que realmente hayas visitado. Explorar las tarjetas de presentación no cuenta como jugar.",notice:"Sin juegos activos y sin una cuenta vinculada, no existen avances que registrar. Ninguna visita a esta página suma progreso."},
  logros:{title:"CÓMO OBTENER LOGROS",paragraph:"Los ejemplos mostrados son objetivos previstos, no premios obtenidos. Los logros solo podrán acreditarse al completar requisitos comprobables dentro de un videojuego habilitado.",notice:"Sin partidas verificadas no se asignan medallas, recompensas ni puntos de experiencia."}
} as const;

export function LiryGamerInfoDialog({topic}:{topic:Topic}){
  const dialogRef=useRef<HTMLDialogElement>(null);
  const data=panels[topic];
  return <>
    <button type="button" className={styles.gamerCardAction} onClick={()=>dialogRef.current?.showModal()} aria-haspopup="dialog">{data.title} <span aria-hidden="true">→</span></button>
    <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label={data.title} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
      <div className={styles.gamerInfoDialogInside}>
        <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar subpantalla">×</button></form>
        <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · TU EXPERIENCIA</p>
        <h3>{data.title}</h3>
        <p>{data.paragraph}</p>
        {topic==="perfil"&&<p><a href="#liry-dna" onClick={()=>dialogRef.current?.close()}>EXPLORAR LIRY ADN →</a></p>}
        <small>{data.notice}</small>
        <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
      </div>
    </dialog>
  </>;
}
