"use client";

import { useMemo,useState } from "react";
import type { Locale } from "../lib/i18n";

type Region={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;color:string|null};
type Point={slug:string;name_es:string;name_en:string;description_es:string|null;description_en:string|null;x:number|null;y:number|null;icon:string|null};

export function LumenMap({locale,regions,points}:{locale:Locale;regions:Region[];points:Point[]}) {
  const [selected,setSelected]=useState<string>("vorax");
  const [zoom,setZoom]=useState(1);
  const regionMap=useMemo(()=>Object.fromEntries(regions.map(r=>[r.slug,r])),[regions]);
  const selectedRegion=regionMap[selected];

  function track(kind:string,slug:string){
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"map_interaction",locale,path:`/${locale}/mapa`,metadata:{kind,slug}
    }),keepalive:true}).catch(()=>{});
  }

  const details=selectedRegion
    ?{title:locale==="es"?selectedRegion.name_es:selectedRegion.name_en,body:locale==="es"?selectedRegion.description_es:selectedRegion.description_en}
    :points.find(p=>p.slug===selected);

  return <div className="mapLayout">
    <div className="mapCanvas">
      <div className="mapControls">
        <button onClick={()=>setZoom(z=>Math.min(1.5,z+.1))}>+</button>
        <button onClick={()=>setZoom(z=>Math.max(.8,z-.1))}>−</button>
        <button onClick={()=>setZoom(1)}>↺</button>
      </div>
      <div className="mapScene" style={{transform:`scale(${zoom})`}}>
        <button className="mapRegion vorax" onClick={()=>{setSelected("vorax");track("region","vorax")}}>VORAX</button>
        <button className="mapRegion ethelis" onClick={()=>{setSelected("ethelis");track("region","ethelis")}}>ETHELIS</button>
        <button className="mapRegion nara" onClick={()=>{setSelected("nara");track("region","nara")}}>NARA</button>
        <button className="mapRegion umbral" onClick={()=>{setSelected("umbral");track("region","umbral")}}>UMBRAL</button>
        {points.map(p=><button key={p.slug} className="mapPoint" style={{left:`${p.x??50}%`,top:`${p.y??50}%`}} onClick={()=>{setSelected(p.slug);track("point",p.slug)}} aria-label={locale==="es"?p.name_es:p.name_en}>•</button>)}
      </div>
    </div>
    <aside className="card mapInfo">
      <div className="kicker">{locale==="es"?"Exploración de Lumen":"Explore Lumen"}</div>
      <h2>{selectedRegion?(locale==="es"?selectedRegion.name_es:selectedRegion.name_en):(details?locale==="es"?(details as Point).name_es:(details as Point).name_en:"Lumen")}</h2>
      <p>{selectedRegion?(locale==="es"?selectedRegion.description_es:selectedRegion.description_en):(details?locale==="es"?(details as Point).description_es:(details as Point).description_en:"")}</p>
      <div className="mapLegend">
        {regions.map(r=><button key={r.slug} onClick={()=>setSelected(r.slug)}><span style={{background:r.color||"#C9A84C"}}/>{locale==="es"?r.name_es:r.name_en}</button>)}
      </div>
    </aside>
  </div>;
}
