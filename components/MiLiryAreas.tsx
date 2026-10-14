"use client";
import {useRef,useState} from "react";
import Link from "next/link";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {MiLiryIdentityPreview} from "./MiLiryIdentityPreview";
const areas=[
 {id:"identidad",title:"MI IDENTIDAD",desc:"Nombre público, avatar y preferencias",status:"Pendiente de conexión",href:"/lirygames#perfil-gamer",detail:"El perfil editable se habilitará cuando exista una sesión de jugador verificada."},
 {id:"mundos",title:"MIS MUNDOS",desc:"Historial y progreso de videojuegos verificados",status:"Sin actividad registrada",href:"/lirygames#mundos",detail:"Se mostrarán partidas y mundos únicamente cuando sus servidores confirmen la actividad."},
 {id:"logros",title:"MIS LOGROS",desc:"Insignias y recompensas acreditadas",status:"Sin logros acreditados",href:"/lirygames#perfil-gamer",detail:"No hay insignias otorgadas. Los logros requerirán eventos de juego autenticados."},
 {id:"inventario",title:"MI INVENTARIO",desc:"Artículos digitales asociados a compras verificadas",status:"Sin inventario conectado",href:"/lirygames#tienda",detail:"El inventario permanecerá vacío hasta conectar compras y entregas verificadas."},
 {id:"comunidad",title:"MI COMUNIDAD",desc:"Amistades, publicaciones y eventos",status:"Pendiente de activación",href:"/lirygames#comunidad",detail:"Las amistades, publicaciones y eventos dependerán de una identidad activa y permisos de privacidad."},
 {id:"liryboost",title:"MI LIRYBOOST",desc:"Invitaciones verificadas y participación",status:"Competencia inactiva",href:"/lirygames#liryboost",detail:"LiryBoost todavía no registra participaciones ni concede acceso beta."}
] as const;
export function MiLiryAreas(){
 const [selected,setSelected]=useState<(typeof areas)[number]>(areas[0]);
 const [previewSession,setPreviewSession]=useState(0);
 const dialog=useRef<HTMLDialogElement>(null);
 const trigger=useRef<HTMLButtonElement|null>(null);
 const closeButton=useRef<HTMLButtonElement>(null);
 const openArea=(area:(typeof areas)[number],button:HTMLButtonElement)=>{
  setSelected(area);
  trigger.current=button;
  const modal=dialog.current;
  if(!modal)return;
  if(modal.open)return;
  modal.showModal();
  modal.scrollTop=0;
  requestAnimationFrame(()=>{if(modal.open)closeButton.current?.focus({preventScroll:true});});
 };
 return <><div className={styles.grid}>{areas.map(area=><article className={styles.card} key={area.id}>
  <h3>{area.title}</h3><p>{area.desc}</p><small>{area.status}</small>
  <button className={styles.areaLink} type="button" aria-haspopup="dialog" aria-label={`Abrir ${area.title}`} onClick={event=>openArea(area,event.currentTarget)}>ABRIR MI ÁREA →</button>
 </article>)}</div>
 <dialog ref={dialog} className={styles.areaDialog} aria-labelledby="mi-liry-area-title" onClose={()=>{setPreviewSession(value=>value+1);trigger.current?.focus({preventScroll:true});trigger.current=null;}} onClick={event=>{if(event.target===dialog.current)dialog.current.close()}}>
  <div className={styles.areaDialogContent}>
   <form method="dialog"><button ref={closeButton} className={styles.areaClose} aria-label="Cerrar área y volver a MI LIRY" type="submit">×</button></form>
   <span className={styles.eyebrow}>MI LIRY · ESPACIO PERSONAL</span>
   <h2 id="mi-liry-area-title">{selected.title}</h2><p>{selected.detail}</p>
   <span className={styles.areaStatus}>{selected.status}</span>
   {selected.id==="identidad"&&<div className={styles.identityDetails} aria-label="Preparación de identidad del jugador">
    <div><strong>NOMBRE PÚBLICO</strong><span>Sin identidad verificada</span></div>
    <div><strong>AVATAR</strong><span>Pendiente de personalización</span></div>
    <div><strong>PREFERENCIAS</strong><span>No configuradas</span></div>
    <p>Los datos personales solo se mostrarán al titular después de una autenticación segura. Esta vista no almacena información.</p>
   </div>}
   {selected.id==="identidad"&&<MiLiryIdentityPreview key={previewSession} />}
   {selected.id==="identidad"&&<section className={styles.identitySecurity} aria-label="Seguridad del perfil">
    <h3>SEGURIDAD DE MI IDENTIDAD</h3>
    <p>Los cambios de nombre, avatar y preferencias requerirán una sesión personal verificada. Ningún dato se guarda desde esta vista previa.</p>
    <ul><li>Inicio de sesión gamer independiente del administrador</li><li>Validación de nombre público y controles de privacidad</li><li>Confirmación del usuario antes de guardar cambios</li></ul>
   </section>}
   {selected.id==="mundos"&&<section className={styles.worldsPanel} aria-label="Estado de mundos del jugador">
    <h3>MUNDOS DE MI CUENTA</h3>
    <p className={styles.worldsEmpty}>Todavía no hay partidas ni mundos vinculados a una cuenta autenticada.</p>
    <div className={styles.worldsFacts}><div><strong>JUEGOS VINCULADOS</strong><span>Sin datos verificados</span></div><div><strong>ÚLTIMA PARTIDA</strong><span>No disponible</span></div><div><strong>PROGRESO</strong><span>No disponible</span></div></div>
    <p>Los títulos pendientes de registro no se publican aquí. En el futuro, solo aparecerán juegos autorizados y datos confirmados por el servidor.</p>
   </section>}
   {selected.id==="logros"&&<section className={styles.worldsPanel} aria-label="Estado de logros y recompensas">
    <h3>LOGROS DE MI CUENTA</h3>
    <p className={styles.worldsEmpty}>No hay insignias, desafíos completados ni recompensas acreditadas a una cuenta autenticada.</p>
    <div className={styles.worldsFacts}>
     <div><strong>INSIGNIAS</strong><span>Sin datos verificados</span></div>
     <div><strong>DESAFÍOS</strong><span>No disponibles</span></div>
     <div><strong>RECOMPENSAS</strong><span>No acreditadas</span></div>
    </div>
    <p>Los logros aparecerán únicamente cuando un videojuego activo confirme sus eventos mediante el servidor. Esta pantalla no concede premios ni simula progresos.</p>
   </section>}
   {selected.id==="inventario"&&<section className={styles.worldsPanel} aria-label="Inventario digital verificado">
    <h3>ARTÍCULOS DE MI CUENTA</h3>
    <p className={styles.worldsEmpty}>No hay artículos digitales vinculados a una cuenta de jugador autenticada.</p>
    <div className={styles.worldsFacts}>
     <div><strong>SKINS Y APARIENCIAS</strong><span>Sin datos verificados</span></div>
     <div><strong>OBJETOS DE JUEGO</strong><span>No disponibles</span></div>
     <div><strong>COMPRAS Y ENTREGAS</strong><span>Sin conexión</span></div>
    </div>
    <p>El inventario solo mostrará artículos entregados y confirmados por el servidor del videojuego. La compra de skins, elementos de ataque u otros objetos freemium no está habilitada desde esta pantalla.</p>
   </section>}
   {selected.id==="comunidad"&&<section className={styles.worldsPanel} aria-label="Estado de Mi Comunidad">
    <h3>MI COMUNIDAD</h3>
    <p className={styles.worldsEmpty}>No existe una sesión gamer verificada. Las relaciones y publicaciones privadas no están disponibles en modo visitante.</p>
    <div className={styles.worldsFacts}>
     <div><strong>MIS AMISTADES</strong><span>Sin datos verificados</span></div>
     <div><strong>MIS PUBLICACIONES</strong><span>No disponibles</span></div>
     <div><strong>EVENTOS</strong><span>Pendientes de activación</span></div>
    </div>
    <p>Las solicitudes de amistad y publicaciones requerirán identidad autenticada, consentimiento, controles de visibilidad y herramientas de reporte y moderación. No se muestran perfiles de terceros ni actividad inventada.</p>
   </section>}
   {selected.id==="liryboost"&&<section className={styles.worldsPanel} aria-label="Estado de participación en LiryBoost">
    <h3>MI PARTICIPACIÓN EN LIRYBOOST</h3>
    <p className={styles.worldsEmpty}>La competencia todavía no está activa. No existen invitaciones ni puestos de clasificación acreditados para esta sesión visitante.</p>
    <div className={styles.worldsFacts}>
     <div><strong>INVITACIONES VÁLIDAS</strong><span>Sin datos verificados</span></div>
     <div><strong>MI POSICIÓN</strong><span>Sin clasificación activa</span></div>
     <div><strong>ACCESO A BETA</strong><span>No asignado</span></div>
    </div>
    <p>El futuro Top 10 mostrará únicamente participaciones verificadas, bajo reglas publicadas previamente. Compartir una página no garantiza una posición ni acceso anticipado hasta que exista un sistema de atribución y validación activo.</p>
   </section>}
   <div className={styles.areaDialogActions}><Link className={styles.areaLink} href={selected.href}>EXPLORAR SECCIÓN →</Link><form method="dialog"><button type="submit" className={styles.areaLink}>VOLVER A MI LIRY</button></form></div>
  </div>
 </dialog></>;
}
