"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import {type PublicGameCard} from "../lib/games/public-catalog";
import styles from "../app/lirygames/lirygames.module.css";

const themes=["COMPETITIVO · ACCIÓN · MULTIJUGADOR","ESTRATEGIA · ACCIÓN · MULTIJUGADOR","EKONIA · ESTRATEGIA · SIMULACIÓN","SUPERVIVENCIA · RPG · MUNDO ABIERTO","SOCIAL · SIMULACIÓN · MULTIJUGADOR","FANTASÍA · RPG · MUNDO ABIERTO","PUZZLE · AVENTURA · EXPLORACIÓN","ESTRATEGIA · NFT · MULTIJUGADOR","PLATAFORMAS · AVENTURA · PUZZLES"];
const publicCodenames=["LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03","LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06","LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"];
const catalogArt=["/lirygames-games/skill-arena.webp","/lirygames-games/inflabots-arena.webp","/lirygames-games/la-batalla-del-dinero.webp","/lirygames-games/gaias-last-stand.webp","/lirygames-games/nexo-social.webp","/lirygames-games/eternun.webp","/lirygames-games/fragmentun.webp","/lirygames-games/cripto-titans.webp","/lirygames-games/codeverse.webp"];
const traits=["Explorador","Estratega","Competidor","Social","Acción","Creativo"];

export function LiryGameDiscovery({games}:{games:readonly PublicGameCard[]}){
  const catalogRef=useRef<HTMLDivElement>(null);
  const [catalogHeight,setCatalogHeight]=useState<number|null>(null);
  useEffect(()=>{
    const catalog=catalogRef.current;
    if(!catalog)return;
    const measure=()=>setCatalogHeight(Math.ceil(catalog.getBoundingClientRect().height));
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(catalog);
    return ()=>observer.disconnect();
  },[]);
  const dnaHeightStyle={"--liry-catalog-height":catalogHeight===null?undefined:`${catalogHeight}px`} as CSSProperties;
  return <div className={styles.worldShowcase}>
    <div className={styles.worldsGrid} ref={catalogRef}>
      {games.map((game,index)=><article className={styles.gameCard} key={game.slug} style={{["--world-index" as string]:index+1}}>
        <img className={styles.gameCardArt} src={catalogArt[index]} alt="" loading="lazy" decoding="async" />
        <div className={styles.cardContent}>
          <div className={styles.worldCardText}>
            <h3>{publicCodenames[index]??`LIRY // PROJECT-${String(index+1).padStart(2,"0")}`}</h3>
            <p>{themes[index]??game.tagline}</p>
            <span className={styles.worldAvailability}>{game.state==="available"?"DISPONIBLE":game.state==="beta"?"EN BETA":"PRÓXIMAMENTE"}</span>
          </div>
          <span className={styles.worldArrow} aria-hidden="true">→</span>
        </div>
      </article>)}
    </div>
    <aside className={styles.dnaSide} style={dnaHeightStyle} id="liry-dna" aria-labelledby="dna-side-title">
      <p className={styles.kicker}>EXPERIENCIA INTERACTIVA</p>
      <h3 id="dna-side-title">DESCUBRE TU <span>LIRY DNA</span></h3>
      <div className={styles.dnaArt} aria-hidden="true">
        <img className={styles.dnaMap} src="/liry-dna-cinematic.svg" alt="" loading="eager" decoding="async" /><img className={styles.dnaPhotoUpper} src="/LIRY_DNA_Hiperrealista.png" alt="" loading="eager" decoding="async" onLoad={(e)=>e.currentTarget.classList.add(styles.dnaPhotoLoaded)} onError={(e)=>e.currentTarget.style.display="none"} />
      </div>
      <p>Conoce los seis estilos que formarán parte de tu identidad gamer.</p>
      <a className={styles.dnaSideButton} href="#liry-dna">EXPLORAR ESTILOS →</a>
      <ul className={styles.dnaTraitList}>
        {traits.map((trait,i)=><li key={trait}><span className={styles.dnaTraitIndex}>{i+1}</span><span>{trait}</span><span className={styles.dnaTraitPending}>Por evaluar</span><span className={styles.dnaTraitTrack} aria-hidden="true"><span className={styles.dnaTraitShimmer}/></span></li>)}
      </ul>
      <small>Tu evaluación estará disponible al activar Liry DNA. No mostramos resultados ficticios.</small>
      <div className={styles.dnaContinuation} aria-hidden="true"><img className={styles.dnaPhotoLower} src="/LIRY_DNA_Hiperrealista.png" alt="" loading="eager" decoding="async" onLoad={(e)=>e.currentTarget.classList.add(styles.dnaPhotoLoaded)} onError={(e)=>e.currentTarget.style.display="none"} /><svg viewBox="0 0 320 460" preserveAspectRatio="none" role="presentation"><defs><linearGradient id="liryDnaContinuationGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#50dfff"/><stop offset="1" stopColor="#ba79ff"/></linearGradient><radialGradient id="liryDnaContinuationGlow"><stop stopColor="#36d9ff" stopOpacity=".4"/><stop offset="1" stopColor="#36d9ff" stopOpacity="0"/></radialGradient></defs><g className={styles.dnaContinuationHelix}><path d="M112 14 C232 72 84 120 208 172 S82 279 208 335 S120 392 160 425" fill="none" stroke="url(#liryDnaContinuationGradient)" strokeWidth="5"/><path d="M208 14 C88 72 236 120 112 172 S238 279 112 335 S200 392 160 425" fill="none" stroke="#62d5ff" strokeWidth="5" opacity=".78"/>{Array.from({length:16},(_,i)=>{const y=25+i*23;const x=160+46*Math.sin(i*1.27);return <line key={i} x1={x} x2={320-x} y1={y} y2={y} stroke={i%2?"#b78aff":"#71efff"} strokeWidth="2" opacity=".72"/>})}</g><g className={styles.dnaContinuationBase}><ellipse cx="160" cy="422" rx="132" ry="32" fill="url(#liryDnaContinuationGlow)"/><ellipse cx="160" cy="422" rx="115" ry="27" fill="none" stroke="#70dfff" strokeWidth="2" opacity=".8"/><ellipse cx="160" cy="422" rx="77" ry="16" fill="none" stroke="#c48aff" strokeWidth="2" opacity=".65"/></g></svg></div>
    </aside>

  </div>;
}
