export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PublicHeader } from "../../components/PublicHeader";
import { LeadForm } from "../../components/LeadForm";
import { TrackLink } from "../../components/TrackLink";
import { PageView } from "../../components/PageView";
import { MotionEffects } from "../../components/MotionEffects";
import { copy,locales,type Locale } from "../../lib/i18n";
import { getBooks,getLocalizedContent } from "../../lib/content";
import { fragmentunCoverEs } from "../../lib/officialAssets";

export default async function Home({params}:{params:Promise<{locale:string}>}){
  const{locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const t=copy[locale];

  const[cms,books]=await Promise.all([
    getLocalizedContent(locale),
    getBooks(locale)
  ]);

  const hero=cms["home.hero"]||{};
  const why=cms["home.why"]||{};
  const lumen=cms["home.lumen"]||{};
  const chapter=cms["home.chapter"]||{};
  const finalCta=cms["home.final_cta"]||{};

  const firstBook=(books as any[]).find((b:any)=>b.slug==="fragmentun-i")||(books as any[])[0];
  const amazonUrl=firstBook?.edition_status==="published"?firstBook?.amazon_url:null;

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

  return <>
    <PageView locale={locale}/>
    <MotionEffects/>
    <PublicHeader locale={locale} amazonUrl={amazonUrl}/>

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
                ?<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} newTab>{hero.primary_cta||t.buy}</TrackLink>
                :<span className="btn btnGhost">{locale==="es"?"Edición en este idioma: próximamente":"Edition in this language: coming soon"}</span>}
              <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale}>{hero.secondary_cta||t.chapter}</TrackLink>
            </div>
          </div>

          <div>
            <div className="bookStage">
              {locale==="es"
                ? <img className="officialBookCover" src={fragmentunCoverEs} alt="Portada oficial de FRAGMENTUN I: El Despertar Emocional de José Liranzo"/>
                : <div className="bookPlaceholder"><div><strong>FRAGMENTUN I</strong><p>{t.officialCover}</p></div></div>}
            </div>
            <p className="note">{locale==="es"
              ? "Portada oficial de la edición publicada."
              : "English edition cover coming soon."}</p>
          </div>
        </div>
      </section>

      <section className="section" id="historia">
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

      <section className="section" id="lumen">
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

      <section className="section" id="capitulo">
        <div className="container">
          <div className="formPanel">
            <div className="sectionIntro">
              <div className="kicker">{chapter.title||t.chapterTitle}</div>
              <h2>{chapter.title||t.chapterTitle}</h2>
              <p className="lead">{chapter.body||t.chapterBody}</p>
            </div>
            <LeadForm locale={locale} nameLabel={t.name} emailLabel={t.email} submitLabel={chapter.cta||t.send}/>
            <p className="note">{chapter.privacy||(locale==="es"?"Tu idioma se guardará para que recibas la secuencia correcta.":"Your language will be preserved so you receive the correct sequence.")}</p>
          </div>
        </div>
      </section>

      <section className="section" id="saga">
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
                <TrackLink className="btn btnPrimary" href={b.amazon_url} eventName="amazon_click" locale={locale} newTab>{t.buy}</TrackLink>}
            </article>)}
          </div>
        </div>
      </section>

      <section className="section" id="test">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Experiencia interactiva":"Interactive experience"}</div>
            <h2>{locale==="es"?"Descubre tu perfil emocional":"Discover your emotional profile"}</h2>
            <p className="lead">{locale==="es"?"12 preguntas narrativas y cinco perfiles conectados al universo FRAGMENTUN.":"12 narrative questions and five profiles connected to the FRAGMENTUN universe."}</p>
            <a className="btn btnSecondary" href={`/${locale}/test`}>{locale==="es"?"Hacer el test":"Take the test"}</a>
          </div>
        </div>
      </section>

      <section className="section" id="mapa">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Exploración":"Exploration"}</div>
            <h2>{locale==="es"?"Mapa interactivo de Lumen":"Interactive map of Lumen"}</h2>
            <p className="lead">{locale==="es"?"Territorios, puntos de interés y eventos narrativos con navegación visual.":"Territories, landmarks and narrative events with visual navigation."}</p>
            <a className="btn btnGhost" href={`/${locale}/mapa`}>{locale==="es"?"Abrir el mapa":"Open the map"}</a>
          </div>
        </div>
      </section>

      <section className="section" id="autor">
        <div className="container">
          <div className="sectionIntro">
            <div className="kicker">{locale==="es"?"Autor":"Author"}</div>
            <h2>{t.author}</h2>
            <p className="lead">{t.authorBody}</p>
          </div>
        </div>
      </section>

      <section className="ctaFinal">
        <div className="container">
          <div className="kicker">{finalCta.eyebrow||(locale==="es"?"El despertar ya comenzó":"The awakening has begun")}</div>
          <h2>{finalCta.title||(locale==="es"?"Entra en Lumen. Decide cuánto estás dispuesto a sentir.":"Enter Lumen. Decide how much you are willing to feel.")}</h2>
          <div className="heroActions">
            {amazonUrl&&<TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} newTab>{finalCta.primary_cta||t.buy}</TrackLink>}
            <TrackLink className="btn btnSecondary" href="#capitulo" eventName="chapter_click" locale={locale}>{finalCta.secondary_cta||t.chapter}</TrackLink>
          </div>
        </div>
      </section>
    </main>

    <footer className="footer">
      <div className="container footerGrid">
        <span>© 2026 José Liranzo · FRAGMENTUN</span>
        <span>{t.footer}</span>
      </div>
    </footer>
  </>;
}
