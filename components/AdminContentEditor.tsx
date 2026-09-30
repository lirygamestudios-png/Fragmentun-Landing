"use client";
import { useEffect,useState } from "react";

type Row={
  content_key:string;section:string;es:any;en:any;
  status_es:"draft"|"review"|"published";
  status_en:"draft"|"review"|"published";
};

export function AdminContentEditor(){
  const[rows,setRows]=useState<Row[]>([]);
  const[selected,setSelected]=useState<Row|null>(null);
  const[esText,setEsText]=useState("");
  const[enText,setEnText]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(true);

  useEffect(()=>{fetch("/api/admin/content").then(r=>r.json()).then(j=>{setRows(j.data||[]);setLoading(false)})},[]);

  function choose(row:Row){
    setSelected(row);
    setEsText(JSON.stringify(row.es,null,2));
    setEnText(JSON.stringify(row.en,null,2));
    setStatus("");
  }

  async function save(){
    if(!selected)return;
    try{
      const es=JSON.parse(esText),en=JSON.parse(enText);
      setStatus("Guardando…");
      const r=await fetch("/api/admin/content",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        content_key:selected.content_key,es,en,status_es:selected.status_es,status_en:selected.status_en
      })});
      const j=await r.json();
      if(!r.ok) throw new Error(j.error||"error");
      setRows(old=>old.map(x=>x.content_key===selected.content_key?j.data:x));
      setSelected(j.data);setStatus("Guardado ✓");
    }catch(e){setStatus("Revisa el JSON antes de guardar.");}
  }

  if(loading)return <p>Cargando contenido…</p>;
  return <div className="adminEditorGrid">
    <aside className="adminList">
      {rows.map(row=><button key={row.content_key} onClick={()=>choose(row)} className={selected?.content_key===row.content_key?"active":""}>
        <strong>{row.content_key}</strong><span>{row.section}</span>
      </button>)}
    </aside>
    <section className="card">
      {!selected?<p>Selecciona una sección para editar.</p>:<>
        <div className="kicker">{selected.section}</div>
        <h2>{selected.content_key}</h2>
        <div className="adminLangGrid">
          <div>
            <label>ES · JSON</label>
            <textarea value={esText} onChange={e=>setEsText(e.target.value)} className="adminTextarea"/>
            <label>Estado ES</label>
            <select value={selected.status_es} onChange={e=>setSelected({...selected,status_es:e.target.value as Row["status_es"]})}>
              <option value="draft">Borrador</option><option value="review">Revisión</option><option value="published">Publicado</option>
            </select>
          </div>
          <div>
            <label>EN · JSON</label>
            <textarea value={enText} onChange={e=>setEnText(e.target.value)} className="adminTextarea"/>
            <label>Estado EN</label>
            <select value={selected.status_en} onChange={e=>setSelected({...selected,status_en:e.target.value as Row["status_en"]})}>
              <option value="draft">Draft</option><option value="review">Review</option><option value="published">Published</option>
            </select>
          </div>
        </div>
        <div className="adminSaveRow"><button className="btn btnPrimary" onClick={save}>Guardar cambios</button><span>{status}</span></div>
      </>}
    </section>
  </div>;
}
