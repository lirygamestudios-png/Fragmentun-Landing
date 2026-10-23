import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Informational registration safeguards: no user input is collected or submitted. */
export function LiryPlayerVerificationConsentPreview({locale}:{locale:"es"|"en"}){
 const es=locale==="es";
 return <section className={styles.recoveryPreview} aria-labelledby="liry-signup-verification-title">
  <h2 id="liry-signup-verification-title">{es?"VERIFICACIÓN Y CONSENTIMIENTOS":"VERIFICATION AND CONSENTS"}</h2>
  <p>{es?"Etapas previstas para el registro seguro. No se aceptan datos ni se envían correos.":"Planned secure registration stages. No data is collected or emails sent."}</p>
  <details className={styles.authPreviewDisclosure}><summary>{es?"Verificación del correo":"Email verification"}</summary>
   <div className={styles.recoveryFields}>
    <label>{es?"Correo electrónico":"Email address"}<input type="email" autoComplete="off" disabled placeholder={es?"Correo":"Email"}/></label>
    <button type="button" disabled>{es?"Enviar código":"Send code"}</button>
    <label>{es?"Código temporal":"Temporary code"}<input type="text" inputMode="numeric" maxLength={6} autoComplete="off" disabled placeholder="••••••"/></label>
    <button type="button" disabled>{es?"Verificar correo":"Verify email"}</button>
   </div>
  </details>
  <details className={styles.authPreviewDisclosure}><summary>{es?"Términos y permisos":"Terms and permissions"}</summary>
   <div className={styles.signupConsentPreview}>
    <label><input type="checkbox" disabled />{es?"He leído y acepto los Términos de Uso (obligatorio).":"I have read and accept the Terms of Use (required)."}</label>
    <p>{es?"La Política de Privacidad debe estar disponible para consulta antes de continuar.":"The Privacy Policy must be available to read before continuing."}</p>
    <label><input type="checkbox" disabled />{es?"Acepto comunicaciones promocionales (opcional).":"I agree to marketing communications (optional)."}</label>
    <p>{es?"Cuando corresponda, se exigirán los consentimientos parentales pertinentes.":"Where required, appropriate parental consent will be needed."}</p>
    <button type="button" disabled>{es?"Continuar registro":"Continue registration"}</button>
   </div>
  </details>
  <p role="status">{es?"Vista previa: no se registran consentimientos ni se crean cuentas.":"Preview only: no consents are recorded and no accounts are created."}</p>
 </section>;
}
