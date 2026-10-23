import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Preparatory identity-provider choices only. No OAuth requests, email collection, or session creation. */
export function LirySignInOptionsPreview({locale,role}:{locale:"es"|"en";role:"player"|"developer"}){
 const es=locale==="es";
 const roleName=role==="player"?(es?"Jugador":"Player"):(es?"Desarrollador":"Developer");
 const title=es?"INICIAR SESIÓN":"SIGN IN";
 const choices=[
  {id:"email",es:"Continuar con correo y contraseña",en:"Continue with email and password"},
  {id:"google",es:"Continuar con Google",en:"Continue with Google"},
  {id:"microsoft",es:"Continuar con Microsoft",en:"Continue with Microsoft"},
  {id:"apple",es:"Continuar con Apple",en:"Continue with Apple"},
  {id:"magic",es:"Recibir enlace de acceso por correo",en:"Get an email sign-in link"}
 ] as const;
 return <section className={styles.recoveryPreview} aria-labelledby={`liry-signin-${role}-title`}>
  <h2 id={`liry-signin-${role}-title`}>{title} · {roleName}</h2>
  <p>{es?"Elige cómo acceder cuando las cuentas verificadas estén disponibles. Tener abierto el correo no concede acceso automático.":"Choose how to sign in when verified accounts become available. Being signed in to email does not grant automatic access."}</p>
  <details className={styles.authPreviewDisclosure}><summary>{es?"Ver modalidades de acceso":"View sign-in methods"}</summary><div className={styles.signInOptionsPreview}>
   {choices.map(choice=><button type="button" key={choice.id} disabled>{es?choice.es:choice.en}</button>)}
  </div></details>
  <p role="status">{es?"Vista preliminar: ninguna opción está activa, no se solicitan credenciales ni se crean sesiones.":"Preview only: all options are inactive, no credentials are collected and no sessions are created."}</p>
 </section>;
}
