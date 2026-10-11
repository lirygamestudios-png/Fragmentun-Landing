"use client";
import {useRef} from "react";
import styles from "../app/lirygames/lirygames.module.css";

/** Información preliminar solamente; no crea participación ni concede acceso beta. */
export function LiryBoostConditions(){
  const dialogRef=useRef<HTMLDialogElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  return <>
    <button type="button" ref={triggerRef} className={styles.liryBoostOpen} aria-haspopup="dialog" aria-controls="liryboost-condiciones" onClick={()=>dialogRef.current?.showModal()}>CÓMO SE VALIDARÁ TU PARTICIPACIÓN →</button>
    <dialog ref={dialogRef} id="liryboost-condiciones" className={styles.gamerInfoDialog} aria-labelledby="liryboost-conditions-title" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
      <div className={styles.gamerInfoDialogInside}>
        <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar condiciones">×</button></form>
        <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · LIRYBOOST</p>
        <h3 id="liryboost-conditions-title">CÓMO FUNCIONARÁ LIRYBOOST</h3>
        <p>Esta información describe el mecanismo previsto. No son todavía las bases oficiales de una convocatoria abierta.</p>
        <ol className={styles.gamerInfoModalList}>
          <li>El programa abrirá solo cuando se publiquen sus bases y la política de privacidad aplicable.</li>
          <li>La participación requerirá registro y aceptación de las condiciones correspondientes.</li>
          <li>El Top 10 mostrará únicamente alias públicos autorizados e invitaciones verificadas. Compartir ahora no genera puntos.</li>
          <li>Las invitaciones repetidas, automatizadas o no verificables no darán acceso a ventajas.</li>
          <li>La prioridad para recibir versiones beta estará condicionada a disponibilidad, elegibilidad y reglas de cada lanzamiento; no es una recompensa garantizada.</li>
        </ol>
        <small>ESTADO ACTUAL: COMPETENCIA CERRADA · SIN INSCRIPCIONES NI PUNTUACIONES ACTIVAS.</small>
        <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
      </div>
    </dialog>
  </>;
}
