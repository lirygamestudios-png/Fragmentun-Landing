"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {LIRY_GAME_LINKS_PENDING} from "../lib/games/liry-game-link-contract";
import {LIRY_VISITOR_IDENTITY} from "../lib/games/liry-id-contract";

type Topic="perfil"|"journey"|"logros"|"mundos"|"logros-lista";
const panels={
  perfil:{title:"MI PERFIL Y LIRY ID",paragraph:"Visitante: explora Liry ADN y utiliza un avatar temporal. Próximamente, Liry ID permitirá guardar tu identidad; la actividad de juego se acreditará únicamente desde videojuegos conectados.",notice:"Registro e inicio de sesión aún no disponibles. Esta pantalla no crea cuentas ni guarda progreso."},
  journey:{title:"CÓMO FUNCIONARÁ TU VIAJE",paragraph:"Cuando habilitemos las cuentas y los videojuegos, este recorrido mostrará los mundos que realmente hayas visitado. Explorar las tarjetas de presentación no cuenta como jugar.",notice:"Sin juegos activos y sin una cuenta vinculada, no existen avances que registrar. Ninguna visita a esta página suma progreso."},
  mundos:{title:"LOS NUEVE MUNDOS",paragraph:"Explora el catálogo de experiencias previstas. Todos los lanzamientos están pendientes y ninguna visita a las fichas contará como partida jugada.",notice:"Los nueve mundos están pendientes de vinculación con Liry ID. Solo un servidor de juego autorizado podrá verificar partidas y registrar progreso."},
  "logros-lista":{title:"OBJETIVOS DE LOGROS",paragraph:"Estas son metas previstas para futuras experiencias gamer. Todavía no existe un sistema activo de acreditación.",notice:"Los objetivos son informativos: ningún logro ni recompensa se obtiene por visitar esta pantalla."},
  logros:{title:"CÓMO OBTENER LOGROS",paragraph:"Los ejemplos mostrados son objetivos previstos, no premios obtenidos. Los logros solo podrán acreditarse al completar requisitos comprobables dentro de un videojuego habilitado.",notice:"Sin partidas verificadas no se asignan medallas, recompensas ni puntos de experiencia."}
} as const;

export function LiryGamerInfoDialog({topic}:{topic:Topic}){
  const dialogRef=useRef<HTMLDialogElement>(null);
  const triggerRef=useRef<HTMLButtonElement>(null);
  const [selectedWorld,setSelectedWorld]=useState<number|null>(null);
  const worldLinks=LIRY_GAME_LINKS_PENDING;
  const data=panels[topic];
  return <>
    <button type="button" ref={triggerRef} className={styles.gamerCardAction} onClick={()=>{setSelectedWorld(null);dialogRef.current?.showModal()}} aria-haspopup="dialog">{data.title} <span aria-hidden="true">→</span></button>
    <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-label={data.title} onClose={()=>{setSelectedWorld(null);triggerRef.current?.focus({preventScroll:true})}} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
      <div className={styles.gamerInfoDialogInside}>
        <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar subpantalla">×</button></form>
        <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · TU EXPERIENCIA</p>
        <h3>{data.title}</h3>
        <p>{data.paragraph}</p>
        {topic==="mundos"&&<><ol className={styles.gamerInfoModalList}>{worldLinks.map((link,index)=><li key={link.publicGameCode}><button type="button" className={styles.gamerWorldChoice} aria-pressed={selectedWorld===index} onClick={()=>setSelectedWorld(index)}>{link.publicGameCode} <span>VER VINCULACIÓN →</span></button></li>)}</ol>{selectedWorld!==null&&<div className={styles.gamerWorldStatus} role="status"><strong>{worldLinks[selectedWorld].publicGameCode}</strong><p>ESTADO DE VINCULACIÓN: {worldLinks[selectedWorld].status==="not_connected"?"NO CONECTADO":worldLinks[selectedWorld].status==="pending_verification"?"PENDIENTE DE VERIFICACIÓN":"VERIFICADO"}</p><small>Este mundo todavía no está conectado a Liry ID. No se registran partidas, XP ni progreso en esta vista.</small></div>}</>}
        {topic==="logros-lista"&&<ul className={styles.gamerInfoModalList}>{[["Primeros pasos","Completa tu primer juego"],["Explorador de mundos","Descubre cinco mundos"],["La comunidad te necesita","Juega con tres amigos"],["Maestro de estrategias","Gana diez partidas estratégicas"]].map(([title,description])=><li key={title}><span>{title}</span><small>{description} · PENDIENTE</small></li>)}</ul>}
        {topic==="perfil"&&<><div className={styles.liryIdentityStages} aria-label="Etapas de identidad gamer"><div><strong>01 · VISITANTE</strong><span>{LIRY_VISITOR_IDENTITY.kind==="visitor"?"ESTADO ACTUAL":"—"}</span><p>Explora el FrontDesk sin cuenta ni progreso guardado.</p></div><div><strong>02 · CUENTA LIRY ID</strong><span>NO DISPONIBLE</span><p>Identidad y preferencias guardadas solo tras activar el registro seguro.</p></div><div><strong>03 · JUGADOR ACTIVO</strong><span>NO DISPONIBLE</span><p>Actividad reconocida únicamente desde videojuegos conectados.</p></div></div><p><a href="#liry-dna" onClick={()=>dialogRef.current?.close()}>EXPLORAR LIRY ADN →</a></p></>}
        <small>{data.notice}</small>
        <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
      </div>
    </dialog>
  </>;
}
