"use client";
import {useEffect,useRef,useState,type CSSProperties} from "react";
import {type PublicGameCard} from "../lib/games/public-catalog";
import {rankApprovedLiryDnaCatalog,type LiryApprovedDnaCatalogRecord} from "../lib/games/liry-dna-catalog-bridge";
import styles from "../app/lirygames/lirygames.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";






const publicCodenames=["LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03","LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06","LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"];
const catalogArt=["/liry-assets/world-01.webp","/liry-assets/world-02.webp","/liry-assets/world-03.webp","/liry-assets/world-04.webp","/liry-assets/world-05.webp","/liry-assets/world-06.webp","/liry-assets/world-07.webp","/liry-assets/world-08.webp","/liry-assets/world-09.webp"];





/* Afinidades editoriales orientativas (exploración, estrategia, competencia, social, acción, creatividad).
   No son telemetría ni resultados de gameplay; solo correspondencia declarada por catálogo. */
const gameAffinity:number[][]=[
 [1,1,3,2,3,0],[1,3,3,1,2,1],[1,3,1,0,0,2],
 [3,2,1,1,3,1],[1,0,1,3,0,2],[3,2,0,1,2,2],
 [3,1,0,1,1,3],[2,3,2,1,1,1],[2,2,1,1,1,3]
];

