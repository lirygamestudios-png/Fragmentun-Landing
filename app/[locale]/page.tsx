export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PublicHeader } from "../../components/PublicHeader";
import { ChapterLeadExperiment } from "../../components/ChapterLeadExperiment";
import { TrackLink } from "../../components/TrackLink";
import { PageView } from "../../components/PageView";
import { MotionEffects } from "../../components/MotionEffects";
import { SocialLinks } from "../../components/SocialLinks";
import { FrontDiscovery } from "../../components/FrontDiscovery";
import { ReviewsShowcase } from "../../components/ReviewsShowcase";
import { copy,locales,type Locale } from "../../lib/i18n";
import { getBooks,getLocalizedContent,getPublishedReviews } from "../../lib/content";

export default async function Home({
  params,
  searchParams
}:{
  params:Promise<{locale:string}>;
  searchParams:Promise<{signup?:string}>;
}){
  const[{locale:raw},{signup}] = await Promise.all([params,searchParams]);
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const t=copy[locale];

  const[cms,books,reviews]=await Promise.all([
    getLocalizedContent(locale),
    getBooks(locale),
    getPublishedReviews(locale)
  ]);

  const hero=cms["home.hero"]||{};
  const why=cms["home.why"]||{};
  const lumen=cms["home.lumen"]||{};
  const chapter=cms["home.chapter"]||{};
  const finalCta=cms["home.final_cta"]||{};
  const shareReward=cms["home.share_reward"]||{};

  const firstBook=(books as any[]).find((b:any)=>b.slug==="fragmentun-i")||(books as any[])[0];
  const amazonUrl=firstBook?.edition_status==="published"?firstBook?.amazon_url:null;
  const env=(upper:string,lower:string)=>(process.env[upper]||process.env[lower]||"").trim();
  const patreonUrl=env("NEXT_PUBLIC_PATREON_URL","next_public_patreon_url")||"https://patreon.com/sagaFragmentun?utm_source=fragmentun&utm_medium=website&utm_campaign=patreon_support&utm_content=landing";
  const facebookCommunityUrl=env("NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL","next_public_facebook_community_url");
  const socialItems=[
    {key:"instagram",label:"Instagram",url:env("NEXT_PUBLIC_INSTAGRAM_URL","next_public_instagram_url")},
    {key:"tiktok",label:"TikTok",url:env("NEXT_PUBLIC_TIKTOK_URL","next_public_tiktok_url")},
    {key:"youtube",label:"YouTube",url:env("NEXT_PUBLIC_YOUTUBE_URL","next_public_youtube_url")},
    {key:"facebook",label:"Facebook",url:env("NEXT_PUBLIC_FACEBOOK_URL","next_public_facebook_url")},
    {key:"x",label:"X",url:env("NEXT_PUBLIC_X_URL","next_public_x_url")}
  ];

  const fallbackBooks=[
    {
      slug:"fragmentun-i",
      volume:1,
      title_es:"FRAGMENTUN I",
      title_en:"FRAGMENTUN I",
      subtitle_es:"El Despertar Emocional",
      subtitle_en:"The Emotional Awakening",
      edition_status:locale==="es"?"published":"coming_soon",
      amazon_url:locale==="es"?"https://www.amazon.com/dp/B0HBLTHT8S":null
    },
    {
      slug:"fragmentun-ii",
      volume:2,
      title_es:"FRAGMENTUN II",
      title_en:"FRAGMENTUN II",
      subtitle_es:"La Guerra de la Fractura",
      subtitle_en:"The Fracture War",
      edition_status:"coming_soon",
      amazon_url:null
    },
    {
      slug:"fragmentun-iii",
      volume:3,
      title_es:"FRAGMENTUN III",
      title_en:"FRAGMENTUN III",
      subtitle_es:"Protocolo de Ascensión",
      subtitle_en:"Ascension Protocol",
      edition_status:"coming_soon",
      amazon_url:null
    },
    {
      slug:"fragmentun-iv",
      volume:4,
      title_es:"FRAGMENTUN IV",
      title_en:"FRAGMENTUN IV",
      subtitle_es:"Génesis del Halo",
      subtitle_en:"Genesis of the Halo",
      edition_status:"coming_soon",
      amazon_url:null
    }
  ];

  const publicBooks=fallbackBooks.map((fallback:any)=>
    (books as any[]).find((book:any)=>Number(book.volume)===fallback.volume)
      ? {...fallback,...(books as any[]).find((book:any)=>Number(book.volume)===fallback.volume)}
      : fallback
  );

  const site=env("NEXT_PUBLIC_SITE_URL","next_public_site_url")||"https://www.fragmentun.com";
  const structuredData=[
    {
      "@context":"https://schema.org",
      "@type":"Book",
      name:locale==="es"?"FRAGMENTUN I: El Despertar Emocional":"FRAGMENTUN I: The Emotional Awakening",
      author:{"@type":"Person",name:"José Liranzo"},
      inLanguage:locale,
      url:`${site}/${locale}`,
      image:`${site}/fragmentun-i-cover-es.jpg`,
      sameAs:["https://www.amazon.com/dp/B0HBLTHT8S",patreonUrl,...socialItems.map(x=>x.url).filter(Boolean)],
      publisher:{"@type":"Organization",name:"LIRYGAMES STUDIOS"}
    },
    {
      "@context":"https://schema.org",
      "@type":"Person",
      name:"José Liranzo",
      url:`${site}/${locale}#autor`,
      worksFor:{"@type":"Organization",name:"LIRYGAMES STUDIOS"},
      sameAs:socialItems.map(x=>x.url).filter(Boolean)
    },
    {
      "@context":"https://schema.org",
      "@type":"WebSite",
      name:"FRAGMENTUN",
      url:site,
      inLanguage:["es","en"]
    }
  ];

  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData)}}/>
    <PageView locale={locale}/>
    <MotionEffects/>
    <PublicHeader locale={locale} amazonUrl={amazonUrl} patreonUrl={patreonUrl}/>

    <main>
      <section className="hero">
        <div className="container heroGrid">
          <div className="approvedLandingHeroCopy">
            <div className="kicker">{locale==="es"?"FRAGMENTUN I · EL DESPERTAR EMOCIONAL":"FRAGMENTUN I · THE EMOTIONAL AWAKENING"}</div>
            <h1>{hero.question||t.heroQuestion}</h1>
            <p className="lead">{hero.body||t.heroBody}</p>

            <div className="heroActions">
              {amazonUrl
                ?<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{book:"fragmentun-i",edition_locale:locale,marketplace:firstBook?.marketplace||"amazon.com"}} newTab>{hero.primary_cta||t.buy}</TrackLink>
                :<span className="btn btnGhost">{locale==="es"?"Edición en este idioma: próximamente":"Edition in this language: coming soon"}</span>}
              <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale}>{hero.secondary_cta||t.chapter}</TrackLink>
            </div>
          </div>

          <div>
            <div className="bookStage">
              {locale==="es"
                ? <img
                  className="officialBookCover"
                  src="/fragmentun-i-cover-es.jpg"
                  alt="Portada oficial de FRAGMENTUN I: El Despertar Emocional de José Liranzo"
                  width={1200}
                  height={1800}
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                : <div className="bookPlaceholder"><div><strong>FRAGMENTUN I</strong><p>{t.officialCover}</p></div></div>}
            </div>
            <p className="note">{locale==="es"?"Portada oficial de la edición publicada.":"English edition cover coming soon."}</p>
          </div>
        </div>
      </section>

      <FrontDiscovery locale={locale} amazonUrl={amazonUrl} shareReward={shareReward}/>

      <section className="masterAuthorBand" id="autor">
        <div className="container masterAuthorGrid">
          <div className="masterAuthorCopy">
            <div className="kicker">{locale==="es"?"José Liranzo · El autor":"José Liranzo · The author"}</div>
            <h2>José Liranzo</h2>
            <p className="lead">{locale==="es"
              ?"Creo en el poder de las historias para despertar lo que sentimos, cuestionar lo que somos y construir mundos más humanos."
              :"I believe in the power of stories to awaken what we feel, question who we are, and build more human worlds."}</p>
            <a className="btn btnPrimary" href="#historia">{locale==="es"?"Conoce mi historia":"Meet the author"}</a>
          </div>
          <div className="masterAuthorPortrait" aria-hidden="true"><span>JL</span></div>
          <blockquote>FRAGMENTUN<br/>{locale==="es"
            ?"nace de una pregunta que aún me acompaña: ¿y si sentir fuera el acto más peligroso del mundo?"
            :"was born from a question that still follows me: what if feeling were the most dangerous act in the world?"}</blockquote>
        </div>
      </section>

      <section className="section masterWhySection" id="historia">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{why.title||t.why}</div>
            <h2>{why.title||t.why}</h2>
            <p className="lead">{why.body||t.whyBody}</p>
          </div>

          <div className="grid4">
            {(why.cards||[
              {title:locale==="es"?"Historia":"Story",body:locale==="es"?"Una sociedad que sobrevivió aprendiendo a controlar aquello que la hacía impredecible.":"A society that survived by learning to control what made it unpredictable."},
              {title:locale==="es"?"Personajes":"Characters",body:locale==="es"?"Elyon Voss convierte el conflicto social en una experiencia íntima.":"Elyon Voss turns social conflict into an intimate experience."},
              {title:locale==="es"?"Un mundo vivo":"A living world",body:locale==="es"?"Lumen y sus sistemas revelan el costo de una paz diseñada.":"Lumen and its systems reveal the cost of engineered peace."},
              {title:locale==="es"?"Temas":"Themes",body:locale==="es"?"Identidad, libertad, emoción y el costo humano del control.":"Identity, freedom, emotion and the human cost of control."}
            ]).map((c:any,index:number)=><article className={`card whyCard whyCard${index+1}`} key={c.title}>
              <div className="whyCardVisual" aria-hidden="true"/>
              <div className="whyCardCopy">
                <h3>{c.title}</h3>
                <p>{c.body}</p>
                <span className="whyCardArrow" aria-hidden="true">→</span>
              </div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="section masterLumenSection" id="lumen">
        <div className="container split">
          <div className="lumenMasterCopy">
            <div className="kicker">LUMEN</div>
            <h2>LUMEN</h2>
            <h3>{locale==="es"?"UNA CIUDAD, MIL EMOCIONES":"ONE CITY, A THOUSAND EMOTIONS"}</h3>
            <p className="lead">{lumen.body||(locale==="es"
              ?"Explora la ciudad donde las emociones son poder, memoria y resistencia."
              :"Explore the city where emotions are power, memory and resistance.")}</p>
            <TrackLink className="btn btnPrimary" href={`/${locale}/mapa`} eventName="map_interaction" locale={locale}>
              {locale==="es"?"Explorar el Mapa de Lumen →":"Explore the Map of Lumen →"}
            </TrackLink>
          </div>
        </div>
      </section>

      <section className="section masterChapterSection" id="capitulo">
        <div className="container">
          <div className="formPanel">
            <div className="sectionIntro">
              <div className="kicker">{chapter.title||t.chapterTitle}</div>
              <h2>{chapter.title||t.chapterTitle}</h2>
              <p className="lead">{chapter.body||t.chapterBody}</p>
            </div>
            {signup&&<div className="formNotice" role="status">
              {signup==="invalid"
                ?(locale==="es"?"Revisa el correo electrónico e inténtalo de nuevo.":"Check your email address and try again.")
                :signup==="consent"
                  ?(locale==="es"?"Debes aceptar el consentimiento para recibir el Capítulo 1 por correo.":"You must accept consent to receive Chapter 1 by email.")
                  :(locale==="es"?"No pudimos guardar tu registro. Inténtalo nuevamente.":"We couldn't save your signup. Please try again.")}
            </div>}
            <ChapterLeadExperiment locale={locale} nameLabel={t.name} emailLabel={t.email} defaultLabel={chapter.cta||t.send}/>
            <p className="note">{chapter.privacy||(locale==="es"?"Tu idioma se guardará para que recibas la secuencia correcta.":"Your language will be preserved so you receive the correct sequence.")}</p>
          </div>
        </div>
      </section>

      <section className="section masterSagaSection" id="saga">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"La saga":"The saga"}</div>
            <h2>{locale==="es"?"Un universo que apenas comienza":"A universe that is only beginning"}</h2>
          </div>

          <div className="grid3">
            {publicBooks.map((b:any)=><article className="card sagaCard" key={b.slug}>
              <div className="sagaMark">{locale==="es"?b.title_es:b.title_en}</div>
              <h3>{locale==="es"?b.subtitle_es:b.subtitle_en}</h3>
              <p>{b.edition_status==="published"?(locale==="es"?"Publicado":"Published"):(locale==="es"?"Próximamente":"Coming soon")}</p>
              {b.edition_status==="published"&&b.amazon_url&&
                <TrackLink className="btn btnPrimary" href={b.amazon_url} eventName="amazon_click" locale={locale} metadata={{book:b.slug,edition_locale:locale,marketplace:b.marketplace||"amazon.com"}} newTab>{t.buy}</TrackLink>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="section newsSection" id="noticias">
        <div className="container">
          <div className="newsHeader">
            <div>
              <div className="kicker">{locale==="es"?"Noticias del Universo":"Universe news"}</div>
              <h2>{locale==="es"?"Últimas transmisiones desde Lumen":"Latest transmissions from Lumen"}</h2>
              <p className="lead">{locale==="es"
                ?"Novedades editoriales, experiencias interactivas y avances del universo FRAGMENTUN."
                :"Editorial updates, interactive experiences and developments from the FRAGMENTUN universe."}</p>
            </div>
            <span className="newsSignal">● {locale==="es"?"TRANSMISIÓN ACTIVA":"LIVE TRANSMISSION"}</span>
          </div>

          <div className="newsGrid">
            <article className="newsCard featured">
              <div className="newsVisual bookNews"><img src="/fragmentun-i-cover-es.jpg" alt="FRAGMENTUN I"/></div>
              <div className="newsCopy">
                <span>{locale==="es"?"PUBLICACIÓN":"RELEASE"}</span>
                <h3>{locale==="es"?"FRAGMENTUN I ya está disponible":"FRAGMENTUN I is now available"}</h3>
                <p>{locale==="es"
                  ?"El Despertar Emocional abre oficialmente las puertas de Lumen a los lectores."
                  :"The Emotional Awakening officially opens the gates of Lumen to readers."}</p>
                {amazonUrl&&<TrackLink className="newsLink" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{placement:"news",book:"fragmentun-i"}} newTab>
                  {locale==="es"?"Ver edición disponible →":"View available edition →"}
                </TrackLink>}
              </div>
            </article>

            <article className="newsCard">
              <div className="newsVisual lumenNews"/>
              <div className="newsCopy">
                <span>{locale==="es"?"EXPERIENCIA":"EXPERIENCE"}</span>
                <h3>{locale==="es"?"Lumen se abre a la exploración":"Lumen opens for exploration"}</h3>
                <p>{locale==="es"
                  ?"El mapa interactivo evoluciona hacia una experiencia 3D con territorios y puntos narrativos."
                  :"The interactive map is evolving into a 3D experience with territories and narrative points."}</p>
                <a className="newsLink" href={`/${locale}/mapa`}>{locale==="es"?"Explorar el mapa →":"Explore the map →"}</a>
              </div>
            </article>

            <article className="newsCard">
              <div className="newsVisual testNews"/>
              <div className="newsCopy">
                <span>{locale==="es"?"INTERACTIVO":"INTERACTIVE"}</span>
                <h3>{locale==="es"?"¿Qué emoción domina tu perfil?":"Which emotion shapes your profile?"}</h3>
                <p>{locale==="es"
                  ?"El Test Emocional conecta tus respuestas con los arquetipos de FRAGMENTUN."
                  :"The Emotional Test connects your answers with FRAGMENTUN archetypes."}</p>
                <a className="newsLink" href={`/${locale}/test`}>{locale==="es"?"Hacer el test →":"Take the test →"}</a>
              </div>
            </article>
          </div>
        </div>
      </section>

      <div className="masterDualRow container">
        <section className="masterInteractiveSection" id="test">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Test emocional":"Emotional test"}</div>
            <h2>{locale==="es"?"Descubre tu perfil en el universo FRAGMENTUN":"Discover your profile in the FRAGMENTUN universe"}</h2>
            <p className="lead">{locale==="es"?"12 preguntas · 5 arquetipos · resultados personalizados.":"12 questions · 5 archetypes · personalized results."}</p>
            <a className="btn btnPrimary" href={`/${locale}/test`}>{locale==="es"?"Hacer el Test":"Take the Test"}</a>
          </div>
        </section>

        <section className="masterMapSection" id="mapa">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Mapa interactivo de Lumen":"Interactive map of Lumen"}</div>
            <h2>{locale==="es"?"Explora los territorios. Descubre sus secretos.":"Explore the territories. Discover their secrets."}</h2>
            <p className="lead">{locale==="es"?"Vorax, Ethelis, Umbral y Nara te esperan dentro de Lumen.":"Vorax, Ethelis, Umbral and Nara await inside Lumen."}</p>
            <a className="btn btnPrimary" href={`/${locale}/mapa`}>{locale==="es"?"Abrir el Mapa":"Open the Map"}</a>
          </div>
        </section>
      </div>

      <div className="masterCommunityRow container">
        <section className="masterCommunitySection" id="comunidad-publica">
          <div className="kicker">{locale==="es"?"Comunidad FRAGMENTUN":"FRAGMENTUN community"}</div>
          <h2>{locale==="es"?"Únete a quienes sienten, cuestionan y exploran más allá de lo evidente.":"Join those who feel, question and explore beyond the obvious."}</h2>
          <p className="lead">{locale==="es"
            ?"Sigue la evolución de la saga, comparte el universo y acompaña las próximas historias."
            :"Follow the saga's evolution, share the universe and join the stories to come."}</p>
          <SocialLinks locale={locale} items={socialItems} placement="community_section"/>
          <div className="communityActions">
            {facebookCommunityUrl&&<TrackLink
              className="btn btnPrimary"
              href={facebookCommunityUrl}
              eventName="community_click"
              locale={locale}
              metadata={{network:"facebook_group",placement:"community_cta"}}
              newTab
            >{locale==="es"?"Unirme a la Comunidad":"Join the Community"}</TrackLink>}
            <TrackLink
              className="btn btnPatreon"
              href={patreonUrl}
              eventName="patreon_click"
              locale={locale}
              metadata={{placement:"community_section",creator:"sagaFragmentun"}}
              newTab
            >{locale==="es"?"APOYAR FRAGMENTUN EN PATREON":"SUPPORT FRAGMENTUN ON PATREON"}</TrackLink>
          </div>
        </section>

        <section className="masterReviewsPanel" id="lectores">
          <div className="kicker">{locale==="es"?"Lo que dicen los lectores":"What readers say"}</div>
          <ReviewsShowcase locale={locale} reviews={reviews as any[]}/>
        </section>
      </div>

      <section className="ctaFinal">
        <div className="container finalCtaMaster">
          <div className="kicker">{locale==="es"?"EL DESPERTAR YA COMENZÓ":"THE AWAKENING HAS BEGUN"}</div>
          <h2>{locale==="es"?"Descubre FRAGMENTUN I y forma parte de esta historia.":"Discover FRAGMENTUN I and become part of this story."}</h2>
          <p>{locale==="es"
            ?"Entra en Lumen. Decide cuánto estás dispuesto a sentir."
            :"Enter Lumen. Decide how much you are willing to feel."}</p>
          <div className="heroActions">
            {amazonUrl&&<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{book:"fragmentun-i",edition_locale:locale,marketplace:firstBook?.marketplace||"amazon.com"}} newTab>{locale==="es"?"Comprar en Amazon →":"Buy on Amazon →"}</TrackLink>}
            <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale}>{locale==="es"?"Leer el Capítulo 1":"Read Chapter 1"}</TrackLink>
          </div>
        </div>
      </section>
    </main>

    <footer className="footer approvedFooter">
      <div className="container approvedFooterGrid">
        <div className="approvedFooterBrand">
          <strong>FRAGMENTUN</strong>
          <span>EL UNIVERSO</span>
          <p>{locale==="es"?"Historias para un mundo más consciente.":"Stories for a more conscious world."}</p>
          <SocialLinks locale={locale} items={socialItems} placement="footer"/>
        </div>
        <div className="approvedFooterCol">
          <h3>{locale==="es"?"Explora":"Explore"}</h3>
          <a href="#saga">{locale==="es"?"El Libro":"The Book"}</a>
          <a href="#lumen">{locale==="es"?"El Universo":"The Universe"}</a>
          <a href="#personajes">{locale==="es"?"Personajes":"Characters"}</a>
          <a href={`/${locale}/mapa`}>{locale==="es"?"Mapa de Lumen":"Map of Lumen"}</a>
        </div>
        <div className="approvedFooterCol">
          <h3>{locale==="es"?"Recursos":"Resources"}</h3>
          <a href={`/${locale}/test`}>{locale==="es"?"Test Emocional":"Emotional Test"}</a>
          <a href="#comunidad-publica">{locale==="es"?"Comunidad":"Community"}</a>
          <a href="#lectores">{locale==="es"?"Reseñas":"Reviews"}</a>
          <a href="#capitulo">{locale==="es"?"Capítulo 1":"Chapter 1"}</a>
        </div>
        <div className="approvedFooterCol">
          <h3>{locale==="es"?"Legal":"Legal"}</h3>
          <a href={`/${locale}/privacidad`}>{locale==="es"?"Política de Privacidad":"Privacy Policy"}</a>
          <span>{t.footer}</span>
        </div>
        <div className="approvedFooterJoin">
          <h3>{locale==="es"?"Únete al universo":"Join the universe"}</h3>
          <p>{locale==="es"?"Recibe novedades, arte y próximos capítulos.":"Receive news, artwork and upcoming chapters."}</p>
          <a className="btn btnPrimary" href="#capitulo">{locale==="es"?"Quiero entrar →":"Join →"}</a>
        </div>
      </div>
      <div className="container approvedFooterBottom">
        <span>© 2026 JOSÉ LIRANZO · FRAGMENTUN · {locale==="es"?"Todos los derechos reservados.":"All rights reserved."}</span>
        <span>{locale==="es"?"El despertar apenas comienza...":"The awakening is only beginning..."}</span>
      </div>
    </footer>
    <nav className="mobileBottomNav" aria-label={locale==="es"?"Navegación móvil":"Mobile navigation"}>
      <a href={`/${locale}`}><span>⌂</span><small>{locale==="es"?"Inicio":"Home"}</small></a>
      <a href="#historia"><span>◫</span><small>{locale==="es"?"Historia":"Story"}</small></a>
      <a href="#test"><span>◇</span><small>Test</small></a>
      <a href="#mapa"><span>⌖</span><small>{locale==="es"?"Mapa":"Map"}</small></a>
      <a href="#comunidad-publica"><span>♟</span><small>{locale==="es"?"Comunidad":"Community"}</small></a>
    </nav>
  </>;
}
