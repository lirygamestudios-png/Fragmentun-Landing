"use client";

import {useEffect,useState} from "react";
import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";
import {analyticsAttribution} from "../lib/analytics-client";

type Character={
  key:string;
  name:string;
  roleEs:string;
  roleEn:string;
  bodyEs:string;
  bodyEn:string;
  tone:string;
  image?:string;
  fallbackImage?:string;
  video?:string;
};

const fallbackCharacters:Character[]=[
  {
    key:"elyon",name:"Elyon Voss",
    roleEs:"Protagonista · Sensitivo",roleEn:"Protagonist · Sensitive",
    bodyEs:"Un hombre que comienza a sentir de una forma que Lumen ya no puede explicar. Su despertar convierte una crisis personal en una amenaza para todo el sistema.",
    bodyEn:"A man who begins to feel in a way Lumen can no longer explain. His awakening turns a personal crisis into a threat to the entire system.",
    tone:"elyon",image:"/elyon-hd.avif",fallbackImage:"/elyon-hero.jpg"
  },
  {
    key:"umbral",name:"Umbral",
    roleEs:"Fragmento del Miedo",roleEn:"Fragment of Fear",
    bodyEs:"Alto y esbelto, compuesto por números que giran y letras que se desvanecen. Encarna el miedo sofisticado a perder, fallar y no ser suficiente.",
    bodyEn:"Tall and slender, formed by rotating numbers and fading letters. It embodies the sophisticated fear of losing, failing and never being enough.",
    tone:"umbral",image:"/umbral-hd.webp",fallbackImage:"/umbral-hd.jpg"
  },
  {
    key:"ethelis",name:"Ethelis",
    roleEs:"Fragmento de la Esperanza",roleEn:"Fragment of Hope",
    bodyEs:"Una presencia andrógina hecha de pétalos y rayos de sol solidificados. Donde avanza, la vida recupera fuerza, color y posibilidades.",
    bodyEn:"An androgynous presence made of petals and solidified sunlight. Wherever it moves, life regains strength, color and possibility.",
    tone:"ethelis",image:"/ethelis-hd.webp",fallbackImage:"/ethelis-hd.jpg"
  },
  {
    key:"vorax",name:"Vorax",
    roleEs:"Fragmento de la Ira",roleEn:"Fragment of Anger",
    bodyEs:"Masa, calor y propósito. Su piel parece lava enfriándose y convierte la ira reprimida en una energía capaz de destruir o crear.",
    bodyEn:"Mass, heat and purpose. Its skin resembles cooling lava, turning repressed anger into an energy capable of destroying or creating.",
    tone:"vorax",image:"/vorax-hd.webp",fallbackImage:"/vorax-hd.jpg"
  },
  {
    key:"nara",name:"Nara",
    roleEs:"Potencial · Conciencia emergente",roleEn:"Potential · Emerging consciousness",
    bodyEs:"Una conciencia nacida de memoria y emoción. Su presencia cuestiona la frontera entre herramienta, identidad y una nueva forma de vida.",
    bodyEn:"A consciousness born from memory and emotion. Its presence questions the boundary between tool, identity and a new form of life.",
    tone:"nara",image:"/nara-hd.webp",fallbackImage:"/nara-hd.jpg"
  }
];

