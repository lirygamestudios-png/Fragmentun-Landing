"use client";
import type {IdentityDecision} from "../lib/games/liry-biometric-readiness";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
type Stage={key:string;complete:boolean};
/** Isolated design reference, never mounted on public FrontDesk or connected to real cases. */
export function LiryBiometricAdminStatusMock({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const es=locale==="es";
 const states:ReadonlyArray<{status:IdentityDecision;es:string;en:string}>=[
  {status:"not_started",es:"No iniciada",en:"Not started"},
  {status:"pending",es:"Pendiente",en:"Pending"},
  {status:"verified",es:"Identidad verificada",en:"Identity verified"},
  {status:"needs_review",es:"Revisión humana",en:"Human review"},
  {status:"rejected",es:"Rechazada",en:"Rejected"},
  {status:"expired",es:"Vencida",en:"Expired"}
 ];
 const gates:ReadonlyArray<Stage & {es:string;en:string}>=[
  {key:"identity",complete:false,es:"Identidad",en:"Identity"},
  {key:"ip",complete:false,es:"Derechos IP",en:"IP rights"},
  {key:"bank",complete:false,es:"Titularidad bancaria",en:"Bank ownership"},
  {key:"safety",complete:false,es:"Seguridad y edad",en:"Safety and age"},
  {key:"manual",complete:false,es:"Aprobación manual",en:"Manual approval"}
 ];
 return <section aria-label={es?"Diseño interno ilustrativo de verificación":"Illustrative internal verification design"} style={{padding:20,border:"1px solid #47bde7",borderRadius:12,background:"#08172d",color:"#e5f8ff",maxWidth:680}}>
  <h2>{es?"Revisión de identidad · Diseño interno":"Identity review · Internal design"}</h2>
  <p role="status">{es?"DEMO · Sin expedientes ni identidad real":"DEMO · No real applicants or identities"}</p>
  <p>{es?"Estados permitidos (catálogo, no resultados de personas):":"Allowed states (catalogue, not individual results):"}</p>
  <ul>{states.map(item=><li key={item.status}>{es?item.es:item.en}</li>)}</ul>
  <h3>{es?"Compuertas de admisión":"Admission gates"}</h3>
  <ul>{gates.map(item=><li key={item.key}>{es?item.es:item.en}: {es?"Pendiente":"Pending"}</li>)}</ul>
  <p>{es?"La admisión permanece BLOQUEADA hasta completar todas las revisiones y la aprobación manual.":"Admission stays BLOCKED until all reviews and manual approval are complete."}</p>
  <small>{es?"Componente aislado, no disponible en la plataforma pública; sin conexión al proveedor ni almacenamiento.":"Isolated component, not mounted publicly; no provider connection or storage."}</small>
 </section>;
}
