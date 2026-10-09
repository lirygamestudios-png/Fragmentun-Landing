"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import {type PublicGameCard} from "../lib/games/public-catalog";
import styles from "../app/lirygames/lirygames.module.css";

const themes=["COMPETITIVO · ACCIÓN · MULTIJUGADOR","ESTRATEGIA · ACCIÓN · MULTIJUGADOR","EKONIA · ESTRATEGIA · SIMULACIÓN","SUPERVIVENCIA · RPG · MUNDO ABIERTO","SOCIAL · SIMULACIÓN · MULTIJUGADOR","FANTASÍA · RPG · MUNDO ABIERTO","PUZZLE · AVENTURA · EXPLORACIÓN","ESTRATEGIA · NFT · MULTIJUGADOR","PLATAFORMAS · AVENTURA · PUZZLES"];
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
    <aside className={styles.dnaSide} style={dnaHeightStyle} id="liry-dna" aria-labelledby="dna-side-title">
      <p className={styles.kicker}>EXPERIENCIA INTERACTIVA</p>
      <h3 id="dna-side-title">DESCUBRE TU <span>LIRY DNA</span></h3>
      <div className={styles.dnaArt} aria-hidden="true">
        <svg className={styles.dnaMap} viewBox="0 0 320 720" preserveAspectRatio="xMidYMid meet" role="presentation">
          <defs>
            <linearGradient id="liryDnaStrand" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#43e8ff"/><stop offset=".55" stopColor="#9388ff"/><stop offset="1" stopColor="#ce67f9"/></linearGradient>
            <radialGradient id="liryDnaBase"><stop stopColor="#3bdfff" stopOpacity=".45"/><stop offset="1" stopColor="#3bdfff" stopOpacity="0"/></radialGradient>
          </defs>
          <g className={styles.dnaRings}>
            <ellipse cx="160" cy="340" rx="126" ry="300"/>
            <ellipse cx="160" cy="340" rx="104" ry="270"/>
          </g>
          <g className={styles.dnaOrbit}>
            <ellipse cx="160" cy="340" rx="123" ry="65" transform="rotate(-29 160 340)"/>
            <ellipse cx="160" cy="340" rx="123" ry="65" transform="rotate(29 160 340)"/>
          </g>
          <g className={styles.dnaHelix}>
            <path d="M116 54 C245 115 78 178 204 244 S76 380 204 470 S76 555 204 615" fill="none" stroke="url(#liryDnaStrand)" strokeWidth="5" strokeLinecap="round"/>
            <path d="M204 54 C75 115 242 178 116 244 S244 380 116 470 S244 555 116 615" fill="none" stroke="#58ccff" strokeOpacity=".83" strokeWidth="5" strokeLinecap="round"/>
            {Array.from({length:24},(_,i)=>{const y=65+i*23;const x=160+45*Math.sin(i*1.28);return <line key={i} x1={x} x2={320-x} y1={y} y2={y} stroke={i%2?"#a879ff":"#65e4ff"} strokeOpacity=".7" strokeWidth="2.2"/>})}
          </g>
          <g className={styles.dnaConnections}>
            {[[52,120],[269,216],[50,320],[270,425],[65,535],[257,610]].map(([x,y],i)=><g key={i}>
              <path d={`M ${x} ${y} L 160 ${y}`} stroke={i%2?"#b28bff":"#59d8ff"} strokeOpacity=".37" strokeDasharray="4 5" fill="none"/>
              <circle cx={x} cy={y} r="9" fill="#07172c" stroke={i%2?"#c27cff":"#52dfff"} strokeWidth="2"/>
              <circle cx={x} cy={y} r="3" fill="#ebfbff"/>
            </g>)}
          </g>
          <g className={styles.dnaEnergyColumn}>
            <path d="M116 615 Q134 646 160 669" fill="none" stroke="#58e4ff" strokeWidth="2" strokeOpacity=".48"/>
            <path d="M204 615 Q186 646 160 669" fill="none" stroke="#bd81ff" strokeWidth="2" strokeOpacity=".48"/>
            <path d="M160 614 L160 670" fill="none" stroke="#8cf6ff" strokeWidth="3" strokeOpacity=".5" strokeDasharray="5 10"/>
            {Array.from({length:9},(_,i)=><circle key={i} cx={160+Math.sin(i*1.7)*((i%3)+1)*11} cy={618+i*6} r={i%2?1.5:2.3} fill={i%2?"#c49cff":"#79efff"} opacity=".8"/>)}
          </g>
          <g className={styles.dnaPlatform}>
            <ellipse cx="160" cy="669" rx="137" ry="43" fill="url(#liryDnaBase)"/>
            <ellipse cx="160" cy="669" rx="120" ry="31" fill="none" stroke="#60d5ff" strokeOpacity=".8" strokeWidth="2"/>
            <ellipse cx="160" cy="669" rx="89" ry="22" fill="none" stroke="#a588ff" strokeOpacity=".7" strokeWidth="1.5"/>
            <ellipse cx="160" cy="669" rx="54" ry="12" fill="none" stroke="#74eeff" strokeOpacity=".9" strokeWidth="2"/>
          </g>
          <circle className={styles.dnaPulse} cx="160" cy="340" r="15" fill="none" stroke="#8bdfff" strokeWidth="1.5"/>
        </svg>
      </div>
      <p>Conoce los seis estilos que formarán parte de tu identidad gamer.</p>
      <a className={styles.dnaSideButton} href="#dna-perfiles">EXPLORAR ESTILOS →</a>
      <ul className={styles.dnaTraitList}>
        {traits.map((trait,i)=><li key={trait}><span className={styles.dnaTraitIndex}>{i+1}</span><span>{trait}</span><span className={styles.dnaTraitPending}>Por evaluar</span><span className={styles.dnaTraitTrack} aria-hidden="true"><span className={styles.dnaTraitShimmer}/></span></li>)}
      </ul>
      <small>Tu evaluación estará disponible al activar Liry DNA. No mostramos resultados ficticios.</small>
      <div className={styles.dnaContinuation} aria-hidden="true"><svg viewBox="0 0 320 460" preserveAspectRatio="xMidYMid meet" role="presentation"><defs><linearGradient id="liryDnaContinuationGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#50dfff"/><stop offset="1" stopColor="#ba79ff"/></linearGradient><radialGradient id="liryDnaContinuationGlow"><stop stopColor="#36d9ff" stopOpacity=".4"/><stop offset="1" stopColor="#36d9ff" stopOpacity="0"/></radialGradient></defs><g className={styles.dnaContinuationHelix}><path d="M112 14 C232 72 84 120 208 172 S82 279 208 335 S120 392 160 425" fill="none" stroke="url(#liryDnaContinuationGradient)" strokeWidth="5"/><path d="M208 14 C88 72 236 120 112 172 S238 279 112 335 S200 392 160 425" fill="none" stroke="#62d5ff" strokeWidth="5" opacity=".78"/>{Array.from({length:16},(_,i)=>{const y=25+i*23;const x=160+46*Math.sin(i*1.27);return <line key={i} x1={x} x2={320-x} y1={y} y2={y} stroke={i%2?"#b78aff":"#71efff"} strokeWidth="2" opacity=".72"/>})}</g><g className={styles.dnaContinuationBase}><ellipse cx="160" cy="422" rx="132" ry="32" fill="url(#liryDnaContinuationGlow)"/><ellipse cx="160" cy="422" rx="115" ry="27" fill="none" stroke="#70dfff" strokeWidth="2" opacity=".8"/><ellipse cx="160" cy="422" rx="77" ry="16" fill="none" stroke="#c48aff" strokeWidth="2" opacity=".65"/></g></svg></div>
    </aside>
    <div className={styles.worldsNotes}>
      {games.map((game)=><div id={`detalle-${game.slug}`} key={game.slug} className={styles.worldNote}><strong>{game.title}</strong><span>{game.state==="coming_soon"?"Lanzamiento pendiente. Tres mundos gratuitos previstos y cosméticos opcionales.":game.state==="beta"?"Beta sujeta a acceso verificado.":"Consulta el acceso oficial publicado."}</span></div>)}
    </div>
  </div>;
}
