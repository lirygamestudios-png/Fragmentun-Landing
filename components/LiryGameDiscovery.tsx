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
      <div className={styles.dnaArt} aria-hidden="true"><svg className={styles.dnaMap} viewBox="0 0 300 300" role="presentation"><defs><radialGradient id="liryDnaGlow"><stop offset="0%" stopColor="#57e6ff" stopOpacity=".23"/><stop offset="75%" stopColor="#7452e8" stopOpacity=".06"/><stop offset="100%" stopColor="#050e23" stopOpacity="0"/></radialGradient><linearGradient id="liryDnaStrand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4fe0ff"/><stop offset=".5" stopColor="#8c8cff"/><stop offset="1" stopColor="#bc67fb"/></linearGradient></defs><circle cx="150" cy="150" r="144" fill="url(#liryDnaGlow)"/><g className={styles.dnaRings}><circle cx="150" cy="150" r="106"/><circle cx="150" cy="150" r="80"/><circle cx="150" cy="150" r="54"/></g><g className={styles.dnaOrbit}><ellipse cx="150" cy="150" rx="132" ry="50" transform="rotate(-36 150 150)"/><ellipse cx="150" cy="150" rx="132" ry="50" transform="rotate(36 150 150)"/></g><g className={styles.dnaHelix}><path d="M116 49 C220 84 79 113 185 149 S78 218 180 253" fill="none" stroke="url(#liryDnaStrand)" strokeWidth="5" strokeLinecap="round"/><path d="M184 49 C80 84 221 113 115 149 S222 218 120 253" fill="none" stroke="#65c9ff" strokeOpacity=".75" strokeWidth="5" strokeLinecap="round"/>{Array.from({length:9},(_,i)=>{const y=58+i*23;const x=150+Math.sin(i*1.42)*43;return <line key={i} x1={x} y1={y} x2={300-x} y2={y} stroke={i%2?"#d37bff":"#5be1ff"} strokeWidth="2.4" opacity=".67"/>})}</g><g className={styles.dnaNodes}>{[[150,18],[264,85],[264,215],[150,282],[36,215],[36,85]].map(([x,y],i)=><g key={i}><circle cx={x} cy={y} r="9" fill="#07172c" stroke={i%2?"#c27cff":"#52dfff"} strokeWidth="2"/><circle cx={x} cy={y} r="3" fill="#e4f9ff"/></g>)}</g><circle className={styles.dnaPulse} cx="150" cy="150" r="16" fill="none" stroke="#8bdfff" strokeWidth="1.5"/></svg></div>
      <p>Conoce los seis estilos que formarán parte de tu identidad gamer.</p>
      <a className={styles.dnaSideButton} href="#dna-perfiles">EXPLORAR ESTILOS →</a>
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
