"use client";

import {useMemo,useRef,useState} from "react";
import type {Locale} from "../lib/i18n";

type Region={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;color:string|null};
type Point={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;x:number|null;y:number|null;icon:string|null};

export function LumenMap({locale,regions,points}:{locale:Locale;regions:Region[];points:Point[]}) {
  const[selected,setSelected]=useState<string>("vorax");
  const[zoom,setZoom]=useState(1);
  const[tilt,setTilt]=useState({x:58,y:-8});
  const dragging=useRef(false);
  const last=useRef({x:0,y:0});

  const regionMap=useMemo(()=>Object.fromEntries(regions.map(r=>[r.slug,r])),[regions]);
  const selectedRegion=regionMap[selected];

  function track(kind:string,slug:string){
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"map_interaction",locale,path:`/${locale}/mapa`,metadata:{kind,slug}
    }),keepalive:true}).catch(()=>{});
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
      x:Math.max(42,Math.min(72,t.x-dy*.22)),
      y:Math.max(-24,Math.min(24,t.y+dx*.22))
    }));
  }
  function onPointerUp(e:React.PointerEvent<HTMLDivElement>){
    dragging.current=false;
    try{e.currentTarget.releasePointerCapture(e.pointerId)}catch{}
  }

  const details=selectedRegion
    ?{title:locale==="es"?selectedRegion.name_es:selectedRegion.name_en,body:locale==="es"?selectedRegion.description_es:selectedRegion.description_en}
    :points.find(p=>p.slug===selected);

  return <div className="mapLayout map3dLayout">
    <div
      className="mapCanvas map3dCanvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className="map3dAtmosphere" aria-hidden="true"/>
      <div className="mapControls">
        <button type="button" aria-label={locale==="es"?"Acercar":"Zoom in"} onClick={()=>setZoom(z=>Math.min(1.55,z+.1))}>+</button>
        <button type="button" aria-label={locale==="es"?"Alejar":"Zoom out"} onClick={()=>setZoom(z=>Math.max(.82,z-.1))}>−</button>
        <button type="button" aria-label={locale==="es"?"Restablecer vista":"Reset view"} onClick={()=>{setZoom(1);setTilt({x:58,y:-8})}}>↺</button>
      </div>
      <div className="map3dHint">{locale==="es"?"ARRASTRA PARA ROTAR · CONTROLES PARA ZOOM":"DRAG TO ROTATE · USE CONTROLS TO ZOOM"}</div>

      <div
        className="mapScene map3dScene"
        style={{transform:`perspective(1100px) rotateX(${tilt.x}deg) rotateZ(${tilt.y}deg) scale(${zoom})`}}
      >
        <div className="map3dGrid" aria-hidden="true"/>
        <div className="map3dCore" aria-hidden="true">LUMEN</div>

        <button className="mapRegion vorax" onClick={()=>{setSelected("vorax");track("region","vorax")}}>VORAX</button>
        <button className="mapRegion ethelis" onClick={()=>{setSelected("ethelis");track("region","ethelis")}}>ETHELIS</button>
        <button className="mapRegion nara" onClick={()=>{setSelected("nara");track("region","nara")}}>NARA</button>
        <button className="mapRegion umbral" onClick={()=>{setSelected("umbral");track("region","umbral")}}>UMBRAL</button>

        {points.map(p=><button
          key={p.slug}
          className="mapPoint"
          style={{left:`${p.x??50}%`,top:`${p.y??50}%`}}
          onClick={()=>{setSelected(p.slug);track("point",p.slug)}}
          aria-label={locale==="es"?p.name_es:p.name_en}
        >•</button>)}
      </div>
    </div>

    <aside className="card mapInfo map3dInfo">
      <div className="kicker">{locale==="es"?"Exploración 3D de Lumen":"3D exploration of Lumen"}</div>
      <h2>{selectedRegion?(locale==="es"?selectedRegion.name_es:selectedRegion.name_en):(details?locale==="es"?(details as Point).name_es:(details as Point).name_en:"Lumen")}</h2>
      <p>{selectedRegion?(locale==="es"?selectedRegion.description_es:selectedRegion.description_en):(details?locale==="es"?(details as Point).description_es:(details as Point).description_en:"")}</p>
      <div className="mapLegend">
        {regions.map(r=><button key={r.slug} onClick={()=>{setSelected(r.slug);track("legend",r.slug)}} className={selected===r.slug?"active":""}>
          <span style={{background:r.color||"#C9A84C"}}/>{locale==="es"?r.name_es:r.name_en}
        </button>)}
      </div>
    </aside>
  </div>;
}
