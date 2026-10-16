import Link from "next/link";
import {LiryShare} from "../../components/LiryShare";
import {LirySecretsInfo} from "../../components/LirySecretsInfo";
import {LiryStoreCategories} from "../../components/LiryStoreCategories";
import {LiryOfficialNetworks} from "../../components/LiryOfficialNetworks";
import {LiryCommunityTabs} from "../../components/LiryCommunityTabs";
import {LiryBoostTop10} from "../../components/LiryBoostTop10";
import {LiryBoostEnrollment} from "../../components/LiryBoostEnrollment";
import {LiryGameDiscovery} from "../../components/LiryGameDiscovery";
import {LiryThirdPartyCatalog} from "../../components/LiryThirdPartyCatalog";
import {LiryGamerInfoDialog} from "../../components/LiryGamerInfoDialog";
import {LiryGamerIdentity} from "../../components/LiryGamerIdentity";
import {LiryIdAccess} from "../../components/LiryIdAccess";
import {LiryDeveloperAccess} from "../../components/LiryDeveloperAccess";
import {LiryCommunityContact} from "../../components/LiryCommunityContact";
import {LiryPrivacyPreview} from "../../components/LiryPrivacyPreview";
import {getLiryPublicCatalog,getLiryApprovedThirdPartyCatalog} from "../../lib/games/public-catalog-server";
import {VISITOR_GAMER_SNAPSHOT} from "../../lib/games/public-gamer-snapshot";
import styles from "./lirygames.module.css";
import {liryFrontdeskStrings} from "../../lib/games/liry-frontdesk-i18n";

export const metadata={
  title:{absolute:"LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar"},
  description:"Descubre los videojuegos de LIRYGAMES STUDIOS, un ecosistema de experiencias y comunidades gamer. Próximamente.",
  applicationName:"LIRYGAMES STUDIOS",
  category:"Games",
  openGraph:{
    type:"website" as const,
    siteName:"LIRYGAMES STUDIOS",
    title:"LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar",
    description:"Cientos de mundos por descubrir. Explora los próximos lanzamientos y únete a la comunidad LIRYGAMES.",
    images:[{url:"/lirygames/opengraph-image",width:1200,height:630,alt:"LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar"}]
  },
  twitter:{
    card:"summary" as const,
    title:"LIRYGAMES STUDIOS — Cientos de mundos. Infinitas formas de jugar",
    description:"Descubre los videojuegos y la comunidad de LIRYGAMES STUDIOS.",
    images:["/lirygames/opengraph-image"]
  },
  robots:{index:false,follow:false}
};

