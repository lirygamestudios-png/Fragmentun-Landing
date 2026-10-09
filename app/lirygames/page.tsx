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
      <nav aria-label="Navegación LIRYGAMES"><a href="#inicio">Inicio</a><a href="#mundos">Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#tienda">Tienda</a></nav><div className={styles.navUtilities}><a className={styles.navSearch} href="#mundos" aria-label="Explorar los nueve videojuegos" title="Explorar videojuegos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></a><a className={styles.navNotice} href="#social" aria-label="Ver la sección social" title="Redes sociales y compartir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></a><a className={styles.profileAccess} href="#perfil-gamer" aria-label="Acceder al perfil gamer; inicio de sesión próximamente" title="Perfil gamer · acceso próximamente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></svg><span>VISITANTE</span></a><details className={styles.navMenu}><summary aria-label="Abrir menú de navegación"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><div className={styles.navMenuPanel}><a href="#inicio">Inicio</a><a href="#mundos">Los 9 Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#tienda">Tienda</a></div></details></div>
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
    <div className={styles.socialTrio} aria-label="Comunidad, eventos y recomendaciones">
      <section className={styles.section} id="comunidad">
        <h2>COMUNIDAD LIRY</h2><p className={styles.socialIntro}>Conecta, comparte, juega.</p>
        <div className={styles.communityTabs} aria-label="Categorías de comunidad"><span className={styles.communityTabActive}>TODOS</span><span>AMIGOS</span><span>LOGROS</span><span>EVENTOS</span></div>
        <div className={styles.communityFeed}>
          <div className={styles.communityEmpty}><span className={styles.communityEmptyIcon} aria-hidden="true">◉</span><strong>La comunidad está por despertar</strong><p>Las publicaciones, mensajes y actividades aparecerán cuando el servicio comunitario esté disponible. Sin conversaciones ficticias.</p></div>
          <div className={styles.communityPost}><span className={styles.communityAvatar} aria-hidden="true">L</span><div><strong>Tu comunidad Liry</strong><p>Comparte la página e invita a otros jugadores a descubrir los nueve mundos.</p><small>Comunidad en preparación</small></div></div>
        </div>
        <div className={styles.communityCompose}><span>Publicaciones disponibles próximamente</span><span aria-hidden="true">➤</span></div>
      </section>
      <section className={styles.section} id="social">
        <h2>SECCIÓN SOCIAL</h2>
        <p className={styles.socialIntro}>Conecta con LIRYGAMES y comparte nuestro universo.</p>
        <div className={styles.socialFeature}>
          <span className={styles.socialFeatureIcon} aria-hidden="true">✦</span>
          <strong>COMPARTE LIRYGAMES</strong>
          <p>Invita a tus amigos a conocer los nueve mundos y forma parte de nuestra comunidad desde el inicio.</p>
        </div>
        <p className={styles.socialChannelsTitle}>COMPARTE EN TUS REDES</p>
        <LiryShare />
        <div className={styles.socialChannels}>
          <strong>SÍGUENOS EN REDES SOCIALES</strong>
          <p>Los perfiles oficiales aparecerán aquí cuando sus enlaces estén verificados en el Admin.</p>
          <div className={styles.socialNetworkLabels} aria-label="Redes sociales oficiales pendientes de conexión">
            <span title="Instagram · perfil pendiente" aria-label="Instagram, próximamente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.7" r="1" fill="currentColor" stroke="none"/></svg></span>
            <span title="TikTok · perfil pendiente" aria-label="TikTok, próximamente"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.5 2c.3 2.5 1.7 4.1 4.5 4.3v3.5a10 10 0 0 1-4.5-1.3v7.2c0 4.2-3 6.7-6.6 6.3-3.8-.4-5.8-4.1-4.4-7.5 1.1-2.7 3.5-4 6.7-3.7v3.6c-2-.4-3.3.8-3.3 2.3 0 1.5 1.3 2.4 2.7 2.1 1.1-.2 1.5-1.1 1.5-2.5V2h4.4Z"/></svg></span>
            <span title="YouTube · canal pendiente" aria-label="YouTube, próximamente"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M22 7.3c-.25-1.1-.95-1.8-2.1-2C18.1 5 12 5 12 5s-6.1 0-7.9.3C2.95 5.5 2.25 6.2 2 7.3 1.7 9 1.7 12s0 3 .3 4.7c.25 1.1.95 1.8 2.1 2C5.9 19 12 19 12 19s6.1 0 7.9-.3c1.15-.2 1.85-.9 2.1-2 .3-1.7.3-4.7.3-4.7s0-3-.3-4.7ZM10 15.7V8.3l6.2 3.7Z"/></svg></span>
            <span title="Facebook · perfil pendiente" aria-label="Facebook, próximamente"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M14.2 22v-8.8h3L17.7 9h-3.5V6.3c0-1.2.4-2 2-2H18V.5C17.7.2 16.4 0 15 0c-3.4 0-5.7 2.1-5.7 5.9V9H6v4.2h3.3V22h4.9Z"/></svg></span>
          </div>
        </div>
        <small className={styles.socialPending}>Solo se habilitan enlaces oficiales confirmados; compartir la página ya está disponible.</small>
      </section>
            <section className={styles.section} id="recomendaciones">
        <h2>RECOMENDACIONES PARA TI</h2><p className={styles.socialIntro}>Basado en tu Liry DNA.</p>
        <div className={styles.recommendList}>
          {[{title:"Nexo Social",reason:"Conecta con otros jugadores",index:4},{title:"Gaias Last Stand",reason:"Explora un mundo de supervivencia",index:3},{title:"Eternun",reason:"Descubre un universo de fantasía",index:5}].map(game=><article className={styles.recommendItem} key={game.title}><div className={`${styles.recommendThumb} ${styles[`recommendThumb${game.index}`]} `} aria-hidden="true"><span>✧</span></div><div className={styles.recommendText}><strong>{game.title}</strong><p>{game.reason}</p><small>Selección editorial · personalización pendiente</small></div><a href="#mundos">Ver juego →</a></article>)}
        </div>
        <a className={styles.recommendAll} href="#mundos">VER TODOS LOS MUNDOS <span aria-hidden="true">→</span></a>
      </section>
    </div>
    <section className={styles.storeShowcase} id="tienda" aria-labelledby="liry-store-title">
      <div className={styles.storeIntro}>
        <p className={styles.storeEyebrow}>ECOSISTEMA LIRYGAMES</p>
        <h2 id="liry-store-title"><span aria-hidden="true">▢</span> TIENDA <em>LIRY</em></h2>
        <p>Lleva el universo LIRY contigo.</p>
        <small>Explora nuestras futuras colecciones. Los productos y los pagos se habilitarán únicamente cuando existan artículos y proveedores confirmados.</small>
        <span className={styles.storeComingSoon}>CATÁLOGO PRÓXIMAMENTE</span>
      </div>
      <div className={styles.storeCategories} aria-label="Categorías previstas para Tienda Liry">
        {[
          {name:"ROPA",symbol:"♧",tone:"wear"},
          {name:"ACCESORIOS",symbol:"◆",tone:"accessories"},
          {name:"COLECCIONABLES",symbol:"✧",tone:"collectibles"},
          {name:"ARTE DIGITAL",symbol:"▧",tone:"art"},
          {name:"GAMING GEAR",symbol:"⌘",tone:"gear"}
        ].map(item=><div className={styles.storeCategory} key={item.name}><div className={`${styles.storeCategoryVisual} ${styles[`storeTone_${item.tone}`]} `} aria-hidden="true">{item.symbol}</div><strong>{item.name}</strong><span className={styles.storeCategoryLine}/></div>)}
      </div>
      <p className={styles.storeLegal}>Modelo freemium: los tres mundos internos iniciales previstos para cada videojuego serán gratuitos; las compras cosméticas serán opcionales. No hay pagos activos ni artículos disponibles actualmente.</p>
    </section>
    <div className={styles.finalDiscover} aria-label="Tu viaje y secretos de Liry">
      <section className={styles.journeyBanner} id="modelo">
        <div className={styles.journeyBannerArt} aria-hidden="true"><span className={styles.bannerOrbit}></span><span className={styles.bannerTraveler}>✧</span></div>
        <div className={styles.journeyBannerContent}>
          <h2>TU VIAJE, TUS REGLAS</h2>
          <p>Explora. Juega. Conecta. Vive la experiencia Liry.</p>
          <a href="#mundos" className={styles.bannerCta}>CONOCE MÁS SOBRE LIRY <span aria-hidden="true">→</span></a>
          <small>Tres mundos internos gratuitos previstos en cada primer lanzamiento; cosméticos opcionales.</small>
        </div>
      </section>
      <section className={styles.secretsBanner} id="secretos">
        <div className={styles.secretsHdArt} role="img" aria-label="Ilustración vectorial de alta definición de un portal de cristal violeta en el universo Liry">
          <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="secretsSky" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#090e28"/><stop offset=".48" stopColor="#38136e"/><stop offset="1" stopColor="#07071c"/></linearGradient>
              <radialGradient id="secretsAura"><stop stopColor="#f39dff" stopOpacity=".92"/><stop offset=".42" stopColor="#9637e8" stopOpacity=".5"/><stop offset="1" stopColor="#32146b" stopOpacity="0"/></radialGradient>
              <linearGradient id="secretsCrystal" x1=".1" x2=".9" y1="0" y2="1"><stop stopColor="#eff1ff"/><stop offset=".25" stopColor="#e071ff"/><stop offset=".6" stopColor="#7433d4"/><stop offset="1" stopColor="#180b52"/></linearGradient>
              <filter id="secretsGlow"><feGaussianBlur stdDeviation="12"/></filter>
            </defs>
            <rect width="1200" height="520" fill="url(#secretsSky)"/>
            <ellipse cx="610" cy="215" rx="405" ry="320" fill="url(#secretsAura)"/>
            <path d="M0 388 104 250 182 330 285 162 400 340 475 230 570 398 680 195 785 346 928 148 1023 305 1120 180 1200 330V520H0Z" fill="#160e3c"/>
            <path d="m0 465 154-210 133 220 129-138 116 162 174-235 137 203 128-130 129 100v83H0Z" fill="#090b2d"/>
            <g fill="none" stroke="#b97cff" strokeWidth="3" opacity=".64"><path d="m285 162 23 114-23 70M680 195l-12 140 24 70M928 148l-33 159 30 81"/><path d="M55 420 500 444 780 385 1165 454" opacity=".35"/></g>
            <g transform="translate(504 30)">
              <ellipse cx="110" cy="220" rx="185" ry="195" fill="url(#secretsAura)"/>
              <path d="M110 5 238 135 194 336 110 443 26 336-18 135Z" fill="#a650ff" opacity=".3" filter="url(#secretsGlow)"/>
              <path d="M110 7 234 132 189 330 110 438 32 330-12 132Z" fill="url(#secretsCrystal)" stroke="#e29cff" strokeWidth="7"/>
              <path d="M110 7 91 160 110 438 190 331 234 132 110 7 32 330 91 160-12 132 234 132" fill="none" stroke="#f5bfff" strokeWidth="4" opacity=".78"/>
              <path d="M91 160 190 331 32 330Z" fill="#2b145e" opacity=".45"/>
              <path d="M71 195 110 164 153 195 110 249Z" fill="#eff5ff" opacity=".9"/>
            </g>
            <g fill="#eeb4ff"><circle cx="145" cy="105" r="3"/><circle cx="358" cy="63" r="2"/><circle cx="929" cy="69" r="4"/><circle cx="1060" cy="202" r="2"/><circle cx="829" cy="284" r="3"/><circle cx="250" cy="244" r="3"/></g>
            <path d="M0 490 170 465 320 495 585 460 820 495 1000 454 1200 489v31H0Z" fill="#040817"/>
          </svg>
        </div>
        <div className={styles.secretsCopy}>
          <h2>SECRETOS DE LIRY</h2>
          <p>Hay más de lo que ves...</p>
          <p>Encuentra los fragmentos ocultos y desbloquea desafíos cuando estén disponibles.</p>
          <div className={styles.secretsTrack} aria-label="Secretos aún no disponibles"><span /></div>
          <small>PRÓXIMAMENTE · SIN PROGRESO SIMULADO</small>
        </div>
        
      </section>
      <div className={styles.finalSignature} aria-label="Liry: más que videojuegos"><span aria-hidden="true">▽</span><strong>MORE<br/>THAN<br/>GAMES.<br/>IT'S A<br/>UNIVERSE.</strong></div>
    </div>
    <footer className={styles.footer}><strong>LIRYGAMES STUDIOS</strong><p>Nueve videojuegos. Un universo en expansión.</p><Link href="/es">FRAGMENTUN ↗</Link></footer>
  </main>;
}
