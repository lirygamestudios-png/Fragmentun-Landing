"use client";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
const fields=copy.fields;
export function LiryDeveloperFinancePreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerFinance;
 return <section className={`${styles.notice} ${styles.developerFinance}`} aria-labelledby="liry-developer-finance-title">
  <h2 id="liry-developer-finance-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <div className={styles.developerFinanceGrid}>{fields.map(field=><article className={styles.developerFinanceCard} key={field.id}><h3>{field.label}</h3><strong>{field.value}</strong><p>{field.detail}</p></article>)}</div>
  <div className={styles.developerFinanceNotice} role="status"><strong>{copy.inactive}</strong><p>{copy.notice}</p></div>
 </section>;
}
