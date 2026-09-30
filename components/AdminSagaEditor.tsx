"use client";
import { useEffect,useState } from "react";

export function AdminSagaEditor(){
  const[books,setBooks]=useState<any[]>([]);const[msg,setMsg]=useState("");
  useEffect(()=>{fetch("/api/admin/saga").then(r=>r.json()).then(j=>setBooks(j.data||[]))},[]);
  function set(i:number,k:string,v:any){setBooks(bs=>bs.map((b,n)=>n===i?{...b,[k]:v}:b))}
  async function save(i:number){
    setMsg("Guardando…");const r=await fetch("/api/admin/saga",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(books[i])});
    const j=await r.json();if(r.ok){set(i,"id",j.data.id);setMsg("Guardado ✓")}else setMsg("Error al guardar");
  }
  return <div className="adminBookGrid">{books.map((b,i)=><article className="card" key={b.id}>
    <div className="kicker">FRAGMENTUN {b.volume}</div>
    <label>Título ES</label><input value={b.title_es||""} onChange={e=>set(i,"title_es",e.target.value)}/>
    <label>Subtitle ES</label><input value={b.subtitle_es||""} onChange={e=>set(i,"subtitle_es",e.target.value)}/>
    <label>Title EN</label><input value={b.title_en||""} onChange={e=>set(i,"title_en",e.target.value)}/>
    <label>Subtitle EN</label><input value={b.subtitle_en||""} onChange={e=>set(i,"subtitle_en",e.target.value)}/>
    <label>Estado</label><select value={b.status} onChange={e=>set(i,"status",e.target.value)}><option value="published">Publicado</option><option value="coming_soon">Próximamente</option><option value="development">Desarrollo</option></select>
    <label>Amazon ES</label><input value={b.amazon_url_es||""} onChange={e=>set(i,"amazon_url_es",e.target.value)}/>
    <button className="btn btnPrimary" onClick={()=>save(i)}>Guardar</button>
  </article>)}<p>{msg}</p></div>;
}
