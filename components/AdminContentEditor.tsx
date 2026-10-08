"use client";
import { useEffect,useMemo,useState } from "react";
import { createSupabaseBrowserClient } from "../lib/supabase/browser";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

type Row={
  content_key:string;section:string;es:any;en:any;
  status_es:"draft"|"review"|"published";
  status_en:"draft"|"review"|"published";
};
type MediaAsset={id:string;slug:string;kind:string;storage_path:string;public_visible:boolean};
const SECTION_LABELS:Record<string,string>={
  "home.hero":"Inicio",
  "home.characters":"Personajes",
  "home.author":"Autor",
  "home.why":"¿Por qué FRAGMENTUN?",
  "home.lumen":"Lumen",
  "home.official_video":"Video oficial · FRAGMENTUN I",
  "home.chapter":"Entra en Lumen",
  "home.news":"Noticias del Universo",
  "home.test":"Test emocional",
  "home.map":"Mapa interactivo de Lumen",
  "home.community":"Comunidad",
  "home.share_reward":"Arte conceptual gratis",
  "home.shop":"Tienda FRAGMENTUN",
  "home.final_cta":"El despertar ya comenzó",
  "home.footer":"Pie de página",
  "home.saga":"La saga"
};
const FIELD_LABELS:Record<string,string>={
  kicker:"Encabezado",
  title:"Título",
  subtitle:"Subtítulo",
  body:"Texto principal",
  description:"Descripción",
  quote:"Frase destacada",
  cta:"Texto del botón",
  cta_label:"Texto del botón",
  image_alt:"Descripción de la imagen",
  name:"Nombre",
  heading:"Título",
  eyebrow:"Encabezado corto"
};
const MEDIA_LABELS:Record<string,string>={
  image_url:"Imagen principal",
  video_url:"Video",
  poster_url:"Imagen de portada",
  art_url:"Arte"
};
function sectionLabel(key:string){return SECTION_LABELS[key]||key.replace(/^home\./,"").replace(/_/g," ")}
function fieldLabel(key:string){return FIELD_LABELS[key]||key.replace(/_/g," ")}


