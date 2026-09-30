"use client";
import { useEffect,useState } from "react";

export function AdminMapEditor(){
  const[regions,setRegions]=useState<any[]>([]);const[points,setPoints]=useState<any[]>([]);const[msg,setMsg]=useState("");
  useEffect(()=>{fetch("/api/admin/map").then(r=>r.json()).then(j=>{setRegions(j.regions||[]);setPoints(j.points||[])})},[]);
  const update=(kind:"region"|"point",i:number,k:string,v:any)=>kind==="region"?setRegions(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x)):setPoints(a=>a.map((x,n)=>n===i?{...x,[k]:v}:x));
  async function save(kind:"region"|"point",item:any){
    setMsg("Guardando…");
    const r=await fetch("/api/admin/map",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...item,kind})});
    setMsg(r.ok?"Guardado ✓":"Error");
  }
  return <div>
    <h2>Territorios</h2>
    <div className="adminBookGrid">{regions.map((r,i)=><article className="card" key={r.id}>
      <div className="kicker">{r.slug}</div>
      <label>Nombre ES</label><input value={r.name_es||""} onChange={e=>update("region",i,"name_es",e.target.value)}/>
      <label>Name EN</label><input value={r.name_en||""} onChange={e=>update("region",i,"name_en",e.target.value)}/>
      <label>Descripción ES</label><textarea className="adminSmallArea" value={r.description_es||""} onChange={e=>update("region",i,"description_es",e.target.value)}/>
      <label>Description EN</label><textarea className="adminSmallArea" value={r.description_en||""} onChange={e=>update("region",i,"description_en",e.target.value)}/>
      <label>Color</label><input value={r.color||""} onChange={e=>update("region",i,"color",e.target.value)}/>
      <button className="btn btnPrimary" onClick={()=>save("region",r)}>Guardar</button>
    </article>)}</div>
    <h2 style={{marginTop:32}}>Puntos de interés</h2>
    <div className="adminBookGrid">{points.map((p,i)=><article className="card" key={p.id}>
      <div className="kicker">{p.slug}</div>
      <label>Nombre ES</label><input value={p.name_es||""} onChange={e=>update("point",i,"name_es",e.target.value)}/>
      <label>Name EN</label><input value={p.name_en||""} onChange={e=>update("point",i,"name_en",e.target.value)}/>
      <label>X</label><input type="number" value={p.x??50} onChange={e=>update("point",i,"x",e.target.value)}/>
      <label>Y</label><input type="number" value={p.y??50} onChange={e=>update("point",i,"y",e.target.value)}/>
      <button className="btn btnPrimary" onClick={()=>save("point",p)}>Guardar</button>
    </article>)}</div><p>{msg}</p>
  </div>;
}
