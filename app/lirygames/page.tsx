import Link from "next/link";
import {LiryShare} from "../../components/LiryShare";
import {LirySecretsInfo} from "../../components/LirySecretsInfo";
import {LiryStoreCategories} from "../../components/LiryStoreCategories";
import {LiryOfficialNetworks} from "../../components/LiryOfficialNetworks";
import {LiryCommunityTabs} from "../../components/LiryCommunityTabs";
import {LiryBoostTop10} from "../../components/LiryBoostTop10";
import {LiryBoostEnrollment} from "../../components/LiryBoostEnrollment";
import {LiryContactForm} from "../../components/LiryContactForm";
import {LiryGameDiscovery} from "../../components/LiryGameDiscovery";
import {LiryGamerInfoDialog} from "../../components/LiryGamerInfoDialog";
import {LiryGamerIdentity} from "../../components/LiryGamerIdentity";
import {LiryIdAccess} from "../../components/LiryIdAccess";
import {LiryPrivacyPreview} from "../../components/LiryPrivacyPreview";
import {getLiryPublicCatalog} from "../../lib/games/public-catalog-server";
import {VISITOR_GAMER_SNAPSHOT} from "../../lib/games/public-gamer-snapshot";
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
    images:[{url:"/lirygames/opengraph-image",width:1200,height:630,alt:"LIRYGAMES STUDIOS — 9 mundos, infinitas formas de jugar"}]
  },
  twitter:{
    card:"summary" as const,
    title:"LIRYGAMES STUDIOS — 9 mundos, infinitas formas de jugar",
    description:"Descubre los videojuegos y la comunidad de LIRYGAMES STUDIOS.",
    images:["/lirygames/opengraph-image"]
  },
  robots:{index:false,follow:false}
};

