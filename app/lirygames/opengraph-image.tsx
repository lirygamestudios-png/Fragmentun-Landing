import {ImageResponse} from "next/og";
export const alt="LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar";
export const size={width:1200,height:630};
export const contentType="image/png";
export default function OpenGraphImage(){
 return new ImageResponse(
  <div style={{width:"100%",height:"100%",display:"flex",flexDirection:"column",justifyContent:"center",padding:"72px",background:"linear-gradient(135deg,#031025 0%,#091e3c 55%,#062d49 100%)",color:"#eafbff",fontFamily:"sans-serif",border:"14px solid #126b94"}}>
   <div style={{display:"flex",fontSize:24,letterSpacing:8,color:"#71dcf5",marginBottom:36}}>LIRYGAMES STUDIOS</div>
   <div style={{display:"flex",flexDirection:"column",fontWeight:800,fontSize:78,lineHeight:1.12}}>
    <div>CIENTOS DE MUNDOS.</div>
    <div style={{color:"#64d6f4"}}>INFINITAS FORMAS</div>
    <div>DE JUGAR.</div>
   </div>
   <div style={{display:"flex",marginTop:40,fontSize:25,color:"#c7e8f7"}}>Explora el universo de videojuegos LIRYGAMES</div>
   <div style={{display:"flex",position:"absolute",right:65,bottom:47,color:"#5fb9d3",fontSize:18,letterSpacing:4}}>PRÓXIMAMENTE</div>
  </div>,size);
}
