"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";

function publicUrl(row:any){
  if(!row?.storage_path)return "";
  if(row.storage_path.startsWith("/")||/^https?:\/\//i.test(row.storage_path))return row.storage_path;
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
  return base?`${base}/storage/v1/object/public/${row.storage_path}`:"";
}

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
    <div className="card adminMediaUploadCard">
      <div className="adminPanelHeader"><div><div className="kicker">Biblioteca oficial</div><h2>Subir archivo</h2></div><span className="adminPanelBadge">BIBLIOTECA</span></div>
      <div className="adminFormGrid">
        <input placeholder="slug-ejemplo" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/>
        <select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="image">Imagen</option><option value="pdf">PDF</option><option value="video">Video</option><option value="press">Press kit</option></select>
        <select value={form.bucket} onChange={e=>setForm({...form,bucket:e.target.value})}><option value="official-media">Official media</option><option value="editorial-media">Editorial media</option><option value="press-kit">Press kit</option></select>
        <input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/>
        <input placeholder="Alt ES" value={form.alt_es} onChange={e=>setForm({...form,alt_es:e.target.value})}/>
        <input placeholder="Alt EN" value={form.alt_en} onChange={e=>setForm({...form,alt_en:e.target.value})}/>
        <button className="btn btnPrimary" onClick={upload}>Subir archivo</button>
      </div>
      <p className="note">Usa “Official media” para portada publicada y arte aprobado. “Editorial media” permanece privado.</p>
      <p>{msg}</p>
    </div>

    <div className="card adminMediaLibraryCard" style={{marginTop:22}}>
      <div className="adminPanelHeader"><div><div className="kicker">Recursos</div><h2>Biblioteca</h2></div><span className="adminPanelBadge">{rows.length} archivos</span></div>
      <div className="adminMediaGallery">
        {rows.map(r=>{
          const src=publicUrl(r);
          return <article className="adminMediaTile" key={r.id}>
            <div className="adminMediaThumb">
              {r.kind==="image"&&src?<img src={src} alt={r.alt_es||r.slug}/>:<div className="adminMediaType">{String(r.kind||"media").toUpperCase()}</div>}
              <span className={r.public_visible?"live":"private"}>{r.public_visible?"Público":"Privado"}</span>
            </div>
            <div className="adminMediaMeta"><strong>{r.slug}</strong><small>{r.kind} · {r.storage_path}</small></div>
          </article>
        })}
      </div>
    </div>
  </div>;
}
