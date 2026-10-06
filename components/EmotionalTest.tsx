"use client";

import { useEffect,useMemo,useState } from "react";
import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { analyticsAttribution } from "../lib/analytics-client";

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
  const [sessionId,setSessionId]=useState("");
  const [utm,setUtm]=useState({source:"",medium:"",campaign:"",content:""});

  useEffect(()=>{
    const attribution=analyticsAttribution();
    setUtm({
      source:attribution.source||"",
      medium:attribution.medium||"",
      campaign:attribution.campaign||"",
      content:attribution.content||""
    });
    setSessionId(attribution.session_id||"");
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
  const profileImage:Record<string,string>={
    vorax:"/vorax-hd.webp",
    umbral:"/umbral-hd.webp",
    ethelis:"/ethelis-hd.webp",
    nara:"/nara-hd.webp"
  };
  const resultImage=profileImage[resultKey]||"";

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

    const loadImage=async(url:string)=>{
      const response=await fetch(url,{cache:"no-store"});
      if(!response.ok)throw new Error("image_fetch_failed");
      const blob=await response.blob();
      const objectUrl=URL.createObjectURL(blob);
      return await new Promise<{img:HTMLImageElement;url:string}>((resolve,reject)=>{
        const img=new Image();
        img.onload=()=>resolve({img,url:objectUrl});
        img.onerror=()=>{URL.revokeObjectURL(objectUrl);reject(new Error("image_load_failed"))};
        img.src=objectUrl;
      });
    };

    const profileName=locale==="es"?result.name_es:result.name_en;
    const strength=locale==="es"?result.superpower_es:result.superpower_en;
    const description=locale==="es"?result.description_es:result.description_en;
    const total=Object.values(scores).reduce((a,b)=>a+b,0);
    const dominant=Math.max(...Object.values(scores));
    const affinity=total?Math.round(dominant/total*100):0;
    const accent=result.color||"#C9A84C";

    const canvas=document.createElement("canvas");
    canvas.width=1080;
    canvas.height=1350;
    const ctx=canvas.getContext("2d");
    if(!ctx)return null;

    const loaded:{img:HTMLImageElement;url:string}[]=[];
    try{
      const logo=await loadImage("/fragmentun-logo-official.webp");
      loaded.push(logo);

      const characterImages:{img:HTMLImageElement;url:string}[]=[];
      if(resultKey==="balance"){
        for(const key of ["vorax","umbral","ethelis","nara"]){
          const item=await loadImage(profileImage[key]);
          loaded.push(item);
          characterImages.push(item);
        }
      }else if(resultImage){
        const item=await loadImage(resultImage);
        loaded.push(item);
        characterImages.push(item);
      }

      ctx.fillStyle="#07111f";
      ctx.fillRect(0,0,canvas.width,canvas.height);

      const glow=ctx.createRadialGradient(860,150,20,860,150,720);
      glow.addColorStop(0,accent+"33");
      glow.addColorStop(1,"rgba(10,22,40,0)");
      ctx.fillStyle=glow;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      // Marco FRAGMENTUN: misma línea visual del descargable oficial ya aprobado.
      ctx.strokeStyle="#C9A84C";
      ctx.lineWidth=4;
      ctx.strokeRect(18,18,canvas.width-36,canvas.height-36);
      ctx.strokeStyle="rgba(201,168,76,.34)";
      ctx.lineWidth=1;
      ctx.strokeRect(34,34,canvas.width-68,canvas.height-68);

      const logoHeight=116;
      const logoWidth=Math.round(logo.img.naturalWidth*(logoHeight/logo.img.naturalHeight));
      ctx.drawImage(logo.img,(canvas.width-logoWidth)/2,42,logoWidth,logoHeight);

      const imageX=72;
      const imageY=195;
      const imageW=936;
      const imageH=595;
      ctx.save();
      ctx.beginPath();
      ctx.rect(imageX,imageY,imageW,imageH);
      ctx.clip();

      if(resultKey==="balance"&&characterImages.length===4){
        const tileW=imageW/2;
        const tileH=imageH/2;
        characterImages.forEach((asset,i)=>{
          const img=asset.img;
          const tx=imageX+(i%2)*tileW;
          const ty=imageY+Math.floor(i/2)*tileH;
          const scale=Math.max(tileW/img.naturalWidth,tileH/img.naturalHeight);
          const dw=img.naturalWidth*scale;
          const dh=img.naturalHeight*scale;
          ctx.drawImage(img,tx+(tileW-dw)/2,ty+(tileH-dh)/2,dw,dh);
        });
      }else if(characterImages[0]){
        const img=characterImages[0].img;
        const scale=Math.max(imageW/img.naturalWidth,imageH/img.naturalHeight);
        const dw=img.naturalWidth*scale;
        const dh=img.naturalHeight*scale;
        ctx.drawImage(img,imageX+(imageW-dw)/2,imageY+(imageH-dh)/2,dw,dh);
      }

      const shade=ctx.createLinearGradient(imageX,imageY,imageX,imageY+imageH);
      shade.addColorStop(0,"rgba(7,17,31,.02)");
      shade.addColorStop(.7,"rgba(7,17,31,.12)");
      shade.addColorStop(1,"rgba(7,17,31,.72)");
      ctx.fillStyle=shade;
      ctx.fillRect(imageX,imageY,imageW,imageH);
      ctx.restore();

      ctx.strokeStyle="rgba(201,168,76,.75)";
      ctx.lineWidth=2;
      ctx.strokeRect(imageX,imageY,imageW,imageH);

      ctx.textAlign="center";
      ctx.fillStyle="#C9A84C";
      ctx.font='700 23px Arial, Helvetica, sans-serif';
      ctx.fillText(locale==="es"?"MI PERFIL EMOCIONAL ES":"MY EMOTIONAL PROFILE IS",540,850);

      ctx.fillStyle=accent;
      ctx.font='700 74px Georgia, "Times New Roman", serif';
      wrapCanvasText(ctx,profileName.toUpperCase(),850).slice(0,2).forEach((line,i)=>ctx.fillText(line,540,940+i*80));

      ctx.fillStyle="#F3E3A7";
      ctx.font='700 23px Arial, Helvetica, sans-serif';
      ctx.fillText((locale==="es"?"AFINIDAD DOMINANTE ":"DOMINANT AFFINITY ")+affinity+"%",540,1035);

      ctx.fillStyle="#D8BF70";
      ctx.font='700 18px Arial, Helvetica, sans-serif';
      ctx.fillText(locale==="es"?"FORTALEZA":"STRENGTH",540,1090);

      ctx.fillStyle="#ffffff";
      ctx.font='700 28px Arial, Helvetica, sans-serif';
      wrapCanvasText(ctx,strength,820).slice(0,2).forEach((line,i)=>ctx.fillText(line,540,1132+i*36));

      ctx.fillStyle="#9eb0c2";
      ctx.font='500 20px Arial, Helvetica, sans-serif';
      wrapCanvasText(ctx,description,820).slice(0,2).forEach((line,i)=>ctx.fillText(line,540,1210+i*30));

      ctx.fillStyle="#D8BF70";
      ctx.font='700 18px Arial, Helvetica, sans-serif';
      ctx.fillText(locale==="es"?"DESCUBRE TU PERFIL EMOCIONAL":"DISCOVER YOUR EMOTIONAL PROFILE",540,1282);
      ctx.fillStyle="#7f93a8";
      ctx.font='600 16px Arial, Helvetica, sans-serif';
      ctx.fillText("FRAGMENTUN.COM/"+locale.toUpperCase()+"/TEST",540,1314);

      return await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/png",.95));
    }finally{
      loaded.forEach(item=>URL.revokeObjectURL(item.url));
    }
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
        <div className="testViralInnerFrame">
          <img className="testViralOfficialLogo" src="/fragmentun-logo-official.webp" alt="FRAGMENTUN"/>
          <div className={"testViralCharacter "+(resultKey==="balance"?"balance":"")}>
            {resultKey==="balance"
              ?(["vorax","umbral","ethelis","nara"] as const).map(key=><img key={key} src={profileImage[key]} alt={profileMap[key]?.[locale==="es"?"name_es":"name_en"]||key}/>)
              :resultImage&&<img src={resultImage} alt={locale==="es"?result.name_es:result.name_en}/>}
          </div>
          <div className="testViralLabel">{locale==="es"?"MI PERFIL EMOCIONAL ES":"MY EMOTIONAL PROFILE IS"}</div>
          <strong>{locale==="es"?result.name_es:result.name_en}</strong>
          <div className="testViralStrength"><span>{locale==="es"?"FORTALEZA":"STRENGTH"}</span>{locale==="es"?result.superpower_es:result.superpower_en}</div>
          <small>{locale==="es"?"Comparte tu resultado y reta a alguien a descubrir el suyo.":"Share your result and challenge someone to discover theirs."}</small>
        </div>
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
          <input type="hidden" name="session_id" value={sessionId}/>
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