export default async function LiryGamesFrontDesk(){
  // Publicar solo identificadores editoriales: no serializar títulos ni slugs internos de IP.
  const internalCatalog=await getLiryPublicCatalog();
  // Hasta existir proveedor de identidad y telemetría autorizado: estado visitante, sin datos fabricados.
  const gamerSnapshot=VISITOR_GAMER_SNAPSHOT;
  const publicCodenames=["LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03","LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06","LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"];
  // Lista explícita de campos permitidos: jamás pasar títulos, rutas ni textos internos al cliente.
  const games=internalCatalog.slice(0,9).map((game,index)=>({
    slug:`liry-public-${String(index+1).padStart(2,"0")}`,
    title:publicCodenames[index]??`LIRY // PROJECT-${String(index+1).padStart(2,"0")}`,
    state:game.state,
    tagline:"Experiencia LIRYGAMES en preparación",
    playUrl:null,
    internalWorldCount:game.internalWorldCount
  }));
  return <main className={styles.page}>
    <header className={styles.nav}>
      <a className={styles.brand} href="#inicio" aria-label="LiryGames Studios"><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span><span className={styles.wordmark}><strong>LIRY</strong><span>GAMES STUDIOS</span><small>UNIVERSO DE VIDEOJUEGOS</small></span></a>
      <nav aria-label="Navegación LIRYGAMES"><a href="#inicio">Inicio</a><a href="#mundos">Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#liryboost">LiryBoost</a><a href="#tienda">Tienda</a><a href="#contacto">Contacto</a></nav><div className={styles.navUtilities}><a className={styles.navSearch} href="#mundos" aria-label="Explorar los nueve videojuegos" title="Explorar videojuegos"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></a><a className={styles.navNotice} href="#social" aria-label="Ver la sección social" title="Redes sociales y compartir"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></a><a className={styles.profileAccess} href="#perfil-gamer" aria-label="Acceder al perfil gamer; inicio de sesión próximamente" title="Perfil gamer · acceso próximamente"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></svg><span>VISITANTE</span></a><span className={styles.languagePreview} aria-label="Idioma actual: Español. Traducción al inglés próximamente" title="Selector de idioma · traducción próximamente"><span className={styles.languageActive}>ES</span><span className={styles.languageDivider}>/</span><span className={styles.languageInactive}>EN</span></span><details className={styles.navMenu}><summary aria-label="Abrir menú de navegación"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><div className={styles.navMenuPanel}><a href="#inicio">Inicio</a><a href="#mundos">Los 9 Mundos</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">Tu viaje</a><a href="#comunidad">Comunidad</a><a href="#liryboost">LiryBoost</a><a href="#social">Redes sociales</a><a href="#tienda">Tienda</a><a href="#contacto">Contacto</a></div></details></div>
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
          <LiryGamerIdentity snapshot={gamerSnapshot} />
          <LiryIdAccess />
          <LiryPrivacyPreview />
          <LiryGamerInfoDialog topic="perfil" />
          <small className={styles.gamerDataNote}>Estado visitante · sin sesión gamer</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">⬡</span><div><h3>TU LIRY JOURNEY</h3><p>Esta es tu historia en Liry. Sigue explorando.</p></div></header>
          <div className={styles.journeyContent}>
            <div className={styles.journeyRing} role="progressbar" aria-label="Mundos visitados con actividad verificada" aria-valuemin={0} aria-valuemax={9} aria-valuenow={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length:undefined} aria-valuetext={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length} de 9 mundos`:"Sin actividad verificada"} style={{["--journey-progress" as string]:gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length/9*100}%`:"0%"}}><div className={styles.journeyRingCenter}><strong>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length} / 9`:"— / 9"}</strong><span>Mundos descubiertos</span></div></div>
            <ol className={styles.journeyWorlds}>{games.map((game,index)=><li key={game.slug}><span className={styles.journeyNumber}>{index+1}</span><span className={styles.journeyName}>{game.title}</span><span className={styles.journeyPending} aria-label={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.visitedWorldIds.includes(game.slug)?"Mundo visitado con actividad verificada":"Sin avance registrado"}>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.visitedWorldIds.includes(game.slug)?"✓":"○"}</span></li>)}</ol>
          </div>
          <LiryGamerInfoDialog topic="mundos" />
          <LiryGamerInfoDialog topic="journey" />
          <small className={styles.gamerDataNote}>Progreso sin iniciar · pendiente de actividad verificada.</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">✣</span><h3>LOGROS POR DESBLOQUEAR</h3><span className={styles.gamerTopRight}>Vista previa</span></header>
          <div className={styles.achievementList}>
            {[
              {id:"first-steps",icon:"✧",title:"Primeros pasos",detail:"Completa tu primer juego"},
              {id:"world-explorer",icon:"⬡",title:"Explorador de mundos",detail:"Descubre cinco mundos"},
              {id:"community-friends",icon:"✦",title:"La comunidad te necesita",detail:"Juega con tres amigos"},
              {id:"strategy-master",icon:"♜",title:"Maestro de estrategias",detail:"Gana diez partidas estratégicas"}
            ].map(item=>{
              const earned=gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.achievementIds.includes(item.id)===true;
              return <div className={`${styles.achievementRow} ${earned?styles.achievementEarned:""}`} key={item.id} aria-label={`${item.title}: ${earned?"Acreditado":"Pendiente"}`}><span className={styles.achievementMedal} aria-hidden="true">{item.icon}</span><div><strong>{item.title}</strong><span>{item.detail}</span><small>{earned?"LOGRO ACREDITADO":"Pendiente de obtener"}</small></div></div>;
            })}
          </div>
          <LiryGamerInfoDialog topic="logros-lista" />
          <LiryGamerInfoDialog topic="logros" />
          <small className={styles.gamerDataNote}>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.achievementIds.length} logros acreditados mediante actividad verificada.`:"Objetivos previstos · ningún logro acreditado."}</small>
        </article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.liryBoostSection}`} id="liryboost" aria-labelledby="liryboost-title">
      <p className={styles.kicker}>COMPARTE · CONECTA · PARTICIPA</p>
      <h2 id="liryboost-title">LIRYBOOST</h2>
      <p className={styles.sectionIntro}>Próximamente podrás participar compartiendo LIRYGAMES. Los diez participantes con mayor cantidad de invitaciones verificadas tendrán prioridad para recibir acceso a las versiones beta, según las reglas oficiales de cada convocatoria.</p>
      <div aria-label="Cómo funcionará LiryBoost" className={styles.liryBoostSteps}>
        {[
          {number:"01",title:"COMPARTE",detail:"Invita a nuevos jugadores con tu enlace personal, una vez abierto el programa."},
          {number:"02",title:"VERIFICAMOS",detail:"Contabilizaremos únicamente las invitaciones válidas, de acuerdo con las reglas publicadas."},
          {number:"03",title:"ACCEDE ANTES",detail:"El Top 10 tendrá prioridad para las versiones beta disponibles, sujeto a las condiciones de cada juego."}
        ].map(step=><article key={step.number} className={styles.liryBoostStep}>
          <span className={styles.liryBoostNumber}>{step.number}</span>
          <strong className={styles.liryBoostStepTitle}>{step.title}</strong>
          <p className={styles.liryBoostDetail}>{step.detail}</p>
        </article>)}
      </div>
      <LiryBoostTop10 />
      <div className={styles.liryBoostActions}>
        <LiryBoostEnrollment />
        <a href="#social" className={styles.liryBoostSecondary}>COMPARTIR LIRYGAMES →</a>
        <a href="#contacto" className={styles.liryBoostSecondary}>RECIBIR NOVEDADES →</a>
      </div>
      <p className={styles.liryBoostNotice}>El registro de participaciones, la validación de invitaciones y el Top 10 todavía no están activos. Compartir ahora no genera puntos ni garantiza acceso beta. Publicaremos las condiciones antes de abrir la competencia.</p>
    </section>
    <div className={styles.socialTrio} aria-label="Comunidad, eventos y recomendaciones">
      <section className={styles.section} id="comunidad">
        <div className={styles.socialPanelHeader}><h2>COMUNIDAD LIRY</h2><p className={styles.socialIntro}>Conecta, comparte, juega.</p></div>
        <LiryCommunityTabs />
        <div className={styles.communityCompose}><span>Publicaciones disponibles próximamente</span><span aria-hidden="true">➤</span></div>
      </section>
      <section className={styles.section} id="social">
        <div className={styles.socialPanelHeader}><h2>SECCIÓN SOCIAL</h2>
        <p className={styles.socialIntro}>Comparte los nueve mundos.</p></div>
        <div className={styles.socialFeature}>
          <span className={styles.socialFeatureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.5 6.6-4M8.7 13.5l6.6 4"/></svg></span>
          <strong>COMPARTE LIRYGAMES</strong>
          <p>Haz que otros descubran LIRYGAMES.</p>
        </div>
        <p className={styles.socialChannelsTitle}>COMPARTE EN TUS REDES</p>
        <LiryShare />
        <div className={styles.socialChannels}>
          <strong>SÍGUENOS EN REDES SOCIALES</strong>
          <p>Perfiles oficiales próximamente.</p>
          <LiryOfficialNetworks />
        </div>
        <small className={styles.socialPending}>Enlaces oficiales pendientes de verificación.</small>
      </section>
            <section className={styles.section} id="recomendaciones">
        <div className={styles.socialPanelHeader}><h2>RECOMENDACIONES PARA TI</h2><p className={styles.socialIntro}>Descubre tres mundos destacados.</p></div>
        <div className={styles.recommendList}>
          {[{title:"LIRY // LINK-05",reason:"Conecta con otros jugadores",index:4},{title:"LIRY // EARTH-04",reason:"Explora un mundo de supervivencia",index:3},{title:"LIRY // REALM-06",reason:"Descubre un universo de fantasía",index:5}].map(game=><article className={styles.recommendItem} key={game.title}><div className={`${styles.recommendThumb} ${styles[`recommendThumb${game.index}`]} `} aria-hidden="true"><img src={`/liry-assets/world-${String(game.index+1).padStart(2,"0")}.webp`} alt="" loading="lazy" style={{width:"100%",height:"100%",minHeight:52,objectFit:"cover",borderRadius:3}} /></div><div className={styles.recommendText}><strong>{game.title}</strong><p>{game.reason}</p></div><a href={`#liry-world-${String(game.index+1).padStart(2,"0")}`}>Ver juego →</a></article>)}
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
      <LiryStoreCategories />
      <p className={styles.storeLegal}>Modelo freemium: los tres mundos internos iniciales previstos para cada videojuego serán gratuitos; las compras cosméticas serán opcionales. No hay pagos activos ni artículos disponibles actualmente.</p>
    </section>
    <div className={styles.finalDiscover} aria-label="Tu viaje y secretos de Liry">
      <section className={styles.journeyBanner} id="modelo">
        <div className={styles.journeyCinematicImage} role="img" aria-label="Paisaje cinematográfico del universo LIRYGAMES con mundos fantásticos" />
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
          <p>Próximamente podrás descubrir fragmentos ocultos y acceder a desafíos especiales.</p>
          <div className={styles.secretsTrack} role="img" aria-label="Sistema de secretos aún no disponible; no hay progreso registrado"><span /></div>
          <small>PRÓXIMAMENTE · SIN PROGRESO SIMULADO</small>
          <LirySecretsInfo />
        </div>
        
      </section>
      <div className={styles.finalSignature} aria-label="Liry: más que videojuegos"><span aria-hidden="true">▽</span><strong>MÁS QUE<br/>VIDEOJUEGOS.<br/>ES TODO<br/>UN UNIVERSO.</strong></div>
    </div>
    <section className={`${styles.section} ${styles.contactSection}`} id="contacto" aria-labelledby="liry-contact-title"><p className={styles.kicker}>TU OPINIÓN NOS IMPORTA</p><h2 id="liry-contact-title">CONTACTA CON LIRYGAMES</h2><p>Comparte sugerencias, opiniones sobre nuestros videojuegos o propuestas de colaboración. Queremos escucharte.</p><LiryContactForm /></section>
    <footer className={styles.footer}>
      <div className={styles.footerIdentity}><strong>LIRY<span>GAMES</span></strong><small>STUDIOS</small></div>
      <div className={styles.footerTagline}>MÁS QUE VIDEOJUEGOS.<br/>ES TODO UN UNIVERSO.</div>
      <nav className={styles.footerNav} aria-label="Enlaces del pie de página"><a href="#inicio">INICIO</a><a href="#mundos">MUNDOS</a><a href="#liry-dna">LIRY DNA</a><a href="#perfil-gamer">TU VIAJE</a><a href="#comunidad">COMUNIDAD</a><a href="#liryboost">LIRYBOOST</a><a href="#tienda">TIENDA</a><a href="#social">REDES</a><a href="#contacto">CONTACTO</a></nav>
      <nav className={styles.footerLegalNav} aria-label="Documentación legal de LIRYGAMES"><a href="/lirygames/legal">CENTRO LEGAL</a></nav>
      <div className={styles.footerCopyright}>© {new Date().getFullYear()} LIRYGAMES STUDIOS. Todos los derechos reservados.</div>
    </footer>
  </main>;
}
