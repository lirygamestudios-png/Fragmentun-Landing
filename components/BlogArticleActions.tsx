"use client";
import {useState} from "react";

type Article={id:string;slug:string;title_es:string;title_en:string;published_es:boolean;published_en:boolean};
export function BlogArticleActions({article,disabled,onEdit,onDeleted}:{article:Article;disabled:boolean;onEdit:()=>void;onDeleted:()=>Promise<void>}){
 const [open,setOpen]=useState(false);
 const [stage,setStage]=useState<0|1|2>(0);
 const [typed,setTyped]=useState("");
 const [working,setWorking]=useState(false);
 const [error,setError]=useState("");
 const published=article.published_es||article.published_en;
 function reset(){setOpen(false);setStage(0);setTyped("");setError("");}
 async function remove(){
   if(working||typed!==article.slug||published)return;
   setWorking(true);setError("");
   try{
     const r=await fetch("/api/admin/blog",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:article.id,slug:article.slug,confirmation:"ELIMINAR DEFINITIVAMENTE"})});
     const j=await r.json().catch(()=>({error:"invalid_response"}));
     if(!r.ok)throw Error(j.error||"delete_failed");
     await onDeleted();reset();
   }catch(e){setError(e instanceof Error?e.message:"delete_failed");}
   finally{setWorking(false);}
 }
 return <div style={{position:"relative",display:"flex",alignItems:"stretch",gap:6,margin:"8px 0"}}>
  <button type="button" onClick={()=>{reset();onEdit();}} disabled={disabled||working} style={{flex:1,minWidth:0,padding:12,textAlign:"left",background:"#12233a",border:"1px solid #ffffff30",borderRadius:10,color:"white",cursor:"pointer"}}>
   {article.title_es||article.title_en||article.slug}<small style={{display:"block",opacity:.7}}>{published?"Publicado":"Borrador"} · {article.slug}</small>
  </button>
  <button type="button" aria-label={`Opciones de ${article.slug}`} aria-expanded={open} title="Opciones" onClick={()=>setOpen(x=>!x)} disabled={disabled||working} style={{width:44,border:"1px solid #ffffff45",borderRadius:10,background:"#12233a",color:"white",fontSize:22,cursor:"pointer"}}>⋮</button>
  {open?<div role="menu" style={{position:"absolute",zIndex:20,right:0,top:"100%",width:192,background:"#0c1a2c",border:"1px solid #6d9abb",borderRadius:10,padding:7,boxShadow:"0 14px 24px #0009"}}>
   <button role="menuitem" type="button" onClick={()=>{reset();onEdit();}} style={{display:"block",width:"100%",textAlign:"left",padding:10,background:"transparent",color:"white",border:0,cursor:"pointer"}}>Editar artículo</button>
   <button role="menuitem" type="button" disabled={published} title={published?"Retira la publicación antes de eliminar":"Eliminar borrador"} onClick={()=>{setStage(1);setOpen(false);}} style={{display:"block",width:"100%",textAlign:"left",padding:10,background:"transparent",color:published?"#8b96a6":"#ff9c9c",border:0,cursor:published?"not-allowed":"pointer"}}>Eliminar{published?" (retirar antes)":""}</button>
  </div>:null}
  {stage!==0?<div role="dialog" aria-modal="true" aria-label="Confirmar eliminación de artículo" style={{position:"fixed",inset:0,background:"#000b",zIndex:1000,display:"grid",placeItems:"center",padding:20}}>
   <div style={{maxWidth:480,width:"100%",background:"#101e32",color:"white",border:"1px solid #88b1cb",borderRadius:14,padding:22,boxShadow:"0 20px 60px #000a"}}>
    <h3 style={{marginTop:0}}>Eliminar artículo — confirmación {stage} de 2</h3>
    <p><strong>{article.title_es||article.slug}</strong></p>
    <p>Esta acción elimina definitivamente el artículo de la base de datos. No se puede deshacer.</p>
    {stage===2?<><label htmlFor={`blog-delete-${article.id}`}>Escribe exactamente el identificador <strong>{article.slug}</strong> para confirmar:</label><input id={`blog-delete-${article.id}`} autoComplete="off" spellCheck={false} value={typed} onChange={e=>setTyped(e.target.value)} style={{width:"100%",padding:10,marginTop:8}}/></>:null}
    {error?<p role="alert" style={{color:"#ffaaaa"}}>No se pudo eliminar: {error}</p>:null}
    <div style={{display:"flex",justifyContent:"flex-end",gap:10,marginTop:18,flexWrap:"wrap"}}>
     <button type="button" disabled={working} onClick={reset} className="btn btnGhost">Cancelar</button>
     {stage===1?<button type="button" className="btn btnGhost" onClick={()=>setStage(2)}>Continuar a segunda confirmación</button>:<button type="button" disabled={working||typed!==article.slug} onClick={()=>void remove()} style={{background:"#8d2431",color:"white",border:0,borderRadius:8,padding:"10px 14px",cursor:"pointer"}}>{working?"Eliminando…":"Eliminar definitivamente"}</button>}
    </div>
   </div>
  </div>:null}
 </div>;
}
