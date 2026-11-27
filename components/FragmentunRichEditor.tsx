"use client";
import {useEffect,useRef,useState} from "react";
import {parseRich,RICH_PREFIX,safeRichHref,safeRichImage,type RichBlock,type RichPiece} from "./FragmentunRichContent";
import {createSupabaseBrowserClient} from "../lib/supabase/browser";

function applyPiece(container:HTMLElement,piece:RichPiece){
  let element:Node=document.createTextNode(piece.text);
  if(piece.bold){const e=document.createElement("strong");e.appendChild(element);element=e;}
  if(piece.italic){const e=document.createElement("em");e.appendChild(element);element=e;}
  if(piece.underline){const e=document.createElement("u");e.appendChild(element);element=e;}
  const href=safeRichHref(piece.href);
  if(href){const e=document.createElement("a");e.setAttribute("href",href);e.appendChild(element);element=e;}
  container.appendChild(element);
}
function makeElement(block:RichBlock){
  if(block.kind==="image"){
    const fig=document.createElement("figure");
    fig.style.margin="20px 0";fig.style.display="flex";
    fig.style.justifyContent=block.align==="left"?"flex-start":block.align==="right"?"flex-end":"center";
    const img=document.createElement("img");
    img.src=safeRichImage(block.src)||"";img.alt=block.alt||"";
    img.style.width=`${block.width||100}%`;img.style.maxWidth="100%";img.style.height="auto";
    img.style.borderRadius="10px";img.contentEditable="false";
    fig.appendChild(img);return fig;
  }
  const map:Record<Exclude<RichBlock["kind"],"image">,string>={p:"p",h2:"h2",h3:"h3",quote:"blockquote",bullet:"ul",number:"ol"};
  const el=document.createElement(map[block.kind]);
  const target=block.kind==="bullet"||block.kind==="number"?document.createElement("li"):el;
  if(target!==el)el.appendChild(target);
  if(block.align)el.style.textAlign=block.align;
  if(block.indent)el.style.marginLeft=`${Math.min(3,block.indent)*20}px`;
  for(const piece of block.pieces)applyPiece(target,piece);
  if(!target.childNodes.length)target.appendChild(document.createElement("br"));
  return el;
}
function segment(text:string,opts:Omit<RichPiece,"text">):RichPiece[]{return text?[{text,...opts}]:[];}
function gatherInline(node:Node,opts:Omit<RichPiece,"text">={}):RichPiece[]{
  if(node.nodeType===Node.TEXT_NODE)return segment(node.textContent||"",opts);
  if(!(node instanceof HTMLElement))return [];
  const tag=node.tagName.toLowerCase();
  if(["script","style","iframe","object","svg","img","form"].includes(tag))return [];
  if(tag==="br")return segment("\n",opts);
  const weight=node.style.fontWeight;
  const next={...opts,
    bold:opts.bold||["strong","b"].includes(tag)||weight==="bold"||Number(weight)>=600,
    italic:opts.italic||["em","i"].includes(tag)||node.style.fontStyle==="italic",
    underline:opts.underline||tag==="u"||node.style.textDecoration.includes("underline"),
    href:tag==="a"?(safeRichHref(node.getAttribute("href"))||opts.href):opts.href};
  return Array.from(node.childNodes).flatMap(c=>gatherInline(c,next));
}
function alignment(node:HTMLElement):RichBlock["align"]{
  const align=(node.style.textAlign||node.getAttribute("align")||"left").toLowerCase();
  return ["left","center","right","justify"].includes(align)?align as RichBlock["align"]:"left";
}
function indentation(node:HTMLElement){
  const n=parseInt(node.style.marginLeft||"0",10);
  return Number.isFinite(n)?Math.min(3,Math.max(0,Math.round(n/20))):0;
}
function serialize(root:HTMLElement):RichBlock[]{
  const out:RichBlock[]=[];
  const walk=(node:Node)=>{
    if(node.nodeType===Node.TEXT_NODE){const s=node.textContent||"";if(s.trim())out.push({kind:"p",pieces:[{text:s}]});return;}
    if(!(node instanceof HTMLElement))return;
    const tag=node.tagName.toLowerCase();
    if(["script","style","iframe","object","svg","img","form"].includes(tag))return;
    if(tag==="figure"){
      const img=node.querySelector("img");const src=safeRichImage(img?.getAttribute("src"));
      if(src){
        const width=Number.parseInt(img?.style.width||"100",10);
        out.push({kind:"image",src,alt:(img?.getAttribute("alt")||"").slice(0,240),width:Number.isFinite(width)?Math.max(25,Math.min(100,width)):100,align:node.style.justifyContent==="flex-start"?"left":node.style.justifyContent==="flex-end"?"right":"center",pieces:[]});
      }
      return;
    }
    if(tag==="ul"||tag==="ol"){
      for(const li of Array.from(node.children))if(li.tagName.toLowerCase()==="li")out.push({kind:tag==="ul"?"bullet":"number",align:alignment(node),indent:indentation(node),pieces:gatherInline(li)});
      return;
    }
    if(["div","p","h2","h3","blockquote","h1"].includes(tag)){
      out.push({kind:tag==="h2"?"h2":tag==="h3"?"h3":tag==="blockquote"?"quote":"p",align:alignment(node),indent:indentation(node),pieces:gatherInline(node)});
      return;
    }
    if(tag==="br"){out.push({kind:"p",pieces:[]});return;}
    for(const c of Array.from(node.childNodes))walk(c);
  };
  for(const child of Array.from(root.childNodes))walk(child);
  return out.slice(0,500);
}
export function FragmentunRichEditor({value,onChange,language}:{value:string;onChange:(next:string)=>void;language:"es"|"en"}){
  const ref=useRef<HTMLDivElement>(null);
  const current=useRef(value);
  const [notice,setNotice]=useState("");
  const [imagePanel,setImagePanel]=useState(false);
  const [imageError,setImageError]=useState("");
  const [uploadFile,setUploadFile]=useState<File|null>(null);
  const [uploadBusy,setUploadBusy]=useState(false);
  const [uploadSuccess,setUploadSuccess]=useState("");
  const [mediaRows,setMediaRows]=useState<{id:string;slug:string;kind:string;storage_path:string;public_visible:boolean;protected:boolean;alt_es:string;alt_en:string}[]>([]);
  const [mediaStatus,setMediaStatus]=useState<"idle"|"loading"|"ready"|"error">("idle");
  const [showMedia,setShowMedia]=useState(false);
  const [imageUrl,setImageUrl]=useState("");
  const [imageAlt,setImageAlt]=useState("");
  const [imageWidth,setImageWidth]=useState(100);
  const [imageAlign,setImageAlign]=useState<"left"|"center"|"right">("center");
  const selectionRef=useRef<Range|null>(null);
  const rememberSelection=()=>{
    const selection=window.getSelection();
    if(!selection?.rangeCount||!ref.current)return;
    const range=selection.getRangeAt(0);
    if(ref.current.contains(range.commonAncestorContainer))selectionRef.current=range.cloneRange();
  };
  const mediaUrl=(row:{storage_path:string;public_visible:boolean;protected:boolean}):string|undefined=>{
    if(row.protected===true || row.public_visible!==true || !row.storage_path || row.storage_path.startsWith("editorial-media/"))return undefined;
    const path=row.storage_path.trim();
    if(path.startsWith("/") || /^https:\/\//i.test(path))return safeRichImage(path);
    const base=(process.env.NEXT_PUBLIC_SUPABASE_URL||"").replace(/\/$/,"");
    return base?safeRichImage(`${base}/storage/v1/object/public/${path}`):undefined;
  };
  const loadMedia=async()=>{
    setMediaStatus("loading");
    try{
      const response=await fetch("/api/admin/media",{cache:"no-store"});
      if(!response.ok)throw new Error("not_authorized");
      const payload:unknown=await response.json();
      const rows=(payload&&typeof payload==="object"&&"data" in payload&&(payload as {data:unknown}).data);
      setMediaRows(Array.isArray(rows)?rows.filter(row=>row&&typeof row==="object"&&row.kind==="image"&&row.public_visible===true&&row.protected!==true&&typeof row.storage_path==="string").slice(0,80):[]);
      setMediaStatus("ready");
    }catch{setMediaStatus("error");}
  };
  const uploadFromComputer=async()=>{
    setImageError("");setUploadSuccess("");
    if(uploadBusy)return;
    const file=uploadFile;
    if(!file){setImageError(language==="es"?"Selecciona una imagen JPG, PNG o WebP.":"Choose a JPG, PNG or WebP image.");return;}
    const ext:Record<string,string>={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
    const suffix=ext[file.type];
    if(!suffix || file.size>5*1024*1024 || file.size===0){setImageError(language==="es"?"Formato no admitido o archivo superior a 5 MB.":"Unsupported image format or file over 5 MB.");return;}
    if(!imageAlt.trim()){setImageError(language==="es"?"Primero escribe la descripción ALT de la imagen.":"Enter image ALT text before uploading.");return;}
    setUploadBusy(true);
    let path="";
    try{
      const supabase=createSupabaseBrowserClient();
      const slug=`blog-${Date.now()}-${Math.random().toString(36).slice(2,10)}`;
      path=`blog/${slug}.${suffix}`;
      const {error:storageError}=await supabase.storage.from("official-media").upload(path,file,{upsert:false,contentType:file.type,cacheControl:"3600"});
      if(storageError)throw new Error("storage_upload_denied");
      const register=await fetch("/api/admin/media",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({slug,kind:"image",storage_path:`official-media/${path}`,alt_es:imageAlt.trim().slice(0,240),alt_en:imageAlt.trim().slice(0,240),protected:false,public_visible:true,metadata:{filename:file.name,size:file.size,mime:file.type,bucket:"official-media",path,category:"other",usage:"blog"}})});
      if(!register.ok){
        // Remove only the exact object created in this action if registration fails.
        await supabase.storage.from("official-media").remove([path]);
        throw new Error("media_registration_denied");
      }
      const {data}=supabase.storage.from("official-media").getPublicUrl(path);
      const src=safeRichImage(data.publicUrl);
      if(!src)throw new Error("invalid_public_url");
      setImageUrl(src);setUploadFile(null);
      setUploadSuccess(language==="es"?"Imagen subida. Pulsa «Insertar imagen en el artículo» para colocarla.":"Image uploaded. Click «Insert image into article» to place it.");
      // Upload is explicit; insertion is a separate editorial confirmation.
    }catch(e){
      setImageError(language==="es"?"No se pudo subir o registrar la imagen. Comprueba sesión, MFA y permisos de medios.":"Could not upload or register image. Check session, MFA and media permissions.");
    }finally{setUploadBusy(false);}
  };
  const insertImage=()=>{
    setImageError("");
    if(uploadBusy){setImageError(language==="es"?"Finaliza primero la subida.":"Finish upload first.");return;}
    const src=safeRichImage(imageUrl);
    if(!src){setImageError(language==="es"?"Introduce una URL HTTPS válida o selecciona una imagen pública de la biblioteca. No se admiten SVG.":"Enter a valid HTTPS URL or choose a public image from the library. SVG is not supported.");return;}
    if(!imageAlt.trim()){setImageError(language==="es"?"Escribe la descripción ALT antes de insertar.":"Enter ALT text before inserting.");return;}
    const root=ref.current;if(!root){setImageError(language==="es"?"No se encuentra el área de edición.":"Editor area not found.");return;}
    const figure=makeElement({kind:"image",src,alt:imageAlt.trim().slice(0,240),width:imageWidth,align:imageAlign,pieces:[]});
    const range=selectionRef.current;
    if(range&&root.contains(range.commonAncestorContainer)){
      // Insert after current paragraph, to avoid nested figures inside paragraphs.
      let top:Node=range.startContainer;
      while(top.parentNode&&top.parentNode!==root)top=top.parentNode;
      if(top.parentNode===root)top.parentNode.insertBefore(figure,top.nextSibling);
      else root.appendChild(figure);
    }else root.appendChild(figure);
    root.focus();setImagePanel(false);setShowMedia(false);setImageUrl("");setImageAlt("");setUploadSuccess("");selectionRef.current=null;sync();
  };
  useEffect(()=>{
    const el=ref.current;if(!el)return;
    if(document.activeElement===el)return;
    el.replaceChildren(...parseRich(value||"").map(makeElement));
    current.current=value;
  },[value,language]);
  const sync=()=>{
    if(!ref.current)return;
    const next=RICH_PREFIX+JSON.stringify(serialize(ref.current));
    if(next.length>49000){setNotice(language==="es"?"Se alcanzo el limite seguro de contenido (49.000 caracteres). Reduce el texto antes de guardar.":"Content safety limit (49,000 characters). Shorten the text before saving.");return;}
    setNotice("");current.current=next;onChange(next);
  };
  const command=(name:string,arg?:string)=>{
    ref.current?.focus();document.execCommand(name,false,arg);sync();
  };
  const addLink=()=>{
    const input=window.prompt(language==="es"?"URL segura (https:// o ruta /):":"Safe URL (https:// or / path):","https://");
    if(input===null)return;
    const url=safeRichHref(input);
    if(!url){setNotice(language==="es"?"Enlace no valido":"Invalid link");return;}
    command("createLink",url);
  };
  const buttons:[string,string,string?][]=[
    ["B","bold"],["I","italic"],["U","underline"],
    ["H2","formatBlock","h2"],["H3","formatBlock","h3"],["¶","formatBlock","p"],
    ["❝","formatBlock","blockquote"],["• Lista","insertUnorderedList"],["1. Lista","insertOrderedList"],
    ["↤","justifyLeft"],["↔","justifyCenter"],["↦","justifyRight"],["≡","justifyFull"],
    ["⇥","indent"],["⇤","outdent"],["↶","undo"],["↷","redo"]
  ];
  return <div style={{marginTop:6}}>
    <div role="toolbar" aria-label={language==="es"?"Herramientas de formato":"Formatting tools"} style={{display:"flex",flexWrap:"wrap",gap:5,padding:9,background:"#0e2035",border:"1px solid #ffffff36",borderRadius:"10px 10px 0 0"}}>
      {buttons.map(([label,cmd,arg],i)=><button key={i} type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>command(cmd,arg)} title={cmd} aria-label={cmd} style={{background:"#1c3550",color:"#fff",border:"1px solid #ffffff36",padding:"7px 10px",borderRadius:6,cursor:"pointer",fontWeight:700}}>{label}</button>)}
      <button type="button" onMouseDown={e=>e.preventDefault()} onClick={()=>{rememberSelection();setImageError("");setImagePanel(v=>!v);}} aria-label={language==="es"?"Insertar imagen":"Insert image"} style={{background:"#1c3550",color:"#fff",border:"1px solid #ffffff36",padding:"7px 10px",borderRadius:6,cursor:"pointer"}}>🖼 {language==="es"?"Imagen":"Image"}</button>
      <button type="button" onMouseDown={e=>e.preventDefault()} onClick={addLink} style={{background:"#1c3550",color:"#fff",border:"1px solid #ffffff36",padding:"7px 10px",borderRadius:6,cursor:"pointer"}}>🔗</button>
    </div>
    {imagePanel?<div style={{padding:12,background:"#12243b",border:"1px solid #ffffff36",display:"grid",gap:9}}>
      <label>{language==="es"?"URL de imagen pública (HTTPS o /ruta)":"Public image URL (HTTPS or /path)"}<input value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://.../foto.webp" style={{display:"block",width:"100%"}} /></label>
      <label>{language==="es"?"Texto alternativo (obligatorio)":"Alternative text (required)"}<input value={imageAlt} maxLength={240} onChange={e=>setImageAlt(e.target.value)} style={{display:"block",width:"100%"}} /></label>
      <div style={{padding:12,border:"1px solid #ffffff30",borderRadius:8,display:"grid",gap:8}}>
        <strong>{language==="es"?"Subir desde mi computadora":"Upload from my computer"}</strong>
        <label>{language==="es"?"JPG, PNG o WebP · máximo 5 MB":"JPG, PNG or WebP · max 5 MB"}<input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploadBusy} onChange={e=>{setUploadFile(e.target.files?.[0]||null);setUploadSuccess("");}} style={{display:"block",width:"100%"}} /></label>
        <button type="button" disabled={uploadBusy||!uploadFile} onClick={()=>void uploadFromComputer()} style={{background:"#244868",color:"white",border:"1px solid #8199ad",padding:"9px 12px",borderRadius:7,cursor:uploadBusy?"progress":"pointer",justifySelf:"start"}}>{uploadBusy?(language==="es"?"Subiendo...":"Uploading..."):(language==="es"?"Subir imagen a medios oficiales":"Upload to official media")}</button>
        <small style={{opacity:.8}}>{language==="es"?"Solo se sube al pulsar el botón. Usa el almacenamiento existente; no publica el artículo.":"Uploads only when clicked. Uses existing storage; does not publish the article."}</small>
        {uploadSuccess?<p role="status" style={{color:"#a8ebce",margin:0}}>{uploadSuccess}</p>:null}
      </div>
      <label>{language==="es"?"Ancho":"Width"} ({imageWidth}%)<input type="range" min={25} max={100} step={5} value={imageWidth} onChange={e=>setImageWidth(Number(e.target.value))} /></label>
      <label>{language==="es"?"Alineación":"Alignment"}<select value={imageAlign} onChange={e=>setImageAlign(e.target.value as "left"|"center"|"right")}><option value="left">{language==="es"?"Izquierda":"Left"}</option><option value="center">{language==="es"?"Centro":"Center"}</option><option value="right">{language==="es"?"Derecha":"Right"}</option></select></label>
      <button type="button" onClick={()=>{const next=!showMedia;setShowMedia(next);if(next)void loadMedia();}} style={{background:"#244868",color:"white",border:"1px solid #8199ad",borderRadius:7,padding:"9px 12px",cursor:"pointer",justifySelf:"start"}}>{language==="es"?"Seleccionar de biblioteca pública":"Choose from public library"}</button>
      {showMedia?<div style={{border:"1px solid #ffffff30",padding:10,borderRadius:8}}>
        {mediaStatus==="loading"?<p role="status">{language==="es"?"Cargando biblioteca...":"Loading library..."}</p>:null}
        {mediaStatus==="error"?<p role="alert">{language==="es"?"No se pudo consultar la biblioteca. Comprueba tu sesión administrativa y MFA.":"Cannot load the library. Check your admin session and MFA."}</p>:null}
        {mediaStatus==="ready"&&mediaRows.length===0?<p>{language==="es"?"No hay imágenes públicas disponibles. Puedes utilizar una URL HTTPS existente.":"No public images available. You can use an existing HTTPS URL."}</p>:null}
        {mediaStatus==="ready"?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(125px,1fr))",gap:9,maxHeight:280,overflowY:"auto"}}>
          {mediaRows.map(row=>{const src=mediaUrl(row);return src?<button type="button" key={row.id} onClick={()=>{setImageUrl(src);setImageAlt((language==="es"?row.alt_es:row.alt_en)||row.slug);setImageError("");setShowMedia(false);}} style={{background:"#152e49",border:"1px solid #ffffff40",borderRadius:8,padding:8,color:"white",textAlign:"left",cursor:"pointer",minWidth:0}} aria-label={`${language==="es"?"Seleccionar":"Select"} ${row.slug}`}><img src={src} alt="" loading="lazy" style={{width:"100%",height:80,objectFit:"cover",borderRadius:5}}/><span style={{display:"block",fontSize:12,overflowWrap:"anywhere"}}>{row.slug}</span></button>:null;})}
        </div>:null}
      </div>:null}
      {imageError?<p role="alert" style={{color:"#ffcf96",fontWeight:600,margin:0}}>{imageError}</p>:null}
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}><button type="button" onClick={insertImage} style={{background:"#2b6984",color:"white",border:"1px solid #9bc7d4",padding:"9px 15px",borderRadius:7,cursor:"pointer",fontWeight:700}}>{language==="es"?"Insertar imagen en el artículo":"Insert image into article"}</button><button type="button" onClick={()=>{setImagePanel(false);setShowMedia(false);setImageError("");}}>{language==="es"?"Cancelar":"Cancel"}</button></div>
    </div>:null}
    <div ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label={language==="es"?"Contenido del articulo":"Article content"} lang={language} spellCheck onInput={sync} onKeyUp={rememberSelection} onMouseUp={rememberSelection} onBlur={sync} onPaste={e=>{
      e.preventDefault();const text=e.clipboardData.getData("text/plain");document.execCommand("insertText",false,text);sync();
    }} style={{minHeight:350,padding:20,background:"#101a29",border:"1px solid #ffffff36",borderTop:0,borderRadius:"0 0 10px 10px",color:"white",lineHeight:1.8,whiteSpace:"pre-wrap",overflowWrap:"anywhere",outlineOffset:3}} />
    <p style={{opacity:.75,fontSize:13,marginTop:7}}>{language==="es"?"Edicion visual con correccion ortografica del navegador. Los enlaces y el formato se guardan como bloques seguros.":"Visual editing with browser spellcheck. Links and formatting are stored as safe blocks."}</p>
    {notice?<p role="alert" style={{color:"#ffce8a"}}>{notice}</p>:null}
  </div>;
}
