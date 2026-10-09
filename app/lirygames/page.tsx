import Link from "next/link";
import {LiryShare} from "../../components/LiryShare";
import {LiryGameDiscovery} from "../../components/LiryGameDiscovery";
import {getLiryPublicCatalog} from "../../lib/games/public-catalog-server";
import styles from "./lirygames.module.css";

export const metadata={
  title:{absolute:"LIRYGAMES STUDIOS — 9 mundos, infinitas formas de jugar"},
  description:"Descubre los nueve videojuegos de LIRYGAMES STUDIOS, un ecosistema de experiencias y comunidades gamer. Próximamente.",
  applicationName:"LIRYGAMES STUDIOS",
  category:"Games",
  openGraph:{
    type:"website" as const,
    siteName:"LIRYGAMES STUDIOS",
    title:"LIRYGAMES STUDIOS — 9 mundos, infinitas formas de jugar",
    description:"Nueve universos de juego. Explora los próximos lanzamientos y únete a la comunidad LIRYGAMES.",
    images:[]
  },
  twitter:{
    card:"summary" as const,
    title:"LIRYGAMES STUDIOS — 9 mundos, infinitas formas de jugar",
    description:"Descubre los videojuegos y la comunidad de LIRYGAMES STUDIOS.",
    images:[]
  },
  robots:{index:false,follow:false}
};

