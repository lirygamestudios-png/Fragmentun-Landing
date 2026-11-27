import type {ReactNode} from "react";

export const RICH_PREFIX = "FRAGMENTUN_RICH_V1:";
export type RichPiece = {text:string; bold?:boolean; italic?:boolean; underline?:boolean; href?:string};
export type RichBlock = {kind:"p"|"h2"|"h3"|"quote"|"bullet"|"number"|"image"; align?:"left"|"center"|"right"|"justify"; indent?:number; pieces:RichPiece[]; src?:string; alt?:string; width?:number};

const kinds = new Set(["p","h2","h3","quote","bullet","number","image"]);
const aligns = new Set(["left","center","right","justify"]);
export function safeRichHref(raw:unknown):string|undefined {
  if (typeof raw !== "string") return undefined;
  const s=raw.trim();
  if (/^https:\/\/[^\s<>"']+$/i.test(s) || /^\/(?!\/)[a-zA-Z0-9/_\-.#?=&%]+$/.test(s) || /^#[a-zA-Z0-9_-]+$/.test(s)) return s;
  return undefined;
}
export function safeRichImage(raw:unknown):string|undefined {
  if(typeof raw!=="string")return undefined;
  const s=raw.trim();
  // No data/blob/javascript URLs, no protocol-relative or SVG sources.
  if(/^https:\/\/[^\s<>"'`]+$/i.test(s) && !/\.svg(?:[?#]|$)/i.test(s))return s;
  if(/^\/(?!\/)[a-zA-Z0-9/_\-.]+(?:[?#][a-zA-Z0-9/_\-.%=&?]*)?$/i.test(s) && !/\.svg(?:[?#]|$)/i.test(s))return s;
  return undefined;
}
export function parseRich(value:string):RichBlock[] {
  if (!value.startsWith(RICH_PREFIX)) return value.split(/\n\s*\n/).filter(Boolean).map(text=>({kind:"p" as const,pieces:[{text:text.trim()}]}));
  try {
    const parsed:unknown=JSON.parse(value.slice(RICH_PREFIX.length));
    if (!Array.isArray(parsed) || parsed.length>500) return [];
    return parsed.map((b:unknown):RichBlock|null=>{
      if (!b || typeof b!=="object") return null;
      const item=b as Record<string,unknown>;
      if (!kinds.has(String(item.kind)) || !Array.isArray(item.pieces) || item.pieces.length>500) return null;
      if(item.kind==="image"){
        const src=safeRichImage(item.src);
        if(!src)return null;
        const alt=typeof item.alt==="string"?item.alt.slice(0,240):"";
        const width=typeof item.width==="number"&&Number.isFinite(item.width)?Math.max(25,Math.min(100,Math.round(item.width))):100;
        return {kind:"image",src,alt,width,align:aligns.has(String(item.align))?item.align as RichBlock["align"]:"center",pieces:[]};
      }
      const pieces:RichPiece[]=item.pieces.flatMap((p:unknown):RichPiece[]=>{
        if (!p || typeof p!=="object") return [];
        const piece=p as Record<string,unknown>;
        if (typeof piece.text!=="string") return [];
        return [{text:piece.text.slice(0,50000),bold:piece.bold===true,italic:piece.italic===true,underline:piece.underline===true,href:safeRichHref(piece.href)}];
      });
      return {kind:item.kind as RichBlock["kind"],align:aligns.has(String(item.align))?item.align as RichBlock["align"]:undefined,indent:typeof item.indent==="number"?Math.max(0,Math.min(3,Math.floor(item.indent))):0,pieces};
    }).filter((b):b is RichBlock=>b!==null);
  } catch {return [];}
}
function renderPieces(pieces:RichPiece[]):ReactNode {
  return pieces.map((piece,i)=>{
    let node:ReactNode=piece.text;
    if (piece.bold) node=<strong>{node}</strong>;
    if (piece.italic) node=<em>{node}</em>;
    if (piece.underline) node=<u>{node}</u>;
    const href=safeRichHref(piece.href);
    if (href) node=<a href={href} rel={href.startsWith("https://")?"noopener noreferrer":undefined}>{node}</a>;
    return <span key={i}>{node}</span>;
  });
}
export function BlogRichContent({value}:{value:string}) {
  const blocks=parseRich(value||"");
  const nodes:ReactNode[]=[];
  for(let i=0;i<blocks.length;){
    const b=blocks[i];
    const style={textAlign:b.align||"left",marginLeft:`${Math.min(3,b.indent||0)*1.25}rem`} as const;
    if(b.kind==="bullet" || b.kind==="number"){
      const items:ReactNode[]=[];
      let j=i;
      while(j<blocks.length && blocks[j].kind===b.kind && blocks[j].align===b.align && blocks[j].indent===b.indent){
        items.push(<li key={j}>{renderPieces(blocks[j].pieces)}</li>);j++;
      }
      nodes.push(b.kind==="bullet"?<ul key={i} style={style}>{items}</ul>:<ol key={i} style={style}>{items}</ol>);
      i=j;continue;
    }
    if(b.kind==="image"){
      const src=safeRichImage(b.src);
      if(src){
        const justify=b.align==="left"?"flex-start":b.align==="right"?"flex-end":"center";
        nodes.push(<figure key={i} style={{display:"flex",justifyContent:justify,margin:"1.5rem 0"}}><img src={src} alt={b.alt||""} loading="lazy" style={{maxWidth:"100%",width:`${b.width||100}%`,height:"auto",borderRadius:10,objectFit:"contain"}} /></figure>);
      }
      i++;continue;
    }
    const children=renderPieces(b.pieces);
    switch(b.kind){
      case "h2": nodes.push(<h2 key={i} style={style}>{children}</h2>);break;
      case "h3": nodes.push(<h3 key={i} style={style}>{children}</h3>);break;
      case "quote": nodes.push(<blockquote key={i} style={style}>{children}</blockquote>);break;
      default: nodes.push(<p key={i} style={style}>{children}</p>);
    }
    i++;
  }
  return <>{nodes}</>;
}
