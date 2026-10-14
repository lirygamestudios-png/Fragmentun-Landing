"use client";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
const fields=[
 {label:"VENTAS CONFIRMADAS",value:"Sin datos conectados",detail:"Solo transacciones verificadas del videojuego."},
 {label:"REEMBOLSOS Y AJUSTES",value:"Sin datos conectados",detail:"Devoluciones, contracargos y ajustes documentados."},
 {label:"COMISIÓN LIRYGAMES",value:"Pendiente de contrato",detail:"Tasa aplicable y base neta definidas en contrato."},
 {label:"SALDO LIQUIDABLE",value:"Sin saldo verificado",detail:"Disponible únicamente tras conciliación y controles de pago."}
] as const;
export function LiryDeveloperFinancePreview(){
 return <section className={`${styles.notice} ${styles.developerFinance}`} aria-labelledby="liry-developer-finance-title">
  <h2 id="liry-developer-finance-title">VENTAS Y LIQUIDACIONES · VISTA PREPARATORIA</h2>
  <p>El desarrollador consultará exclusivamente los ingresos de sus propios juegos. Los importes aparecerán cuando existan ventas reales verificadas.</p>
  <div className={styles.developerFinanceGrid}>{fields.map(field=><article className={styles.developerFinanceCard} key={field.label}><h3>{field.label}</h3><strong>{field.value}</strong><p>{field.detail}</p></article>)}</div>
  <div className={styles.developerFinanceNotice} role="status"><strong>LIQUIDACIONES INACTIVAS</strong><p>No existen transacciones ni saldos asociados a esta demostración. Ningún importe, comisión o pago puede solicitarse desde esta pantalla.</p></div>
 </section>;
}
