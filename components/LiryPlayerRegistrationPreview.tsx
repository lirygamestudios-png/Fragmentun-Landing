import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Non-operational registration guide: no forms submit, no identity or birth data is stored. */
export function LiryPlayerRegistrationPreview({locale}:{locale:"es"|"en"}){
 const es=locale==="es";
 const steps=es?[
  ["1","Declaración de edad","Determinar protecciones apropiadas antes de solicitar datos personales."],
  ["2","Método de registro","Elegir correo y contraseña o un proveedor autorizado."],
  ["3","Verificación de correo","Confirmar la dirección mediante un mecanismo temporal protegido."],
  ["4","Consentimientos","Revisar términos, privacidad y autorizaciones correspondientes a la edad."],
  ["5","Crear Liry ID","Solo tras controles de seguridad y autorización administrativa."],
  ["6","Acceder al perfil","Entrar al área del Jugador con permisos apropiados."]
 ]:[
  ["1","Age declaration","Determine safeguards before requesting personal information."],
  ["2","Registration method","Choose email and password or an authorized identity provider."],
  ["3","Email verification","Confirm address through a protected temporary mechanism."],
  ["4","Consents","Review terms, privacy and age-appropriate permissions."],
  ["5","Create Liry ID","Only after security checks and administrative authorization."],
  ["6","Open player profile","Access the player area with appropriate permissions."]
 ];
 return <section className={styles.recoveryPreview} aria-labelledby="liry-registration-title">
  <h2 id="liry-registration-title">{es?"REGISTRO LIRY ID":"LIRY ID REGISTRATION"}</h2>
  <p>{es?"Recorrido previsto para crear una cuenta. Ningún paso está habilitado todavía.":"Planned account registration flow. No step is enabled yet."}</p>
  <details className={styles.authPreviewDisclosure}>
   <summary>{es?"Ver las seis etapas del registro":"View six registration steps"}</summary>
   <ol className={styles.registrationPreviewSteps}>{steps.map(([number,title,description])=><li key={number}><strong>{title}</strong><span>{description}</span></li>)}</ol>
  </details>
  <p role="status">{es?"Vista preliminar: no se crean cuentas ni se recopilan datos.":"Preview only: no accounts are created and no data is collected."}</p>
 </section>;
}
