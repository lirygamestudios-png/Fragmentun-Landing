"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";

type Row={
  content_key:string;section:string;es:any;en:any;
  status_es:"draft"|"review"|"published";
  status_en:"draft"|"review"|"published";
};
type MediaAsset={id:string;slug:string;kind:string;storage_path:string;public_visible:boolean};

export function AdminContentEditor(){
  const[rows,setRows]=useState<Row[]>([]);
  const[selected,setSelected]=useState<Row|null>(null);
  const[esText,setEsText]=useState("");
  const[enText,setEnText]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(true);
  const[media,setMedia]=useState<MediaAsset[]>([]);
  const[authorFile,setAuthorFile]=useState<File|null>(null);
  const[uploading,setUploading]=useState(false);
  const[showAdvanced,setShowAdvanced]=useState(false);
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);

  useEffect(()=>{
    Promise.all([fetch("/api/admin/content"),fetch("/api/admin/media")])
      .then(async([a,b])=>[await a.json(),await b.json()])
      .then(([content,assets])=>{setRows(content.data||[]);setMedia(assets.data||[]);setLoading(false)})
  },[]);

  function choose(row:Row){
    setSelected(row);
    setEsText(JSON.stringify(row.es,null,2));
    setEnText(JSON.stringify(row.en,null,2));
    setStatus("");
    setShowAdvanced(false);
  }

  function assetUrl(asset:MediaAsset){
    if(asset.storage_path.startsWith("/")||/^https?:\/\//i.test(asset.storage_path))return asset.storage_path;
    const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
    return base?`${base}/storage/v1/object/public/${asset.storage_path}`:"";
  }

  function setMediaField(lang:"es"|"en",field:"image_url"|"video_url"|"poster_url"|"art_url",value:string){
    try{
      const current=JSON.parse(lang==="es"?esText:enText);
      const next={...current,[field]:value};
      if(lang==="es")setEsText(JSON.stringify(next,null,2));
      else setEnText(JSON.stringify(next,null,2));
    }catch{
      setStatus("Revisa el JSON antes de asignar multimedia.");
    }
  }

  function mediaFieldValue(lang:"es"|"en",field:string){
    try{return JSON.parse(lang==="es"?esText:enText)?.[field]||""}catch{return ""}
  }

  function json(lang:"es"|"en"){try{return JSON.parse(lang==="es"?esText:enText)||{}}catch{return {}}}
  function setField(lang:"es"|"en",field:string,value:string){
    const next={...json(lang),[field]:value};
    if(lang==="es")setEsText(JSON.stringify(next,null,2)); else setEnText(JSON.stringify(next,null,2));
  }
  function authorImage(){return json("es").image_url||json("en").image_url||""}
  function setAuthorImage(value:string){
    const es={...json("es"),image_url:value,poster_url:value};
    const en={...json("en"),image_url:value,poster_url:value};
    setEsText(JSON.stringify(es,null,2));
    setEnText(JSON.stringify(en,null,2));
  }
  async function uploadAuthorImage(){
    if(!authorFile)return;
    setUploading(true);setStatus("Subiendo imagen…");
    const slug="jose-liranzo-author";
    const safe=authorFile.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    const{error}=await supabase.storage.from("official-media").upload(path,authorFile,{contentType:authorFile.type||undefined});
    if(error){setUploading(false);setStatus(error.message);return}
    const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,kind:"image",storage_path:`official-media/${path}`,alt_es:"José Liranzo, autor de FRAGMENTUN",alt_en:"José Liranzo, author of FRAGMENTUN",protected:false,public_visible:true,metadata:{filename:authorFile.name,bucket:"official-media",path,usage:"author_photo"}})});
    const j=await r.json();
    if(!r.ok){setUploading(false);setStatus(j.error||"No se pudo registrar la imagen.");return}
    const url=assetUrl(j.data);setAuthorImage(url);setMedia(m=>[j.data,...m.filter(x=>x.id!==j.data.id)]);setAuthorFile(null);setUploading(false);setStatus("Imagen preparada. Pulsa Guardar cambios.");
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
      setSelected(j.data);
      setEsText(JSON.stringify(j.data.es||{},null,2));
      setEnText(JSON.stringify(j.data.en||{},null,2));
      setStatus("Guardado ✓");
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
        {selected.content_key==="home.author"&&<div className="adminAuthorVisual">
          <div className="adminAuthorVisualHead"><div><div className="kicker">Imagen del autor</div><h3>Fotografía pública</h3></div><span>ES + EN</span></div>
          <div className="adminAuthorVisualGrid">
            <div className="adminAuthorPreview">{authorImage()?<img src={authorImage()} alt="José Liranzo"/>:<div>JL</div>}</div>
            <div className="adminAuthorControls">
              <label>Imagen de Multimedia<select value={authorImage()} onChange={e=>setAuthorImage(e.target.value)}><option value="">— Sin imagen —</option>{media.filter(m=>m.public_visible&&m.kind==="image").map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}</select></label>
              <label>Subir nueva fotografía<input type="file" accept="image/*" onChange={e=>setAuthorFile(e.target.files?.[0]||null)}/></label>
              <button className="btn btnPrimary" type="button" disabled={!authorFile||uploading} onClick={uploadAuthorImage}>{uploading?"Subiendo…":"Subir fotografía"}</button>
              <p className="note">Después de subirla, pulsa “Guardar cambios” para publicarla en la sección Autor.</p>
            </div>
          </div>
        </div>}
        <div className="card" style={{marginBottom:18}}>
          <div className="kicker">Multimedia rápida</div>
          <p className="note">Asigna recursos aprobados de la Biblioteca sin editar rutas manualmente. El JSON continúa disponible para campos avanzados.</p>
          <div className="adminLangGrid">
            {(["es","en"] as const).map(lang=><div key={lang}>
              <strong>{lang==="es"?"Español":"English"}</strong>
              {(["image_url","video_url","poster_url","art_url"] as const).map(field=>{
                const wantVideo=field==="video_url";
                const options=media.filter(m=>m.public_visible&&(wantVideo?m.kind==="video":m.kind==="image"));
                return <label key={field} style={{display:"block",marginTop:10}}>
                  {field}
                  <select value={mediaFieldValue(lang,field)} onChange={e=>setMediaField(lang,field,e.target.value)}>
                    <option value="">— Sin asignar —</option>
                    {options.map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}
                  </select>
                </label>;
              })}
            </div>)}
          </div>
        </div>
        <div className="adminLangGrid">
          {(["es","en"] as const).map(lang=><div className="adminVisualContentFields" key={lang}>
            <div className="kicker">{lang==="es"?"Español":"Inglés"}</div>
            {Object.entries(json(lang))
              .filter(([key,value])=>!["image_url","video_url","poster_url","art_url"].includes(key)&&["string","number","boolean"].includes(typeof value))
              .map(([key,value])=><label key={key}>
                <span>{key.replace(/_/g," ")}</span>
                {String(value).length>120
                  ?<textarea className="adminSmallArea" value={String(value)} onChange={e=>setField(lang,key,e.target.value)}/>
                  :<input value={String(value)} onChange={e=>setField(lang,key,e.target.value)}/>}
              </label>)}
            <label>Estado
              <select value={lang==="es"?selected.status_es:selected.status_en} onChange={e=>setSelected(lang==="es"
                ?{...selected,status_es:e.target.value as Row["status_es"]}
                :{...selected,status_en:e.target.value as Row["status_en"]})}>
                <option value="draft">Borrador</option>
                <option value="review">Revisión</option>
                <option value="published">Publicado</option>
              </select>
            </label>
          </div>)}
        </div>

        <button type="button" className="adminAdvancedToggle" onClick={()=>setShowAdvanced(v=>!v)}>
          {showAdvanced?"Ocultar opciones avanzadas":"Opciones avanzadas"}
        </button>
        {showAdvanced&&<div className="adminAdvancedPanel">
          <p className="note">Vista técnica para mantenimiento. No es necesaria para la edición normal.</p>
          <div className="adminLangGrid">
            <div><label>Datos ES</label><textarea value={esText} onChange={e=>setEsText(e.target.value)} className="adminTextarea"/></div>
            <div><label>Datos EN</label><textarea value={enText} onChange={e=>setEnText(e.target.value)} className="adminTextarea"/></div>
          </div>
        </div>}
        <div className="adminSaveRow"><button className="btn btnPrimary" onClick={save}>Guardar cambios</button><span>{status}</span></div>
      </>}
    </section>
  </div>;
}
