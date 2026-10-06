"use client";

import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import type { Locale } from "../lib/i18n";

type ScoreKey="vorax"|"umbral"|"ethelis"|"nara";
type Option={
  id:string;
  label_es:string;
  label_en:string;
  score_key:ScoreKey;
  score_value:number;
  sort_order:number;
};
type Question={
  id:string;
  prompt_es:string;
  prompt_en:string;
  sort_order:number;
  test_options:Option[];
};
type Profile={
  profile_key:string;
  name_es:string;
  name_en:string;
  description_es:string;
  description_en:string;
  superpower_es:string;
  superpower_en:string;
  color:string|null;
};

export function EmotionalTest({locale,questions,profiles}:{locale:Locale;questions:Question[];profiles:Profile[]}) {
  const [started,setStarted]=useState(false);
  const [index,setIndex]=useState(0);
  const [scores,setScores]=useState<Record<ScoreKey,number>>({vorax:0,umbral:0,ethelis:0,nara:0});
  const [done,setDone]=useState(false);
  const [email,setEmail]=useState("");
  const [name,setName]=useState("");
  const [consent,setConsent]=useState(false);
  const [shareStatus,setShareStatus]=useState("");
  const [utm,setUtm]=useState({source:"",medium:"",campaign:"",content:""});

  useEffect(()=>{
    setUtm({
      source:sessionStorage.getItem("utm_source")||"",
      medium:sessionStorage.getItem("utm_medium")||"",
      campaign:sessionStorage.getItem("utm_campaign")||"",
      content:sessionStorage.getItem("utm_content")||""
    });
  },[]);

  const profileMap=useMemo(()=>Object.fromEntries(profiles.map(p=>[p.profile_key,p])),[profiles]);

  function track(event_name:string,metadata?:Record<string,unknown>){
    fetch("/api/analytics",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        event_name,
        locale,
        path:`/${locale}/test`,
        source:utm.source,
        medium:utm.medium,
        campaign:utm.campaign,
        content:utm.content,
        metadata
      }),
      keepalive:true
    }).catch(()=>{});
  }

  function start(){
    if(!questions.length)return;
    setStarted(true);
    track("test_start",{question_count:questions.length});
  }

  function choose(option:Option){
    const next={...scores,[option.score_key]:scores[option.score_key]+(option.score_value||1)};
    setScores(next);

    if(index>=questions.length-1){
      const entries=Object.entries(next) as [ScoreKey,number][];
      const max=Math.max(...entries.map(([,v])=>v));
      const winners=entries.filter(([,v])=>v===max);
      const completedProfile=winners.length===1?winners[0][0]:"balance";
      setDone(true);
      track("test_complete",{scores:next,profile:completedProfile,question_count:questions.length});
    }else{
      setIndex(index+1);
    }
  }

  const resultKey=useMemo(()=>{
    const entries=Object.entries(scores) as [ScoreKey,number][];
    const max=Math.max(...entries.map(([,v])=>v));
    const winners=entries.filter(([,v])=>v===max);
    return winners.length===1?winners[0][0]:"balance";
  },[scores]);

  const result=profileMap[resultKey];

  function roundedRect(ctx:CanvasRenderingContext2D,x:number,y:number,w:number,h:number,r:number){
    const radius=Math.min(r,w/2,h/2);
    ctx.beginPath();
    ctx.moveTo(x+radius,y);
    ctx.arcTo(x+w,y,x+w,y+h,radius);
    ctx.arcTo(x+w,y+h,x,y+h,radius);
    ctx.arcTo(x,y+h,x,y,radius);
    ctx.arcTo(x,y,x+w,y,radius);
    ctx.closePath();
  }

  function wrapCanvasText(ctx:CanvasRenderingContext2D,text:string,maxWidth:number){
    const words=text.split(/\s+/);
    const lines:string[]=[];
    let line="";
    for(const word of words){
      const test=line?line+" "+word:word;
      if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}
      else line=test;
    }
    if(line)lines.push(line);
    return lines;
  }

  async function createResultCard(){
    if(!result)return null;
    const canvas=document.createElement("canvas");
    canvas.width=1080;
    canvas.height=1350;
    const ctx=canvas.getContext("2d");
    if(!ctx)return null;

    const profileName=locale==="es"?result.name_es:result.name_en;
    const strength=locale==="es"?result.superpower_es:result.superpower_en;
    const description=locale==="es"?result.description_es:result.description_en;
    const total=Object.values(scores).reduce((a,b)=>a+b,0);
    const dominant=Math.max(...Object.values(scores));
    const affinity=total?Math.round(dominant/total*100):0;
    const accent=result.color||"#C9A84C";

    const bg=ctx.createLinearGradient(0,0,1080,1350);
    bg.addColorStop(0,"#07101d");
    bg.addColorStop(.55,"#0A1628");
    bg.addColorStop(1,"#050a12");
    ctx.fillStyle=bg;
    ctx.fillRect(0,0,1080,1350);

    const glow=ctx.createRadialGradient(790,300,0,790,300,520);
    glow.addColorStop(0,accent+"55");
    glow.addColorStop(1,"transparent");
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,1080,900);

    ctx.strokeStyle="#C9A84C88";
    ctx.lineWidth=3;
    roundedRect(ctx,55,55,970,1240,34);
    ctx.stroke();

    ctx.fillStyle="#C9A84C";
    ctx.font="700 32px Georgia, serif";
    ctx.textAlign="center";
    ctx.fillText("FRAGMENTUN",540,135);
    ctx.font="600 18px Arial, sans-serif";
    ctx.letterSpacing="4px" as any;
    ctx.fillText(locale==="es"?"TEST EMOCIONAL":"EMOTIONAL TEST",540,177);

    ctx.fillStyle="#ffffff";
    ctx.font="700 30px Arial, sans-serif";
    ctx.fillText(locale==="es"?"MI PERFIL EMOCIONAL ES":"MY EMOTIONAL PROFILE IS",540,300);

    ctx.fillStyle=accent;
    ctx.font="700 92px Georgia, serif";
    const nameLines=wrapCanvasText(ctx,profileName.toUpperCase(),850);
    nameLines.slice(0,2).forEach((line,i)=>ctx.fillText(line,540,410+i*105));

    ctx.fillStyle="#ffffff";
    ctx.font="600 25px Arial, sans-serif";
    ctx.fillText(locale==="es"?"AFINIDAD DOMINANTE":"DOMINANT AFFINITY",540,625);
    ctx.fillStyle="#C9A84C";
    ctx.font="700 72px Arial, sans-serif";
    ctx.fillText(affinity+"%",540,705);

    ctx.fillStyle="#dbe6f1";
    ctx.font="400 30px Arial, sans-serif";
    const descLines=wrapCanvasText(ctx,description,820).slice(0,4);
    descLines.forEach((line,i)=>ctx.fillText(line,540,805+i*44));

    ctx.fillStyle="#ffffff";
    ctx.font="700 23px Arial, sans-serif";
    ctx.fillText(locale==="es"?"FORTALEZA":"STRENGTH",540,1030);
    ctx.fillStyle=accent;
    ctx.font="700 34px Arial, sans-serif";
    wrapCanvasText(ctx,strength,780).slice(0,2).forEach((line,i)=>ctx.fillText(line,540,1080+i*42));

    ctx.strokeStyle="#ffffff22";
    ctx.beginPath();ctx.moveTo(170,1192);ctx.lineTo(910,1192);ctx.stroke();
    ctx.fillStyle="#C9A84C";
    ctx.font="700 25px Arial, sans-serif";
    ctx.fillText(locale==="es"?"DESCUBRE EL TUYO":"DISCOVER YOURS",540,1245);
    ctx.fillStyle="#ffffff";
    ctx.font="600 24px Arial, sans-serif";
    ctx.fillText("fragmentun.com/"+locale+"/test",540,1283);

    return await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png",.95));
  }

  async function shareResultCard(){
    const blob=await createResultCard();
    if(!blob)return;
    const profileName=locale==="es"?result?.name_es:result?.name_en;
    const file=new File([blob],`fragmentun-perfil-${String(resultKey)}.png`,{type:"image/png"});
    const url=`${window.location.origin}/${locale}/test`;
    const text=locale==="es"
      ?`Mi perfil emocional en FRAGMENTUN es ${profileName}. ¿Cuál es el tuyo?`
      :`My FRAGMENTUN emotional profile is ${profileName}. What's yours?`;
    try{
      if(navigator.share&&navigator.canShare?.({files:[file]})){
        await navigator.share({title:"FRAGMENTUN · Test Emocional",text,url,files:[file]});
        track("test_result_share",{profile:resultKey,method:"image"});
        setShareStatus(locale==="es"?"Tarjeta compartida.":"Card shared.");
        return;
      }
      if(navigator.share){
        await navigator.share({title:"FRAGMENTUN · Test Emocional",text,url});
        track("test_result_share",{profile:resultKey,method:"link"});
        setShareStatus(locale==="es"?"Resultado compartido.":"Result shared.");
        return;
      }
      await downloadResultCard(blob);
      setShareStatus(locale==="es"?"Tu tarjeta se descargó para que puedas compartirla.":"Your card was downloaded so you can share it.");
    }catch(err:any){
      if(err?.name!=="AbortError")setShareStatus(locale==="es"?"No fue posible compartir. Puedes descargar la tarjeta.":"Could not share. You can download the card.");
    }
  }

  async function downloadResultCard(existing?:Blob){
    const blob=existing||await createResultCard();
    if(!blob)return;
    const a=document.createElement("a");
    a.href=URL.createObjectURL(blob);
    a.download=`fragmentun-perfil-${String(resultKey)}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href),1000);
    track("test_result_download",{profile:resultKey});
  }

  if(!questions.length){
    return <section className="testPanel">
      <div className="kicker">{locale==="es"?"Experiencia narrativa":"Narrative experience"}</div>
      <h1>{locale==="es"?"El test está siendo preparado":"The test is being prepared"}</h1>
      <p className="lead">{locale==="es"
        ?"Las preguntas no están disponibles temporalmente. Vuelve a intentarlo más tarde."
        :"The questions are temporarily unavailable. Please try again later."}</p>
    </section>;
  }

  if(!started){
    return <section className="testPanel">
      <div className="kicker">{locale==="es"?"Experiencia narrativa":"Narrative experience"}</div>
      <h1>{locale==="es"?"¿Qué emoción domina tu forma de enfrentar el mundo?":"Which emotion shapes how you face the world?"}</h1>
      <p className="lead">{locale==="es"
        ?"Responde 12 preguntas y descubre con qué territorio emocional de FRAGMENTUN tienes mayor afinidad. Es una experiencia narrativa de entretenimiento, no una evaluación clínica."
        :"Answer 12 questions and discover which FRAGMENTUN emotional territory you align with most. This is a narrative entertainment experience, not a clinical assessment."}</p>
      <button className="btn btnPrimary" onClick={start}>{locale==="es"?"Comenzar el test":"Start the test"}</button>
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

      <div className="testViralCard" style={{"--profile-color":result.color||"#C9A84C"} as React.CSSProperties}>
        <div className="testViralGlow"/>
        <div className="testViralBrand">FRAGMENTUN <span>{locale==="es"?"TEST EMOCIONAL":"EMOTIONAL TEST"}</span></div>
        <div className="testViralLabel">{locale==="es"?"MI PERFIL EMOCIONAL ES":"MY EMOTIONAL PROFILE IS"}</div>
        <strong>{locale==="es"?result.name_es:result.name_en}</strong>
        <div className="testViralStrength"><span>{locale==="es"?"FORTALEZA":"STRENGTH"}</span>{locale==="es"?result.superpower_es:result.superpower_en}</div>
        <small>{locale==="es"?"Comparte tu resultado y reta a alguien a descubrir el suyo.":"Share your result and challenge someone to discover theirs."}</small>
      </div>
      <div className="testViralActions">
        <button className="btn btnPrimary" type="button" onClick={shareResultCard}>{locale==="es"?"Compartir mi resultado":"Share my result"}</button>
        <button className="btn btnGhost" type="button" onClick={()=>downloadResultCard()}>{locale==="es"?"Descargar tarjeta PNG":"Download PNG card"}</button>
      </div>
      {shareStatus&&<p className="note testShareStatus" role="status">{shareStatus}</p>}

      <div className="profileCapture card">
        <div className="kicker">{locale==="es"?"Guarda tu resultado":"Save your result"}</div>
        <h3>{locale==="es"?"Recibe novedades según tu perfil emocional":"Get updates based on your emotional profile"}</h3>
        <p>{locale==="es"
          ?"Si quieres, guarda tu perfil junto a tu correo para recibir futuras comunicaciones de FRAGMENTUN relacionadas con este territorio emocional."
          :"If you want, save your profile with your email to receive future FRAGMENTUN communications related to this emotional territory."}</p>
        <form className="formGrid" action="/api/subscribe" method="post">
          <input type="hidden" name="locale" value={locale}/>
          <input type="hidden" name="emotional_profile" value={resultKey}/>
          <input type="hidden" name="emotional_scores" value={JSON.stringify(scores)}/>
          <input type="hidden" name="consent_version" value="2026-09-30"/>
          <input type="hidden" name="utm_source" value={utm.source}/>
          <input type="hidden" name="utm_medium" value={utm.medium}/>
          <input type="hidden" name="utm_campaign" value={utm.campaign}/>
          <input type="hidden" name="utm_content" value={utm.content}/>
          <input aria-label={locale==="es"?"Tu nombre":"Your name"} name="name" value={name} onChange={e=>setName(e.target.value)} placeholder={locale==="es"?"Tu nombre (opcional)":"Your name (optional)"}/>
          <input aria-label={locale==="es"?"Tu correo electrónico":"Your email"} name="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder={locale==="es"?"Tu correo electrónico":"Your email"} required/>
          <label className="consentRow">
            <input name="consent_marketing" type="checkbox" value="yes" checked={consent} onChange={e=>setConsent(e.target.checked)} required/>
            <span>
              {locale==="es"
                ?"Acepto recibir comunicaciones de FRAGMENTUN por correo electrónico."
                :"I agree to receive FRAGMENTUN email communications."}
              {" "}
              <Link href={`/${locale}/privacidad`}>{locale==="es"?"Política de privacidad.":"Privacy policy."}</Link>
            </span>
          </label>
          <input className="hpField" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
          <button className="btn btnPrimary" type="submit">
            {locale==="es"?"Guardar mi perfil":"Save my profile"}
          </button>
        </form>
      </div>
      <button className="btn btnGhost" onClick={()=>{
        setStarted(false);
        setDone(false);
        setIndex(0);
        setScores({vorax:0,umbral:0,ethelis:0,nara:0});
      }}>
        {locale==="es"?"Repetir test":"Retake test"}
      </button>
    </section>;
  }

  const q=questions[index];
  if(!q)return null;

  const orderedOptions=[...(q.test_options||[])].sort((a,b)=>(a.sort_order??0)-(b.sort_order??0));

  return <section className="testPanel">
    <div className="testProgress"><span style={{width:`${((index+1)/questions.length)*100}%`}}/></div>
    <div className="note">{locale==="es"?"Pregunta":"Question"} {index+1} / {questions.length}</div>
    <h2>{locale==="es"?q.prompt_es:q.prompt_en}</h2>
    <div className="testOptions">
      {orderedOptions.map(option=><button key={option.id} className="testOption" onClick={()=>choose(option)}>
        {locale==="es"?option.label_es:option.label_en}
      </button>)}
    </div>
  </section>;
}
