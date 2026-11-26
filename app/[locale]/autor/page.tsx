import Link from "next/link";
import { notFound } from "next/navigation";
import { locales, type Locale } from "../../../lib/i18n";

export default async function AuthorPage({params}:{params:Promise<{locale:string}>}) {
  const {locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const es=raw==="es";
  const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com").replace(/\/$/,"");
  const authorData={
    "@context":"https://schema.org",
    "@type":"Person",
    "@id":`${site}/${raw}/autor#jose-liranzo`,
    name:"José Liranzo",
    url:`${site}/${raw}/autor`,
    image:`${site}/jose-liranzo.jpg`,
    knowsAbout:["FRAGMENTUN",es?"Ciencia ficción distópica":"Dystopian science fiction"]
  };
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(authorData)}}/>
    <main className="section">
      <div className="container" style={{maxWidth:980}}>
        <div className="kicker">FRAGMENTUN · {es?"EL AUTOR":"THE AUTHOR"}</div>
        <h1>{es?"José Liranzo, autor de FRAGMENTUN":"José Liranzo, Author of FRAGMENTUN"}</h1>
        <p className="lead">{es
          ?"Conoce al creador del universo de Lumen y de la saga FRAGMENTUN."
          :"Meet the creator of the world of Lumen and the FRAGMENTUN saga."}</p>
        <div className="card" style={{padding:24,marginTop:24}}>
          <div style={{display:"grid",gridTemplateColumns:"minmax(0,1fr)",gap:18}}>
            <img src="/jose-liranzo.jpg" alt={es?"José Liranzo, autor de FRAGMENTUN":"José Liranzo, author of FRAGMENTUN"} loading="lazy" width={400} height={400} style={{display:"block",maxWidth:"100%",height:"auto",borderRadius:12}} />
            <div>
              <h2>{es?"La historia detrás de FRAGMENTUN":"The story behind FRAGMENTUN"}</h2>
              <p>{es
                ?"FRAGMENTUN nace de una pregunta: ¿y si sentir fuera el acto más peligroso del mundo? En Lumen, las emociones están reguladas y Elyon Voss se enfrenta a un mundo donde sentir puede desafiar el orden establecido."
                :"FRAGMENTUN begins with a question: what if feeling were the most dangerous act in the world? In Lumen, emotions are regulated, and Elyon Voss faces a world where feeling can challenge the established order."}</p>
              <p>{es
                ?"José Liranzo presenta con FRAGMENTUN I: El Despertar Emocional el primer libro de una saga de cuatro novelas de ciencia ficción que explora la identidad, la emoción y la libertad."
                :"With FRAGMENTUN I: El Despertar Emocional, José Liranzo introduces the first book in a four-volume science-fiction saga exploring identity, emotion and freedom."}</p>
            </div>
          </div>
        </div>
        <section style={{marginTop:32}}>
          <h2>{es?"Explora FRAGMENTUN":"Explore FRAGMENTUN"}</h2>
          <p>{es
            ?"Entra en Lumen, descubre el universo narrativo y solicita el Capítulo 1 gratuito desde la página oficial."
            :"Enter Lumen, explore the fictional universe, and request the free first chapter on the official website."}</p>
          <div style={{display:"flex",flexWrap:"wrap",gap:12,marginTop:18}}>
            <Link className="btn btnPrimary" href={`/${raw}#capitulo`}>{es?"Leer el Capítulo 1":"Read Chapter 1"}</Link>
            <Link className="btn btnSecondary" href={`/${raw}/mapa`}>{es?"Explorar Lumen":"Explore Lumen"}</Link>
            <Link className="btn btnGhost" href={`/${raw}`}>{es?"Volver al inicio":"Back to home"}</Link>
          </div>
        </section>
      </div>
    </main>
  </>;
}