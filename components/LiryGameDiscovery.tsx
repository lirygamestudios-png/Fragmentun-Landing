"use client";
import {type PublicGameCard} from "../lib/games/public-catalog";
import styles from "../app/lirygames/lirygames.module.css";

const themes=["COMPETITIVO · ACCIÓN · MULTIJUGADOR","ESTRATEGIA · ACCIÓN · MULTIJUGADOR","EKONIA · ESTRATEGIA · SIMULACIÓN","SUPERVIVENCIA · RPG · MUNDO ABIERTO","SOCIAL · SIMULACIÓN · MULTIJUGADOR","FANTASÍA · RPG · MUNDO ABIERTO","PUZZLE · AVENTURA · EXPLORACIÓN","ESTRATEGIA · NFT · MULTIJUGADOR","PLATAFORMAS · AVENTURA · PUZZLES"];
const traits=["Explorador","Estratega","Competidor","Social","Acción","Creativo"];

export function LiryGameDiscovery({games}:{games:readonly PublicGameCard[]}){
  return <div className={styles.worldShowcase}>
    <div className={styles.worldsGrid}>
      {games.map((game,index)=><article className={styles.gameCard} key={game.slug} style={{["--world-index" as string]:index+1}}>
        <div className={styles.cardContent}>
          <div className={styles.worldCardText}>
            <h3>{game.title}</h3>
            <p>{themes[index]??game.tagline}</p>
            <span className={styles.worldAvailability}>{game.state==="available"?"DISPONIBLE":game.state==="beta"?"EN BETA":"PRÓXIMAMENTE"}</span>
          </div>
          <a className={styles.worldArrow} href={`#detalle-${game.slug}`} aria-label={`Conocer el estado de ${game.title}`}>→</a>
        </div>
      </article>)}
    </div>
    <aside className={styles.dnaSide} id="liry-dna" aria-labelledby="dna-side-title">
      <p className={styles.kicker}>EXPERIENCIA INTERACTIVA</p>
      <h3 id="dna-side-title">DESCUBRE TU <span>LIRY DNA</span></h3>
      <p>Conoce los seis estilos que formarán parte de tu identidad gamer.</p>
      <a className={styles.dnaSideButton} href="#dna-perfiles">EXPLORAR ESTILOS →</a>
      <div className={styles.dnaArt} aria-hidden="true">⟡</div>
      <ul className={styles.dnaTraitList}>
        {traits.map((trait,i)=><li key={trait}><span className={styles.dnaTraitIndex}>{i+1}</span><span>{trait}</span><span className={styles.dnaTraitPending}>Por evaluar</span></li>)}
      </ul>
      <small>Tu evaluación estará disponible al activar Liry DNA. No mostramos resultados ficticios.</small>
    </aside>
    <div className={styles.worldsNotes}>
      {games.map((game)=><div id={`detalle-${game.slug}`} key={game.slug} className={styles.worldNote}><strong>{game.title}</strong><span>{game.state==="coming_soon"?"Lanzamiento pendiente. Tres mundos gratuitos previstos y cosméticos opcionales.":game.state==="beta"?"Beta sujeta a acceso verificado.":"Consulta el acceso oficial publicado."}</span></div>)}
    </div>
  </div>;
}
