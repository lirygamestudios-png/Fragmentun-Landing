"use client";
import { useEffect,useState } from "react";

type Character={
  id?:string;slug:string;name:string;role_es:string|null;role_en:string|null;
  bio_es:string|null;bio_en:string|null;territory:string|null;status:string;sort_order:number;
  image_asset_id?:string|null;video_asset_id?:string|null;
};
type MediaAsset={id:string;slug:string;kind:string;storage_path:string;public_visible:boolean;metadata?:any};

const empty:Character={slug:"",name:"",role_es:"",role_en:"",bio_es:"",bio_en:"",territory:"",status:"draft",sort_order:0,image_asset_id:null,video_asset_id:null};

function mediaUrl(asset?:MediaAsset){
  if(!asset)return "";
  if(asset.storage_path.startsWith("/")||/^https?:\/\//i.test(asset.storage_path))return asset.storage_path;
  const slash=asset.storage_path.indexOf("/");
  if(slash<1)return "";
  const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
  return base?`${base}/storage/v1/object/public/${asset.storage_path}`:"";
}

export function AdminCharacters(){
  const[items,setItems]=useState<Character[]>([]);
  const[selected,setSelected]=useState(0);
  const[creating,setCreating]=useState(false);
  const[draft,setDraft]=useState<Character>(empty);
  const[msg,setMsg]=useState("");
  const[loadError,setLoadError]=useState(false);
  const[media,setMedia]=useState<MediaAsset[]>([]);

  async function load(){
    try{
      const[rChars,rMedia]=await Promise.all([fetch("/api/admin/characters"),fetch("/api/admin/media")]);
      const[jChars,jMedia]=await Promise.all([rChars.json().catch(()=>({})),rMedia.json().catch(()=>({}))]);
      if(!rChars.ok||!rMedia.ok)throw new Error("load_failed");
      setItems(jChars.data||[]);
      setMedia(jMedia.data||[]);
      setSelected(0);
      setLoadError(false);
    }catch{
      setLoadError(true);
    }
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
    try{
      const r=await fetch("/api/admin/characters",{
        method:creating?"POST":"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify(current)
      });
      const j=await r.json().catch(()=>({}));
      if(!r.ok){setMsg(j.error||"No fue posible guardar el personaje.");return;}
      setMsg("GUARDADO SATISFACTORIAMENTE");
      setCreating(false);
      setDraft(empty);
      await load();
    }catch{
      setMsg("No fue posible guardar el personaje. Revisa la conexión e inténtalo nuevamente.");
    }
  }

  if(loadError)return <section className="card"><p className="adminSaveFeedback error">No fue posible cargar los personajes.</p><button type="button" className="btn btnGhost" onClick={()=>window.location.reload()}>Reintentar</button></section>;

  return <div className="adminEditorGrid">
    <aside className="adminList">
      <button className={creating?"active":""} onClick={()=>{setCreating(true);setDraft(empty);setMsg("Nuevo personaje preparado. Completa sus datos y pulsa Guardar personaje.");}}>
        + Nuevo personaje
      </button>
      {items.map((c,i)=><button key={c.id} className={!creating&&selected===i?"active":""} onClick={()=>{setCreating(false);setSelected(i)}}>
        {c.name}<span>{c.status} · {c.territory||"sin territorio"}</span>
      </button>)}
    </aside>

    <section>
      {!current?<div className="card"><p>No hay personajes todavía.</p></div>:<div className="card adminCharacterCard">
        <div className="adminPanelHeader"><div><div className="kicker">Archivo de personaje</div><h2>{current.name||"Nuevo personaje"}</h2></div><span className="adminPanelBadge">{current.status}</span></div>
        <div className="adminModuleSectionHead"><div><div className="kicker">Identidad</div><h3>Datos principales</h3></div></div><div className="adminFormGrid">
          <label>Nombre<input value={current.name||""} onChange={e=>update("name",e.target.value)}/></label>
          <label>Identificador interno<input value={current.slug||""} onChange={e=>update("slug",e.target.value)}/></label>
          <label>Territorio<input value={current.territory||""} onChange={e=>update("territory",e.target.value)}/></label>
          <label>Orden<input type="number" value={current.sort_order??0} onChange={e=>update("sort_order",Number(e.target.value))}/></label>
        </div>

        <div className="adminModuleSectionHead" style={{marginTop:22}}><div><div className="kicker">Presentación pública</div><h3>Contenido bilingüe</h3></div></div><div className="adminLangGrid" style={{marginTop:0}}>
          <div>
            <div className="kicker">Español</div>
            <label>Rol</label><input value={current.role_es||""} onChange={e=>update("role_es",e.target.value)}/>
            <label>Biografía</label><textarea className="adminSmallArea" value={current.bio_es||""} onChange={e=>update("bio_es",e.target.value)}/>
          </div>
          <div>
            <div className="kicker">Inglés</div>
            <label>Rol</label><input value={current.role_en||""} onChange={e=>update("role_en",e.target.value)}/>
            <label>Biografía</label><textarea className="adminSmallArea" value={current.bio_en||""} onChange={e=>update("bio_en",e.target.value)}/>
          </div>
        </div>

        <div className="adminModuleSectionHead" style={{marginTop:22}}><div><div className="kicker">Publicación</div><h3>Medios y estado</h3></div></div><div className="adminFormGrid" style={{marginTop:0}}>
          <label>Imagen
            <select value={current.image_asset_id||""} onChange={e=>update("image_asset_id",e.target.value||null)}>
              <option value="">Sin imagen</option>
              {media.filter(m=>m.kind==="image"&&m.public_visible).map(m=><option key={m.id} value={m.id}>{m.slug}</option>)}
            </select>
          </label>
          <label>Video
            <select value={current.video_asset_id||""} onChange={e=>update("video_asset_id",e.target.value||null)}>
              <option value="">Sin video</option>
              {media.filter(m=>m.kind==="video"&&m.public_visible).map(m=><option key={m.id} value={m.id}>{m.slug}</option>)}
            </select>
          </label>
          <label>Estado
            <select value={current.status} onChange={e=>update("status",e.target.value)}>
              <option value="draft">Borrador</option>
              <option value="published">Publicado</option>
              <option value="hidden">Oculto</option>
            </select>
          </label>
        </div>

        <div className="adminCharacterPreviewWrap">
        {current.image_asset_id&&(()=>{
          const asset=media.find(m=>m.id===current.image_asset_id);
          const src=mediaUrl(asset);
          return src?<div style={{marginTop:18,maxWidth:320}}>
            <div className="kicker">Vista previa</div>
            <img src={src} alt={current.name} style={{width:"100%",aspectRatio:"2 / 3",objectFit:"cover",borderRadius:16}}/>
          </div>:null;
        })()}
        <div className="adminCharacterIdentity"><strong>{current.name||"Sin nombre"}</strong><span>{current.role_es||current.role_en||"Rol pendiente"}</span><small>{current.territory||"Territorio no definido"}</small></div>
        </div>

        <div className="adminSaveRow">
          <button className="btn btnPrimary" onClick={save}>Guardar personaje</button>
          <span className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</span>
        </div>
      </div>}
    </section>
  </div>;
}
