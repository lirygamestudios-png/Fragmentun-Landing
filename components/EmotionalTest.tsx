"use client";

import { useMemo,useState } from "react";
import type { Locale } from "../lib/i18n";

type Option={id:string;label_es:string;label_en:string;score_key:"vorax"|"umbral"|"ethelis"|"nara";score_value:number};
type Question={id:string;prompt_es:string;prompt_en:string;sort_order:number;test_options:Option[]};
type Profile={profile_key:string;name_es:string;name_en:string;description_es:string;description_en:string;superpower_es:string;superpower_en:string;color:string|null};

export function EmotionalTest({locale,questions,profiles}:{locale:Locale;questions:Question[];profiles:Profile[]}) {
  const [started,setStarted]=useState(false);
  const [index,setIndex]=useState(0);
  const [scores,setScores]=useState({vorax:0,umbral:0,ethelis:0,nara:0});
  const [done,setDone]=useState(false);

  const profileMap=useMemo(()=>Object.fromEntries(profiles.map(p=>[p.profile_key,p])),[profiles]);

  function choose(option:Option){
    const next={...scores,[option.score_key]:scores[option.score_key]+(option.score_value||1)};
    setScores(next);
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:index===0?"test_start":"map_interaction",locale,path:`/${locale}/test`,metadata:{question:index+1}
    }),keepalive:true}).catch(()=>{});
    if(index>=questions.length-1){
      setDone(true);
      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        event_name:"test_complete",locale,path:`/${locale}/test`,metadata:{scores:next}
      }),keepalive:true}).catch(()=>{});
    } else setIndex(index+1);
  }

  const resultKey=useMemo(()=>{
    const entries=Object.entries(scores) as [keyof typeof scores,number][];
    const max=Math.max(...entries.map(([,v])=>v));
    const winners=entries.filter(([,v])=>v===max);
    return winners.length===1?winners[0][0]:"balance";
  },[scores]);
  const result=profileMap[resultKey];

  if(!started){
    return <section className="testPanel">
      <div className="kicker">{locale==="es"?"Experiencia narrativa":"Narrative experience"}</div>
      <h1>{locale==="es"?"¿Qué emoción domina tu forma de enfrentar el mundo?":"Which emotion shapes how you face the world?"}</h1>
      <p className="lead">{locale==="es"
        ?"Responde 12 preguntas y descubre con qué territorio emocional de FRAGMENTUN tienes mayor afinidad. Es una experiencia narrativa de entretenimiento, no una evaluación clínica."
        :"Answer 12 questions and discover which FRAGMENTUN emotional territory you align with most. This is a narrative entertainment experience, not a clinical assessment."}</p>
      <button className="btn btnPrimary" onClick={()=>setStarted(true)}>{locale==="es"?"Comenzar el test":"Start the test"}</button>
    </section>;
  }

  if(done&&result){
    return <section className="testPanel">
      <div className="kicker">{locale==="es"?"Tu perfil":"Your profile"}</div>
      <h1 style={{color:result.color||"#C9A84C"}}>{locale==="es"?result.name_es:result.name_en}</h1>
      <p className="lead">{locale==="es"?result.description_es:result.description_en}</p>
      <div className="resultPill">{locale==="es"?"Fortaleza":"Strength"}: {locale==="es"?result.superpower_es:result.superpower_en}</div>
      <div className="scoreGrid">
        {(["vorax","umbral","ethelis","nara"] as const).map(key=><div className="scoreCard" key={key}>
          <strong>{profileMap[key]?.[locale==="es"?"name_es":"name_en"]||key}</strong>
          <span>{scores[key]}</span>
        </div>)}
      </div>
      <button className="btn btnGhost" onClick={()=>{setStarted(false);setDone(false);setIndex(0);setScores({vorax:0,umbral:0,ethelis:0,nara:0})}}>
        {locale==="es"?"Repetir test":"Retake test"}
      </button>
    </section>;
  }

  const q=questions[index];
  return <section className="testPanel">
    <div className="testProgress"><span style={{width:`${((index+1)/questions.length)*100}%`}}/></div>
    <div className="note">{locale==="es"?"Pregunta":"Question"} {index+1} / {questions.length}</div>
    <h2>{locale==="es"?q.prompt_es:q.prompt_en}</h2>
    <div className="testOptions">
      {q.test_options.sort((a,b)=>a.id.localeCompare(b.id)).map(option=><button key={option.id} className="testOption" onClick={()=>choose(option)}>
        {locale==="es"?option.label_es:option.label_en}
      </button>)}
    </div>
  </section>;
}
