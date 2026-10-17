import Link from "next/link";
import {VISITOR_GAMER_SNAPSHOT} from "../../../lib/games/public-gamer-snapshot";
import styles from "./mi-liry.module.css";
import {MiLiryAreas} from "../../../components/MiLiryAreas";
import {liryFrontdeskStrings,getReleasedLiryFrontdeskLocale} from "../../../lib/games/liry-frontdesk-i18n";
export const metadata={title:"MI LIRY | LIRYGAMES STUDIOS",description:"Espacio personal del jugador en preparación.",robots:{index:false,follow:false}};
export default async function MiLiryPage({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const locale=getReleasedLiryFrontdeskLocale((await searchParams).lang);
 const gamer=VISITOR_GAMER_SNAPSHOT;
 const copy=liryFrontdeskStrings(locale).miLiry;
 return <main className={styles.page} lang={locale}>
  <header className={styles.header}><Link href={`/lirygames?lang=${locale}`} className={styles.brand} aria-label={copy.backAria}><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span></Link><Link href={`/lirygames?lang=${locale}#perfil-gamer`} className={styles.back}>← {copy.back}</Link></header>
  <section className={styles.hero} aria-labelledby="mi-liry-title"><span className={styles.eyebrow}>{copy.eyebrow}</span><h1 id="mi-liry-title">MI <em>LIRY</em></h1><p>{copy.intro}</p><span className={styles.state}>{copy.visitorState}</span></section>
  <section className={styles.content} aria-label={copy.accountSummary}><div className={styles.identity}><div className={styles.avatar} aria-hidden="true">◇</div><div><span className={styles.eyebrow}>{copy.profile}</span><h2>{gamer.displayName}</h2><p>{copy.pendingIdentity}</p></div></div>
  <MiLiryAreas locale={locale} />
  <div className={styles.notice}><strong>{copy.comingSoon}</strong><p>{copy.notice}</p><Link href={`/lirygames?lang=${locale}#perfil-gamer`}>{copy.exploreProfile} →</Link></div></section>
  <footer className={styles.footer}>© {new Date().getFullYear()} LIRYGAMES STUDIOS · {copy.rights}</footer>
 </main>;
}
