import Link from "next/link";
export const metadata={title:"Centro legal | LIRYGAMES STUDIOS",robots:{index:false,follow:false}};
const documents=[
 {slug:"privacidad",title:"Política de privacidad",about:"Tratamiento de datos, derechos y contacto de privacidad."},
 {slug:"terminos",title:"Términos y condiciones",about:"Uso del FrontDesk y de futuros servicios gamer."},
 {slug:"cookies",title:"Política de cookies",about:"Tecnologías de navegación y futuras opciones de consentimiento."},
 {slug:"compras",title:"Compras, entregas y reembolsos",about:"Bienes físicos y digitales, condiciones de pago y devoluciones."},
 {slug:"liryboost",title:"Bases de LiryBoost",about:"Participación, invitaciones válidas, clasificación y acceso beta."},
 {slug:"propiedad-intelectual",title:"Propiedad intelectual",about:"Marcas, obras, contenidos y licencias del estudio."},
 {slug:"menores",title:"Seguridad y menores",about:"Edad, privacidad infantil y futuras funciones de protección."},
 {slug:"accesibilidad",title:"Accesibilidad",about:"Compromisos de acceso inclusivo y contacto para incidencias."}
] as const;
export default function LegalIndex(){return <main style={{minHeight:"100vh",background:"#041222",color:"#e7f7ff",fontFamily:"Arial,sans-serif",padding:"clamp(24px,5vw,72px)"}}>
 <Link href="/lirygames" style={{color:"#63e2ff",fontSize:13}}>← VOLVER A LIRYGAMES</Link>
 <p style={{color:"#65d9ff",letterSpacing:3,fontSize:12,marginTop:36}}>LIRYGAMES STUDIOS</p><h1 style={{fontSize:"clamp(28px,4vw,46px)"}}>CENTRO LEGAL</h1>
 <p style={{color:"#b4cfdf",maxWidth:760,lineHeight:1.6}}>Accede a la información legal del ecosistema LIRYGAMES. Los documentos están en preparación y requieren revisión y aprobación antes del lanzamiento. No constituyen políticas definitivas.</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,maxWidth:1050,marginTop:32}}>{documents.map(d=><Link key={d.slug} href={`/lirygames/legal/${d.slug}`} style={{padding:20,borderRadius:12,border:"1px solid #236c91",background:"#091e34",color:"#effaff",textDecoration:"none",display:"grid",gap:10}}><strong>{d.title} ↗</strong><span style={{fontSize:13,color:"#a7cadb",lineHeight:1.5}}>{d.about}</span><small style={{color:"#5dd6f5"}}>DOCUMENTO EN PREPARACIÓN</small></Link>)}</div>
 </main>}
