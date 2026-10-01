export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PublicHeader } from "../../components/PublicHeader";
import { ChapterLeadExperiment } from "../../components/ChapterLeadExperiment";
import { TrackLink } from "../../components/TrackLink";
import { PageView } from "../../components/PageView";
import { MotionEffects } from "../../components/MotionEffects";
import { SocialLinks } from "../../components/SocialLinks";
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

  const firstBook=(books as any[]).find((b:any)=>b.slug==="fragmentun-i")||(books as any[])[0];
  const amazonUrl=firstBook?.edition_status==="published"?firstBook?.amazon_url:null;
  const env=(upper:string,lower:string)=>process.env[upper]||process.env[lower]||"";
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
    }
  ];

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
          <div>
            <div className="kicker">{hero.eyebrow||t.heroKicker}</div>
            <h1>{hero.title||t.title}</h1>
            <div className="kicker">{hero.subtitle||t.subtitle}</div>
            <p className="lead"><strong>{hero.question||t.heroQuestion}</strong></p>
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

      <section className="masterValueStrip" aria-label={locale==="es"?"Valor de FRAGMENTUN":"FRAGMENTUN value"}>
        <div className="container masterValueGrid">
          <div><span>✦</span><strong>{locale==="es"?"Ciencia ficción emocional":"Emotional science fiction"}</strong></div>
          <div><span>◉</span><strong>{locale==="es"?"Un universo expansible":"An expandable universe"}</strong></div>
          <div><span>♙</span><strong>{locale==="es"?"Personajes inolvidables":"Unforgettable characters"}</strong></div>
          <div><span>↗</span><strong>{locale==="es"?"Ya disponible en Amazon":"Available now on Amazon"}</strong></div>
        </div>
      </section>

      <section className="masterAuthorBand" id="autor">
        <div className="container masterAuthorGrid">
          <div className="masterAuthorCopy">
            <div className="kicker">{locale==="es"?"José Liranzo · El autor":"José Liranzo · The author"}</div>
            <h2>José Liranzo</h2>
            <p className="lead">{locale==="es"
              ?"Creo en el poder de las historias para despertar lo que sentimos, cuestionar lo que somos y construir mundos más humanos."
              :"I believe in the power of stories to awaken what we feel, question who we are, and build more human worlds."}</p>
            <a className="btn btnPrimary" href="#autor-historia">{locale==="es"?"Conoce mi historia":"Meet the author"}</a>
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
            ]).map((c:any)=><article className="card" key={c.title}><h3>{c.title}</h3><p>{c.body}</p></article>)}
          </div>
        </div>
      </section>

      <section className="section masterLumenSection" id="lumen">
        <div className="container split">
          <div>
            <div className="kicker">{lumen.subtitle||t.lumen}</div>
            <h2>{lumen.title||t.lumen}</h2>
            <p className="lead">{lumen.body||t.lumenBody}</p>
            <TrackLink className="btn btnGhost" href={`/${locale}/mapa`} eventName="map_interaction" locale={locale}>
              {lumen.cta||(locale==="es"?"Explorar el mapa de Lumen":"Explore the map of Lumen")}
            </TrackLink>
          </div>

          <div className="worldPanel">
            <span>RN</span>
            <span>{locale==="es"?"Sensitivos":"Sensitives"}</span>
            <span>{locale==="es"?"Fragmentados":"Fragmented"}</span>
          </div>
        </div>
      </section>

      <section className="band">
        <div className="container grid4">
          <div className="territory"><strong>Vorax</strong><span>{locale==="es"?"Ira":"Anger"}</span></div>
          <div className="territory"><strong>Umbral</strong><span>{locale==="es"?"Miedo":"Fear"}</span></div>
          <div className="territory"><strong>Ethelis</strong><span>{locale==="es"?"Esperanza":"Hope"}</span></div>
          <div className="territory"><strong>Nara</strong><span>{locale==="es"?"Potencial":"Potential"}</span></div>
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
            {(books.length?books:fallbackBooks).map((b:any)=><article className="card sagaCard" key={b.slug}>
              <div className="sagaMark">{locale==="es"?b.title_es:b.title_en}</div>
              <h3>{locale==="es"?b.subtitle_es:b.subtitle_en}</h3>
              <p>{b.edition_status==="published"?(locale==="es"?"Publicado":"Published"):(locale==="es"?"Próximamente":"Coming soon")}</p>
              {b.edition_status==="published"&&b.amazon_url&&
                <TrackLink className="btn btnPrimary" href={b.amazon_url} eventName="amazon_click" locale={locale} metadata={{book:b.slug,edition_locale:locale,marketplace:b.marketplace||"amazon.com"}} newTab>{t.buy}</TrackLink>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="section masterInteractiveSection" id="test">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Experiencia interactiva":"Interactive experience"}</div>
            <h2>{locale==="es"?"Descubre tu perfil emocional":"Discover your emotional profile"}</h2>
            <p className="lead">{locale==="es"?"12 preguntas narrativas y cinco perfiles conectados al universo FRAGMENTUN.":"12 narrative questions and five profiles connected to the FRAGMENTUN universe."}</p>
            <a className="btn btnSecondary" href={`/${locale}/test`}>{locale==="es"?"Hacer el test":"Take the test"}</a>
          </div>
        </div>
      </section>

      <section className="section masterMapSection" id="mapa">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Exploración":"Exploration"}</div>
            <h2>{locale==="es"?"Mapa interactivo de Lumen":"Interactive map of Lumen"}</h2>
            <p className="lead">{locale==="es"?"Territorios, puntos de interés y eventos narrativos con navegación visual.":"Territories, landmarks and narrative events with visual navigation."}</p>
            <a className="btn btnGhost" href={`/${locale}/mapa`}>{locale==="es"?"Abrir el mapa":"Open the map"}</a>
          </div>
        </div>
      </section>

      {reviews.length>0&&<section className="section" id="lectores">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Lectores":"Readers"}</div>
            <h2>{locale==="es"?"Reseñas verificadas":"Verified reviews"}</h2>
            <p className="lead">{locale==="es"
              ?"Solo mostramos reseñas publicadas y marcadas como verificadas en el panel."
              :"Only reviews published and marked as verified in the admin panel are shown."}</p>
          </div>
          <div className="grid3">
            {reviews.map((r:any)=><article className="card reviewCard" key={r.id}>
              <div className="kicker">{r.source}</div>
              <p className="reviewQuote">“{r.body}”</p>
              <p className="note">{r.author_display|| (locale==="es"?"Lector verificado":"Verified reader")}</p>
              {r.source_url&&<a className="reviewSource" href={r.source_url} target="_blank" rel="noreferrer">{locale==="es"?"Ver fuente":"View source"}</a>}
            </article>)}
          </div>
        </div>
      </section>}

      <section className="section" id="patreon">
        <div className="container">
          <div className="supportPanel">
            <div>
              <div className="kicker">{locale==="es"?"Patrocina la saga":"Support the saga"}</div>
              <h2>{locale==="es"?"Ayuda a llevar FRAGMENTUN más lejos":"Help take FRAGMENTUN further"}</h2>
              <p className="lead">
                {locale==="es"
                  ?"Si quieres apoyar directamente el crecimiento de FRAGMENTUN, el desarrollo de nuevas historias, arte y experiencias del universo, puedes convertirte en patrocinador a través de Patreon."
                  :"If you want to directly support FRAGMENTUN's growth, new stories, art and experiences across the universe, you can become a supporter through Patreon."}
              </p>
            </div>
            <TrackLink
              className="btn btnPatreon"
              href={patreonUrl}
              eventName="patreon_click"
              locale={locale}
              metadata={{placement:"support_section",creator:"sagaFragmentun"}}
              newTab
            >
              {locale==="es"?"Apoyar FRAGMENTUN en Patreon":"Support FRAGMENTUN on Patreon"}
            </TrackLink>
          </div>
        </div>
      </section>

      <section className="section masterCommunitySection" id="comunidad-publica">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Redes sociales":"Social media"}</div>
            <h2>{locale==="es"?"Sigue FRAGMENTUN":"Follow FRAGMENTUN"}</h2>
            <p className="lead">{locale==="es"
              ?"Acompaña el desarrollo de la saga, nuevas imágenes, videos, avances y publicaciones."
              :"Follow the saga's development, new artwork, videos, previews and releases."}</p>
            <SocialLinks locale={locale} items={socialItems} placement="social_section"/>
          </div>
        </div>
      </section>

      {facebookCommunityUrl&&<section className="section" id="comunidad">
        <div className="container">
          <div className="supportPanel">
            <div>
              <div className="kicker">{locale==="es"?"Comunidad oficial":"Official community"}</div>
              <h2>{locale==="es"?"Únete a la comunidad FRAGMENTUN":"Join the FRAGMENTUN community"}</h2>
              <p className="lead">{locale==="es"
                ?"Conversa con otros lectores, comparte teorías y sigue de cerca la evolución de la saga."
                :"Talk with other readers, share theories and follow the saga's evolution closely."}</p>
            </div>
            <TrackLink
              className="btn btnSecondary"
              href={facebookCommunityUrl}
              eventName="community_click"
              locale={locale}
              metadata={{network:"facebook_group",placement:"community_cta"}}
              newTab
            >
              {locale==="es"?"Unirme a la comunidad":"Join the community"}
            </TrackLink>
          </div>
        </div>
      </section>}

      <section className="section masterAuthorStory" id="autor-historia">
        <div className="container split">
          <div>
            <div className="kicker">{locale==="es"?"El autor":"The author"}</div>
            <h2>{t.author}</h2>
            <p className="lead">{t.authorBody}</p>
          </div>
          <div className="masterAuthorSeal">
            <span>FRAGMENTUN</span>
            <strong>JOSÉ LIRANZO</strong>
            <small>LIRYGAMES STUDIOS</small>
          </div>
        </div>
      </section>

      <section className="ctaFinal">
        <div className="container">
          <div className="kicker">{finalCta.eyebrow||(locale==="es"?"El despertar ya comenzó":"The awakening has begun")}</div>
          <h2>{finalCta.title||(locale==="es"?"Entra en Lumen. Decide cuánto estás dispuesto a sentir.":"Enter Lumen. Decide how much you are willing to feel.")}</h2>
          <div className="heroActions">
            {amazonUrl&&<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{book:"fragmentun-i",edition_locale:locale,marketplace:firstBook?.marketplace||"amazon.com"}} newTab>{finalCta.primary_cta||t.buy}</TrackLink>}
            <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale}>{finalCta.secondary_cta||t.chapter}</TrackLink>
            <TrackLink className="btn btnPatreon" href={patreonUrl} eventName="patreon_click" locale={locale} metadata={{placement:"final_cta",creator:"sagaFragmentun"}} newTab>
              {locale==="es"?"Patrocinar en Patreon":"Support on Patreon"}
            </TrackLink>
          </div>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="container footerGrid">
        <span>© 2026 José Liranzo · FRAGMENTUN</span>
        <span>{t.footer}</span>
        <SocialLinks locale={locale} items={socialItems} placement="footer"/>
      </div>
    </footer>
  </>;
}