export default async function LiryGamesFrontDesk(){
  // Publicar solo identificadores editoriales: no serializar títulos ni slugs internos de IP.
  const internalCatalog=await getLiryPublicCatalog();
  const approvedThirdPartyCatalog=await getLiryApprovedThirdPartyCatalog();
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
  const copy=liryFrontdeskStrings("es");
  return <main className={styles.page} id="liry-main">
    <a className={styles.skipToContent} href="#mundos">{copy.navigation.skipCatalog}</a>
    <header className={styles.nav}>
      <a className={styles.brand} href="#inicio" aria-label="LiryGames Studios"><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span><span className={styles.wordmark}><strong>LIRY</strong><span>GAMES STUDIOS</span><small>{copy.heroDetails.brandTagline}</small></span></a>
      <nav aria-label={copy.navigation.navAria}><a href="#inicio">{copy.navigation.home}</a><a href="#mundos">{copy.navigation.worlds}</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">{copy.navigation.journey}</a><a href="#comunidad">{copy.navigation.community}</a><a href="#liryboost">LiryBoost</a><a href="#tienda">{copy.navigation.store}</a></nav><div className={styles.navUtilities}><a className={styles.navSearch} href="#mundos" aria-label={copy.navigation.searchAria} title={copy.navigation.searchTitle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true"><circle cx="10.7" cy="10.7" r="6.7"/><path d="m16 16 5 5"/></svg></a><a className={styles.navNotice} href="#social" aria-label={copy.navigation.socialAria} title={copy.navigation.socialTitle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg></a><LiryDeveloperAccess /><a className={styles.profileAccess} href="/lirygames/mi-liry" aria-label={copy.heroDetails.profileAria} title={copy.heroDetails.profileTitle}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.5"/><path d="M5 20c.5-4 3-6 7-6s6.5 2 7 6"/></svg><span>{copy.visitor.label}</span></a><span className={styles.languagePreview} aria-label={copy.heroDetails.languageAria} title={copy.heroDetails.languageTitle}><span className={styles.languageActive}>ES</span><span className={styles.languageDivider}>/</span><span className={styles.languageInactive}>EN</span></span><details className={styles.navMenu}><summary aria-label={copy.navigation.menuAria}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></summary><div className={styles.navMenuPanel}><a href="#inicio">{copy.navigation.home}</a><a href="#mundos">{copy.discovery.title}</a><a href="#liry-dna">Liry DNA</a><a href="#perfil-gamer">{copy.navigation.journey}</a><a href="#comunidad">{copy.navigation.community}</a><a href="#liryboost">LiryBoost</a><a href="#social">{copy.navigation.social}</a><a href="#tienda">{copy.navigation.store}</a></div></details></div>
    </header>
    <section className={styles.hero} id="inicio">
      <div className={styles.heroUniverse} aria-hidden="true"><span className={styles.heroOrbitOne}></span><span className={styles.heroOrbitTwo}></span><span className={styles.heroPlanet}></span><span className={styles.heroSatellite}></span><span className={styles.heroStardust}></span></div>
      <div className={styles.heroContent}>
        <p className={styles.kicker}>{copy.hero.eyebrow}</p>
        <h1>{copy.heroDetails.headlineLines[0]}<br/><span>{copy.heroDetails.headlineLines[1]}<br/>{copy.heroDetails.headlineLines[2]}</span></h1>
        <p>{copy.heroDetails.description}</p>
        <div className={styles.heroActions}><a className={styles.button} href="#mundos">{copy.hero.explore} →</a><a className={styles.heroSecondary} href="#comunidad">{copy.hero.community} →</a></div>
      </div>
      <a className={styles.heroStart} href="#mundos" aria-label={copy.heroDetails.startAria}><span className={styles.heroPlay} aria-hidden="true">▶</span><span>{copy.heroDetails.startLines[0]}<br/>{copy.heroDetails.startLines[1]}</span></a>
      <div className={styles.heroJourney} aria-label={copy.heroDetails.stagesAria}><a href="#mundos">{copy.journey.explore}</a><a href="#comunidad">{copy.journey.connect}</a><a href="#modelo">{copy.journey.play}</a><a href="#perfil-gamer">{copy.journey.evolve}</a></div>
    </section>
    <section className={styles.section} id="mundos">
      <p className={styles.kicker}>{copy.discovery.eyebrow}</p>
      <h2>{copy.discovery.title}</h2>
      <p className={styles.sectionIntro}>{copy.discovery.description}</p>
      <LiryGameDiscovery games={games} />
      <LiryThirdPartyCatalog games={approvedThirdPartyCatalog} />
    </section>
    <section className={`${styles.section} ${styles.gamerSection}`} id="perfil-gamer" aria-label={copy.journey.sectionAria}>
      <div className={styles.gamerGrid}>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">♙</span><h3>{copy.gamerProfile.title}</h3></header>
          <LiryGamerIdentity snapshot={gamerSnapshot} />
          <LiryIdAccess />
          <LiryPrivacyPreview />
          <LiryGamerInfoDialog topic="perfil" />
          <small className={styles.gamerDataNote}>Estado visitante · sin sesión gamer</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">⬡</span><div><h3>{copy.journey.title}</h3><p>{copy.journey.subtitle}</p></div></header>
          <div className={styles.journeyContent}>
            <div className={styles.journeyRing} role="progressbar" aria-label={copy.journey.progressAria} aria-valuemin={0} aria-valuemax={9} aria-valuenow={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length:undefined} aria-valuetext={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length} ${copy.journey.exploredSuffix}`:copy.journey.noActivity} style={{["--journey-progress" as string]:gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length/9*100}%`:"0%"}}><div className={styles.journeyRingCenter}><strong>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.visitedWorldIds.filter(id=>games.some(game=>game.slug===id)).length} / 9`:"— / 9"}</strong><span>{copy.journey.discovered}</span></div></div>
            <ol className={styles.journeyWorlds}>{games.map((game,index)=><li key={game.slug}><span className={styles.journeyNumber}>{index+1}</span><span className={styles.journeyName}>{game.title}</span><span className={styles.journeyPending} aria-label={gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.visitedWorldIds.includes(game.slug)?copy.journey.visitedAria:copy.journey.noProgressAria}>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.visitedWorldIds.includes(game.slug)?"✓":"○"}</span></li>)}</ol>
          </div>
          <LiryGamerInfoDialog topic="mundos" />
          <LiryGamerInfoDialog topic="journey" />
          <small className={styles.gamerDataNote}>{copy.journey.pendingNote}</small>
        </article>
        <article className={styles.gamerCard}>
          <header className={styles.gamerCardHeader}><span className={styles.gamerHeaderIcon} aria-hidden="true">✣</span><h3>{copy.achievementsPreview.title}</h3><span className={styles.gamerTopRight}>{copy.achievementsPreview.preview}</span></header>
          <div className={styles.achievementList}>
            {copy.achievementsPreview.goals.map((item,index)=>{
              const earned=gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?.achievementIds.includes(item.id)===true;
              const icons=["✧","⬡","✦","♜"] as const;
              return <div className={`${styles.achievementRow} ${earned?styles.achievementEarned:""}`} key={item.id} aria-label={`${item.title}: ${earned?copy.achievementsPreview.earned:copy.achievementsPreview.pending}`}><span className={styles.achievementMedal} aria-hidden="true">{icons[index]}</span><div><strong>{item.title}</strong><span>{item.detail}</span><small>{earned?copy.achievementsPreview.earnedLabel:copy.achievementsPreview.pendingLabel}</small></div></div>;
            })}
          </div>
          <LiryGamerInfoDialog topic="logros-lista" />
          <LiryGamerInfoDialog topic="logros" />
          <small className={styles.gamerDataNote}>{gamerSnapshot.status==="verified"&&gamerSnapshot.verifiedActivity?`${gamerSnapshot.verifiedActivity.achievementIds.length} ${copy.achievementsPreview.verifiedSuffix}`:copy.achievementsPreview.empty}</small>
        </article>
      </div>
    </section>
    <section className={`${styles.section} ${styles.liryBoostSection}`} id="liryboost" aria-labelledby="liryboost-title">
      <p className={styles.kicker}>{copy.liryBoostSection.kicker}</p>
      <h2 id="liryboost-title">LIRYBOOST</h2>
      <p className={styles.sectionIntro}>{copy.liryBoostSection.intro}</p>
      <div aria-label={copy.liryBoostSection.stepsAria} className={styles.liryBoostSteps}>
        {copy.liryBoostSection.steps.map(step=><article key={step.number} className={styles.liryBoostStep}>
          <span className={styles.liryBoostNumber}>{step.number}</span>
          <strong className={styles.liryBoostStepTitle}>{step.title}</strong>
          <p className={styles.liryBoostDetail}>{step.detail}</p>
        </article>)}
      </div>
      <LiryBoostTop10 />
      <div className={styles.liryBoostActions}>
        <LiryBoostEnrollment />
        <a href="#social" className={styles.liryBoostSecondary}>{copy.liryBoostSection.share} →</a>
        <a href="#contacto" className={styles.liryBoostSecondary}>{copy.liryBoostSection.contact} →</a>
      </div>
      <p className={styles.liryBoostNotice}>{copy.liryBoostSection.notice}</p>
    </section>
    <div className={styles.socialTrio} aria-label={copy.communityOverview.trioAria}>
      <section className={styles.section} id="comunidad">
        <div className={styles.socialPanelHeader}><h2>{copy.communityOverview.communityTitle}</h2><p className={styles.socialIntro}>{copy.communityOverview.communityIntro}</p></div>
        <LiryCommunityTabs />
        <LiryCommunityContact />
        <div className={styles.communityCompose}><span>{copy.communityOverview.postsPending}</span><span aria-hidden="true">➤</span></div>
      </section>
      <section className={styles.section} id="social">
        <div className={styles.socialPanelHeader}><h2>{copy.communityOverview.socialTitle}</h2>
        <p className={styles.socialIntro}>{copy.communityOverview.socialIntro}</p></div>
        <div className={styles.socialFeature}>
          <span className={styles.socialFeatureIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.7 10.5 6.6-4M8.7 13.5l6.6 4"/></svg></span>
          <strong>{copy.communityOverview.shareTitle}</strong>
          <p>{copy.communityOverview.shareIntro}</p>
        </div>
        <p className={styles.socialChannelsTitle}>{copy.communityOverview.shareNetworks}</p>
        <LiryShare />
        <div className={styles.socialChannels}>
          <strong>{copy.communityOverview.follow}</strong>
          <p>{copy.communityOverview.officialPending}</p>
          <LiryOfficialNetworks />
        </div>
        <small className={styles.socialPending}>{copy.communityOverview.linksPending}</small>
      </section>
            <section className={styles.section} id="recomendaciones">
        <div className={styles.socialPanelHeader}><h2>{copy.recommendationsOverview.title}</h2><p className={styles.socialIntro}>{copy.recommendationsOverview.intro}</p></div>
        <div className={styles.recommendList}>
          {copy.recommendationsOverview.items.map(game=><article className={styles.recommendItem} key={game.code}><div className={`${styles.recommendThumb} ${styles[`recommendThumb${game.index}`]} `} aria-hidden="true"><img src={`/liry-assets/world-${String(game.index+1).padStart(2,"0")}.webp`} alt="" loading="lazy" style={{width:"100%",height:"100%",minHeight:52,objectFit:"cover",borderRadius:3}} /></div><div className={styles.recommendText}><strong>{game.code}</strong><p>{game.reason}</p></div><a href={`#liry-world-${String(game.index+1).padStart(2,"0")}`}>{copy.recommendationsOverview.viewGame} →</a></article>)}
        </div>
        <a className={styles.recommendAll} href="#mundos">{copy.recommendationsOverview.viewAll} <span aria-hidden="true">→</span></a>
      </section>
    </div>
    <section className={styles.storeShowcase} id="tienda" aria-labelledby="liry-store-title">
      <div className={styles.storeIntro}>
        <p className={styles.storeEyebrow}>{copy.storeOverview.eyebrow}</p>
        <h2 id="liry-store-title"><span aria-hidden="true">▢</span> {copy.storeOverview.title} <em>LIRY</em></h2>
        <p>{copy.storeOverview.subtitle}</p>
        <small>{copy.storeOverview.intro}</small>
        <span className={styles.storeComingSoon}>{copy.storeOverview.comingSoon}</span>
      </div>
      <LiryStoreCategories />
      <p className={styles.storeLegal}>{copy.storeOverview.freemium}</p>
    </section>
    <div className={styles.finalDiscover} aria-label={copy.finalSections.groupAria}>
      <section className={styles.journeyBanner} id="modelo">
        <div className={styles.journeyCinematicImage} role="img" aria-label={copy.finalSections.landscapeAria} />
        <div className={styles.journeyBannerContent}>
          <h2>{copy.finalSections.journeyTitle}</h2>
          <p>{copy.finalSections.journeyIntro}</p>
          <a href="#mundos" className={styles.bannerCta}>{copy.finalSections.journeyCta} <span aria-hidden="true">→</span></a>
          <small>{copy.finalSections.journeyDisclaimer}</small>
        </div>
      </section>
      <section className={styles.secretsBanner} id="secretos">
        <div className={styles.secretsHdArt} role="img" aria-label={copy.finalSections.secretsArtAria}>
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
          <h2>{copy.finalSections.secretsTitle}</h2>
          <p>{copy.finalSections.secretsTagline}</p>
          <p>{copy.finalSections.secretsDescription}</p>
          <div className={styles.secretsTrack} role="img" aria-label={copy.finalSections.secretsTrackAria}><span /></div>
          <small>{copy.finalSections.secretsNotice}</small>
          <LirySecretsInfo />
        </div>
        
      </section>
      <div className={styles.finalSignature} aria-label={copy.finalSections.signatureAria}><span aria-hidden="true">▽</span><strong>{copy.finalSections.signature[0]}<br/>{copy.finalSections.signature[1]}<br/>{copy.finalSections.signature[2]}<br/>{copy.finalSections.signature[3]}</strong></div>
    </div>
    
    <footer className={styles.footer}>
      <div className={styles.footerIdentity}><strong>LIRY<span>GAMES</span></strong><small>STUDIOS</small></div>
      <div className={styles.footerTagline}>{copy.footerCopy.tagline[0]}<br/>{copy.footerCopy.tagline[1]}</div>
      <nav className={styles.footerNav} aria-label={copy.footerCopy.navigationAria}>{(["#inicio","#mundos","#liry-dna","#perfil-gamer","#comunidad","#liryboost","#tienda","#social","#comunidad"] as const).map((href,index)=><a href={href} key={index}>{copy.footerCopy.links[index]}</a>)}</nav>
      <nav className={styles.footerLegalNav} aria-label={copy.footerCopy.legalAria}><a href="/lirygames/legal">{copy.footerCopy.legal}</a></nav>
      <div className={styles.footerCopyright}>© {new Date().getFullYear()} LIRYGAMES STUDIOS. {copy.footerCopy.rights}</div>
    </footer>
  </main>;
}
