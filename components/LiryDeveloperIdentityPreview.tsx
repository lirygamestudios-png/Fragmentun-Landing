"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import type {LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

/** Informational only: no document uploads, camera access, provider calls or biometrics. */
export function LiryDeveloperIdentityPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const [details,setDetails]=useState(false);
 const es=locale==="es";
 const stages=es?[
  ["1. Documento oficial","Proveedor especializado valida autenticidad y vigencia del documento."],
  ["2. Rostro y prueba de vida","El proveedor compara el rostro con la identificación y detecta intentos de suplantación."],
  ["3. Revisión de identidad","Un resultado pendiente o inconcluso puede requerir revisión humana o un método alternativo."],
  ["4. Documentación bancaria para pagos","Copia del estado de cuenta bancario más reciente de la cuenta destinada a recibir pagos. Se comprobará titularidad y coincidencia con el beneficiario; la verificación bancaria es independiente de la biometría."],
  ["5. Admisión LIRYGAMES","Verificar identidad no acredita derechos de autor, titularidad bancaria ni aprobación para publicar."]
 ]:[
  ["1. Government ID","A specialized provider checks the ID's authenticity and validity."],
  ["2. Face and liveness","The provider compares the face with the ID and detects impersonation attempts."],
  ["3. Identity review","Pending or inconclusive results may require a human review or alternative method."],
  ["4. Banking documentation for payouts","Copy of the most recent bank statement for the account designated to receive payouts. Beneficiary ownership and matching will be checked separately from biometrics."],
  ["5. LIRYGAMES admission","Identity verification does not establish IP rights, bank ownership, or publishing approval."]
 ];
 return <section className={styles.notice} aria-labelledby="liry-developer-identity-preview-title">
  <h3 id="liry-developer-identity-preview-title">{es?"Verificación de identidad del desarrollador":"Developer identity verification"}</h3>
  <p role="status" aria-live="polite"><strong>{es?"No disponible todavía · Solo presentación informativa":"Not available yet · Informational preview only"}</strong></p>
  <p>{es?"La futura validación utilizará un proveedor especializado para verificar documento y rostro con consentimiento previo. LIRYGAMES no recibirá imágenes biométricas desde esta pantalla.":"Future verification will use a specialized provider for ID and face verification with prior consent. LIRYGAMES does not receive biometric images from this screen."}</p>
  <button type="button" className={styles.previewReset} aria-expanded={details} aria-controls="liry-developer-identity-stages" onClick={()=>setDetails(value=>!value)}>{details?(es?"Ocultar proceso":"Hide process"):(es?"Conocer el proceso previsto":"View planned process")}</button>
  {details&&<div id="liry-developer-identity-stages">
   <ol style={{paddingLeft:22,lineHeight:1.7}}>{stages.map(([heading,description])=><li key={heading}><strong>{heading}</strong><p>{description}</p></li>)}</ol>
   <p role="note">{es?"Antes de activar este proceso deberán definirse proveedor, consentimiento, retención y eliminación de datos, requisitos legales por jurisdicción y alternativas accesibles. No introduzcas documentos ni información sensible en esta vista. En la fase real, la documentación bancaria deberá enviarse únicamente por un canal seguro y con acceso limitado.":"Before activation, the provider, consent, retention and deletion, jurisdictional legal requirements, and accessible alternatives must be defined. Do not enter documents or sensitive information in this preview. During the real process, bank documents must be provided only through a secure, access-restricted channel."}</p>
  </div>}
 </section>;
}
