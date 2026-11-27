import {ImageResponse} from "next/og";
import {readFile} from "node:fs/promises";
import {join} from "node:path";
import {notFound} from "next/navigation";
import {publishedPost,localized,type BlogLocale} from "../../../../lib/blog/data";

export const runtime="nodejs";
export const alt="Tarjeta de artículo de FRAGMENTUN — José Liranzo";
export const size={width:1200,height:630};
export const contentType="image/png";

type Props={params:Promise<{locale:string;slug:string}>};

export default async function BlogOpenGraphImage({params}:Props){
 const {locale,slug}=await params;
 if(locale!=="es"&&locale!=="en")notFound();
 const post=await publishedPost(locale,slug);
 if(!post)notFound();
 const lang=locale as BlogLocale;
 const title=(localized(post,lang).title||"FRAGMENTUN").trim().slice(0,112);
 const isEs=locale==="es";
 const titleSize=title.length>75?33:title.length>48?40:49;
 // This is a bundled public asset; no remote image host or credentials are required.
 let portraitSrc:string|undefined;
 try {
  const image=await readFile(join(process.cwd(),"public","elyon-hero.jpg"));
  portraitSrc=`data:image/jpeg;base64,${image.toString("base64")}`;
 } catch { /* The branded card remains readable without an optional portrait. */ }
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",position:"relative",overflow:"hidden",background:"linear-gradient(115deg,#050c1c 0%,#0a1932 52%,#17264d 100%)",color:"#f7eedb",fontFamily:"Georgia,serif"}}>
   <div style={{position:"absolute",width:670,height:670,borderRadius:335,top:-100,right:-180,background:"radial-gradient(circle,rgba(65,150,215,.35) 0%,rgba(17,40,84,.17) 49%,transparent 72%)"}}/>
   {portraitSrc?<div style={{position:"absolute",display:"flex",top:50,right:46,width:365,height:530,border:"2px solid rgba(202,174,91,.65)",borderRadius:20,overflow:"hidden",boxShadow:"0 0 55px rgba(65,139,220,.26)"}}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={portraitSrc} alt="" width="365" height="530" style={{objectFit:"cover",width:"100%",height:"100%"}}/>
   </div>:<div style={{position:"absolute",width:430,height:430,borderRadius:215,top:95,right:50,border:"2px solid rgba(202,174,91,.45)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:154,color:"#e2c16c"}}>✦</div>}
   <div style={{position:"absolute",left:790,top:0,width:145,height:630,background:"linear-gradient(90deg,#0a1932 0%,rgba(10,25,50,.6) 48%,transparent 100%)"}}/>
   <div style={{display:"flex",flexDirection:"column",justifyContent:"center",padding:"58px 70px",zIndex:2,width:820}}>
    <div style={{fontSize:23,letterSpacing:7,color:"#d7b96e",marginBottom:21}}>JOSÉ LIRANZO  ·  AUTOR</div>
    <div style={{fontSize:76,fontWeight:700,letterSpacing:2,lineHeight:1.06,color:"#f4dfaa",marginBottom:17}}>FRAGMENTUN</div>
    <div style={{height:3,width:205,background:"#d7b96e",marginBottom:27}}/>
    <div style={{fontSize:titleSize,lineHeight:1.18,width:705,overflow:"hidden",maxHeight:205}}>{title}</div>
    <div style={{fontSize:19,color:"#b7cee9",marginTop:24}}>{isEs?"CRÓNICAS DEL UNIVERSO FRAGMENTUN":"CHRONICLES OF THE FRAGMENTUN UNIVERSE"}</div>
    <div style={{fontSize:17,color:"#d7b96e",marginTop:22,letterSpacing:2}}>FRAGMENTUN.COM</div>
   </div>
  </div>,size
 );
}
