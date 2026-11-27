"use client";
import {BlogRichContent,safeRichImage} from "./FragmentunRichContent";

type PreviewItem={slug:string;title_es:string;title_en:string;excerpt_es:string;excerpt_en:string;body_es:string;body_en:string;image_url:string|null};
export function BlogDraftPreview({item,language,onClose}:{item:PreviewItem;language:"es"|"en";onClose:()=>void}){
  const es=language==="es";
  const title=es?item.title_es:item.title_en;
  const excerpt=es?item.excerpt_es:item.excerpt_en;
  const body=es?item.body_es:item.body_en;
  const cover=safeRichImage(item.image_url);
  return <section role="region" aria-label={es?"Vista previa privada del borrador":"Private draft preview"} style={{marginTop:20,background:"#0b1626",border:"1px solid #6687a655",borderRadius:15,overflow:"hidden",maxWidth:"100%"}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12,padding:"12px 18px",borderBottom:"1px solid #ffffff26"}}>
      <span style={{fontSize:12,fontWeight:700,letterSpacing:".08em",color:"#b4d6e8"}}>{es?"VISTA PREVIA PRIVADA · NO PUBLICADA":"PRIVATE PREVIEW · NOT PUBLISHED"}</span>
      <button type="button" onClick={onClose} style={{background:"#203d54",color:"white",border:"1px solid #7695af",borderRadius:7,padding:"8px 12px",cursor:"pointer"}}>{es?"Cerrar vista previa":"Close preview"}</button>
    </div>
    <div style={{padding:"clamp(18px,4vw,38px)",maxWidth:880,margin:"auto",overflowWrap:"anywhere"}}>
      <p style={{color:"#bdcee0",fontSize:12,letterSpacing:".16em"}}>FRAGMENTUN · BLOG</p>
      <h1 style={{fontSize:"clamp(26px,4vw,44px)",lineHeight:1.18,overflowWrap:"anywhere",margin:"14px 0"}}>{title|| (es?"Título pendiente":"Title pending")}</h1>
      <p style={{fontSize:"clamp(16px,2vw,20px)",opacity:.85,lineHeight:1.65}}>{excerpt}</p>
      {cover?<img src={cover} alt={title||""} style={{maxWidth:"100%",width:"100%",height:"auto",borderRadius:12,margin:"16px 0",objectFit:"contain"}}/>:null}
      <div style={{fontSize:17,lineHeight:1.85,overflowWrap:"anywhere"}}><BlogRichContent value={body}/></div>
    </div>
    <p style={{padding:"0 18px 15px",fontSize:12,opacity:.68}}>{es?"Esta vista muestra el contenido actual del editor. No crea enlaces públicos ni publica el artículo.":"This preview shows the current editor content. It does not publish the article."}</p>
  </section>;
}
