import Link from "next/link";
import {plannedLiryGames} from "../../lib/games/public-catalog";
import styles from "./lirygames.module.css";

export const metadata={title:"LIRYGAMES STUDIOS | 9 Worlds"};

export default function LiryGamesFrontDesk(){
  return <main className={styles.page}>
    <header className={styles.nav}>
      <a className={styles.brand} href="#inicio" aria-label="LiryGames Studios">LIRY<span>GAMES</span><small>STUDIOS</small></a>
      <nav aria-label="Navegación LIRYGAMES"><a href="#mundos">Mundos</a><a href="#modelo">Tu viaje</a><a href="#comunidad">Comunidad</a></nav>
    </header>
    <section className={styles.hero} id="inicio">
      <div className={styles.orb} aria-hidden="true" />
      <div className={styles.heroContent}>
        <p className={styles.kicker}>UN ECOSISTEMA · NUEVE VIDEOJUEGOS</p>
        <h1>9 WORLDS.<br/><span>INFINITE WAYS TO PLAY.</span></h1>
        <p>Descubre el universo LIRYGAMES. Los videojuegos llegarán progresivamente, cada uno con tres mundos internos gratuitos y compras opcionales.</p>
        <a className={styles.button} href="#mundos">EXPLORA LOS MUNDOS ↗</a>
      </div>
    </section>
    <section className={styles.section} id="mundos">
      <p className={styles.kicker}>TU UNIVERSO DE JUEGO</p>
      <h2>LOS 9 MUNDOS</h2>
      <p className={styles.sectionIntro}>Cada tarjeta representa un videojuego diferente. Su lanzamiento se anunciará cuando esté realmente disponible.</p>
      <div className={styles.grid}>{plannedLiryGames.map((game,index)=>
        <article className={styles.gameCard} key={game.slug}>
          <span className={styles.number}>{String(index+1).padStart(2,"0")}</span>
          <div className={styles.cardContent}><span className={styles.status}>PRÓXIMAMENTE</span><h3>{game.title}</h3><p>{game.tagline}</p>
          <small>3 mundos internos gratuitos previstos</small></div>
        </article>)}</div>
    </section>
    <section className={styles.feature} id="modelo">
      <p className={styles.kicker}>TU VIAJE, TUS REGLAS</p>
      <h2>ENTRA GRATIS. <span>EXPLORA SIN LÍMITES DE PAGO.</span></h2>
      <p>El primer lanzamiento de cada videojuego está concebido con tres mundos internos jugables sin costo. Los artículos, skins y personalizaciones serán compras voluntarias.</p>
      <p className={styles.honesty}>El perfil gamer, Liry DNA y Liry Journey estarán disponibles cuando se complete su integración. No mostramos progreso ficticio.</p>
    </section>
    <section className={styles.section} id="comunidad"><p className={styles.kicker}>COMUNIDAD LIRY</p><h2>EL UNIVERSO CRECE CONTIGO</h2><p className={styles.sectionIntro}>Próximamente: canales oficiales, novedades, contenido compartible y LiryBoost.</p></section>
    <footer className={styles.footer}><strong>LIRYGAMES STUDIOS</strong><p>Nueve videojuegos. Un universo en expansión.</p><Link href="/es">FRAGMENTUN ↗</Link></footer>
  </main>;
}
