import { ImageResponse } from "next/og";

export const alt = "FRAGMENTUN — Lumen, un universo donde las emociones lo cambian todo";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const isEs = locale !== "en";
  return new ImageResponse(
    (
      <div style={{ width:"100%",height:"100%",display:"flex",position:"relative",overflow:"hidden",background:"linear-gradient(115deg,#050c1c 0%,#0a1932 52%,#17264d 100%)",color:"#f7eedb",fontFamily:"Georgia,serif" }}>
        <div style={{ position:"absolute",width:670,height:670,borderRadius:335,top:-100,right:-180,background:"radial-gradient(circle,rgba(65,150,215,.35) 0%,rgba(17,40,84,.17) 49%,transparent 72%)" }}/>
        <div style={{ position:"absolute",width:440,height:440,borderRadius:220,top:88,right:80,border:"2px solid rgba(202,174,91,.45)",boxShadow:"0 0 55px rgba(65,139,220,.26)",display:"flex",alignItems:"center",justifyContent:"center" }}>
          <div style={{ width:295,height:295,borderRadius:148,border:"1px solid rgba(123,192,242,.57)",display:"flex",alignItems:"center",justifyContent:"center" }}>
            <div style={{ fontSize:154,color:"#e2c16c",textShadow:"0 0 28px rgba(231,187,89,.4)" }}>✦</div>
          </div>
        </div>
        <div style={{ display:"flex",flexDirection:"column",justifyContent:"center",padding:"66px 80px",zIndex:2,maxWidth:850 }}>
          <div style={{ fontSize:27,letterSpacing:11,color:"#d7b96e",marginBottom:25 }}>LIRYGAMES STUDIOS</div>
          <div style={{ fontSize:88,fontWeight:700,letterSpacing:3,lineHeight:1.05,color:"#f4dfaa",marginBottom:18 }}>FRAGMENTUN</div>
          <div style={{ height:3,width:220,background:"#d7b96e",marginBottom:29 }}/>
          <div style={{ fontSize:34,lineHeight:1.25,maxWidth:660 }}>{isEs ? "LUMEN: DONDE SENTIR ES REBELARSE" : "LUMEN: WHERE FEELING IS REBELLION"}</div>
          <div style={{ fontSize:23,color:"#b7cee9",marginTop:27 }}>{isEs ? "Descubre el universo de El Despertar Emocional" : "Explore the universe of The Emotional Awakening"}</div>
          <div style={{ fontSize:19,color:"#d7b96e",marginTop:28,letterSpacing:2 }}>FRAGMENTUN.COM</div>
        </div>
      </div>
    ),
    size
  );
}
