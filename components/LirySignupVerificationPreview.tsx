import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Visual-only signup readiness: fields cannot collect or submit real information. */
export function LirySignupVerificationPreview({locale}:{locale:"es"|"en"}){
 const es=locale==="es";
 return <section className={styles.recoveryPreview} aria-labelledby="liry-signup-verification-title">
  <h2 id="liry-signup-verification-title">{es?"VERIFICACIÓN Y CONSENTIMIENTOS":"VERIFICATION AND CONSENTS"}</h2>
  <p>{es?"Etapas previstas antes de activar una cuenta de jugador. Esta demostración no solicita información.":"Planned steps before activating a player account. This preview does not request information."}</p>
  <details className={styles.authPreviewDisclosure}>
   <summary>{es?"Ver verificación de correo y términos":"View email verification and terms"}</summary>
   <div className={styles.recoveryFields}>
    <label>{es?"Correo electrónico":"Email address"}<input type="email" disabled autoComplete="off" placeholder={es?"Correo verificado":"Verified email"}/></label>
    <button type="button" disabled>{es?"Enviar código":"Send code"}</button>
    <label>{es?"Código de verificación":"Verification code"}<input type="text" disabled inputMode="numeric" maxLength={6} placeholder="••••••" /></label>
    <button type="button" disabled>{es?"Verificar correo":"Verify email"}</button>
   </div>
   <div className={styles.signupConsentPreview}>
    <label><input type="checkbox" disabled />{es?"He leído y acepto los Términos de uso (obligatorio)":"I have read and accept the Terms of Use (required)"}</label>
    <label><input type="checkbox" disabled />{es?"Confirmo haber revisado la Política de privacidad (obligatorio)":"I confirm I have reviewed the Privacy Policy (required)"}</label>
    <label><input type="checkbox" disabled />{es?"Deseo recibir novedades por correo (opcional)":"I want to receive email updates (optional)"}</label>
   </div>
   <p>{es?"Los permisos parentales y las protecciones por edad se evaluarán antes de permitir cuentas de menores.":"Parental permissions and age safeguards will be assessed before allowing minors' accounts."}</p>
   <button className={styles.ageGateContinue} type="button" disabled>{es?"Completar registro":"Complete registration"}</button>
  </details>
  <p role="status">{es?"Vista preliminar: no se envían correos, no se guardan aceptaciones ni se crean cuentas.":"Preview only: no emails are sent, no consents are stored and no accounts are created."}</p>
 </section>;
}
