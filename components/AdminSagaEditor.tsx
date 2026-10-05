"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";

export function AdminSagaEditor(){
  const[books,setBooks]=useState<any[]>([]);
  const[media,setMedia]=useState<any[]>([]);
  const[msg,setMsg]=useState("");
  const[uploading,setUploading]=useState("");
  const[uploadStatus,setUploadStatus]=useState<Record<string,string>>({});
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);

  const loadMedia=()=>fetch("/api/admin/media").then(r=>r.json()).then(j=>setMedia((j.data||[]).filter((m:any)=>m.kind==="image"&&m.public_visible)));

  useEffect(()=>{
    fetch("/api/admin/saga").then(r=>r.json()).then(j=>setBooks(j.data||[]));
    loadMedia();
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

  async function persistBook(book:any){
    const r=await fetch("/api/admin/saga",{
      method:"PUT",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(book)
    });
    const j=await r.json();
    if(!r.ok)throw new Error(j.error||"Error al guardar");
    setBooks(bs=>bs.map(b=>b.id===book.id?j.data:b));
    return j.data;
  }

  async function save(i:number){
    setMsg("Guardando…");
    try{
      await persistBook(books[i]);
      setMsg("GUARDADO SATISFACTORIAMENTE");
    }catch(error:any){
      setMsg(error?.message||"Error al guardar");
    }
  }

  function mediaUrl(slug:string){
    const asset=media.find((m:any)=>m.slug===slug);
    const storagePath=asset?.storage_path||"";
    const slash=storagePath.indexOf("/");
    if(slash<1)return "";
    const bucket=storagePath.slice(0,slash);
    const path=storagePath.slice(slash+1);
    return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl||"";
  }

  async function uploadCover(i:number,j:number,file:File|null){
    if(!file)return;
    if(!file.type.startsWith("image/")){setMsg("La portada debe ser un archivo de imagen.");return}
    const book=books[i];
    const edition=book?.editions?.[j];
    if(!book||!edition)return;

    const locale=String(edition.locale||"edition").trim().toLowerCase()||"edition";
    const slug=`${String(book.slug||`fragmentun-${book.volume||i+1}`).toLowerCase().replace(/[^a-z0-9-]+/g,"-")}-${locale}-cover`;
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    const key=`${book.id}:${j}`;
    setUploading(key);
    setUploadStatus(s=>({...s,[key]:"Subiendo portada…"}));
    setMsg("");

    const{error:uploadError}=await supabase.storage.from("official-media").upload(path,file,{
      upsert:false,
      contentType:file.type||undefined
    });
    if(uploadError){setUploading("");setUploadStatus(s=>({...s,[key]:uploadError.message}));return}

    const metaResponse=await fetch("/api/admin/media",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        slug,
        kind:"image",
        storage_path:`official-media/${path}`,
        alt_es:`Portada de ${book.title_es||"FRAGMENTUN"} ${book.subtitle_es||""}`.trim(),
        alt_en:`Cover of ${book.title_en||"FRAGMENTUN"} ${book.subtitle_en||""}`.trim(),
        protected:false,
        public_visible:true,
        metadata:{filename:file.name,size:file.size,mime:file.type,bucket:"official-media",path,usage:"book_cover",book_id:book.id,locale}
      })
    });
    const meta=await metaResponse.json().catch(()=>({}));
    if(!metaResponse.ok){
      setUploading("");
      setUploadStatus(s=>({...s,[key]:meta.error||"La imagen subió, pero no pudo registrarse en la biblioteca."}));
      return;
    }

    const nextBook={
      ...book,
      editions:(book.editions||[]).map((ed:any,n:number)=>n===j?{...ed,cover_media_slug:slug}:ed)
    };
    setBooks(bs=>bs.map((b,n)=>n===i?nextBook:b));
    await loadMedia();
    try{
      await persistBook(nextBook);
      setUploadStatus(s=>({...s,[key]:"GUARDADO SATISFACTORIAMENTE"}));
    }catch(error:any){
      setUploadStatus(s=>({...s,[key]:error?.message||"La portada subió, pero no pudo vincularse a la edición."}));
    }finally{
      setUploading("");
    }
  }

  return <div className="adminBookGrid">
    {books.map((b,i)=><article className="card adminSagaBookCard" key={b.id}>
      <div className="adminPanelHeader"><div><div className="kicker">FRAGMENTUN {b.volume}</div><h2>{b.subtitle_es||b.subtitle_en||"Libro de la Saga"}</h2></div><span className="adminPanelBadge">{b.status}</span></div>

      <div className="adminLangGrid adminBookLanguageGrid">
        <div>
          <div className="kicker">Español</div>
          <label>Título<input value={b.title_es||""} onChange={e=>setBook(i,"title_es",e.target.value)}/></label>
          <label>Subtítulo<input value={b.subtitle_es||""} onChange={e=>setBook(i,"subtitle_es",e.target.value)}/></label>
        </div>
        <div>
          <div className="kicker">Inglés</div>
          <label>Título<input value={b.title_en||""} onChange={e=>setBook(i,"title_en",e.target.value)}/></label>
          <label>Subtítulo<input value={b.subtitle_en||""} onChange={e=>setBook(i,"subtitle_en",e.target.value)}/></label>
        </div>
      </div>

      <label>Estado general</label>
      <select value={b.status} onChange={e=>setBook(i,"status",e.target.value)}>
        <option value="published">Publicado</option>
        <option value="coming_soon">Próximamente</option>
        <option value="development">Desarrollo</option>
      </select>

      <div className="adminModuleSectionHead adminBookEditionHead"><div><div className="kicker">Publicación</div><h3>Ediciones</h3></div><span>{(b.editions||[]).length} ediciones</span></div><div className="editionList">
        {(b.editions||[]).map((ed:any,j:number)=>{
          const preview=mediaUrl(ed.cover_media_slug||"");
          const uploadKey=`${b.id}:${j}`;
          return <div className="editionCard" key={ed.id||`${ed.locale}-${j}`}>
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

            <div style={{marginTop:16}}>
              <label>Portada de esta edición</label>
              <div className="adminFormGrid" style={{marginTop:8}}>
                <select value={ed.cover_media_slug||""} onChange={e=>setEdition(i,j,"cover_media_slug",e.target.value)}>
                  <option value="">Sin portada vinculada</option>
                  {media.map((m:any)=><option value={m.slug} key={m.id}>{m.slug}</option>)}
                </select>
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploading===uploadKey}
                  onChange={e=>uploadCover(i,j,e.target.files?.[0]||null)}
                />
              </div>
              <p className="note">Puedes subir una portada nueva o seleccionar una imagen ya existente en Medios. Las nuevas portadas se guardan en Medios oficiales.</p>
              {uploadStatus[uploadKey]&&<p className={uploadStatus[uploadKey]==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":"adminSaveFeedback error"} role="status">{uploadStatus[uploadKey]}</p>}
              {preview&&<div className="adminSagaCoverPreview"><img src={preview} alt={b.subtitle_es||"Portada FRAGMENTUN"}/><span>{String(ed.locale||"").toUpperCase()}</span></div>}
            </div>
          </div>
        })}

        <button className="btn btnGhost" type="button" onClick={()=>addEdition(i)}>
          + Añadir edición
        </button>
      </div>

      <button className="btn btnPrimary" onClick={()=>save(i)}>Guardar libro</button>
    </article>)}
    <p className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</p>
  </div>;
}
