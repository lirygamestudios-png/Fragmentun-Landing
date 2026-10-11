"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";

type Topic="perfil"|"journey"|"logros"|"mundos"|"logros-lista";
const panels={
  perfil:{title:"MI PERFIL Y LIRY ID",paragraph:"Visitante: explora Liry ADN y utiliza un avatar temporal. Próximamente, Liry ID permitirá guardar tu identidad; la actividad de juego se acreditará únicamente desde videojuegos conectados.",notice:"Registro e inicio de sesión aún no disponibles. Esta pantalla no crea cuentas ni guarda progreso."},
  journey:{title:"CÓMO FUNCIONARÁ TU VIAJE",paragraph:"Cuando habilitemos las cuentas y los videojuegos, este recorrido mostrará los mundos que realmente hayas visitado. Explorar las tarjetas de presentación no cuenta como jugar.",notice:"Sin juegos activos y sin una cuenta vinculada, no existen avances que registrar. Ninguna visita a esta página suma progreso."},
  mundos:{title:"LOS NUEVE MUNDOS",paragraph:"Explora el catálogo de experiencias previstas. Todos los lanzamientos están pendientes y ninguna visita a las fichas contará como partida jugada.",notice:"El progreso real llegará únicamente con cuentas y actividad verificadas."},
  "logros-lista":{title:"OBJETIVOS DE LOGROS",paragraph:"Estas son metas previstas para futuras experiencias gamer. Todavía no existe un sistema activo de acreditación.",notice:"Los objetivos son informativos: ningún logro ni recompensa se obtiene por visitar esta pantalla."},
  logros:{title:"CÓMO OBTENER LOGROS",paragraph:"Los ejemplos mostrados son objetivos previstos, no premios obtenidos. Los logros solo podrán acreditarse al completar requisitos comprobables dentro de un videojuego habilitado.",notice:"Sin partidas verificadas no se asignan medallas, recompensas ni puntos de experiencia."}
} as const;

export function LiryGamerInfoDialog({topic}:{topic:Topic}){
  const dialogRef=useRef<HTMLDialogElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const [selectedWorld,setSelectedWorld]=useState<number|null>(null);
  const worldNames=["LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03","LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06","LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"];
  const data=panels[topic];
  return <>
    <button type="button" ref={triggerRef} className={styles.gamerCardAction} onClick={()=>{setSelectedWorld(null);dialogRef.current?.showModal()}} aria-haspopup="dialog">{data.title} <span aria-hidden="true">→</span></button>
    <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label={data.title} onClose={()=>{setSelectedWorld(null);triggerRef.current?.focus({preventScroll:true})}} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
      <div className={styles.gamerInfoDialogInside}>
        <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar subpantalla">×</button></form>
        <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · TU EXPERIENCIA</p>
        <h3>{data.title}</h3>
        <p>{data.paragraph}</p>
        {topic==="mundos"&&<><ol className={styles.gamerInfoModalList}>{worldNames.map((label,index)=><li key={label}><button type="button" className={styles.gamerWorldChoice} aria-pressed={selectedWorld===index} onClick={()=>setSelectedWorld(index)}>{label} <span>VER ESTADO →</span></button></li>)}</ol>{selectedWorld!==null&&<div className={styles.gamerWorldStatus} role="status"><strong>{worldNames[selectedWorld]}</strong><p>PRÓXIMAMENTE · Sin acceso jugable autorizado.</p><small>No se registran partidas ni progreso desde esta vista.</small></div>}</>}
        {topic==="logros-lista"&&<ul className={styles.gamerInfoModalList}>{[["Primeros pasos","Completa tu primer juego"],["Explorador de mundos","Descubre cinco mundos"],["La comunidad te necesita","Juega con tres amigos"],["Maestro de estrategias","Gana diez partidas estratégicas"]].map(([title,description])=><li key={title}><span>{title}</span><small>{description} · PENDIENTE</small></li>)}</ul>}
        {topic==="perfil"&&<p><a href="#liry-dna" onClick={()=>dialogRef.current?.close()}>EXPLORAR LIRY ADN →</a></p>}
        <small>{data.notice}</small>
        <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
      </div>
    </dialog>
  </>;
}
