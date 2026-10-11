import Link from "next/link";
import {notFound} from "next/navigation";
import {legalClauses} from "../../../../lib/lirygames-legal-clauses";
export const metadata={robots:{index:false,follow:false}};
const legal={
 privacidad:{title:"Política de privacidad",summary:"Describe los tratamientos de datos previstos para cuentas, comunicaciones, LiryBoost y videojuegos.",check:["Identificación del responsable y datos de contacto","Categorías de datos realmente recopilados y finalidades","Bases legales, destinatarios y transferencias","Plazos de conservación y derechos de los usuarios","Tratamiento de datos de menores y solicitudes de privacidad"]},
 terminos:{title:"Términos y condiciones",summary:"Regulará el uso del sitio, cuentas, videojuegos y contenidos.",check:["Identidad y domicilio de la empresa","Reglas de acceso y uso aceptable","Condiciones de cuentas, suspensiones y reclamaciones","Limitaciones, garantías y jurisdicción aplicable","Actualizaciones y mecanismo de aceptación"]},
 cookies:{title:"Política de cookies",summary:"Informará de cookies, tecnologías similares y preferencias de seguimiento.",check:["Inventario real de cookies y proveedores","Finalidad y duración de cada tecnología","Consentimientos cuando correspondan","Opciones para retirar o modificar preferencias","Relación con analítica y publicidad"]},
 compras:{title:"Compras, entregas y reembolsos",summary:"Regulará compras de productos físicos y elementos digitales según la plataforma y proveedor.",check:["Identidad del vendedor o intermediario","Métodos de pago y monedas","Impuestos, entrega y disponibilidad","Reembolsos y cancelaciones según ley y plataforma","Restauración de bienes digitales y atención al cliente"]},
 liryboost:{title:"Bases de LiryBoost",summary:"Precisará los requisitos y mecanismos del concurso de invitaciones antes de activar el Top 10.",check:["Países, edades y elegibilidad","Fechas, reglas y criterios de invitaciones válidas","Verificación, antifraude y tratamiento de empates","Acceso beta y disponibilidad real de recompensas","Privacidad, publicidad del alias y resolución de reclamaciones"]},
 "propiedad-intelectual":{title:"Propiedad intelectual",summary:"Describirá la titularidad y condiciones de uso de marcas y contenidos.",check:["Identificación de titulares y licencias","Usos permitidos y prohibidos","Procedimiento de reclamación por infracción","Reglas de contenido aportado por usuarios","Protección de títulos de IP aún no publicables"]},
 menores:{title:"Seguridad y menores",summary:"Explicará los controles de edad, el tratamiento de datos infantiles y futuras protecciones.",check:["Audiencia objetivo y requisitos de edad","Verificación parental cuando proceda","Moderación y herramientas de reporte","Controles sociales y de compras","Tratamiento especial de información de menores"]},
 accesibilidad:{title:"Accesibilidad",summary:"Documentará medidas de accesibilidad y vías de reporte de barreras.",check:["Revisión de navegación por teclado","Contraste y compatibilidad con lectores de pantalla","Acceso móvil y controles de movimiento","Canal para reportar incidencias","Plan de mejoras y revisión"]},
} as const;
type Key=keyof typeof legal;
export function generateStaticParams(){return Object.keys(legal).map(slug=>({slug}))}
export default async function LegalDocument({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!(slug in legal))notFound();
 const doc=legal[slug as Key];
 return <main style={{minHeight:"100vh",background:"#041222",color:"#e8f7ff",fontFamily:"Arial,sans-serif",padding:"clamp(24px,5vw,72px)"}}>
  <nav style={{display:"flex",gap:18,flexWrap:"wrap",fontSize:13}}><Link href="/lirygames" style={{color:"#5de4ff"}}>← FRONTDESK</Link><Link href="/lirygames/legal" style={{color:"#5de4ff"}}>CENTRO LEGAL</Link></nav>
  <p style={{color:"#5de4ff",marginTop:36,letterSpacing:2,fontSize:12}}>LIRYGAMES STUDIOS · BORRADOR</p>
  <h1 style={{fontSize:"clamp(25px,4vw,43px)",maxWidth:850}}>{doc.title}</h1>
  <p style={{maxWidth:760,lineHeight:1.7,color:"#c0d6e4"}}>{doc.summary}</p>
  <section style={{maxWidth:850,background:"#0a2036",border:"1px solid #287597",borderRadius:12,padding:"clamp(18px,3vw,28px)",marginTop:28}}>
   <strong style={{color:"#65e5ff"}}>DOCUMENTO EN PREPARACIÓN · NO VIGENTE</strong>
   <p style={{lineHeight:1.7}}>Este texto contiene cláusulas propuestas y protecciones contractuales sujetas a revisión profesional, comprobación del funcionamiento real y aprobación formal. No es una política vigente ni sustituye derechos legales de usuarios o consumidores.</p>
   {slug==="privacidad"&&<div style={{borderTop:"1px solid #244e68",marginTop:24,paddingTop:16,lineHeight:1.7}}>
    <h2 style={{fontSize:19}}>Información del formulario de contacto</h2>
    <p>En la versión actual del FrontDesk, el formulario solicita nombre, correo electrónico, motivo, mensaje y, de manera opcional, el videojuego o producto relacionado. Se utiliza para tramitar y responder la consulta enviada. La casilla de autorización del formulario no constituye una suscripción a publicidad.</p>
    <p>El envío incorpora validaciones y un límite de frecuencia. La aceptación del mensaje depende del servicio de almacenamiento configurado; su operación real debe comprobarse antes del lanzamiento.</p>
    <p><strong>Pendiente de confirmar:</strong> identidad jurídica y domicilio del responsable, correo de privacidad, proveedor y ubicación del almacenamiento, conservación efectiva, régimen de derechos y destinatarios, uso real de analítica y cookies, y tratamiento de datos de menores.</p>
    <p>Las cuentas de jugador, las compras y el ranking activo de LiryBoost no deben describirse como sistemas en funcionamiento mientras no estén habilitados y verificados.</p>
   </div>}
   <h2 style={{fontSize:19,marginTop:26}}>Cláusulas propuestas para revisión</h2>
   {legalClauses[slug]?.map((clause,index)=><section key={index} style={{marginTop:19,paddingTop:14,borderTop:"1px solid #254760"}}><h3 style={{fontSize:16,color:"#8deaff",margin:"0 0 9px"}}>{clause.heading}</h3><p style={{lineHeight:1.75,margin:0,color:"#d5e6f0"}}>{clause.text}</p></section>)}
   <h2 style={{fontSize:19,marginTop:26}}>Validaciones pendientes antes de aprobar</h2>
   <ul style={{lineHeight:1.8,paddingLeft:23}}>{doc.check.map(x=><li key={x}>{x}</li>)}</ul>
  </section>
  <p style={{color:"#9bbbcf",fontSize:13,marginTop:30}}>Para consultas generales puedes utilizar el formulario de contacto del FrontDesk. Este borrador no sustituye asesoramiento jurídico.</p>
  <Link href="/lirygames#contacto" style={{color:"#68eaff"}}>IR A CONTACTO →</Link>
 </main>;
}
