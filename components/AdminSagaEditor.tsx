"use client";
import { useEffect,useState } from "react";

export function AdminSagaEditor(){
  const[books,setBooks]=useState<any[]>([]);
  const[msg,setMsg]=useState("");

  useEffect(()=>{
    fetch("/api/admin/saga").then(r=>r.json()).then(j=>setBooks(j.data||[]));
  },[]);

  function setBook(i:number,k:string,v:any){
    setBooks(bs=>bs.map((b,n)=>n===i?{...b,[k]:v}:b));
  }

  function setEdition(i:number,j:number,k:string,v:any){
    setBooks(bs=>bs.map((b,n)=>n===i
      ?{...b,editions:(b.editions||[]).map((e:any,m:number)=>m===j?{...e,[k]:v}:e)}
      :b
    ));
  }

  function addEdition(i:number){
    setBooks(bs=>bs.map((b,n)=>n===i
      ?{...b,editions:[...(b.editions||[]),{locale:"fr",marketplace:"amazon.com",asin:"",amazon_url:"",status:"coming_soon",cover_media_slug:""}]}
      :b
    ));
  }

  async function save(i:number){
    setMsg("Guardando…");
    const r=await fetch("/api/admin/saga",{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(books[i])
    });
    const j=await r.json();
    if(r.ok){
      setBooks(bs=>bs.map((b,n)=>n===i?j.data:b));
      setMsg("Guardado ✓");
    }else setMsg(j.error||"Error al guardar");
  }

  return <div className="adminBookGrid">
    {books.map((b,i)=><article className="card" key={b.id}>
      <div className="kicker">FRAGMENTUN {b.volume}</div>

      <label>Título ES</label>
      <input value={b.title_es||""} onChange={e=>setBook(i,"title_es",e.target.value)}/>
      <label>Subtítulo ES</label>
      <input value={b.subtitle_es||""} onChange={e=>setBook(i,"subtitle_es",e.target.value)}/>
      <label>Title EN</label>
      <input value={b.title_en||""} onChange={e=>setBook(i,"title_en",e.target.value)}/>
      <label>Subtitle EN</label>
      <input value={b.subtitle_en||""} onChange={e=>setBook(i,"subtitle_en",e.target.value)}/>

      <label>Estado general</label>
      <select value={b.status} onChange={e=>setBook(i,"status",e.target.value)}>
        <option value="published">Publicado</option>
        <option value="coming_soon">Próximamente</option>
        <option value="development">Desarrollo</option>
      </select>

      <div className="editionList">
        {(b.editions||[]).map((ed:any,j:number)=><div className="editionCard" key={ed.id||`${ed.locale}-${j}`}>
          <div className="editionGrid">
            <label>Idioma
              <input value={ed.locale||""} onChange={e=>setEdition(i,j,"locale",e.target.value.toLowerCase())}/>
            </label>
            <label>Tienda
              <input value={ed.marketplace||"amazon.com"} onChange={e=>setEdition(i,j,"marketplace",e.target.value)}/>
            </label>
            <label>ASIN
              <input value={ed.asin||""} onChange={e=>setEdition(i,j,"asin",e.target.value)}/>
            </label>
            <label>Estado
              <select value={ed.status||"coming_soon"} onChange={e=>setEdition(i,j,"status",e.target.value)}>
                <option value="published">Publicado</option>
                <option value="coming_soon">Próximamente</option>
                <option value="development">Desarrollo</option>
              </select>
            </label>
          </div>

          <label>URL específica de Amazon</label>
          <input
            value={ed.amazon_url||""}
            onChange={e=>setEdition(i,j,"amazon_url",e.target.value)}
            placeholder="https://www.amazon.com/dp/..."
          />
        </div>)}

        <button className="btn btnGhost" type="button" onClick={()=>addEdition(i)}>
          + Añadir idioma / edición
        </button>
      </div>

      <button className="btn btnPrimary" onClick={()=>save(i)}>Guardar libro</button>
    </article>)}
    <p>{msg}</p>
  </div>;
}
