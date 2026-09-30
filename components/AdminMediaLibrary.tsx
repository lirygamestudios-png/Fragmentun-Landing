"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";

export function AdminMediaLibrary(){
  const[rows,setRows]=useState<any[]>([]);
  const[file,setFile]=useState<File|null>(null);
  const[form,setForm]=useState({slug:"",kind:"image",alt_es:"",alt_en:"",bucket:"official-media",public_visible:true});
  const[msg,setMsg]=useState("");
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
  const load=()=>fetch("/api/admin/media").then(r=>r.json()).then(j=>setRows(j.data||[]));
  useEffect(()=>{load()},[]);

  async function upload(){
    if(!file||!form.slug){setMsg("Selecciona un archivo y define un slug.");return}
    setMsg("Subiendo…");
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${form.slug}/${Date.now()}-${safe}`;
    const{error}=await supabase.storage.from(form.bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
    if(error){setMsg(error.message);return}
    const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug:form.slug,kind:form.kind,storage_path:`${form.bucket}/${path}`,alt_es:form.alt_es,alt_en:form.alt_en,
      protected:form.bucket==="editorial-media",public_visible:form.public_visible&&form.bucket!=="editorial-media",
      metadata:{filename:file.name,size:file.size,mime:file.type,bucket:form.bucket,path}
    })});
    setMsg(r.ok?"Archivo guardado ✓":"El archivo subió, pero faltó registrar su metadata.");
    if(r.ok){setFile(null);load()}
  }

  return <div>
    <div className="card">
      <h2>Subir recurso</h2>
      <div className="adminFormGrid">
        <input placeholder="slug-ejemplo" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/>
        <select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="image">Imagen</option><option value="pdf">PDF</option><option value="video">Video</option><option value="press">Press kit</option></select>
        <select value={form.bucket} onChange={e=>setForm({...form,bucket:e.target.value})}><option value="official-media">Official media</option><option value="editorial-media">Editorial media</option><option value="press-kit">Press kit</option></select>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/>
        <input placeholder="Alt ES" value={form.alt_es} onChange={e=>setForm({...form,alt_es:e.target.value})}/>
        <input placeholder="Alt EN" value={form.alt_en} onChange={e=>setForm({...form,alt_en:e.target.value})}/>
        <button className="btn btnPrimary" onClick={upload}>Subir recurso</button>
      </div>
      <p className="note">Usa “Official media” para portada publicada y arte aprobado. “Editorial media” permanece privado.</p>
      <p>{msg}</p>
    </div>

    <div className="card" style={{marginTop:22}}>
      <h2>Biblioteca</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Slug</th><th>Tipo</th><th>Ruta</th><th>Público</th></tr></thead><tbody>
        {rows.map(r=><tr key={r.id}><td>{r.slug}</td><td>{r.kind}</td><td style={{maxWidth:360,wordBreak:"break-all"}}>{r.storage_path}</td><td>{r.public_visible?"Sí":"No"}</td></tr>)}
      </tbody></table></div>
    </div>
  </div>;
}