export default async function LiryGamesFrontDesk(){
  const games=await getLiryPublicCatalog();
  return <main className={styles.page}>
    <header className={styles.nav}>
      <a className={styles.brand} href="#inicio" aria-label="LiryGames Studios"><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span><span className={styles.wordmark}><strong>LIRY</strong><span>GAMES STUDIOS</span><small>UNIVERSO DE VIDEOJUEGOS</small></span></a>
      <nav aria-label="Navegación LIRYGAMES"><a href="#inicio">Inicio</a><a href="#mundos">Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#tienda">Tienda</a></nav><div className={styles.navUtilities}><a className={styles.navSearch} href="#mundos" aria-label="Explorar los nueve videojuegos" title="Explorar videojuegos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></a><a className={styles.navNotice} href="#eventos" aria-label="Ver eventos y anuncios" title="Eventos y anuncios"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></a><a className={styles.profileAccess} href="#perfil-gamer" aria-label="Acceder al perfil gamer; inicio de sesión próximamente" title="Perfil gamer · acceso próximamente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></svg><span>VISITANTE</span></a><details className={styles.navMenu}><summary aria-label="Abrir menú de navegación"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><div className={styles.navMenuPanel}><a href="#inicio">Inicio</a><a href="#mundos">Los 9 Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#tienda">Tienda</a></div></details></div>
    </header>
    <section className={styles.hero} id="inicio">
      <div className={styles.heroUniverse} aria-hidden="true"><span className={styles.heroOrbitOne}></span><span className={styles.heroOrbitTwo}></span><span className={styles.heroPlanet}></span><span className={styles.heroSatellite}></span><span className={styles.heroStardust}></span></div>
      <div className={styles.heroContent}>
        <p className={styles.kicker}>UN ECOSISTEMA · NUEVE VIDEOJUEGOS</p>
        <h1>9 MUNDOS.<br/><span>INFINITAS FORMAS<br/> DE JUGAR.</span></h1>
        <p>No solo creamos juegos, creamos universos. En LIRYGAMES STUDIOS, cada mundo es una experiencia única. ¿Cuál será el tuyo?</p>
        <div className={styles.heroActions}><a className={styles.button} href="#mundos">EXPLORA LOS 9 MUNDOS →</a><a className={styles.heroSecondary} href="#comunidad">ÚNETE A LA COMUNIDAD →</a></div>
      </div>
      <a className={styles.heroStart} href="#mundos" aria-label="Comienza tu aventura explorando los nueve videojuegos"><span className={styles.heroPlay} aria-hidden="true">▶</span><span>TU AVENTURA<br/>COMIENZA AQUÍ</span></a>
      <div className={styles.heroJourney} aria-label="Etapas de la experiencia"><a href="#mundos">EXPLORA</a><a href="#comunidad">CONECTA</a><a href="#modelo">JUEGA</a><a href="#perfil-gamer">EVOLUCIONA</a></div>
    </section>
    <section className={styles.section} id="mundos">
      <p className={styles.kicker}>TU UNIVERSO DE JUEGO</p>
      <h2>LOS 9 MUNDOS</h2>
      <p className={styles.sectionIntro}>Cada tarjeta representa un videojuego diferente. Su lanzamiento se anunciará cuando esté realmente disponible.</p>
      <LiryGameDiscovery games={games} />
    </section>
    <section className={styles.section} id="dna-perfiles">
      <p className={styles.kicker}>TU IDENTIDAD GAMER</p><h2>DESCUBRE TU LIRY DNA</h2>
      <p className={styles.sectionIntro}>Estas seis categorías formarán parte del cuestionario cuando se conecten la cuenta gamer y las reglas administrables.</p>
      <div className={styles.dnaGrid}>{["Explorador","Estratega","Competidor","Social","Acción","Creativo"].map(name=>
        <article key={name} className={styles.dnaCard}><span className={styles.dnaDot} aria-hidden="true" /><h3>{name}</h3><p>Evaluación pendiente</p></article>)}</div>
    </section>
    <section className={styles.section} id="perfil-gamer">
      <p className={styles.kicker}>TU EXPERIENCIA LIRYGAMES</p><h2>MI PERFIL GAMER</h2>
      <div className={styles.gamerGrid}>
        <article className={styles.gamerCard}><div className={styles.avatarPlaceholder} aria-hidden="true">?</div><h3>Perfil de visitante</h3><p>Las cuentas gamer guardarán identidad, nivel, experiencia y artículos cuando esté activa su integración.</p><span className={styles.status}>PRÓXIMAMENTE</span></article>
        <article className={styles.gamerCard}><h3>TU LIRY JOURNEY</h3><p>Mundos explorados y videojuegos disponibles se calcularán con actividad real, nunca con estadísticas inventadas.</p><strong className={styles.emptyProgress}>— / 9</strong><small>No hay sesión gamer conectada</small></article>
        <article className={styles.gamerCard}><h3>LOGROS RECIENTES</h3><p>Tus recompensas aparecerán después de completar objetivos reales.</p><span className={styles.emptyProgress}>SIN DATOS</span><small>No se muestran logros ficticios</small></article>
      </div>
    </section>
    <section className={styles.feature} id="modelo">
      <p className={styles.kicker}>TU VIAJE, TUS REGLAS</p>
      <h2>ENTRA GRATIS. <span>EXPLORA SIN LÍMITES DE PAGO.</span></h2>
      <p>El primer lanzamiento de cada videojuego está concebido con tres mundos internos jugables sin costo. Los artículos, skins y personalizaciones serán compras voluntarias.</p>
      <p className={styles.honesty}>El perfil gamer, Liry DNA y Liry Journey estarán disponibles cuando se complete su integración. No mostramos progreso ficticio.</p>
    </section>
    <div className={styles.socialTrio} aria-label="Comunidad, eventos y recomendaciones">
    <section className={styles.section} id="comunidad"><p className={styles.kicker}>COMUNIDAD LIRY</p><h2>COMPARTE TU UNIVERSO</h2><p className={styles.sectionIntro}>Un punto de encuentro para los futuros jugadores. Los enlaces sociales oficiales, las opciones para compartir y LiryBoost se activarán cuando estén configurados y verificados en el Admin.</p><p className={styles.honesty}>Comparte el enlace de la página que estás visitando. Sin contadores de participación ficticios.</p><LiryShare /></section>
    <section className={styles.section} id="eventos">
      <p className={styles.kicker}>ACTUALIDAD DEL ECOSISTEMA</p><h2>EVENTOS EN VIVO</h2>
      <div className={styles.lowerGrid}>
        <article className={styles.lowerCard}><span className={styles.status}>SIN EVENTOS PROGRAMADOS</span><h3>El escenario se está preparando</h3><p>Los eventos oficiales y sus horarios se anunciarán desde el Admin. No mostramos emisiones ni torneos inexistentes.</p></article>
        <article className={styles.lowerCard}><span className={styles.status}>PRÓXIMAMENTE</span><h3>LIRYBOOST</h3><p>Un programa de comunidad y difusión que reconocerá participaciones verificadas y podrá ofrecer acceso anticipado a futuras betas.</p></article>
      </div>
    </section>
    <section className={styles.section} id="recomendaciones">
      <p className={styles.kicker}>EXPLORA SEGÚN TU ESTILO</p><h2>RECOMENDACIONES PARA TI</h2>
      <p className={styles.sectionIntro}>Cuando completes Liry DNA y exista una cuenta gamer, esta sección podrá recomendarte videojuegos del catálogo según tus preferencias reales.</p>
      <div className={styles.lowerGrid}>
        <article className={styles.lowerCard}><h3>Descubre los nueve videojuegos</h3><p>Explora las propuestas de LIRYGAMES antes de escoger dónde comenzar.</p><a className={styles.miniLink} href="#mundos">VER LOS 9 MUNDOS ↗</a></article>
        <article className={styles.lowerCard}><h3>Conoce tu estilo</h3><p>El cuestionario Liry DNA aparecerá aquí cuando se habilite su evaluación real.</p><a className={styles.miniLink} href="#liry-dna">EXPLORAR LIRY DNA ↗</a></article>
      </div>
    </section>
    </div>
    <section className={styles.feature} id="secretos">
      <p className={styles.kicker}>MÁS ALLÁ DE LO VISIBLE</p><h2>SECRETOS DE <span>LIRY</span></h2>
      <p>Los secretos, coleccionables y desafíos ocultos cobrarán vida conforme se publiquen los videojuegos. Ningún logro se considerará obtenido sin actividad verificada.</p>
    </section>
    <section className={styles.section} id="tienda"><p className={styles.kicker}>ECONOMÍA FREEMIUM</p><h2>TIENDA LIRY</h2><p className={styles.sectionIntro}>Skins, efectos y personalizaciones opcionales llegarán junto con los videojuegos. Los tres mundos internos iniciales de cada juego serán gratuitos. Por ahora no hay artículos disponibles para comprar.</p><p className={styles.honesty}><strong>PAGOS EN DEFINICIÓN:</strong> Se evalúan cuatro opciones: Stripe (principal), PayPal, 2Checkout / Verifone y criptomonedas (cuarta opción, sujeta a proveedor, cumplimiento legal, confirmaciones y conversión de moneda). Ninguna está contratada ni activa. Todavía no se procesan cobros ni se ofrecen artículos a la venta.</p></section>
    <footer className={styles.footer}><strong>LIRYGAMES STUDIOS</strong><p>Nueve videojuegos. Un universo en expansión.</p><Link href="/es">FRAGMENTUN ↗</Link></footer>
  </main>;
}
