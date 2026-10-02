"use client";

import {useMemo,useRef,useState} from "react";
import type {Locale} from "../lib/i18n";

type Region={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;color:string|null};
type Point={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;x:number|null;y:number|null;icon:string|null};

type CanonicalZone={
  slug:string;
  labelEs:string;
  labelEn:string;
  roleEs:string;
  roleEn:string;
  emotionEs:string;
  emotionEn:string;
  className:string;
};

const canonicalZones:CanonicalZone[]=[
  {
    slug:"umbral",
    labelEs:"Distrito Financiero — Umbral",
    labelEn:"Financial District — Umbral",
    roleEs:"Distrito del miedo y la contención.",
    roleEn:"District of fear and containment.",
    emotionEs:"Miedo",
    emotionEn:"Fear",
    className:"canonicalUmbral"
  },
  {
    slug:"ethelis",
    labelEs:"Jardines Botánicos — Ethelis",
    labelEn:"Botanical Gardens — Ethelis",
    roleEs:"Territorio de esperanza y regeneración.",
    roleEn:"Territory of hope and regeneration.",
    emotionEs:"Esperanza",
    emotionEn:"Hope",
    className:"canonicalEthelis"
  },
  {
    slug:"vorax",
    labelEs:"Distrito Industrial — Vorax",
    labelEn:"Industrial District — Vorax",
    roleEs:"Distrito de ira, producción y tensión.",
    roleEn:"District of anger, industry and tension.",
    emotionEs:"Ira",
    emotionEn:"Anger",
    className:"canonicalVorax"
  },
  {
    slug:"central",
    labelEs:"Zona Central — Consejo / Torre de Supresión",
    labelEn:"Central Zone — Council / Suppression Tower",
    roleEs:"Centro de control y administración de Lumen.",
    roleEn:"Control and administrative center of Lumen.",
    emotionEs:"Control",
    emotionEn:"Control",
    className:"canonicalCentral"
  },
  {
    slug:"pureza",
    labelEs:"Base de Pureza — Subsuelo",
    labelEn:"Purity Base — Sublevel",
    roleEs:"Complejo de purificación forzada bajo la ciudad.",
    roleEn:"Forced purification complex beneath the city.",
    emotionEs:"Purificación",
    emotionEn:"Purification",
    className:"canonicalPureza"
  },
  {
    slug:"neutral",
    labelEs:"Zona Neutral — Lugar del Halo",
    labelEn:"Neutral Zone — Halo Site",
    roleEs:"Punto de equilibrio y activación del Halo.",
    roleEn:"Balance point and Halo activation site.",
    emotionEs:"Equilibrio",
    emotionEn:"Balance",
    className:"canonicalNeutral"
  }
];

