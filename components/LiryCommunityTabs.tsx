"use client";
import {useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
const categories=[
 {id:"todos",label:"TODOS",title:"La comunidad está por despertar",copy:"Las publicaciones y actividades aparecerán cuando el servicio comunitario esté disponible. Sin conversaciones ficticias."},
 {id:"amigos",label:"AMIGOS",title:"Amigos próximamente",copy:"Las listas de amigos estarán disponibles cuando se habiliten las cuentas Liry ID."},
 {id:"logros",label:"LOGROS",title:"Logros comunitarios próximamente",copy:"Mostraremos únicamente logros de juego acreditados y compartidos con autorización."},
 {id:"eventos",label:"EVENTOS",title:"Eventos próximamente",copy:"Los eventos aparecerán cuando existan convocatorias oficiales confirmadas."}
] as const;
type Category=(typeof categories)[number]["id"];
export function LiryCommunityTabs(){
 const [tab,setTab]=useState<Category>("todos");
 const selected=categories.find(item=>item.id===tab)??categories[0];
 return <>
  <div className={styles.communityTabs} role="tablist" aria-label="Categorías de comunidad">
   {categories.map(item=><button type="button" role="tab" key={item.id} id={`liry-tab-${item.id}`} aria-controls="liry-community-panel" aria-selected={tab===item.id} className={tab===item.id?styles.communityTabActive:undefined} onClick={()=>setTab(item.id)}>{item.label}</button>)}
  </div>
  <div className={styles.communityFeed} role="tabpanel" id="liry-community-panel" aria-labelledby={`liry-tab-${tab}`}>
    <div className={styles.communityEmpty}><span className={styles.communityEmptyIcon} aria-hidden="true">◉</span><strong>{selected.title}</strong><p>{selected.copy}</p></div>
    {tab==="todos"&&<div className={styles.communityPost}><span className={styles.communityAvatar} aria-hidden="true">L</span><div><strong>Tu comunidad Liry</strong><p>Comparte la página e invita a otros jugadores a descubrir los nueve mundos.</p><small>Mensaje informativo · comunidad en preparación</small></div></div>}
  </div>
 </>;
}
