"use client";
import {useEffect,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
type Row={publicName:string;verifiedInvitations:number};
type ResponseShape={programActive:boolean;leaderboard:Row[]};
const EMPTY:Row[]=[];
export function LiryBoostTop10(){
 const [entries,setEntries]=useState<Row[]>(EMPTY);
 const [active,setActive]=useState(false);
 const [unavailable,setUnavailable]=useState(false);
 useEffect(()=>{
  const controller=new AbortController();
  fetch("/api/liryboost/top10",{signal:controller.signal,cache:"no-store"})
   .then(r=>{if(!r.ok)throw new Error("Unavailable");return r.json() as Promise<ResponseShape>})
   .then(data=>{
    if(!data||typeof data.programActive!=="boolean"||!Array.isArray(data.leaderboard))throw new Error("Invalid leaderboard response");
    if(data.programActive===false){setEntries([]);setActive(false);setUnavailable(false);return;}
    setEntries(data.leaderboard.filter(e=>e&&typeof e.publicName==="string"&&e.publicName.trim().length>0&&e.publicName.length<=60&&!/[<>@]/.test(e.publicName)&&!e.publicName.includes("\n")&&!e.publicName.includes("\r")&&Number.isSafeInteger(e.verifiedInvitations)&&e.verifiedInvitations>0).slice(0,10));
    setActive(true);setUnavailable(false);
   }).catch(()=>{if(!controller.signal.aborted){setEntries([]);setActive(false);setUnavailable(true);}});
  return ()=>controller.abort();
 },[]);
 return <div className={styles.liryLeaderboard} aria-labelledby="liry-top-title">
  <div className={styles.liryLeaderboardHeader}>
   <span className={styles.liryLeaderboardEyebrow}>LIRYBOOST · CLASIFICACIÓN</span>
   <h3 id="liry-top-title">TOP 10</h3>
   <p>Clasificación reservada para participantes verificados.</p>
   {!active&&<span className={styles.liryLeaderboardPending}>{unavailable?"CLASIFICACIÓN TEMPORALMENTE NO DISPONIBLE":"COMPETENCIA AÚN NO ACTIVADA"}</span>}
  </div>
  <div className={styles.liryPodium} aria-label="Podio: segundo, primero y tercer puesto">
   {[2,1,3].map(rank=>{const player=entries[rank-1];return <div key={rank} className={styles.liryPodiumParticipant}>
    <span className={styles.liryPodiumMedal} aria-hidden="true">{rank===1?"♛":rank===2?"◇":"✧"}</span>
    <span className={styles.liryPodiumVacant}>{player?.publicName??"POSICIÓN LIBRE"}</span>
    <div className={styles.liryPodiumPlinth} data-rank={rank}><strong>#{rank}</strong>{player&&<small>{player.verifiedInvitations} invitaciones</small>}</div>
   </div>})}
  </div>
  <ol className={styles.liryTopRest} start={4} aria-label="Puestos del cuarto al décimo">
   {[4,5,6,7,8,9,10].map(rank=>{const player=entries[rank-1];return <li key={rank} className={styles.liryTopRow}>
    <strong>{String(rank).padStart(2,"0")}</strong><span>{player?.publicName??"Posición disponible"}</span><small>{player?`${player.verifiedInvitations} invitaciones`:"Sin participantes"}</small>
   </li>})}
  </ol>
  <p className={styles.liryTopFootnote}>{!active?(unavailable?"No fue posible consultar el estado de la clasificación. No mostramos resultados sin verificar.":"Sin participantes ni puntuaciones ficticias. El tablero se actualizará al abrir oficialmente LiryBoost."):"Solo se muestran alias autorizados e invitaciones verificadas."}</p>
 </div>;
}
