"use client";
import { useEffect,useState } from "react";

type Character={
  id?:string;slug:string;name:string;role_es:string|null;role_en:string|null;
  bio_es:string|null;bio_en:string|null;territory:string|null;status:string;sort_order:number;
};

const empty:Character={slug:"",name:"",role_es:"",role_en:"",bio_es:"",bio_en:"",territory:"",status:"draft",sort_order:0};

export function AdminCharacters(){
  const[items,setItems]=useState<Character[]>([]);
  const[selected,setSelected]=useState(0);
  const[creating,setCreating]=useState(false);
  const[draft,setDraft]=useState<Character>(empty);
  const[msg,setMsg]=useState("");

  async function load(){
    const r=await fetch("/api/admin/characters");
    const j=await r.json();
    setItems(j.data||[]);
    setSelected(0);
  }

  useEffect(()=>{load()},[]);

  const current=creating?draft:items[selected];

  function update(k:keyof Character,v:any){
    if(creating)setDraft(d=>({...d,[k]:v}));
    else setItems(xs=>xs.map((x,i)=>i===selected?{...x,[k]:v}:x));
  }

  async function save(){
    if(!current)return;
    setMsg("Guardando…");
    const r=await fetch("/api/admin/characters",{
      method:creating?"POST":"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(current)
    });
    const j=await r.json();
    if(!r.ok){setMsg(j.error||"Error al guardar");return;}
    setMsg("Guardado ✓");
    setCreating(false);
    setDraft(empty);
    await load();
  }

  return <div className="adminEditorGrid">
    <aside className="adminList">
      <button className={creating?"active":""} onClick={()=>{setCreating(true);setDraft(empty)}}>
        + Nuevo personaje
      </button>
      {items.map((c,i)=><button key={c.id} className={!creating&&selected===i?"active":""} onClick={()=>{setCreating(false);setSelected(i)}}>
        {c.name}<span>{c.status} · {c.territory||"sin territorio"}</span>
      </button>)}
    </aside>

    <section>
      {!current?<div className="card"><p>No hay personajes todavía.</p></div>:<div className="card">
        <div className="adminFormGrid">
          <label>Nombre<input value={current.name||""} onChange={e=>update("name",e.target.value)}/></label>
          <label>Slug<input value={current.slug||""} onChange={e=>update("slug",e.target.value)}/></label>
          <label>Territorio<input value={current.territory||""} onChange={e=>update("territory",e.target.value)}/></label>
          <label>Orden<input type="number" value={current.sort_order??0} onChange={e=>update("sort_order",Number(e.target.value))}/></label>
        </div>

        <div className="adminLangGrid" style={{marginTop:18}}>
          <div>
            <div className="kicker">Español</div>
            <label>Rol</label><input value={current.role_es||""} onChange={e=>update("role_es",e.target.value)}/>
            <label>Biografía</label><textarea className="adminSmallArea" value={current.bio_es||""} onChange={e=>update("bio_es",e.target.value)}/>
          </div>
          <div>
            <div className="kicker">English</div>
            <label>Role</label><input value={current.role_en||""} onChange={e=>update("role_en",e.target.value)}/>
            <label>Biography</label><textarea className="adminSmallArea" value={current.bio_en||""} onChange={e=>update("bio_en",e.target.value)}/>
          </div>
        </div>

        <label style={{display:"block",marginTop:16}}>Estado</label>
        <select value={current.status} onChange={e=>update("status",e.target.value)}>
          <option value="draft">Borrador</option>
          <option value="published">Publicado</option>
          <option value="hidden">Oculto</option>
        </select>

        <div className="adminSaveRow">
          <button className="btn btnPrimary" onClick={save}>Guardar personaje</button>
          <span>{msg}</span>
        </div>
      </div>}
    </section>
  </div>;
}