export function LumenMap({locale,regions,points}:{locale:Locale;regions:Region[];points:Point[]}) {
  const[selected,setSelected]=useState<string>("central");
  const[zoom,setZoom]=useState(1);
  const[tilt,setTilt]=useState({x:54,y:-4});
  const dragging=useRef(false);
  const last=useRef({x:0,y:0});

  const regionMap=useMemo(()=>Object.fromEntries(regions.map(r=>[r.slug,r])),[regions]);
  const selectedCanonical=canonicalZones.find(z=>z.slug===selected);
  const selectedRegion=regionMap[selected];
  const selectedPoint=points.find(p=>p.slug===selected);

  function track(kind:string,slug:string){
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"map_interaction",locale,path:`/${locale}/mapa`,metadata:{kind,slug,version:"lumen_post_pulse"}
    }),keepalive:true}).catch(()=>{});
  }

  function select(kind:string,slug:string){
    setSelected(slug);
    track(kind,slug);
  }

  function onPointerDown(e:React.PointerEvent<HTMLDivElement>){
    dragging.current=true;
    last.current={x:e.clientX,y:e.clientY};
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e:React.PointerEvent<HTMLDivElement>){
    if(!dragging.current)return;
    const dx=e.clientX-last.current.x;
    const dy=e.clientY-last.current.y;
    last.current={x:e.clientX,y:e.clientY};
    setTilt(t=>({
      x:Math.max(40,Math.min(68,t.x-dy*.18)),
      y:Math.max(-22,Math.min(22,t.y+dx*.18))
    }));
  }
  function onPointerUp(e:React.PointerEvent<HTMLDivElement>){
    dragging.current=false;
    try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}
  }

  const canonicalDescription=selectedCanonical
    ?(locale==="es"?selectedCanonical.roleEs:selectedCanonical.roleEn)
    :"";
  const dbDescription=selectedRegion
    ?(locale==="es"?selectedRegion.description_es:selectedRegion.description_en)
    :selectedPoint
      ?(locale==="es"?selectedPoint.description_es:selectedPoint.description_en)
      :"";
  const title=selectedCanonical
    ?(locale==="es"?selectedCanonical.labelEs:selectedCanonical.labelEn)
    :selectedRegion
      ?(locale==="es"?selectedRegion.name_es:selectedRegion.name_en)
      :selectedPoint
        ?(locale==="es"?selectedPoint.name_es:selectedPoint.name_en)
        :"Lumen";

  return <div className="lumenCanonicalShell">
    <div className="lumenCanonicalTopline">
      <div>
        <div className="kicker">LUMEN DESPUÉS DEL PULSO</div>
        <h2>{locale==="es"?"Mapa emocional de territorios fracturados":"Emotional map of fractured territories"}</h2>
      </div>
      <div className="lumenFlowLegend" aria-label={locale==="es"?"Flujos emocionales":"Emotional flows"}>
        <span className="flowWill">{locale==="es"?"Voluntad":"Will"}</span>
        <span className="flowAnger">{locale==="es"?"Ira":"Anger"}</span>
        <span className="flowFear">{locale==="es"?"Miedo":"Fear"}</span>
        <span className="flowHope">{locale==="es"?"Esperanza":"Hope"}</span>
      </div>
    </div>

    <div className="mapLayout map3dLayout canonicalMapLayout">
      <div
        className="mapCanvas map3dCanvas canonicalMapCanvas"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div className="map3dAtmosphere canonicalAtmosphere" aria-hidden="true"/>
        <div className="mapControls">
          <button type="button" aria-label={locale==="es"?"Acercar":"Zoom in"} onClick={()=>setZoom(z=>Math.min(1.48,z+.1))}>+</button>
          <button type="button" aria-label={locale==="es"?"Alejar":"Zoom out"} onClick={()=>setZoom(z=>Math.max(.82,z-.1))}>−</button>
          <button type="button" aria-label={locale==="es"?"Restablecer vista":"Reset view"} onClick={()=>{setZoom(1);setTilt({x:54,y:-4})}}>↺</button>
        </div>
        <div className="map3dHint">{locale==="es"?"ARRASTRA PARA ROTAR · ZOOM PARA EXPLORAR":"DRAG TO ROTATE · ZOOM TO EXPLORE"}</div>

        <div
          className="mapScene map3dScene canonicalCityScene"
          style={{transform:`perspective(1200px) rotateX(${tilt.x}deg) rotateZ(${tilt.y}deg) scale(${zoom})`}}
        >
          <div className="canonicalCityWall" aria-hidden="true"/>
          <div className="canonicalHaloRing" aria-hidden="true"/>
          <div className="canonicalFlowGrid" aria-hidden="true"/>

          <button className="canonicalZone canonicalUmbral" onClick={()=>select("canonical_zone","umbral")}>
            <span>1</span><strong>{locale==="es"?"DISTRITO FINANCIERO":"FINANCIAL DISTRICT"}</strong><small>UMBRAL</small>
          </button>
          <button className="canonicalZone canonicalEthelis" onClick={()=>select("canonical_zone","ethelis")}>
            <span>2</span><strong>{locale==="es"?"JARDINES BOTÁNICOS":"BOTANICAL GARDENS"}</strong><small>ETHELIS</small>
          </button>
          <button className="canonicalZone canonicalVorax" onClick={()=>select("canonical_zone","vorax")}>
            <span>3</span><strong>{locale==="es"?"DISTRITO INDUSTRIAL":"INDUSTRIAL DISTRICT"}</strong><small>VORAX</small>
          </button>
          <button className="canonicalZone canonicalNeutral" onClick={()=>select("canonical_zone","neutral")}>
            <strong>{locale==="es"?"ZONA NEUTRAL":"NEUTRAL ZONE"}</strong><small>{locale==="es"?"LUGAR DEL HALO":"HALO SITE"}</small>
          </button>

          <button className="canonicalTower" onClick={()=>select("canonical_zone","central")}>
            <span className="towerBeam" aria-hidden="true"/>
            <span className="towerBody" aria-hidden="true"/>
            <span className="towerLabel">4. {locale==="es"?"ZONA CENTRAL":"CENTRAL ZONE"}<small>{locale==="es"?"CONSEJO / TORRE DE SUPRESIÓN":"COUNCIL / SUPPRESSION TOWER"}</small></span>
          </button>

          <button className="canonicalSublevel" onClick={()=>select("canonical_zone","pureza")}>
            <span className="sublevelCore" aria-hidden="true"/>
            <strong>5. {locale==="es"?"BASE DE PUREZA":"PURITY BASE"}</strong>
            <small>{locale==="es"?"SUBSUELO":"SUBLEVEL"}</small>
          </button>

          {points.map(p=><button
            key={p.slug}
            className="mapPoint canonicalPoint"
            style={{left:`${p.x??50}%`,top:`${p.y??50}%`}}
            onClick={(e)=>{e.stopPropagation();select("point",p.slug)}}
            aria-label={locale==="es"?p.name_es:p.name_en}
          >•</button>)}
        </div>
      </div>

      <aside className="card mapInfo map3dInfo canonicalMapInfo">
        <div className="kicker">{locale==="es"?"LEYENDA / INFORMACIÓN":"LEGEND / INFORMATION"}</div>
        <h2>{title}</h2>
        <p>{dbDescription||canonicalDescription}</p>
        {selectedCanonical&&<div className="canonicalEmotion">
          <span>{locale==="es"?"Lectura emocional":"Emotional reading"}</span>
          <strong>{locale==="es"?selectedCanonical.emotionEs:selectedCanonical.emotionEn}</strong>
        </div>}

        <div className="canonicalLegend">
          {canonicalZones.map((z,index)=><button
            key={z.slug}
            onClick={()=>select("legend",z.slug)}
            className={selected===z.slug?"active":""}
          >
            <span className={z.className}/>
            <b>{index+1}</b>
            <small>{locale==="es"?z.labelEs:z.labelEn}</small>
          </button>)}
        </div>

        <div className="canonicalMapFacts">
          <strong>{locale==="es"?"DATOS DE LUMEN":"LUMEN DATA"}</strong>
          <span>{locale==="es"?"Estado: Sellada":"Status: Sealed"}</span>
          <span>{locale==="es"?"Gobierno: Consejo de Lumen":"Government: Lumen Council"}</span>
          <span>{locale==="es"?"Halo emocional: En formación":"Emotional Halo: Forming"}</span>
        </div>
      </aside>
    </div>
  </div>;
}