export function AdminContentEditor(){
  const[rows,setRows]=useState<Row[]>([]);
  const[selected,setSelected]=useState<Row|null>(null);
  const[esText,setEsText]=useState("");
  const[enText,setEnText]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(true);
  const[loadError,setLoadError]=useState(false);
  const[media,setMedia]=useState<MediaAsset[]>([]);
  const[authorFile,setAuthorFile]=useState<File|null>(null);
  const[uploading,setUploading]=useState(false);
  const[uploadingWhy,setUploadingWhy]=useState<number|null>(null);
  const[uploadingNews,setUploadingNews]=useState<string|null>(null);
  const[uploadingLumen,setUploadingLumen]=useState(false);
  const supabase=useMemo(()=>createSupabaseBrowserClient(),[]);

  useEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    Promise.all([fetch("/api/admin/content"),fetch("/api/admin/media")])
      .then(async([a,b])=>{
        if(!a.ok||!b.ok)throw new Error("load_failed");
        return [await a.json(),await b.json()];
      })
      .then(([content,assets])=>{
        const nextRows=content.data||[];
        setRows(nextRows);
        setMedia(assets.data||[]);
        const target=qs.get("section");
        const match=target?nextRows.find((row:Row)=>row.content_key===target):null;
        if(match){
          setSelected(match);
          setEsText(JSON.stringify(match.es,null,2));
          setEnText(JSON.stringify(match.en,null,2));
        }
      })
      .catch(()=>setLoadError(true))
      .finally(()=>setLoading(false))
  },[]);

  function choose(row:Row){
    setSelected(row);
    setEsText(JSON.stringify(row.es,null,2));
    setEnText(JSON.stringify(row.en,null,2));
    setStatus("");
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
      setStatus("No fue posible asignar el recurso. Revisa las opciones avanzadas.");
    }
  }

  function mediaFieldValue(lang:"es"|"en",field:string){
    try{return JSON.parse(lang==="es"?esText:enText)?.[field]||""}catch{return ""}
  }

  function json(lang:"es"|"en"){try{return JSON.parse(lang==="es"?esText:enText)||{}}catch{return {}}}
  function setField(lang:"es"|"en",field:string,value:any){
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
    if(!authorFile){setStatus("Selecciona una fotografía antes de continuar.");return}
    setUploading(true);setStatus("Subiendo imagen…");
    const slug="jose-liranzo-author";
    const safe=authorFile.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    try{
      const{error}=await supabase.storage.from("official-media").upload(path,authorFile,{contentType:authorFile.type||undefined});
      if(error){setStatus("No fue posible subir la fotografía.");return}
      const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,kind:"image",storage_path:`official-media/${path}`,alt_es:"José Liranzo, autor de FRAGMENTUN",alt_en:"José Liranzo, author of FRAGMENTUN",protected:false,public_visible:true,metadata:{filename:authorFile.name,bucket:"official-media",path,usage:"author_photo"}})});
      const j=await r.json().catch(()=>({}));
      if(!r.ok){
        await supabase.storage.from("official-media").remove([path]).catch(()=>{});
        setStatus(j.error||"No fue posible registrar la fotografía.");
        return;
      }
      const url=assetUrl(j.data);
      setAuthorImage(url);
      setMedia(m=>[j.data,...m.filter(x=>x.id!==j.data.id)]);
      setAuthorFile(null);
      setStatus("GUARDADO SATISFACTORIAMENTE");
    }catch{
      setStatus("No fue posible completar la subida. Revisa la conexión e inténtalo nuevamente.");
    }finally{
      setUploading(false);
    }
  }

  function setWhyCard(lang:"es"|"en",index:number,field:"title"|"body"|"image_url",value:string){
    const current=json(lang);
    const cards=Array.isArray(current.cards)?[...current.cards]:[];
    while(cards.length<4)cards.push({title:"",body:"",image_url:""});
    cards[index]={...cards[index],[field]:value};
    setField(lang,"cards",cards);
  }
  function setWhyCardImage(index:number,value:string){
    setWhyCard("es",index,"image_url",value);
    setWhyCard("en",index,"image_url",value);
  }
  function whyCardImage(index:number){
    const esCards=Array.isArray(json("es").cards)?json("es").cards:[];
    const enCards=Array.isArray(json("en").cards)?json("en").cards:[];
    return esCards[index]?.image_url||enCards[index]?.image_url||"";
  }
  async function uploadWhyCardImage(index:number,file:File|null){
    if(!file)return;
    if(!file.type.startsWith("image/")){setStatus("Selecciona un archivo de imagen.");return}
    setUploadingWhy(index);setStatus(`Subiendo imagen del apartado ${index+1}…`);
    const slug=`why-fragmentun-${index+1}`;
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    const{error}=await supabase.storage.from("official-media").upload(path,file,{contentType:file.type||undefined});
    if(error){setUploadingWhy(null);setStatus(error.message);return}
    const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug,kind:"image",storage_path:`official-media/${path}`,
      alt_es:`Imagen del apartado ${index+1} de Por qué FRAGMENTUN`,
      alt_en:`Image for Why FRAGMENTUN section ${index+1}`,
      protected:false,public_visible:true,
      metadata:{filename:file.name,bucket:"official-media",path,usage:"why_fragmentun_card",card_index:index+1}
    })});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setUploadingWhy(null);setStatus(j.error||"No se pudo registrar la imagen.");return}
    const url=assetUrl(j.data);
    setWhyCardImage(index,url);
    setMedia(m=>[j.data,...m.filter(x=>x.id!==j.data.id)]);
    setUploadingWhy(null);
    setStatus(`GUARDADO SATISFACTORIAMENTE`);
  }

  function lumenImage(){return json("es").image_url||json("en").image_url||""}
  function setLumenImage(value:string){
    const es={...json("es"),image_url:value,poster_url:value};
    const en={...json("en"),image_url:value,poster_url:value};
    setEsText(JSON.stringify(es,null,2));
    setEnText(JSON.stringify(en,null,2));
  }
  async function uploadLumenImage(file:File|null){
    if(!file)return;
    if(!file.type.startsWith("image/")){setStatus("Selecciona un archivo de imagen.");return}
    setUploadingLumen(true);setStatus("Subiendo imagen de Lumen…");
    const slug="lumen-frontdesk-managed";
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    const{error}=await supabase.storage.from("official-media").upload(path,file,{contentType:file.type||undefined});
    if(error){setUploadingLumen(false);setStatus(error.message);return}
    const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug,kind:"image",storage_path:`official-media/${path}`,
      alt_es:"Ciudad de Lumen",alt_en:"City of Lumen",
      protected:false,public_visible:true,
      metadata:{filename:file.name,size:file.size,mime:file.type,bucket:"official-media",path,usage:"lumen_frontdesk"}
    })});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setUploadingLumen(false);setStatus(j.error||"No se pudo registrar la imagen.");return}
    setLumenImage(assetUrl(j.data));
    setMedia(m=>[j.data,...m.filter(x=>x.id!==j.data.id)]);
    setUploadingLumen(false);
    setStatus("GUARDADO SATISFACTORIAMENTE");
  }

  const NEWS_CARDS=[
    {key:"feature",name:"Publicación",fallback:"/fragmentun-i-cover-es.jpg"},
    {key:"share",name:"Recompensa",fallback:"/elyon-hero.jpg"},
    {key:"expand",name:"Expansión",fallback:"/lumen-ciudad-oficial.webp"}
  ] as const;
  function newsField(lang:"es"|"en",card:string,field:string){
    return json(lang)?.[`card_${card}_${field}`]||"";
  }
  function setNewsField(lang:"es"|"en",card:string,field:string,value:string){
    setField(lang,`card_${card}_${field}`,value);
  }
  function newsImage(card:string){
    return newsField("es",card,"image")||newsField("en",card,"image")||"";
  }
  function setNewsImage(card:string,value:string){
    setNewsField("es",card,"image",value);
    setNewsField("en",card,"image",value);
  }
  async function uploadNewsImage(card:string,file:File|null){
    if(!file)return;
    if(!file.type.startsWith("image/")){setStatus("Selecciona un archivo de imagen.");return}
    setUploadingNews(card);setStatus("Subiendo imagen de Noticias…");
    const slug=`news-${card}`;
    const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,"-");
    const path=`${slug}/${Date.now()}-${safe}`;
    const{error}=await supabase.storage.from("official-media").upload(path,file,{contentType:file.type||undefined});
    if(error){setUploadingNews(null);setStatus(error.message);return}
    const r=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      slug,kind:"image",storage_path:`official-media/${path}`,
      alt_es:`Imagen de Noticias: ${card}`,alt_en:`News image: ${card}`,
      protected:false,public_visible:true,
      metadata:{filename:file.name,bucket:"official-media",path,usage:"news_card",card}
    })});
    const j=await r.json().catch(()=>({}));
    if(!r.ok){setUploadingNews(null);setStatus(j.error||"No se pudo registrar la imagen.");return}
    setNewsImage(card,assetUrl(j.data));
    setMedia(m=>[j.data,...m.filter(x=>x.id!==j.data.id)]);
    setUploadingNews(null);
    setStatus("GUARDADO SATISFACTORIAMENTE");
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
      setStatus("GUARDADO SATISFACTORIAMENTE");
    }catch(e){setStatus("No fue posible guardar. Revisa los campos e inténtalo de nuevo.");}
  }

  if(loading)return <FragmentunProcessOverlay compact state="loading" title="CARGANDO CONTENIDO…"/>;
  if(loadError)return <section className="card"><p className="adminSaveFeedback error">No fue posible cargar el contenido del sitio.</p><button type="button" className="btn btnGhost" onClick={()=>window.location.reload()}>Reintentar</button></section>;
  return <div className="adminEditorGrid">
    <aside className="adminList">
      {rows.map(row=><button key={row.content_key} onClick={()=>choose(row)} className={selected?.content_key===row.content_key?"active":""}>
        <strong>{sectionLabel(row.content_key)}</strong><span>FrontDesk</span>
      </button>)}
    </aside>
    <section className="card">
      {!selected?<p>Selecciona una sección para editar.</p>:<>
        <div className="kicker">FrontDesk · Sección editable</div>
        <h2>{sectionLabel(selected.content_key)}</h2>
        {selected.content_key==="home.author"&&<div className="adminAuthorVisual">
          <div className="adminAuthorVisualHead"><div><div className="kicker">Imagen del autor</div><h3>Fotografía pública</h3></div><span>ES + EN</span></div>
          <div className="adminAuthorVisualGrid">
            <div className="adminAuthorPreview">{authorImage()?<img src={authorImage()} alt="José Liranzo"/>:<div>JL</div>}</div>
            <div className="adminAuthorControls">
              <label>Elegir imagen existente<select value={authorImage()} onChange={e=>setAuthorImage(e.target.value)}><option value="">— Sin imagen —</option>{media.filter(m=>m.public_visible&&m.kind==="image").map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}</select></label>
              <label>Subir nueva fotografía<input type="file" accept="image/*" onChange={e=>setAuthorFile(e.target.files?.[0]||null)}/></label>
              <button className="btn btnPrimary" type="button" disabled={!authorFile||uploading} onClick={uploadAuthorImage}>{uploading?"Subiendo…":"Subir fotografía"}</button>
              <p className="note">Después de subirla, pulsa “Guardar cambios” para publicarla en la sección Autor.</p>
            </div>
          </div>
        </div>}
        {!["home.author","home.why","home.news","home.lumen"].includes(selected.content_key)&&<div className="card" style={{marginBottom:18}}>
          <div className="kicker">Recursos visuales</div>
          <p className="note">Selecciona imágenes o videos aprobados de la biblioteca.</p>
          <div className="adminLangGrid">
            {(["es","en"] as const).map(lang=><div key={lang}>
              <strong>{lang==="es"?"Español":"Inglés"}</strong>
              {(["image_url","video_url","poster_url","art_url"] as const).map(field=>{
                const wantVideo=field==="video_url";
                const options=media.filter(m=>m.public_visible&&(wantVideo?m.kind==="video":m.kind==="image"));
                return <label key={field} style={{display:"block",marginTop:10}}>
                  {MEDIA_LABELS[field]}
                  <select value={mediaFieldValue(lang,field)} onChange={e=>setMediaField(lang,field,e.target.value)}>
                    <option value="">— Sin asignar —</option>
                    {options.map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}
                  </select>
                </label>;
              })}
            </div>)}
          </div>
        </div>}
        {selected.content_key==="home.lumen"&&<div className="adminAuthorVisual adminLumenVisual">
          <div className="adminAuthorVisualHead">
            <div><div className="kicker">Lumen</div><h3>Imagen principal de la sección</h3></div>
            <span>ES + EN</span>
          </div>
          <div className="adminAuthorVisualGrid">
            <div className="adminLumenPreview">{lumenImage()?<img src={lumenImage()} alt="Ciudad de Lumen"/>:<div>Sin imagen</div>}</div>
            <div className="adminAuthorControls">
              <label>Elegir imagen existente
                <select value={lumenImage()} onChange={e=>setLumenImage(e.target.value)}>
                  <option value="">— Sin imagen —</option>
                  {media.filter(m=>m.public_visible&&m.kind==="image").map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}
                </select>
              </label>
              <label>Subir nueva imagen
                <input type="file" accept="image/*" disabled={uploadingLumen} onChange={e=>uploadLumenImage(e.target.files?.[0]||null)}/>
              </label>
              <p className="note">La imagen seleccionada se usará directamente en la sección Lumen del FrontDesk. Después de subirla, pulsa “Guardar cambios”.</p>
              {uploadingLumen&&<p className="adminInlineStatus" role="status">Subiendo imagen de Lumen…</p>}
              {status.includes("Lumen")&&<p className={status==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":"adminSaveFeedback error"} role="status">{status}</p>}
            </div>
          </div>
        </div>}

        {selected.content_key==="home.why"&&<div className="adminWhyEditor">
          <div className="adminPanelHeader">
            <div><div className="kicker">Apartados publicados</div><h3>Tarjetas de “Por qué FRAGMENTUN”</h3><p className="note">Cada apartado controla su propio texto e imagen. La imagen se comparte entre Español e Inglés.</p></div>
            <span className="adminPanelBadge">4 apartados</span>
          </div>
          <div className="adminWhyCards adminWhyCardsUnified">
            {[0,1,2,3].map(index=>{
              const esCard=(Array.isArray(json("es").cards)?json("es").cards:[])[index]||{};
              const enCard=(Array.isArray(json("en").cards)?json("en").cards:[])[index]||{};
              const image=whyCardImage(index);
              const fallback=["/nara-hd.jpg","/elyon-hero.jpg","/lumen-frontdesk.webp","/umbral-hd.jpg"][index];
              return <article className="adminWhyCardEditor adminWhyCardUnified" key={index}>
                <div className="adminWhyCardHead">
                  <div><span>Apartado {index+1}</span><strong>{esCard.title||`Apartado ${index+1}`}</strong></div>
                  <div className="adminWhyImagePreview"><img src={image||fallback} alt=""/></div>
                </div>
                <div className="adminWhyImageControls">
                  <label>Imagen del apartado
                    <select value={image} onChange={e=>setWhyCardImage(index,e.target.value)}>
                      <option value="">Usar imagen actual del diseño</option>
                      {media.filter(m=>m.public_visible&&m.kind==="image").map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}
                    </select>
                  </label>
                  <label className="adminWhyUpload">
                    <span>{uploadingWhy===index?"Subiendo…":"Subir nueva imagen"}</span>
                    <input type="file" accept="image/*" disabled={uploadingWhy===index} onChange={e=>uploadWhyCardImage(index,e.target.files?.[0]||null)}/>
                  </label>
                </div>
                <div className="adminLangGrid">
                  <div>
                    <div className="kicker">Español</div>
                    <label>Título<input value={esCard.title||""} onChange={e=>setWhyCard("es",index,"title",e.target.value)}/><small>{String(esCard.title||"").length} caracteres</small></label>
                    <label>Texto<textarea className="adminSmallArea" value={esCard.body||""} onChange={e=>setWhyCard("es",index,"body",e.target.value)}/><small>{String(esCard.body||"").length} caracteres</small></label>
                  </div>
                  <div>
                    <div className="kicker">Inglés</div>
                    <label>Título<input value={enCard.title||""} onChange={e=>setWhyCard("en",index,"title",e.target.value)}/><small>{String(enCard.title||"").length} caracteres</small></label>
                    <label>Texto<textarea className="adminSmallArea" value={enCard.body||""} onChange={e=>setWhyCard("en",index,"body",e.target.value)}/><small>{String(enCard.body||"").length} caracteres</small></label>
                  </div>
                </div>
              </article>
            })}
          </div>
        </div>}

        {selected.content_key==="home.news"&&<div className="adminWhyEditor adminNewsEditor">
          <div className="adminPanelHeader">
            <div><div className="kicker">Tarjetas publicadas</div><h3>Noticias</h3><p className="note">Cada tarjeta se edita como un bloque independiente. La portada del libro sigue siendo el respaldo de la tarjeta Publicación.</p></div>
            <span className="adminPanelBadge">3 tarjetas</span>
          </div>
          <div className="adminWhyCards adminWhyCardsUnified">
            {NEWS_CARDS.map(card=>{
              const image=newsImage(card.key);
              return <article className="adminWhyCardEditor adminWhyCardUnified" key={card.key}>
                <div className="adminWhyCardHead">
                  <div><span>{card.name}</span><strong>{newsField("es",card.key,"title")||card.name}</strong></div>
                  <div className="adminWhyImagePreview"><img src={image||card.fallback} alt=""/></div>
                </div>
                <div className="adminWhyImageControls">
                  <label>Imagen de la tarjeta
                    <select value={image} onChange={e=>setNewsImage(card.key,e.target.value)}>
                      <option value="">Usar imagen actual del diseño</option>
                      {media.filter(m=>m.public_visible&&m.kind==="image").map(m=><option key={m.id} value={assetUrl(m)}>{m.slug}</option>)}
                    </select>
                  </label>
                  <label className="adminWhyUpload">
                    <span>{uploadingNews===card.key?"Subiendo…":"Subir nueva imagen"}</span>
                    <input type="file" accept="image/*" disabled={uploadingNews===card.key} onChange={e=>uploadNewsImage(card.key,e.target.files?.[0]||null)}/>
                  </label>
                </div>
                <div className="adminLangGrid">
                  {(["es","en"] as const).map(lang=><div key={lang}>
                    <div className="kicker">{lang==="es"?"Español":"Inglés"}</div>
                    <label>Etiqueta<input value={newsField(lang,card.key,"label")} onChange={e=>setNewsField(lang,card.key,"label",e.target.value)}/></label>
                    <label>Título<input value={newsField(lang,card.key,"title")} onChange={e=>setNewsField(lang,card.key,"title",e.target.value)}/></label>
                    <label>Texto<textarea className="adminSmallArea" value={newsField(lang,card.key,"body")} onChange={e=>setNewsField(lang,card.key,"body",e.target.value)}/></label>
                    <label>Texto del botón<input value={newsField(lang,card.key,"cta")} onChange={e=>setNewsField(lang,card.key,"cta",e.target.value)}/></label>
                  </div>)}
                </div>
              </article>
            })}
          </div>
        </div>}

        <div className="adminLangGrid">
          {(["es","en"] as const).map(lang=><div className="adminVisualContentFields" key={lang}>
            <div className="kicker">{lang==="es"?"Español":"Inglés"}</div>
            {Object.entries(json(lang))
              .filter(([key,value])=>!["image_url","video_url","poster_url","art_url","cards"].includes(key)&&!(selected.content_key==="home.news"&&key.startsWith("card_"))&&["string","number","boolean"].includes(typeof value))
              .map(([key,value])=><label key={key}>
                <span>{fieldLabel(key)}</span>
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
        <div className="adminSaveRow"><button className="btn btnPrimary" onClick={save}>Guardar cambios</button><span className={status==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(status&&(status.toLowerCase().includes("error")||status.toLowerCase().includes("no fue")||status.toLowerCase().includes("no se")||status.toLowerCase().includes("inválid")||status.toLowerCase().includes("obligatorio")||status.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{status}</span></div>
      </>}
    </section>
  </div>;
}
