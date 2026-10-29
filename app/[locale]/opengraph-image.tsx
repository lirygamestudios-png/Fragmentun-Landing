import { ImageResponse } from "next/og";

export const alt = "FRAGMENTUN — Elyon Voss en Lumen | José Liranzo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale !== "en";
  const portrait = "https://www.fragmentun.com/elyon-hero.jpg";
  return new ImageResponse(
    (
      <div style={{ width:1200,height:630,display:"flex",position:"relative",overflow:"hidden",background:"linear-gradient(115deg,#050c1c 0%,#0a1932 52%,#17264d 100%)",color:"#f7eedb",fontFamily:"Georgia,serif" }}>
        <div style={{ position:"absolute",display:"flex",width:660,height:660,borderRadius:330,top:-100,right:-100,background:"radial-gradient(circle,rgba(65,150,215,.46) 0%,rgba(17,40,84,.28) 52%,transparent 75%)" }}/>
        <div style={{ position:"absolute",display:"flex",top:64,right:63,width:365,height:502,borderRadius:24,border:"3px solid rgba(116,195,255,.82)",boxShadow:"0 0 58px rgba(30,143,243,.48)",overflow:"hidden",background:"#122b50" }}>
          <img src={portrait} width={365} height={502} style={{width:"100%",height:"100%",objectFit:"cover"}} alt="Elyon Voss"/>
        </div>
        <div style={{ position:"absolute",display:"flex",right:76,bottom:48,color:"#c9e7ff",fontSize:21,letterSpacing:3 }}>ELYON VOSS</div>
        <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",padding:"60px 72px",zIndex:2,width:810 }}>
          <div style={{ fontSize:24,letterSpacing:8,color:"#d7b96e",marginBottom:24 }}>JOSÉ LIRANZO · AUTOR</div>
          <div style={{ fontSize:79,fontWeight:700,letterSpacing:2,lineHeight:1.05,color:"#f4dfaa",marginBottom:20 }}>FRAGMENTUN</div>
          <div style={{ height:3,width:185,background:"#d7b96e",marginBottom:25 }}/>
          <div style={{ fontSize:28,lineHeight:1.25,maxWidth:620 }}>{isEs ? "LUMEN: DONDE SENTIR ES REBELARSE" : "LUMEN: WHERE FEELING IS REBELLION"}</div>
          <div style={{ fontSize:20,color:"#b7cee9",marginTop:22 }}>{isEs ? "Descubre El Despertar Emocional" : "Discover The Emotional Awakening"}</div>
          <div style={{ fontSize:18,color:"#d7b96e",marginTop:25,letterSpacing:2 }}>FRAGMENTUN.COM</div>
        </div>
      </div>
    ),
    size
  );
}
