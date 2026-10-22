import {ImageResponse} from "next/og";
export const alt="LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar";
export const size={width:1200,height:630};
export const contentType="image/png";
const logoSvg="<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 256 256\"><defs><linearGradient id=\"tile\" x1=\"0\" y1=\"0\" x2=\"1\" y2=\"1\"><stop stop-color=\"#30215b\"/><stop offset=\"1\" stop-color=\"#102441\"/></linearGradient><linearGradient id=\"stem\" x1=\"0\" y1=\"0\" x2=\".6\" y2=\"1\"><stop stop-color=\"#ee34fa\"/><stop offset=\".55\" stop-color=\"#a78aff\"/><stop offset=\"1\" stop-color=\"#39d8ff\"/></linearGradient><linearGradient id=\"upper\" x1=\"0\" x2=\"1\"><stop stop-color=\"#e237f1\"/><stop offset=\"1\" stop-color=\"#4deaff\"/></linearGradient><linearGradient id=\"lower\" x1=\"0\" x2=\"1\"><stop stop-color=\"#54d9ff\"/><stop offset=\"1\" stop-color=\"#9747f7\"/></linearGradient></defs><rect x=\"7\" y=\"7\" width=\"242\" height=\"242\" rx=\"63\" fill=\"url(#tile)\" stroke=\"#36e3ff\" stroke-width=\"9\"/><path d=\"M117 61H92C73 61 65 70 65 91V169C65 190 74 197 93 197H116\" fill=\"none\" stroke=\"#39ecff\" stroke-width=\"17\" stroke-linecap=\"square\" stroke-linejoin=\"round\"/><path d=\"M119 64L112 199\" fill=\"none\" stroke=\"url(#stem)\" stroke-width=\"15\"/><path d=\"M121 68H194\" stroke=\"url(#upper)\" stroke-width=\"15\" stroke-linecap=\"round\"/><path d=\"M118 129H187\" stroke=\"#57d8ff\" stroke-width=\"15\" stroke-linecap=\"round\"/><path d=\"M115 188H192\" stroke=\"url(#lower)\" stroke-width=\"15\" stroke-linecap=\"round\"/></svg>";
export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"72px",background:"linear-gradient(135deg,#031025 0%,#091e3c 55%,#062d49 100%)",color:"#eafbff",fontFamily:"sans-serif",border:"14px solid #126b94"}}>
   <div style={{display:"flex",alignItems:"center",gap:18,marginBottom:36}}><img src={`data:image/svg+xml,${encodeURIComponent(logoSvg)}`} width={82} height={82} alt="LIRYGAMES STUDIOS" /><div style={{display:"flex",fontSize:24,letterSpacing:8,color:"#71dcf5"}}>LIRYGAMES STUDIOS</div></div>
   <div style={{display:"flex",flexDirection:"column",fontWeight:800,fontSize:78,lineHeight:1.12}}>
    <div style={{fontSize:62}}>CIENTOS DE MUNDOS.</div>
    <div style={{color:"#64d6f4"}}>INFINITAS FORMAS</div>
    <div>DE JUGAR.</div>
   </div>
   <div style={{display:"flex",marginTop:40,fontSize:25,color:"#c7e8f7"}}>Explora el universo de videojuegos LIRYGAMES</div>
   <div style={{display:"flex",position:"absolute",right:65,bottom:47,color:"#5fb9d3",fontSize:18,letterSpacing:4}}>PRÓXIMAMENTE</div>
  </div>,size);
}
