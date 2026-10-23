import styles from "../app/lirygames/mi-liry/mi-liry.module.css";

/** Registration readiness only: no date of birth is collected or stored. */
export function LiryPlayerAgeGatePreview({locale}:{locale:"es"|"en"}){
 const es=locale==="es";
 return <section className={styles.recoveryPreview} aria-labelledby="liry-player-age-title">
  <h2 id="liry-player-age-title">{es?"REGISTRO DEL JUGADOR · EDAD":"PLAYER REGISTRATION · AGE"}</h2>
  <p>{es?"Antes de crear una cuenta se solicitará la fecha de nacimiento para aplicar las protecciones apropiadas. El registro permanece deshabilitado.":"Before creating an account, date of birth will be requested to apply age-appropriate protections. Registration remains disabled."}</p>
  <details className={styles.authPreviewDisclosure}><summary>{es?"Ver declaración de edad prevista":"View planned age declaration"}</summary>
   <div className={styles.ageGateFields}>
    <label>{es?"Día":"Day"}<input disabled inputMode="numeric" placeholder={es?"DD":"DD"} aria-label={es?"Día de nacimiento":"Birth day"}/></label>
    <label>{es?"Mes":"Month"}<input disabled inputMode="numeric" placeholder={es?"MM":"MM"} aria-label={es?"Mes de nacimiento":"Birth month"}/></label>
    <label>{es?"Año":"Year"}<input disabled inputMode="numeric" placeholder={es?"AAAA":"YYYY"} aria-label={es?"Año de nacimiento":"Birth year"}/></label>
   </div>
   <p>{es?"La declaración no verifica por sí sola la edad. Los menores requerirán medidas y permisos adecuados antes de activar sus cuentas.":"Self-declared age is not age verification. Minors will require appropriate safeguards and permissions before account activation."}</p>
   <button className={styles.ageGateContinue} type="button" disabled>{es?"Continuar registro":"Continue registration"}</button>
  </details>
  <p role="status">{es?"Vista preliminar: no recogemos ni almacenamos fechas de nacimiento.":"Preview only: no dates of birth are collected or stored."}</p>
 </section>;
}
