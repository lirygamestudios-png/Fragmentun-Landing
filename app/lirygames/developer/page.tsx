import {LirySignInOptionsPreview} from "../../../components/LirySignInOptionsPreview";
import {LiryPasswordRecoveryPreview} from "../../../components/LiryPasswordRecoveryPreview";
import Link from "next/link";
import styles from "../mi-liry/mi-liry.module.css";
import {LiryDeveloperAreas} from "../../../components/LiryDeveloperAreas";
import {liryFrontdeskStrings,getReleasedLiryFrontdeskLocale} from "../../../lib/games/liry-frontdesk-i18n";
export const metadata={title:"LIRY DEVELOPER | LIRYGAMES STUDIOS",description:"Vista preparatoria del portal de publicación supervisada.",robots:{index:false,follow:false}};
export default async function LiryDeveloperPage({searchParams}:{searchParams:Promise<{lang?:string}>}){
 const locale=getReleasedLiryFrontdeskLocale((await searchParams).lang);
 const copy=liryFrontdeskStrings(locale).developerPage;
 return <main className={styles.page} lang={locale}>
  <header className={styles.header}><Link href={`/lirygames?lang=${locale}`} className={styles.brand} aria-label={copy.backAria}><img className={styles.sigil} src="/lirygames-brand-icon.svg" width={40} height={40} alt="" aria-hidden="true" /></Link><Link href={`/lirygames?lang=${locale}#comunidad`} className={styles.back}>← {copy.back}</Link><span className={styles.signOutPreview} role="group" aria-label={locale==="es"?"Sesión no iniciada":"Not signed in"}><button type="button" disabled aria-describedby="liry-signout-notice">{locale==="es"?"Cerrar sesión":"Sign out"}</button><span id="liry-signout-notice">{locale==="es"?"Disponible al activar el acceso seguro. Todavía no has iniciado sesión.":"Available when secure sign-in is enabled. You are not signed in yet."}</span></span></header>
  <section className={styles.hero} aria-labelledby="developer-title"><span className={styles.eyebrow}>{copy.eyebrow}</span><h1 id="developer-title">LIRY <em>{locale==="es"?"DESARROLLADOR":"DEVELOPER"}</em></h1><p>{copy.description}</p><span className={styles.state}>{copy.state}</span></section>
  <section className={styles.content} aria-label={copy.areasAria}>
  <LiryDeveloperAreas locale={locale} />
  <LirySignInOptionsPreview locale={locale} role="developer" />
  <LiryPasswordRecoveryPreview locale={locale} role="developer" />
  <div className={styles.notice}><strong>{copy.noticeTitle}</strong><p>{copy.notice}</p><Link href={`/lirygames?lang=${locale}`}>{copy.return} →</Link></div></section>
  <footer className={styles.footer}>© {new Date().getFullYear()} LIRYGAMES STUDIOS · {copy.rights}</footer>
 </main>;
}