export function LiryGameDiscovery({games,locale="es",approvedDnaCatalog}:{games:readonly PublicGameCard[],locale?:LiryFrontdeskLocale,approvedDnaCatalog?:readonly LiryApprovedDnaCatalogRecord[]}){
 const dnaCopy=liryFrontdeskStrings(locale).gamerDna;
 const detailCopy=liryFrontdeskStrings(locale).dnaDetails;
 const accessibilityCopy=liryFrontdeskStrings(locale).dnaExplorerAccessibility;
 const cardCopy=liryFrontdeskStrings(locale).gameCards;
 const themes=cardCopy.themes;
 const traits=dnaCopy.traits;
 const traitDescriptions=detailCopy.descriptions
 const dnaQuestions=dnaCopy.questions;
 const dnaOptions=dnaCopy.answers.map((label,value)=>({label,value}));

  const catalogRef=useRef<HTMLDivElement>(null);
  const advanceTimerRef=useRef<ReturnType<typeof setTimeout>|null>(null);
  const clearAdvanceTimer=()=>{if(advanceTimerRef.current!==null){clearTimeout(advanceTimerRef.current);advanceTimerRef.current=null;}};
  const gameCloseRef=useRef<HTMLButtonElement>(null);
  const gameTriggersRef=useRef<(HTMLButtonElement|null)[]>([]);
  const explorerCloseRef=useRef<HTMLButtonElement>(null);
  const explorerOpenRef=useRef<HTMLButtonElement>(null);
  const [exploringDna,setExploringDna]=useState(false);
  const [activeTrait,setActiveTrait]=useState(0);
  const [dnaSurvey,setDnaSurvey]=useState(false);
  const [dnaStep,setDnaStep]=useState(0);
  const [dnaAnswers,setDnaAnswers]=useState<(number|null)[]>(Array(6).fill(null));
  const [selectedGame,setSelectedGame]=useState<number|null>(null);
  const [catalogHeight,setCatalogHeight]=useState<number|null>(null);
  const resetDnaEvaluation=(preserveStyle=false)=>{
    clearAdvanceTimer();
    if(!preserveStyle)window.dispatchEvent(new CustomEvent("liry:dna-style",{detail:{style:null}}));
    setDnaSurvey(false);setDnaStep(0);setDnaAnswers(Array(6).fill(null));setActiveTrait(0);
  };
  const closeDnaExplorer=()=>{
    const completed=dnaStep===6&&dnaAnswers.every(answer=>answer!==null);
    const scores=completed?dnaAnswers.map(answer=>answer??0):[];
    const max=completed?Math.max(...scores):0;
    const chosen=max>0?traits[scores.indexOf(max)]:null;
    if(chosen)window.dispatchEvent(new CustomEvent("liry:dna-closed",{detail:{style:chosen,durationMs:10000}}));
    setExploringDna(false);resetDnaEvaluation(Boolean(chosen));explorerOpenRef.current?.focus({preventScroll:true});
  };
  useEffect(()=>()=>clearAdvanceTimer(),[]);
  useEffect(()=>{
    const catalog=catalogRef.current;
    if(!catalog)return;
    const measure=()=>setCatalogHeight(Math.ceil(catalog.getBoundingClientRect().height));
    measure();
    const observer=new ResizeObserver(measure);
    observer.observe(catalog);
    return ()=>observer.disconnect();
  },[]);
  // Enfocar el cierre solo cuando se abre: responder preguntas no debe robar el foco.
  useEffect(()=>{
    if(exploringDna)explorerCloseRef.current?.focus({preventScroll:true});
  },[exploringDna]);
  useEffect(()=>{
    if(!exploringDna)return;
    const onKeyDown=(event:KeyboardEvent)=>{
      if(event.key==="Escape"){
        closeDnaExplorer();
      }
    };
    window.addEventListener("keydown",onKeyDown);
    return ()=>window.removeEventListener("keydown",onKeyDown);
  },[exploringDna,dnaStep,dnaAnswers]);
  useEffect(()=>{
    if(selectedGame===null)return;
    gameCloseRef.current?.focus({preventScroll:true});
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){const index=selectedGame;setSelectedGame(null);requestAnimationFrame(()=>gameTriggersRef.current[index]?.focus({preventScroll:true}));}};
    window.addEventListener("keydown",onKey);
    return ()=>window.removeEventListener("keydown",onKey);
  },[selectedGame]);
  const closeGameDetails=()=>{
    if(selectedGame===null)return;
    const index=selectedGame;
    setSelectedGame(null);
    requestAnimationFrame(()=>gameTriggersRef.current[index]?.focus({preventScroll:true}));
  };

  // Preferencia local efímera: nunca XP ni identidad autenticada.
  useEffect(()=>{
    const completed=dnaStep===6&&dnaAnswers.every(answer=>answer!==null);
    const scores=completed?dnaAnswers.map(answer=>answer??0):[];
    const max=completed?Math.max(...scores):0;
    const chosen=max>0?traits[scores.indexOf(max)]:null;
    if(completed)window.dispatchEvent(new CustomEvent("liry:dna-style",{detail:{style:chosen}}));
  },[dnaStep,dnaAnswers]);
  const hasDnaResults=dnaStep===6&&dnaAnswers.every(answer=>answer!==null)&&dnaAnswers.some(answer=>answer!==0);
  const approvedRankings=hasDnaResults&&approvedDnaCatalog?.length?rankApprovedLiryDnaCatalog(approvedDnaCatalog,dnaAnswers.map(n=>n??0),3):[];
  const recommendedIndexes=approvedDnaCatalog?.length?(hasDnaResults?approvedRankings.map(rank=>games.findIndex(game=>game.slug===rank.publicId)).filter(index=>index>=0):[]):hasDnaResults?[...games.map((game,i)=>({i,score:gameAffinity[i]?.reduce((sum,weight,j)=>sum+weight*(dnaAnswers[j]??0),0)??0}))].sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,3).map(entry=>entry.i):[];
  const dnaHeightStyle={"--liry-catalog-height":catalogHeight===null?undefined:`${catalogHeight}px`} as CSSProperties;
  return <div className={styles.worldShowcase}>
    <div className={styles.worldsGrid} ref={catalogRef}>
      {games.map((game,index)=><article className={`${styles.gameCard} ${recommendedIndexes.includes(index)?styles.gameCardRecommended:""}`} key={game.slug} id={`liry-world-${String(index+1).padStart(2,"0")}`} style={{["--world-index" as string]:index+1}}>
        {recommendedIndexes.includes(index)&&<span className={styles.gameRecommendedLabel}>{detailCopy.recommended}</span>}
        <img className={styles.gameCardArt} src={catalogArt[index]} alt="" loading="lazy" decoding="async" />
        <div className={styles.cardContent}>
          <div className={styles.worldCardText}>
            <h3>{publicCodenames[index]??`LIRY // PROJECT-${String(index+1).padStart(2,"0")}`}</h3>
            <p>{themes[index]??game.tagline}</p>
            <span className={styles.worldAvailability}>{game.state==="available"?cardCopy.available:game.state==="beta"?cardCopy.beta:cardCopy.comingSoon}</span>
          </div>
          <span className={styles.worldArrow} aria-hidden="true">→</span>
          <button type="button" ref={node=>{gameTriggersRef.current[index]=node}} className={styles.worldCardOpen} aria-label={`${cardCopy.detailsAria} ${publicCodenames[index]??game.title}`} onClick={()=>setSelectedGame(index)} />
        </div>
      </article>)}
    </div>
    {selectedGame!==null&&<div className={styles.worldDetailBackdrop} onClick={closeGameDetails}><section className={styles.worldDetailDialog} role="dialog" aria-modal="true" aria-labelledby="liry-world-dialog-title" onClick={e=>e.stopPropagation()}><button type="button" ref={gameCloseRef} className={styles.worldDetailClose} onClick={closeGameDetails} aria-label={cardCopy.closeAria}>×</button><img src={catalogArt[selectedGame]} alt="" /><div className={styles.worldDetailBody}><p className={styles.kicker}>{cardCopy.universe}</p><h3 id="liry-world-dialog-title">{publicCodenames[selectedGame]}</h3><p>{themes[selectedGame]}</p><strong>{games[selectedGame].state==="available"?cardCopy.available:games[selectedGame].state==="beta"?cardCopy.beta:cardCopy.comingSoon}</strong><p>{cardCopy.preparing}</p><a href="#contacto" onClick={()=>setSelectedGame(null)}>{cardCopy.contact} →</a></div></section></div>}
    <aside className={styles.dnaSide} style={dnaHeightStyle} id="liry-dna" aria-labelledby="dna-side-title">
      <p className={styles.kicker}>{accessibilityCopy.kicker}</p>
      <h3 id="dna-side-title">{accessibilityCopy.titlePrefix} <span>LIRY DNA</span></h3>
      <div className={styles.dnaArt} aria-hidden="true">
        <img className={styles.dnaMap} src="/liry-dna-cinematic.svg" alt="" loading="eager" decoding="async" /><img className={styles.dnaPhotoUpper} src="/LIRY_DNA_Hiperrealista.png" alt="" loading="eager" decoding="async" onLoad={(e)=>e.currentTarget.classList.add(styles.dnaPhotoLoaded)} onError={(e)=>e.currentTarget.style.display="none"} />
      </div>
      <p>{detailCopy.stylesIntro}</p>
      <button type="button" ref={explorerOpenRef} className={styles.dnaSideButton} aria-expanded={exploringDna} aria-controls="liry-dna-explorer" onClick={()=>exploringDna?closeDnaExplorer():setExploringDna(true)}>{`${detailCopy.exploreStyles} →`}</button>
      {exploringDna&&<div id="liry-dna-explorer" className={styles.dnaExplorer}><div className={styles.dnaExplorerHeading}><p className={styles.dnaExplorerLabel}>{dnaCopy.explore}</p><button type="button" ref={explorerCloseRef} className={styles.dnaExplorerClose} onClick={closeDnaExplorer} aria-label={accessibilityCopy.closeAria} title={accessibilityCopy.closeTitle}>×</button></div><div className={styles.dnaExplorerChoices} role="group" aria-label={accessibilityCopy.stylesAria}>{traits.map((trait,i)=><button type="button" key={trait} className={activeTrait===i?styles.dnaExplorerSelected:styles.dnaExplorerChoice} onClick={()=>setActiveTrait(i)} aria-pressed={activeTrait===i}>{trait}</button>)}</div><p className={styles.dnaExplorerDescription}><strong>{traits[activeTrait]}</strong> — {traitDescriptions[activeTrait]}</p><small>{detailCopy.infoNote}</small>
      <button type="button" className={styles.dnaSurveyToggle} onClick={()=>{if(dnaSurvey)resetDnaEvaluation();else setDnaSurvey(true)}} aria-expanded={dnaSurvey}>{dnaSurvey?dnaCopy.hide:`${dnaCopy.survey} →`}</button>
      {dnaSurvey&&<div className={styles.dnaSurvey} aria-label={accessibilityCopy.surveyAria}>
        <p>{detailCopy.surveyIntro}</p>
        {dnaQuestions.map((question,i)=>i!==dnaStep?null:<fieldset key={question} className={styles.dnaSurveyQuestion}><legend>{i+1}. {question}</legend><div className={styles.dnaSurveyAnswers}>{dnaOptions.map(option=><label key={option.value} className={dnaAnswers[i]===option.value?styles.dnaSurveyAnswerSelected:undefined}>{option.label}<input type="radio" name={`liry-dna-q-${i}`} checked={dnaAnswers[i]===option.value} onChange={()=>{clearAdvanceTimer();setDnaAnswers(current=>current.map((answer,index)=>index===i?option.value:answer));advanceTimerRef.current=setTimeout(()=>{setDnaStep(Math.min(i+1,6));advanceTimerRef.current=null;},420);}}/></label>)}</div></fieldset>)}
        {dnaStep===6&&dnaAnswers.every(answer=>answer!==null)?
          <div className={styles.dnaSurveyResult} aria-live="polite"><h4>{detailCopy.resultTitle}</h4>
            {traits.map((trait,i)=><div className={styles.dnaResultRow} key={trait}><span>{trait}</span><div className={styles.dnaAffinityTrack} role="progressbar" aria-label={trait} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round((dnaAnswers[i]??0)/3*100)} style={{["--dna-accent" as string]:["#19d7ff","#ad58f4","#f5685f","#ffd34c","#d65ef7","#7665ff"][i]}}><span style={{width:`${Math.round((dnaAnswers[i]??0)/3*100)}%`}} /></div><strong>{Math.round((dnaAnswers[i]??0)/3*100)}%</strong></div>)}
            <h4>{detailCopy.recommendations}</h4>
            {dnaAnswers.every(answer=>answer===0)?<p>{detailCopy.noPreferences}</p>:<>
            {[...games.map((game,i)=>({game,i,score:gameAffinity[i]?.reduce((sum,weight,j)=>sum+weight*(dnaAnswers[j]??0),0)??0}))]
              .sort((a,b)=>b.score-a.score||a.i-b.i).slice(0,3).map(({game,i})=><button type="button" key={game.slug} className={styles.dnaRecommendation} onClick={()=>{setExploringDna(false);resetDnaEvaluation();setSelectedGame(i)}}>{publicCodenames[i]??`LIRY // PROJECT-${String(i+1).padStart(2,"0")}`} <span>{detailCopy.viewCard} →</span></button>)}</>}
            <small>{detailCopy.recommendationNote}</small>
            <button type="button" className={styles.dnaSurveyRestart} onClick={()=>{clearAdvanceTimer();window.dispatchEvent(new CustomEvent("liry:dna-style",{detail:{style:null}}));setDnaAnswers(Array(6).fill(null));setDnaStep(0);requestAnimationFrame(()=>document.querySelector<HTMLInputElement>('input[name="liry-dna-q-0"]')?.focus({preventScroll:true}));}}>{detailCopy.restart}</button>
          </div>:<div className={styles.dnaSurveyProgress} aria-live="polite"><span>{detailCopy.question} {dnaStep+1} {detailCopy.of} 6</span><progress value={dnaStep} max={6} aria-label={accessibilityCopy.progressAria} />{dnaStep>0&&<button type="button" className={styles.dnaSurveyBack} onClick={()=>{clearAdvanceTimer();setDnaStep(step=>Math.max(0,step-1));}}>← {detailCopy.previous}</button>}</div>}
      </div>}</div>}
      <ul className={styles.dnaTraitList}>
        {traits.map((trait,i)=><li key={trait}><span className={styles.dnaTraitIndex}>{i+1}</span><span>{trait}</span><span className={styles.dnaTraitPending}>{detailCopy.pending}</span><span className={styles.dnaTraitTrack} aria-hidden="true"><span className={styles.dnaTraitShimmer}/></span></li>)}
      </ul>
      <small>{accessibilityCopy.disclaimer}</small>
      <div className={styles.dnaContinuation} aria-hidden="true"><img className={styles.dnaPhotoLower} src="/LIRY_DNA_Hiperrealista.png" alt="" loading="eager" decoding="async" onLoad={(e)=>e.currentTarget.classList.add(styles.dnaPhotoLoaded)} onError={(e)=>e.currentTarget.style.display="none"} /><svg viewBox="0 0 320 460" preserveAspectRatio="none" role="presentation"><defs><linearGradient id="liryDnaContinuationGradient" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#50dfff"/><stop offset="1" stopColor="#ba79ff"/></linearGradient><radialGradient id="liryDnaContinuationGlow"><stop stopColor="#36d9ff" stopOpacity=".4"/><stop offset="1" stopColor="#36d9ff" stopOpacity="0"/></radialGradient></defs><g className={styles.dnaContinuationHelix}><path d="M112 14 C232 72 84 120 208 172 S82 279 208 335 S120 392 160 425" fill="none" stroke="url(#liryDnaContinuationGradient)" strokeWidth="5"/><path d="M208 14 C88 72 236 120 112 172 S238 279 112 335 S200 392 160 425" fill="none" stroke="#62d5ff" strokeWidth="5" opacity=".78"/>{Array.from({length:16},(_,i)=>{const y=25+i*23;const x=160+46*Math.sin(i*1.27);return <line key={i} x1={x} x2={320-x} y1={y} y2={y} stroke={i%2?"#b78aff":"#71efff"} strokeWidth="2" opacity=".72"/>})}</g><g className={styles.dnaContinuationBase}><ellipse cx="160" cy="422" rx="132" ry="32" fill="url(#liryDnaContinuationGlow)"/><ellipse cx="160" cy="422" rx="115" ry="27" fill="none" stroke="#70dfff" strokeWidth="2" opacity=".8"/><ellipse cx="160" cy="422" rx="77" ry="16" fill="none" stroke="#c48aff" strokeWidth="2" opacity=".65"/></g></svg></div>
    </aside>

  </div>;
}
