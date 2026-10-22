"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
export function LiryDeveloperFinancePreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerFinance;
 const fields=copy.fields;
 const [stage,setStage]=useState(0);
 const heading=useRef<HTMLHeadingElement>(null);
 const move=(next:number)=>{setStage(next);requestAnimationFrame(()=>heading.current?.focus({preventScroll:true}));};
 const stages=locale==="es"?["Resumen financiero","Incorporación","Ingresos","Liquidaciones","Reportes","Asistencia"]:["Financial overview","Onboarding","Revenue","Payouts","Reports","Support"];
 return <section className={`${styles.notice} ${styles.developerFinance}`} aria-labelledby="liry-developer-finance-title">
  <h2 id="liry-developer-finance-title">{copy.title}</h2>
  <div className={styles.developerWizardCompact}><div className={styles.developerWizardTopline}><span>{locale==="es"?"PASO":"STEP"} {stage+1} / 6</span><span>{locale==="es"?"Solo vista previa":"Preview only"}</span></div><progress value={stage} max={6} aria-label={locale==="es"?"Etapas consultadas":"Viewed stages"}/></div>
  <div className={styles.developerWizardStage}><h3 ref={heading} tabIndex={-1}>{stages[stage]}</h3>
  {stage===0&&<><p>{copy.intro}</p>
  <div className={styles.developerFinanceGrid}>{fields.map(field=><article className={styles.developerFinanceCard} key={field.id}><h3>{field.label}</h3><strong>{field.value}</strong><p>{field.detail}</p></article>)}</div>
  </>}
  <div className={styles.developerFinanceNotice} role="status"><strong>{copy.inactive}</strong><p>{copy.notice}</p></div>
  {stage>0&&<section aria-label={locale==="es"?"Modelo de gestión automatizada":"Automated business model"}>
   <h3 style={{color:"#dcefff",marginBottom:12}}>{locale==="es"?"GESTIÓN AUTOMATIZADA PARA DESARROLLADORES":"AUTOMATED DEVELOPER OPERATIONS"}</h3>
   <p style={{color:"#a8cde6",lineHeight:1.7}}>{locale==="es"?"Arquitectura planificada; sin conexiones financieras, KYC ni pagos reales activos. Cada área se habilitará únicamente después de la aprobación contractual y técnica.":"Planned architecture; no live financial connections, KYC or payouts. Each area will be enabled only after contractual and technical approval."}</p>
   <div className={styles.developerFinanceGrid}>
    {[
     {es:"1 · Incorporación",en:"1 · Onboarding",esDetail:"Registro, derechos de IP, contrato y verificación KYC por proveedor autorizado.",enDetail:"Account setup, IP rights, contract and KYC through an approved provider."},
     {es:"2 · Ingresos",en:"2 · Revenue",esDetail:"Separación entre ventas internas y reportes externos autorizados; cálculo mediante reglas auditables, no IA.",enDetail:"Separate internal sales from authorized external reporting; rule-based auditable calculations, not AI."},
     {es:"3 · Liquidaciones",en:"3 · Payouts",esDetail:"Solo saldos conciliados y autorizados; transferencias gestionadas por proveedor regulado.",enDetail:"Only reconciled, eligible balances; transfers handled by a regulated provider."},
     {es:"4 · Reportes",en:"4 · Reports",esDetail:"Detalle de ventas, comisiones, reembolsos, impuestos y fecha de pago con trazabilidad.",enDetail:"Traceable sales, fees, refunds, taxes and payout dates."},
     {es:"5 · Asistencia",en:"5 · Support",esDetail:"Ayuda con estados y reglas; cualquier disputa o excepción escala a revisión humana.",enDetail:"Explain rules and payment states; disputes and exceptions escalate to human review."}
    ].filter((item,index)=>index===stage-1).map(item=><article className={styles.developerFinanceCard} key={item.en}><h3>{locale==="es"?item.es:item.en}</h3><p>{locale==="es"?item.esDetail:item.enDetail}</p><small style={{color:"#81ddf7"}}>{locale==="es"?"Pendiente de activación":"Not yet activated"}</small></article>)}
   </div>
   <p style={{marginTop:12,color:"#a8cde6"}}>{locale==="es"?"Ventas externas: una conexión de informes no autoriza a LIRYGAMES a retener o transferir fondos. Las comisiones deben estar respaldadas por un contrato aplicable.":"External sales: connecting reports does not authorize LIRYGAMES to withhold or transfer funds. Fees require an applicable agreement."}</p>
  </section>}
  </div>
  <nav className={styles.developerWizardActions} aria-label={locale==="es"?"Navegación financiera":"Finance navigation"}><button type="button" disabled={stage===0} onClick={()=>move(Math.max(0,stage-1))}>{locale==="es"?"← ANTERIOR":"← PREVIOUS"}</button><span className={styles.developerWizardStepCount}>{stage+1} / 6</span><button type="button" disabled={stage===5} onClick={()=>move(Math.min(5,stage+1))}>{locale==="es"?"PRÓXIMO →":"NEXT →"}</button></nav>
 </section>;
}
