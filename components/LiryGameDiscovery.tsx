"use client";
import {useMemo,useState} from "react";
import {plannedLiryGames} from "../lib/games/public-catalog";
import styles from "../app/lirygames/lirygames.module.css";

export function LiryGameDiscovery(){
  const [search,setSearch]=useState("");
  const [filter,setFilter]=useState("all");
  const list=useMemo(()=>{
    const q=search.trim().toLocaleLowerCase("es");
    return plannedLiryGames.filter(game=>
      (!q||(game.title+" "+game.tagline).toLocaleLowerCase("es").includes(q))&&
      (filter==="all"||game.state===filter)
    );
  },[search,filter]);
  return <div>
    <div className={styles.discoverControls}>
      <label htmlFor="liry-game-search">Buscar videojuego
        <input id="liry-game-search" type="search" autoComplete="off"
          placeholder="Nombre o estilo de juego" value={search} onChange={event=>setSearch(event.target.value)} />
      </label>
      <label htmlFor="liry-game-filter">Disponibilidad
        <select id="liry-game-filter" value={filter} onChange={event=>setFilter(event.target.value)}>
          <option value="all">Los 9 videojuegos</option>
          <option value="available">Disponibles</option>
          <option value="beta">En beta</option>
          <option value="coming_soon">Próximamente</option>
        </select>
      </label>
      <span className={styles.discoveryCount} role="status" aria-live="polite">{list.length} de 9 videojuegos</span>
    </div>
    <div className={styles.grid}>
      {list.map(game=>{
        const index=plannedLiryGames.findIndex(g=>g.slug===game.slug);
        return <article className={styles.gameCard} key={game.slug} style={{["--world-index" as string]:index+1}}>
          <span className={styles.number}>{String(index+1).padStart(2,"0")}</span>
          <div className={styles.cardContent}>
            <span className={styles.status}>{game.state==="available"?"DISPONIBLE":game.state==="beta"?"EN BETA":"PRÓXIMAMENTE"}</span>
            <h3>{game.title}</h3><p>{game.tagline}</p>
            <small>{game.internalWorldCount} mundos internos gratuitos previstos</small>
            <details className={styles.gameDetails}><summary>CONOCER ESTE MUNDO ↗</summary>
              <p>Videojuego {String(index+1).padStart(2,"0")} del ecosistema LIRYGAMES. El lanzamiento inicial contempla tres mundos internos gratuitos y artículos opcionales.</p>
              <p>{game.state==="coming_soon"?"Acceso jugable pendiente del lanzamiento oficial.":"El acceso se habilitará tras las verificaciones correspondientes."}</p>
            </details>
          </div>
        </article>;
      })}
    </div>
    {!list.length&&<p className={styles.discoveryEmpty} role="status">No hay videojuegos que coincidan con los filtros. Puedes mostrar todos los títulos o buscar otro nombre.</p>}
  </div>;
}
