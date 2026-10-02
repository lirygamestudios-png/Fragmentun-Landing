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
};

const characters:Character[]=[
  {
    key:"elyon",name:"Elyon Voss",
    roleEs:"Protagonista · Sensitivo",roleEn:"Protagonist · Sensitive",
    bodyEs:"Un hombre que comienza a sentir de una forma que Lumen ya no puede explicar. Su despertar convierte una crisis personal en una amenaza para todo el sistema.",
    bodyEn:"A man who begins to feel in a way Lumen can no longer explain. His awakening turns a personal crisis into a threat to the entire system.",
    tone:"elyon",image:"/elyon-hd.webp",fallbackImage:"/elyon-hero.jpg"
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

export function FrontDiscovery({locale,amazonUrl}:{locale:Locale;amazonUrl:string|null}){
  const[openValue,setOpenValue]=useState<string|null>(null);
  const[selected,setSelected]=useState<number|null>(null);

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
            :<a className="btn btnSecondary" href={item.href}>{item.action}</a>}
        </div>)}
      </div>}
    </section>

    <section className="section charactersSection" id="personajes">
      <div className="container">
        <div className="sectionIntro">
          <div className="kicker">{locale==="es"?"Personajes":"Characters"}</div>
          <h2>{locale==="es"?"Rostros de un mundo que vuelve a sentir":"Faces of a world learning to feel again"}</h2>
          <p className="lead">{locale==="es"
            ?"Pulsa un personaje para abrir su ficha visual. Puedes cerrar con la X, hacer clic fuera de la ventana o usar Esc."
            :"Select a character to open the visual profile. Close with X, click outside the window, or press Esc."}</p>
        </div>
        <div className="charactersRail">
          {characters.map((char,index)=><button type="button" className="characterTile" key={char.key} onClick={()=>setSelected(index)}>
            <div className={`characterTileArt ${char.tone}`} style={char.image?{backgroundImage:char.fallbackImage?`url("${char.image}"), url("${char.fallbackImage}")`:`url("${char.image}")`}:undefined}>
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
          <div className={`characterModalArt ${char.tone}`} style={char.image?{backgroundImage:char.fallbackImage?`url("${char.image}"), url("${char.fallbackImage}")`:`url("${char.image}")`}:undefined}>
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
