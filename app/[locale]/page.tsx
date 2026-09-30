import { notFound } from "next/navigation";
import { PublicHeader } from "../../components/PublicHeader";
import { copy, locales, type Locale } from "../../lib/i18n";

export default async function Home({ params }:{ params:Promise<{locale:string}> }) {
  const { locale: raw } = await params;
  if (!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  const t = copy[locale];

  return (
    <>
      <PublicHeader locale={locale} />
      <main>
        <section className="hero">
          <div className="container heroGrid">
            <div>
              <div className="kicker">{t.heroKicker}</div>
              <h1>{t.title}</h1>
              <div className="kicker">{t.subtitle}</div>
              <p className="lead"><strong>{t.heroQuestion}</strong></p>
              <p className="lead">{t.heroBody}</p>
              <div className="heroActions">
                <a className="btn btnPrimary" href="https://www.amazon.com/dp/B0HBLTHT8S" target="_blank" rel="noreferrer">{t.buy}</a>
                <a className="btn btnSecondary" href="#capitulo">{t.chapter}</a>
              </div>
            </div>
            <div>
              <div className="bookStage">
                <div className="bookPlaceholder">
                  <div>
                    <strong>FRAGMENTUN I</strong>
                    <p>{t.officialCover}</p>
                  </div>
                </div>
              </div>
              <p className="note">{t.officialCoverNote}</p>
            </div>
          </div>
        </section>

        <section className="section" id="historia">
          <div className="container">
            <div className="sectionIntro">
              <div className="kicker">{t.why}</div><h2>{t.why}</h2><p className="lead">{t.whyBody}</p>
            </div>
            <div className="grid3">
              <article className="card"><h3>{locale==="es"?"Historia":"Story"}</h3><p>{locale==="es"?"Una sociedad que sobrevivió aprendiendo a controlar aquello que la hacía impredecible.":"A society that survived by learning to control what made it unpredictable."}</p></article>
              <article className="card"><h3>{locale==="es"?"Personajes":"Characters"}</h3><p>{locale==="es"?"Elyon Voss convierte el conflicto social en una experiencia íntima.":"Elyon Voss turns social conflict into an intimate experience."}</p></article>
              <article className="card"><h3>{locale==="es"?"Temas":"Themes"}</h3><p>{locale==="es"?"Identidad, libertad, emoción y el costo humano del control.":"Identity, freedom, emotion and the human cost of control."}</p></article>
            </div>
          </div>
        </section>

        <section className="section" id="lumen">
          <div className="container">
            <div className="sectionIntro"><div className="kicker">{t.lumen}</div><h2>{t.lumen}</h2><p className="lead">{t.lumenBody}</p></div>
            <div className="grid3">
              <div className="card"><h3>RN</h3><p>{locale==="es"?"Regulación emocional convertida en arquitectura social.":"Emotional regulation turned into social architecture."}</p></div>
              <div className="card"><h3>{locale==="es"?"Sensitivos":"Sensitives"}</h3><p>{locale==="es"?"Quienes sienten más allá de los límites permitidos.":"Those who feel beyond permitted limits."}</p></div>
              <div className="card"><h3>{locale==="es"?"Fragmentados":"Fragmented"}</h3><p>{locale==="es"?"Cuando la emoción empieza a quebrar el orden establecido.":"When emotion begins to fracture the established order."}</p></div>
            </div>
          </div>
        </section>

        <section className="band"><div className="container grid4">
          <div className="territory"><strong>Vorax</strong><span>{locale==="es"?"Ira":"Anger"}</span></div>
          <div className="territory"><strong>Umbral</strong><span>{locale==="es"?"Miedo":"Fear"}</span></div>
          <div className="territory"><strong>Ethelis</strong><span>{locale==="es"?"Esperanza":"Hope"}</span></div>
          <div className="territory"><strong>Nara</strong><span>{locale==="es"?"Potencial":"Potential"}</span></div>
        </div></section>

        <section className="section" id="test"><div className="container">
          <div className="sectionIntro"><div className="kicker">{locale==="es"?"Experiencia interactiva":"Interactive experience"}</div><h2>{locale==="es"?"Test emocional FRAGMENTUN":"FRAGMENTUN emotional test"}</h2><p className="lead">{locale==="es"?"12 preguntas narrativas y cinco perfiles emocionales conectados al universo.":"12 narrative questions and five emotional profiles connected to the universe."}</p></div>
          <a className="btn btnGhost" href="#">{locale==="es"?"Próximamente":"Coming soon"}</a>
        </div></section>

        <section className="section" id="mapa"><div className="container">
          <div className="sectionIntro"><div className="kicker">{locale==="es"?"Exploración":"Exploration"}</div><h2>{locale==="es"?"Mapa interactivo de Lumen":"Interactive map of Lumen"}</h2><p className="lead">{locale==="es"?"Territorios, puntos de interés y eventos narrativos con navegación visual.":"Territories, landmarks and narrative events with visual navigation."}</p></div>
          <div className="card">{locale==="es"?"Módulo SVG interactivo en desarrollo.":"Interactive SVG module in development."}</div>
        </div></section>

        <section className="section" id="capitulo"><div className="container"><div className="formPanel">
          <div className="sectionIntro"><div className="kicker">{t.chapterTitle}</div><h2>{t.chapterTitle}</h2><p className="lead">{t.chapterBody}</p></div>
          <form className="formGrid" action={`/${locale}/gracias`} method="get">
            <input name="name" placeholder={t.name} required />
            <input name="email" type="email" placeholder={t.email} required />
            <button className="btn btnPrimary" type="submit">{t.send}</button>
          </form>
          <p className="note">{locale==="es"?"MailerLite se conectará antes de activar tráfico pagado.":"MailerLite will be connected before paid traffic is activated."}</p>
        </div></div></section>

        <section className="section" id="autor"><div className="container">
          <div className="sectionIntro"><div className="kicker">{locale==="es"?"Autor":"Author"}</div><h2>{t.author}</h2><p className="lead">{t.authorBody}</p></div>
        </div></section>
      </main>
      <footer className="footer"><div className="container footerGrid"><span>© 2026 José Liranzo · FRAGMENTUN</span><span>{t.footer}</span></div></footer>
    </>
  );
}