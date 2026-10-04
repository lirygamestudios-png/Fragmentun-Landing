"use client";

import {useEffect,useState} from "react";
import type {Locale} from "../lib/i18n";
import {TrackLink} from "./TrackLink";

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

                    let pageBlurred=false;
                    let pageHidden=document.visibilityState==="hidden";
                    let pageReturned=false;

                    const markBlur=()=>{pageBlurred=true;};
                    const markFocus=()=>{
                      if(pageBlurred||pageHidden)pageReturned=true;
                    };
                    const markVisibility=()=>{
                      if(document.visibilityState==="hidden"){
                        pageHidden=true;
                      }else if(pageHidden){
                        pageReturned=true;
                      }
                    };

                    window.addEventListener("blur",markBlur);
                    window.addEventListener("focus",markFocus);
                    document.addEventListener("visibilitychange",markVisibility);

                    await navigator.share({title:"FRAGMENTUN",text,url});

                    // Some browsers resolve navigator.share() before the native/social surface
                    // has visually disappeared. Wait for a real return signal when available.
                    // Never require a user click: a timed fallback completes the sequence automatically.
                    await new Promise<void>(resolve=>{
                      let done=false;
                      let fallback:number|undefined;

                      const finish=()=>{
                        if(done)return;
                        done=true;
                        window.removeEventListener("focus",onReturn);
                        document.removeEventListener("visibilitychange",onVisibilityReturn);
                        if(fallback!==undefined)window.clearTimeout(fallback);
                        // brief grace period after the native social UI has yielded control
                        window.setTimeout(resolve,450);
                      };

                      const onReturn=()=>{
                        if(pageBlurred||pageHidden||pageReturned)finish();
                      };
                      const onVisibilityReturn=()=>{
                        if(document.visibilityState==="visible"&&(pageHidden||pageReturned))finish();
                      };

                      if(pageReturned){
                        finish();
                        return;
                      }

                      window.addEventListener("focus",onReturn);
                      document.addEventListener("visibilitychange",onVisibilityReturn);

                      // Desktop share implementations do not always emit reliable focus/visibility
                      // events. This fallback prevents "Compartiendo…" from getting stuck while
                      // still delaying the reward long enough for the social sheet to close.
                      fallback=window.setTimeout(finish,1800);
                    });

                    window.removeEventListener("blur",markBlur);
                    window.removeEventListener("focus",markFocus);
                    document.removeEventListener("visibilitychange",markVisibility);

                    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
                      event_name:"share_reward_unlock",locale,path:window.location.pathname,metadata:{placement:"value_strip",result:"completed_after_share_closed"}
                    }),keepalive:true}).catch(()=>{});

                    setRewardReady(true);
                    setRewardOpen(true);
                    setShareStatus("idle");
                  }catch(error){
                    const aborted=error instanceof DOMException&&error.name==="AbortError";
                    if(!aborted){
                      fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
                        event_name:"share_reward_error",locale,path:window.location.pathname,metadata:{placement:"value_strip"}
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
          {rewardReady&&<a
            className="btn btnPrimary"
            href={shareReward?.art_url||"/elyon-hero.jpg"}
            download
            onClick={()=>fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
              event_name:"share_reward_download",locale,path:window.location.pathname,metadata:{placement:"value_strip"}
            }),keepalive:true}).catch(()=>{})}
          >{shareReward?.reward_label||(locale==="es"?"Descargar arte conceptual":"Download concept art")}</a>}
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
