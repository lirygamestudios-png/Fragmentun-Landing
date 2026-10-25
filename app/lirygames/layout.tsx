import type {Metadata} from "next";

/** Metadata de LIRYGAMES, aislada de la raíz FRAGMENTUN, en cada despliegue. */
const rawDeployment=process.env.VERCEL_URL;
const candidate=process.env.NEXT_PUBLIC_LIRY_PUBLIC_URL;
function liryMetadataOrigin(){
 try{
  if(candidate){const u=new URL(candidate);if(u.protocol==="https:"&&!u.username&&!u.password)return u.origin;}
 }catch{}
 if(rawDeployment&&/^[a-zA-Z0-9.-]+\.vercel\.app$/.test(rawDeployment))return "https://"+rawDeployment;
 return "https://lirygames-studios-frontdesk.vercel.app";
}
export const metadata:Metadata={
 metadataBase:new URL(liryMetadataOrigin()),
 title:{default:"LIRYGAMES STUDIOS",template:"%s | LIRYGAMES STUDIOS"},
 description:"CIENTOS DE MUNDOS, INFINITAS FORMAS DE JUGAR. Explora LIRYGAMES STUDIOS.",
 applicationName:"LIRYGAMES STUDIOS",
 openGraph:{type:"website",siteName:"LIRYGAMES STUDIOS",title:"LIRYGAMES STUDIOS",description:"CIENTOS DE MUNDOS, INFINITAS FORMAS DE JUGAR.",url:"/lirygames",images:[{url:"/lirygames/opengraph-image",width:1200,height:630,alt:"LIRYGAMES STUDIOS"}]},
 twitter:{card:"summary_large_image",title:"LIRYGAMES STUDIOS",description:"CIENTOS DE MUNDOS, INFINITAS FORMAS DE JUGAR.",images:["/lirygames/opengraph-image"]},
 icons:{icon:[{url:"/lirygames-brand-icon.svg",type:"image/svg+xml"}],shortcut:"/lirygames-brand-icon.svg",apple:"/lirygames-brand-icon.svg"}
};
export default function LirygamesLayout({children}:{children:React.ReactNode}){return children;}
