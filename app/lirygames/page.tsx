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
    <section className={`${styles.section} ${styles.gamerSection}`} id="perfil-gamer" aria-label="Perfil gamer, recorrido y logros">
      <div className={styles.gamerGrid}>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">♙</span><h3>MI PERFIL GAMER</h3></header>
          <div className={styles.gamerIdentity}>
            <div className={styles.gamerPortrait} aria-hidden="true"><span>?</span></div>
            <div className={styles.gamerIdentityText}><strong>Visitante</strong><span>Nivel —</span><div className={styles.gamerXpTrack} aria-label="Experiencia aún no disponible"><span /></div><small>XP pendiente de conexión</small></div>
          </div>
          <p className={styles.gamerMicroLabel}>Tu estilo de juego</p>
          <div className={styles.gamerStyles}><span>⚔ <b>Explorador</b></span><span>♜ <b>Estratega</b></span><span>✧ <b>Social</b></span></div>
          <div className={styles.gamerMetrics}><div><small>Juegos jugados</small><strong>—</strong></div><div><small>Logros</small><strong>—</strong></div><div><small>Horas de juego</small><strong>—</strong></div></div>
          <a className={styles.gamerCardAction} href="#perfil-gamer" aria-label="Perfil gamer próximamente">VER MI PERFIL <span aria-hidden="true">→</span></a>
          <small className={styles.gamerDataNote}>Vista preliminar · sin sesión gamer</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">⬡</span><div><h3>TU LIRY JOURNEY</h3><p>Esta es tu historia en Liry. Sigue explorando.</p></div></header>
          <div className={styles.journeyContent}>
            <div className={styles.journeyRing}><div className={styles.journeyRingCenter}><strong>— / 9</strong><span>Mundos descubiertos</span></div></div>
            <ol className={styles.journeyWorlds}>{games.map((game,index)=><li key={game.slug}><span className={styles.journeyNumber}>{index+1}</span><span className={styles.journeyName}>{game.title}</span><span className={styles.journeyPending} aria-label="Sin avance registrado">○</span></li>)}</ol>
          </div>
          <a className={styles.gamerCardAction} href="#mundos">VER TODOS LOS MUNDOS <span aria-hidden="true">→</span></a>
          <small className={styles.gamerDataNote}>El progreso aparecerá con actividad verificada.</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">✣</span><h3>LOGROS RECIENTES</h3><span className={styles.gamerTopRight}>Ver todos →</span></header>
          <div className={styles.achievementList}>
            {[
              {icon:"✧",title:"Primeros pasos",detail:"Completa tu primer juego"},
              {icon:"⬡",title:"Explorador de mundos",detail:"Descubre cinco mundos"},
              {icon:"✦",title:"La comunidad te necesita",detail:"Juega con tres amigos"},
              {icon:"♜",title:"Maestro de estrategias",detail:"Gana diez partidas estratégicas"}
            ].map(item=><div className={styles.achievementRow} key={item.title}><span className={styles.achievementMedal} aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><span>{item.detail}</span><small>Pendiente de obtener</small></div></div>)}
          </div>
          <small className={styles.gamerDataNote}>Los logros y recompensas reales aparecerán aquí.</small>
        </article>
      </div>
    </section>
    <section className={styles.feature} id="modelo">
      <p className={styles.kicker}>TU VIAJE, TUS REGLAS</p>
      <h2>ENTRA GRATIS. <span>EXPLORA SIN LÍMITES DE PAGO.</span></h2>
      <p>El primer lanzamiento de cada videojuego está concebido con tres mundos internos jugables sin costo. Los artículos, skins y personalizaciones serán compras voluntarias.</p>
      <p className={styles.honesty}>El perfil gamer, Liry DNA y Liry Journey estarán disponibles cuando se complete su integración. No mostramos progreso ficticio.</p>
    </section>
    <div className={styles.socialTrio} aria-label="Comunidad, eventos y recomendaciones">
      <section className={styles.section} id="comunidad">
        <h2>COMUNIDAD LIRY</h2><p className={styles.socialIntro}>Conecta, comparte, juega.</p>
        <div className={styles.communityTabs} aria-label="Categorías de comunidad"><span className={styles.communityTabActive}>TODOS</span><span>AMIGOS</span><span>LOGROS</span><span>EVENTOS</span></div>
        <div className={styles.communityFeed}>
          <div className={styles.communityEmpty}><span className={styles.communityEmptyIcon} aria-hidden="true">◉</span><strong>La comunidad está por despertar</strong><p>Las publicaciones, mensajes y actividades aparecerán cuando el servicio comunitario esté disponible. Sin conversaciones ficticias.</p></div>
          <div className={styles.communityPost}><span className={styles.communityAvatar} aria-hidden="true">L</span><div><strong>Tu comunidad Liry</strong><p>Comparte la página e invita a otros jugadores a descubrir los nueve mundos.</p><small>Comunidad en preparación</small></div></div>
        </div>
        <div className={styles.communityCompose}><span>Publicaciones disponibles próximamente</span><span aria-hidden="true">➤</span></div>
        <LiryShare />
      </section>
      <section className={styles.section} id="eventos">
        <h2>EVENTOS EN VIVO</h2><p className={styles.socialIntro}>No te lo pierdas.</p>
        <div className={styles.eventMain}><div className={styles.eventLight} aria-hidden="true">⚡</div><div className={styles.eventMainContent}><span>PRÓXIMO EVENTO · POR ANUNCIAR</span><h3>SKILL ARENA</h3><strong>TORNEO GLOBAL</strong><p>Fecha, horario e inscripciones pendientes de confirmación oficial.</p><span className={styles.eventOutline}>INSCRIPCIONES PRÓXIMAMENTE</span></div></div>
        <div className={styles.eventMiniGrid}>
          <article className={styles.eventMini}><span className={styles.eventMiniIcon} aria-hidden="true">✦</span><div><strong>Evento especial</strong><p>Gaias Last Stand</p><small>Fecha por anunciar</small></div><span className={styles.eventMiniLink}>Próximamente</span></article>
          <article className={styles.eventMini}><span className={styles.eventMiniIcon} aria-hidden="true">♜</span><div><strong>Recompensas exclusivas</strong><p>Nexo Social</p><small>Detalles pendientes</small></div><span className={styles.eventMiniLink}>Próximamente</span></article>
        </div>
      </section>
      <section className={styles.section} id="recomendaciones">
        <h2>RECOMENDACIONES PARA TI</h2><p className={styles.socialIntro}>Basado en tu Liry DNA.</p>
        <div className={styles.recommendList}>
          {[{title:"Nexo Social",reason:"Conecta con otros jugadores",index:4},{title:"Gaias Last Stand",reason:"Explora un mundo de supervivencia",index:3},{title:"Eternun",reason:"Descubre un universo de fantasía",index:5}].map(game=><article className={styles.recommendItem} key={game.title}><div className={`${styles.recommendThumb} ${styles[`recommendThumb${game.index}`]} `} aria-hidden="true"><span>✧</span></div><div className={styles.recommendText}><strong>{game.title}</strong><p>{game.reason}</p><small>Selección editorial · personalización pendiente</small></div><a href="#mundos">Ver juego →</a></article>)}
        </div>
        <a className={styles.recommendAll} href="#mundos">VER TODOS LOS MUNDOS <span aria-hidden="true">→</span></a>
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
