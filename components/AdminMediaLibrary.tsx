"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";

const categories=[
  ["covers","Portadas"],
  ["characters","Personajes"],
  ["lumen","Lumen"],
  ["author","Autor"],
  ["campaigns","Campañas"],
  ["videos","Videos"],
  ["concept","Arte conceptual"],
  ["rewards","Recompensas"],
  ["branding","Logos / Branding"],
  ["other","Otros"]
] as const;

function publicUrl(row:any){
  if(!row?.storage_path)return "";
  if(row.storage_path.startsWith("/")||/^https?:\/\//i.test(row.storage_path))return row.storage_path;
  if(row.protected===true||row.public_visible===false||String(row.storage_path).startsWith("editorial-media/"))return "";
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
  return base?`${base}/storage/v1/object/public/${row.storage_path}`:"";
}
function inferCategory(row:any){
  const explicit=String(row?.metadata?.category||"").trim();
  if(explicit)return explicit;
  const s=`${row?.slug||""} ${row?.storage_path||""} ${row?.metadata?.usage||""}`.toLowerCase();
  if(/cover|portada|book/.test(s))return "covers";
  if(/elyon|nara|vorax|ethelis|umbral|character|personaje/.test(s))return "characters";
  if(/lumen|map|territor/.test(s))return "lumen";
  if(/author|autor|jose-liranzo/.test(s))return "author";
  if(/campaign|campana|social|poster|promo/.test(s))return "campaigns";
  if(row?.kind==="video"||/video|trailer/.test(s))return "videos";
  if(/reward|recompensa/.test(s))return "rewards";
  if(/concept|arte/.test(s))return "concept";
  if(/logo|brand|mark|wordmark/.test(s))return "branding";
  return "other";
}
function categoryLabel(key:string){return categories.find(x=>x[0]===key)?.[1]||"Otros"}
function youtubeId(url:string){
  try{
    const u=new URL(url);
    if(u.hostname.includes("youtu.be"))return u.pathname.slice(1);
    if(u.hostname.includes("youtube.com"))return u.searchParams.get("v")||u.pathname.split("/").filter(Boolean).pop()||"";
  }catch{}
  return "";
}
function fileSize(row:any){
  const n=Number(row?.metadata?.size||0);
  if(!n)return "";
  if(n<1024)return `${n} B`;
  if(n<1024*1024)return `${(n/1024).toFixed(1)} KB`;
  return `${(n/1024/1024).toFixed(1)} MB`;
}

export function AdminMediaLibrary(){
  const[rows,setRows]=useState<any[]>([]);
  const[file,setFile]=useState<File|null>(null);
  const[form,setForm]=useState({slug:"",kind:"image",category:"other",alt_es:"",alt_en:"",bucket:"official-media",public_visible:true});
  const[msg,setMsg]=useState("");
  const[loadError,setLoadError]=useState(false);
  const[query,setQuery]=useState("");
  const[category,setCategory]=useState("all");
  const[kind,setKind]=useState("all");
  const[selected,setSelected]=useState<any|null>(null);
  const[copied,setCopied]=useState(false);
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);
  const load=()=>fetch("/api/admin/media").then(async r=>{const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error("load_failed");setRows(j.data||[]);setLoadError(false)}).catch(()=>setLoadError(true));
  useEffect(()=>{load()},[]);

  const filtered=useMemo(()=>rows.filter(row=>{
    const q=query.trim().toLowerCase();
    const cat=inferCategory(row);
    if(category!=="all"&&cat!==category)return false;
    if(kind!=="all"&&String(row.kind)!==kind)return false;
    if(!q)return true;
    return `${row.slug||""} ${row.alt_es||""} ${row.alt_en||""} ${categoryLabel(cat)}`.toLowerCase().includes(q);
  }),[rows,query,category,kind]);

  async function upload(){
    if(!file||!form.slug){setMsg("Selecciona un archivo y escribe un nombre interno.");return}
    setMsg("Subiendo…");
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${form.slug}/${Date.now()}-${safe}`;
    try{
      const{error}=await supabase.storage.from(form.bucket).upload(path,file,{upsert:false,contentType:file.type||undefined});
      if(error){setMsg("No fue posible subir el archivo.");return}
      const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
        slug:form.slug,kind:form.kind,storage_path:`${form.bucket}/${path}`,alt_es:form.alt_es,alt_en:form.alt_en,
        protected:form.bucket==="editorial-media",public_visible:form.public_visible&&form.bucket!=="editorial-media",
        metadata:{filename:file.name,size:file.size,mime:file.type,bucket:form.bucket,path,category:form.category}
      })});
      if(!r.ok){
        await supabase.storage.from(form.bucket).remove([path]).catch(()=>{});
        setMsg("No fue posible registrar el recurso. La subida fue revertida.");
        return;
      }
      setMsg("GUARDADO SATISFACTORIAMENTE");
      setFile(null);setForm(v=>({...v,slug:"",alt_es:"",alt_en:""}));load()
    }catch{
      setMsg("No fue posible completar la subida. Revisa la conexión e inténtalo nuevamente.");
    }
  }

  async function copyUrl(row:any){
    const url=publicUrl(row);
    if(!url)return;
    try{
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(()=>setCopied(false),1800);
    }catch{
      setCopied(false);
      setMsg("No fue posible copiar la URL.");
    }
  }

  if(loadError)return <div className="adminMediaExperience"><section className="card"><p className="adminSaveFeedback error">No fue posible cargar la biblioteca de medios.</p><button type="button" className="btn btnGhost" onClick={()=>window.location.reload()}>Reintentar</button></section></div>;

  return <div className="adminMediaExperience">
    <section className="card adminMediaUploadCard">
      <div className="adminPanelHeader">
        <div><div className="kicker">Biblioteca oficial</div><h2>Subir nuevo recurso</h2><p className="note">Organiza cada archivo desde el momento en que entra al ecosistema FRAGMENTUN.</p></div>
        <span className="adminPanelBadge">NUEVO ACTIVO</span>
      </div>
      <div className="adminMediaUploadGrid">
        <label><span>Nombre interno</span><input placeholder="ej. elyon-azotea-halo" value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})}/></label>
        <label><span>Categoría</span><select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Tipo</span><select value={form.kind} onChange={e=>setForm({...form,kind:e.target.value})}><option value="image">Imagen</option><option value="pdf">PDF</option><option value="video">Video</option><option value="press">Kit de prensa</option></select></label>
        <label><span>Destino</span><select value={form.bucket} onChange={e=>setForm({...form,bucket:e.target.value})}><option value="official-media">Medios oficiales · público</option><option value="editorial-media">Medios editoriales · privado</option><option value="press-kit">Kit de prensa</option></select></label>
        <label className="adminMediaFileInput"><span>Archivo</span><input type="file" onChange={e=>setFile(e.target.files?.[0]||null)}/><small>{file?file.name:"Ningún archivo seleccionado"}</small></label>
        <label><span>Descripción ES</span><input placeholder="Descripción accesible en español" value={form.alt_es} onChange={e=>setForm({...form,alt_es:e.target.value})}/></label>
        <label><span>Descripción EN</span><input placeholder="Accessible description in English" value={form.alt_en} onChange={e=>setForm({...form,alt_en:e.target.value})}/></label>
        <div className="adminMediaUploadAction"><button className="btn btnPrimary" onClick={upload}>Subir a Biblioteca</button><span className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&msg!=="Subiendo…"?"adminSaveFeedback error":"adminSaveFeedback")}>{msg||"El original se conserva sin modificaciones."}</span></div>
      </div>
    </section>

    <section className="card adminMediaLibraryCard">
      <div className="adminPanelHeader">
        <div><div className="kicker">Archivo maestro visual</div><h2>Biblioteca de Medios</h2><p className="note">Busca, filtra y abre cualquier recurso visual de FRAGMENTUN.</p></div>
        <span className="adminPanelBadge">{rows.length} ACTIVOS</span>
      </div>

      <div className="adminMediaFilters">
        <label className="adminMediaSearch"><span>Buscar</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Nombre, descripción o categoría…"/></label>
        <label><span>Categoría</span><select value={category} onChange={e=>setCategory(e.target.value)}><option value="all">Todas</option>{categories.map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label>
        <label><span>Tipo</span><select value={kind} onChange={e=>setKind(e.target.value)}><option value="all">Todos</option><option value="image">Imágenes</option><option value="video">Videos</option><option value="pdf">PDF</option><option value="press">Prensa</option></select></label>
        <div className="adminMediaResultCount"><strong>{filtered.length}</strong><span>visibles</span></div>
      </div>

      {filtered.length===0
        ?<div className="adminMediaEmpty"><strong>No hay recursos que coincidan.</strong><span>Prueba otra categoría o término de búsqueda.</span></div>
        :<div className="adminMediaGallery adminMediaGalleryEnhanced">
          {filtered.map(r=>{
            const src=publicUrl(r);
            const cat=inferCategory(r);
            return <article className="adminMediaTile adminMediaTileEnhanced" key={r.id}>
              <button type="button" className="adminMediaThumb adminMediaThumbButton" onClick={()=>setSelected(r)} aria-label={`Abrir ${r.slug}`}>
                {r.kind==="image"&&src?<img src={src} alt={r.alt_es||r.slug}/>:r.kind==="video"&&src&&youtubeId(src)?<img src={`https://i.ytimg.com/vi/${youtubeId(src)}/hqdefault.jpg`} alt={r.alt_es||r.slug}/>:r.kind==="video"&&src?<video src={src} muted playsInline preload="metadata"/>:<div className="adminMediaType">{String(r.kind||"media").toUpperCase()}</div>}
                <span className={r.public_visible?"live":"private"}>{r.public_visible?"Público":"Privado"}</span>
                <em>{categoryLabel(cat)}</em>
              </button>
              <div className="adminMediaMeta">
                <strong>{r.slug}</strong>
                <small>{categoryLabel(cat)} · {String(r.kind||"media").toUpperCase()}{fileSize(r)?` · ${fileSize(r)}`:""}</small>
                <div className="adminMediaTileActions">
                  <button type="button" onClick={()=>setSelected(r)}>Previsualizar</button>
                  {src?<button type="button" onClick={()=>copyUrl(r)}>Copiar URL</button>:<span className="note">Recurso privado</span>}
                </div>
              </div>
            </article>
          })}
        </div>}
    </section>

    {selected&&<div className="adminMediaModalBackdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}>
      <section className="adminMediaModal" role="dialog" aria-modal="true" aria-label={selected.slug}>
        <button className="adminMediaModalClose" type="button" onClick={()=>setSelected(null)}>×</button>
        <div className="adminMediaModalPreview">
          {selected.kind==="image"&&publicUrl(selected)?<img src={publicUrl(selected)} alt={selected.alt_es||selected.slug}/>:selected.kind==="video"&&publicUrl(selected)&&youtubeId(publicUrl(selected))?<iframe className="adminMediaYoutubeFrame" src={`https://www.youtube-nocookie.com/embed/${youtubeId(publicUrl(selected))}`} title={selected.slug} allow="encrypted-media; picture-in-picture" allowFullScreen/>:selected.kind==="video"&&publicUrl(selected)?<video src={publicUrl(selected)} controls playsInline/>:<div className="adminMediaType">{String(selected.kind||"media").toUpperCase()}</div>}
        </div>
        <div className="adminMediaModalInfo">
          <div className="kicker">{categoryLabel(inferCategory(selected))}</div>
          <h2>{selected.slug}</h2>
          <div className="adminMediaDetailGrid">
            <div><span>Tipo</span><strong>{String(selected.kind||"media").toUpperCase()}</strong></div>
            <div><span>Estado</span><strong>{selected.public_visible?"Público":"Privado"}</strong></div>
            <div><span>Tamaño</span><strong>{fileSize(selected)||"—"}</strong></div>
            <div><span>Creado</span><strong>{selected.created_at?new Date(selected.created_at).toLocaleDateString():"—"}</strong></div>
          </div>
          {selected.alt_es&&<p><strong>ES:</strong> {selected.alt_es}</p>}
          {selected.alt_en&&<p><strong>EN:</strong> {selected.alt_en}</p>}
          <div className="adminMediaModalActions">
            {publicUrl(selected)?<>
              <a className="btn btnPrimary" href={publicUrl(selected)} target="_blank" rel="noreferrer">Abrir original</a>
              <button className="btn btnGhost" type="button" onClick={()=>copyUrl(selected)}>{copied?"URL copiada ✓":"Copiar URL"}</button>
            </>:<span className="adminSaveFeedback">Recurso privado · sin URL pública</span>}
          </div>
        </div>
      </section>
    </div>}
  </div>;
}
