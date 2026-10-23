import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Informational recovery preview only: never collects credentials or sends codes. */
export function LiryPasswordRecoveryPreview({locale,role}:{locale:"es"|"en";role:"player"|"developer"}){
 const es=locale==="es";
 const title=es?"RECUPERAR CONTRASEÑA":"RECOVER PASSWORD";
 const roleLabel=role==="player"?(es?"Jugador":"Player"):(es?"Desarrollador":"Developer");
 return <section className={styles.recoveryPreview} aria-labelledby={`liry-recovery-${role}-title`}>
  <h2 id={`liry-recovery-${role}-title`}>{title}</h2>
  <p>{es?`Recuperación segura para ${roleLabel}. Disponible cuando se activen las cuentas verificadas.`:`Secure recovery for ${roleLabel}. Available when verified accounts are enabled.`}</p>
  <div className={styles.recoveryFields}>
   <label>{es?"Correo verificado":"Verified email"}<input type="email" autoComplete="off" placeholder={es?"Correo electrónico":"Email address"} disabled /></label>
   <button type="button" disabled>{es?"Enviar código de 6 dígitos":"Send 6-digit code"}</button>
   <label>{es?"Código de recuperación":"Recovery code"}<input type="text" inputMode="numeric" maxLength={6} placeholder="••••••" disabled /></label>
   <button type="button" disabled>{es?"Verificar código":"Verify code"}</button>
   <label>{es?"Nueva contraseña":"New password"}<input type="password" autoComplete="new-password" disabled /></label>
   <button type="button" disabled>{es?"Cambiar contraseña":"Change password"}</button>
  </div>
  <p role="status">{es?"Vista informativa: no se envían códigos, no se registran correos ni se cambian contraseñas.":"Information preview: no codes are sent, no emails are collected and no passwords are changed."}</p>
 </section>;
}