export function FrontDiscovery({locale,amazonUrl,shareReward,charactersContent}:{locale:Locale;amazonUrl:string|null;shareReward?:any;charactersContent?:any}){
  const[openValue,setOpenValue]=useState<string|null>(null);
  const[selected,setSelected]=useState<number|null>(null);
  const[rewardOpen,setRewardOpen]=useState(false);
  const[rewardReady,setRewardReady]=useState(false);
  const[shareStatus,setShareStatus]=useState<"idle"|"sharing"|"unsupported"|"error">("idle");
  const characters:Character[]=Array.isArray(charactersContent?.characters)&&charactersContent.characters.length
    ?charactersContent.characters.map((item:any)=>({
      key:item.key||item.name,
      name:item.name||item.key,
      roleEs:item.role||"",
      roleEn:item.role||"",
      bodyEs:item.body||"",
      bodyEn:item.body||"",
      tone:item.tone||item.key||"elyon",
      image:item.image_url||"",
      fallbackImage:item.fallback_url||"",
      video:item.video_url||""
    }))
    :fallbackCharacters;

  async function downloadBrandedReward(){
    const artUrl=shareReward?.art_url||"/elyon-hero.jpg";
    const title=shareReward?.art_title||shareReward?.title||(locale==="es"?"ARTE CONCEPTUAL OFICIAL":"OFFICIAL CONCEPT ART");
    const subtitle=shareReward?.art_subtitle||(locale==="es"?"UNA PIEZA DEL UNIVERSO FRAGMENTUN":"A PIECE FROM THE FRAGMENTUN UNIVERSE");
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

    try{
      const[{img:art,url:artObjectUrl},{img:logo,url:logoObjectUrl}]=await Promise.all([
        loadImage(artUrl),
        loadImage("/fragmentun-logo-official.webp")
      ]);

      const maxArtWidth=1500;
      const maxArtHeight=1900;
      const scale=Math.min(maxArtWidth/art.naturalWidth,maxArtHeight/art.naturalHeight,1.8);
      const artWidth=Math.max(720,Math.round(art.naturalWidth*scale));
      const artHeight=Math.round(art.naturalHeight*(artWidth/art.naturalWidth));
      const side=70;
      const top=190;
      const footer=290;
      const canvas=document.createElement("canvas");
      canvas.width=artWidth+side*2;
      canvas.height=top+artHeight+footer;
      const ctx=canvas.getContext("2d");
      if(!ctx)throw new Error("canvas_unavailable");

      ctx.fillStyle="#07111f";
      ctx.fillRect(0,0,canvas.width,canvas.height);
      const glow=ctx.createRadialGradient(canvas.width*.82,80,10,canvas.width*.82,80,canvas.width*.65);
      glow.addColorStop(0,"rgba(74,144,217,.18)");
      glow.addColorStop(1,"rgba(10,22,40,0)");
      ctx.fillStyle=glow;
      ctx.fillRect(0,0,canvas.width,canvas.height);

      ctx.strokeStyle="#C9A84C";
      ctx.lineWidth=4;
      ctx.strokeRect(18,18,canvas.width-36,canvas.height-36);
      ctx.strokeStyle="rgba(201,168,76,.34)";
      ctx.lineWidth=1;
      ctx.strokeRect(34,34,canvas.width-68,canvas.height-68);

      const logoHeight=122;
      const logoWidth=Math.round(logo.naturalWidth*(logoHeight/logo.naturalHeight));
      ctx.drawImage(logo,(canvas.width-logoWidth)/2,38,logoWidth,logoHeight);

      ctx.save();
      ctx.beginPath();
      ctx.rect(side,top,artWidth,artHeight);
      ctx.clip();
      ctx.drawImage(art,side,top,artWidth,artHeight);
      ctx.restore();

      ctx.strokeStyle="rgba(201,168,76,.75)";
      ctx.lineWidth=2;
      ctx.strokeRect(side,top,artWidth,artHeight);

      const footerY=top+artHeight;
      ctx.fillStyle="#0A1628";
      ctx.fillRect(side,footerY,artWidth,footer);
      ctx.fillStyle="#C9A84C";
      ctx.font='700 26px Georgia, "Times New Roman", serif';
      ctx.textAlign="left";
      ctx.fillText(locale==="es"?"ARTE CONCEPTUAL OFICIAL":"OFFICIAL CONCEPT ART",side+34,footerY+54);

      ctx.fillStyle="#F3E3A7";
      ctx.font='700 42px Georgia, "Times New Roman", serif';
      const cleanTitle=String(title).slice(0,58);
      ctx.fillText(cleanTitle,side+34,footerY+112);

      ctx.fillStyle="#9eb0c2";
      ctx.font='500 20px Arial, Helvetica, sans-serif';
      ctx.fillText(String(subtitle).slice(0,88),side+34,footerY+154);

      ctx.fillStyle="#D8BF70";
      ctx.font='700 20px Georgia, "Times New Roman", serif';
      ctx.fillText("José Liranzo",side+34,footerY+214);

      ctx.textAlign="right";
      ctx.fillStyle="#7f93a8";
      ctx.font='600 15px Arial, Helvetica, sans-serif';
      ctx.fillText("FRAGMENTUN.COM",side+artWidth-34,footerY+196);
      ctx.fillText(locale==="es"?"TODOS LOS DERECHOS RESERVADOS":"ALL RIGHTS RESERVED",side+artWidth-34,footerY+222);

      const blob=await new Promise<Blob|null>(resolve=>canvas.toBlob(resolve,"image/jpeg",.94));
      URL.revokeObjectURL(artObjectUrl);
      URL.revokeObjectURL(logoObjectUrl);
      if(!blob)throw new Error("export_failed");

      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="FRAGMENTUN-Arte-Conceptual-Oficial.jpg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),2000);

      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        event_name:"share_reward_download",locale,path:window.location.pathname,...analyticsAttribution(),metadata:{placement:"value_strip",format:"branded_jpg"}
      }),keepalive:true}).catch(()=>{});
    }catch{
      const a=document.createElement("a");
      a.href=artUrl;
      a.download="";
      a.target="_blank";
      document.body.appendChild(a);
      a.click();
      a.remove();
    }
  }

  useEffect(()=>{
    if(selected===null)return;
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==="Escape")setSelected(null);
      if(e.key==="ArrowRight")setSelected(i=>i===null?0:(i+1)%characters.length);
      if(e.key==="ArrowLeft")setSelected(i=>i===null?0:(i-1+characters.length)%characters.length);
    };
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",onKey);
    return()=>{
      document.body.style.overflow="";
      window.removeEventListener("keydown",onKey);
    };
  },[selected]);

  const values=[
    {
      key:"emotion",icon:"✦",
      title:locale==="es"?"Ciencia ficción emocional":"Emotional science fiction",
      body:locale==="es"
        ?"En Lumen, sentir puede convertirse en poder, amenaza o rebelión."
        :"In Lumen, feeling can become power, threat or rebellion.",
      action:locale==="es"?"Descubre la premisa":"Discover the premise",
      href:"#historia"
    },
    {
      key:"characters",icon:"♙",
      title:locale==="es"?"Personajes inolvidables":"Unforgettable characters",
      body:locale==="es"
        ?"Elyon, Umbral, Ethelis, Vorax y Nara encarnan distintas formas de sentir y resistir."
        :"Elyon, Umbral, Ethelis, Vorax and Nara embody different ways to feel and resist.",
      action:locale==="es"?"Conoce a los personajes":"Meet the characters",
      href:"#personajes"
    },
    {
      key:"universe",icon:"◉",
      title:locale==="es"?"Universo expandible":"Expandable universe",
      body:locale==="es"
        ?"Lumen, sus territorios emocionales, la saga y el mapa forman un universo diseñado para crecer."
        :"Lumen, its emotional territories, the saga and the map form a universe designed to grow.",
      action:locale==="es"?"Explorar Lumen":"Explore Lumen",
      href:"#lumen"
    },
    {
      key:"available",icon:"↗",
      title:locale==="es"?"Disponible ahora":"Available now",
      body:locale==="es"
        ?"FRAGMENTUN I ya está publicado. Este acceso crecerá a medida que se incorporen nuevas plataformas."
        :"FRAGMENTUN I is already published. This access will grow as new platforms are added.",
      action:locale==="es"?"Ver plataformas":"View platforms",
      href:"#"
    },
    {
      key:"free-art",icon:"✧",
      title:shareReward?.title||(locale==="es"?"Arte conceptual gratis":"Free concept art"),
      body:shareReward?.body||(locale==="es"
        ?"Comparte FRAGMENTUN y recibe una pieza de arte conceptual gratuita de la saga."
        :"Share FRAGMENTUN and receive a free piece of concept art from the saga."),
      action:shareReward?.action||(locale==="es"?"Compartir y recibir arte":"Share and receive art"),
      href:"#"
    }
  ];

  return <>
    <section className="masterValueStrip discoveryStrip" aria-label={locale==="es"?"Explora FRAGMENTUN":"Explore FRAGMENTUN"}>
      <div className="container discoveryGrid">
        {values.map(item=><button
          type="button"
          key={item.key}
          className={`discoveryCard ${openValue===item.key?"open":""}`}
          onClick={()=>setOpenValue(openValue===item.key?null:item.key)}
          aria-expanded={openValue===item.key}
        >
          <span className="discoveryIcon">{item.icon}</span>
          <strong>{item.title}</strong>
          <small>{locale==="es"?"Explorar":"Explore"} ↓</small>
        </button>)}
      </div>

      {openValue&&<div className="container discoveryPanel">
        {values.filter(v=>v.key===openValue).map(item=><div className="discoveryPanelInner" key={item.key}>
          <div>
            <div className="kicker">{item.title}</div>
            <h3>{item.body}</h3>
          </div>
          {item.key==="available"
            ?<div className="storeGrid">
              {amazonUrl
                ?<TrackLink className="storeCard active" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{placement:"store_selector",store:"amazon",book:"fragmentun-i"}} newTab><b>amazon</b><span>{locale==="es"?"Disponible":"Available"}</span></TrackLink>
                :<div className="storeCard"><b>amazon</b><span>{locale==="es"?"Próximamente":"Coming soon"}</span></div>}
              <div className="storeCard"><b>Apple Books</b><span>{locale==="es"?"Próximamente":"Coming soon"}</span></div>
              <div className="storeCard"><b>Kobo</b><span>{locale==="es"?"Próximamente":"Coming soon"}</span></div>
              <div className="storeCard"><b>Google Play Books</b><span>{locale==="es"?"Próximamente":"Coming soon"}</span></div>
              <div className="storeCard"><b>Barnes & Noble</b><span>{locale==="es"?"Próximamente":"Coming soon"}</span></div>
            </div>
            :item.key==="free-art"
              ?<div className="shareRewardAction">
                <button className="btn btnSecondary" type="button" disabled={shareStatus==="sharing"} onClick={async()=>{
                  const url=window.location.href;
                  const text=locale==="es"
                    ?"Descubre FRAGMENTUN, una saga de ciencia ficción emocional."
                    :"Discover FRAGMENTUN, an emotional science-fiction saga.";

                  if(typeof navigator.share!=="function"){
                    setShareStatus("unsupported");
                    return;
                  }

                  try{
                    setRewardReady(false);
                    setRewardOpen(false);
                    setShareStatus("sharing");

                    let lostControl=document.visibilityState==="hidden"||!document.hasFocus();

                    await navigator.share({title:"FRAGMENTUN",text,url});

                    // On some desktop browsers navigator.share() resolves before the native
                    // social surface has visually disappeared. Do not use a timer fallback
                    // that can reveal the reward while that surface is still open.
                    //
                    // Instead, wait until FRAGMENTUN has demonstrably lost control at least once
                    // (blur/hidden/no focus), then require the page to be visible + focused
                    // continuously for a short stability window before showing the reward.
                    await new Promise<void>(resolve=>{
                      let settledTimer:number|undefined;
                      let poll:number|undefined;
                      let done=false;

                      const cleanup=()=>{
                        if(poll!==undefined)window.clearInterval(poll);
                        if(settledTimer!==undefined)window.clearTimeout(settledTimer);
                        window.removeEventListener("blur",onBlur);
                        window.removeEventListener("focus",onFocus);
                        document.removeEventListener("visibilitychange",onVisibility);
                      };

                      const finish=()=>{
                        if(done)return;
                        done=true;
                        cleanup();
                        resolve();
                      };

                      const cancelStable=()=>{
                        if(settledTimer!==undefined){
                          window.clearTimeout(settledTimer);
                          settledTimer=undefined;
                        }
                      };

                      const evaluate=()=>{
                        const active=document.visibilityState==="visible"&&document.hasFocus();

                        if(!active){
                          lostControl=true;
                          cancelStable();
                          return;
                        }

                        if(lostControl&&settledTimer===undefined){
                          // Require sustained return to FRAGMENTUN so an intermediate focus
                          // event from the browser share UI cannot trigger the reward.
                          settledTimer=window.setTimeout(()=>{
                            const stillActive=document.visibilityState==="visible"&&document.hasFocus();
                            if(stillActive&&lostControl)finish();
                            else cancelStable();
                          },700);
                        }
                      };

                      const onBlur=()=>{lostControl=true;cancelStable();};
                      const onFocus=()=>evaluate();
                      const onVisibility=()=>evaluate();

                      window.addEventListener("blur",onBlur);
                      window.addEventListener("focus",onFocus);
                      document.addEventListener("visibilitychange",onVisibility);
                      poll=window.setInterval(evaluate,120);

                      evaluate();
                    });

                    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
                      event_name:"share_reward_unlock",locale,path:window.location.pathname,...analyticsAttribution(),metadata:{placement:"value_strip",result:"completed_after_share_closed"}
                    }),keepalive:true}).catch(()=>{});

                    setRewardReady(true);
                    setRewardOpen(true);
                    setShareStatus("idle");
                  }catch(error){
                    const aborted=error instanceof DOMException&&error.name==="AbortError";
                    if(!aborted){
                      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
                        event_name:"share_reward_error",locale,path:window.location.pathname,...analyticsAttribution(),metadata:{placement:"value_strip"}
                      }),keepalive:true}).catch(()=>{});
                    }
                    setRewardReady(false);
                    setRewardOpen(false);
                    setShareStatus(aborted?"idle":"error");
                  }
                }}>
                  {shareStatus==="sharing"
                    ?(locale==="es"?"Compartiendo…":"Sharing…")
                    :item.action}
                </button>
                                {shareStatus==="unsupported"&&<small className="shareRewardStatus">
                  {locale==="es"
                    ?"Este navegador no permite verificar que el contenido haya sido compartido. Abre esta página en un dispositivo compatible con Compartir para desbloquear el arte."
                    :"This browser cannot verify that sharing was completed. Open this page on a device with native Share support to unlock the artwork."}
                </small>}
                {shareStatus==="error"&&<small className="shareRewardStatus">
                  {locale==="es"
                    ?"No pudimos confirmar que la operación se completara. La recompensa no ha sido desbloqueada."
                    :"We could not confirm that sharing was completed. The reward has not been unlocked."}
                </small>}
              </div>
              :<a className="btn btnSecondary" href={item.href}>{item.action}</a>}
        </div>)}
      </div>}
    </section>


    {rewardOpen&&<div className="shareRewardBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setRewardOpen(false)}}>
      <section className="shareRewardModal" role="dialog" aria-modal="true" aria-label={shareReward?.thank_you||(locale==="es"?"Gracias por compartir este universo":"Thank you for sharing this universe")}>
        <button className="shareRewardClose" type="button" aria-label={locale==="es"?"Cerrar":"Close"} onClick={()=>setRewardOpen(false)}>×</button>
        <div className="shareRewardArt">
          <img src={shareReward?.art_url||"/elyon-hero.jpg"} alt={locale==="es"?"Arte conceptual gratuito de FRAGMENTUN":"Free FRAGMENTUN concept art"}/>
        </div>
        <div className="shareRewardCopy">
          <div className="kicker">{locale==="es"?"RECOMPENSA DESBLOQUEADA":"REWARD UNLOCKED"}</div>
          <h2>{shareReward?.thank_you||(locale==="es"?"GRACIAS POR COMPARTIR ESTE UNIVERSO":"THANK YOU FOR SHARING THIS UNIVERSE")}</h2>
          <p>{locale==="es"
            ?"Tu pieza de arte conceptual de FRAGMENTUN está lista. Puedes guardarla y seguir compartiendo el universo."
            :"Your FRAGMENTUN concept art is ready. Save it and keep sharing the universe."}</p>
          {rewardReady&&<button
            className="btn btnPrimary"
            type="button"
            onClick={downloadBrandedReward}
          >{shareReward?.reward_label||(locale==="es"?"Descargar arte conceptual":"Download concept art")}</button>}
        </div>
      </section>
    </div>}

    <section className="section charactersSection" id="personajes">
      <div className="container">
        <div className="sectionIntro">
          <div className="kicker">{charactersContent?.eyebrow||(locale==="es"?"Personajes":"Characters")}</div>
          <h2>{charactersContent?.title||(locale==="es"?"Rostros de un mundo que vuelve a sentir":"Faces of a world learning to feel again")}</h2>
          <p className="lead">{charactersContent?.body||(locale==="es"
            ?"Pulsa un personaje para abrir su ficha visual. Puedes cerrar con la X, hacer clic fuera de la ventana o usar Esc."
            :"Select a character to open the visual profile. Close with X, click outside the window, or press Esc.")}</p>
        </div>
        <div className="charactersRail">
          {characters.map((char,index)=><button type="button" className="characterTile" key={char.key} onClick={()=>setSelected(index)}>
            <div className={`characterTileArt ${char.tone}`}>
              {char.image&&<img className="characterPhoto" src={char.image} alt="" loading="lazy" decoding="async" onError={e=>{if(char.fallbackImage){e.currentTarget.onerror=null;e.currentTarget.src=char.fallbackImage}}}/>}
              {char.video&&<video autoPlay muted loop playsInline preload="metadata" poster={char.image||char.fallbackImage}><source src={char.video}/></video>}
              <span>{char.name}</span>
            </div>
            <strong>{char.name}</strong>
            <small>{locale==="es"?char.roleEs:char.roleEn}</small>
          </button>)}
        </div>
      </div>
    </section>

    {selected!==null&&(()=>{
      const char=characters[selected];
      return <div className="characterModalBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
        <section className="characterModal" role="dialog" aria-modal="true" aria-label={char.name} tabIndex={-1}>
          <button className="characterModalClose" type="button" aria-label={locale==="es"?"Cerrar":"Close"} onClick={()=>setSelected(null)}>×</button>
          <div className={`characterModalArt ${char.tone}`}>
            {char.image&&<img className="characterPhoto" src={char.image} alt={char.name} decoding="async" onError={e=>{if(char.fallbackImage){e.currentTarget.onerror=null;e.currentTarget.src=char.fallbackImage}}}/>}
            {char.video&&<video autoPlay muted loop playsInline preload="metadata" poster={char.image||char.fallbackImage}><source src={char.video}/></video>}
            <div className="characterModalGlow"/>
            <span>{char.name}</span>
          </div>
          <div className="characterModalCopy">
            <div className="kicker">{locale==="es"?char.roleEs:char.roleEn}</div>
            <h2>{char.name}</h2>
            <p>{locale==="es"?char.bodyEs:char.bodyEn}</p>
            <div className="characterModalNav">
              <button type="button" onClick={()=>setSelected((selected-1+characters.length)%characters.length)}>← {locale==="es"?"Anterior":"Previous"}</button>
              <span>{selected+1} / {characters.length}</span>
              <button type="button" onClick={()=>setSelected((selected+1)%characters.length)}>{locale==="es"?"Siguiente":"Next"} →</button>
            </div>
          </div>
        </section>
      </div>;
    })()}
  </>;
}
