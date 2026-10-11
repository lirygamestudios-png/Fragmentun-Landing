import Link from "next/link";
import {VISITOR_GAMER_SNAPSHOT} from "../../../lib/games/public-gamer-snapshot";
import styles from "./mi-liry.module.css";
import {MiLiryAreas} from "../../../components/MiLiryAreas";
export const metadata={title:"MI LIRY | LIRYGAMES STUDIOS",description:"Espacio personal del jugador en preparación.",robots:{index:false,follow:false}};
export default function MiLiryPage(){
 const gamer=VISITOR_GAMER_SNAPSHOT;
 return <main className={styles.page}>
  <header className={styles.header}><Link href="/lirygames" className={styles.brand} aria-label="Volver al FrontDesk de LIRYGAMES STUDIOS"><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span></Link><Link href="/lirygames#perfil-gamer" className={styles.back}>← VOLVER AL FRONTDESK</Link></header>
  <section className={styles.hero} aria-labelledby="mi-liry-title"><span className={styles.eyebrow}>LIRYGAMES STUDIOS · ESPACIO DEL JUGADOR</span><h1 id="mi-liry-title">MI <em>LIRY</em></h1><p>Tu universo personal de juego, comunidad y recompensas.</p><span className={styles.state}>ESTADO VISITANTE · SIN SESIÓN ACTIVA</span></section>
  <section className={styles.content} aria-label="Resumen de cuenta gamer"><div className={styles.identity}><div className={styles.avatar} aria-hidden="true">◇</div><div><span className={styles.eyebrow}>PERFIL GAMER</span><h2>{gamer.displayName}</h2><p>La identidad y el progreso se mostrarán cuando estén disponibles y verificados.</p></div></div>
  <MiLiryAreas />
  <div className={styles.notice}><strong>PRÓXIMAMENTE</strong><p>Este espacio es una vista preparatoria. No se han creado cuentas, partidas, logros, compras ni recompensas ficticias. La autenticación y los datos privados se integrarán únicamente con autorización y pruebas de seguridad.</p><Link href="/lirygames#perfil-gamer">EXPLORAR PERFIL GAMER →</Link></div></section>
  <footer className={styles.footer}>© {new Date().getFullYear()} LIRYGAMES STUDIOS · Todos los derechos reservados.</footer>
 </main>;
}
