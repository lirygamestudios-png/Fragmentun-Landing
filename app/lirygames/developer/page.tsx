import Link from "next/link";
import styles from "../mi-liry/mi-liry.module.css";
import {LiryDeveloperAreas} from "../../../components/LiryDeveloperAreas";
import {liryFrontdeskStrings,getReleasedLiryFrontdeskLocale} from "../../../lib/games/liry-frontdesk-i18n";
export const metadata={title:"LIRY DEVELOPER | LIRYGAMES STUDIOS",description:"Vista preparatoria del portal de publicación supervisada.",robots:{index:false,follow:false}};
export default async function LiryDeveloperPage({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const locale=getReleasedLiryFrontdeskLocale((await searchParams).lang);
 const copy=liryFrontdeskStrings(locale).developerPage;
 return <main className={styles.page} lang={locale}>
  <header className={styles.header}><Link href={`/lirygames?lang=${locale}`} className={styles.brand} aria-label={copy.backAria}><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span></Link><Link href={`/lirygames?lang=${locale}#perfil-gamer`} className={styles.back}>← {copy.back}</Link></header>
  <section className={styles.hero} aria-labelledby="developer-title"><span className={styles.eyebrow}>{copy.eyebrow}</span><h1 id="developer-title">LIRY <em>DEVELOPER</em></h1><p>{copy.description}</p><span className={styles.state}>{copy.state}</span></section>
  <section className={styles.content} aria-label={copy.areasAria}>
  <LiryDeveloperAreas locale={locale} />
  <div className={styles.notice}><strong>{copy.noticeTitle}</strong><p>{copy.notice}</p><Link href="/lirygames">{copy.return} →</Link></div></section>
  <footer className={styles.footer}>© {new Date().getFullYear()} LIRYGAMES STUDIOS · {copy.rights}</footer>
 </main>;
}
