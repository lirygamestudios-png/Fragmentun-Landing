import Link from "next/link";
import { locales, type Locale } from "../../../lib/i18n";
import { notFound } from "next/navigation";

export default async function Gracias({params}:{params:Promise<{locale:string}>}) {
  const {locale: raw} = await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;

  return <main className="hero">
    <div className="container" style={{maxWidth:760,textAlign:"center"}}>
      <div className="kicker">FRAGMENTUN</div>
      <h1 style={{fontSize:"clamp(2.6rem,7vw,5rem)"}}>
        {locale==="es"?"Tu entrada a Lumen comienza aquí.":"Your journey into Lumen begins here."}
      </h1>
      <p className="lead">
        {locale==="es"
          ?"Gracias por registrarte. Revisa tu correo para recibir el Capítulo 1 y futuras comunicaciones de FRAGMENTUN."
          :"Thanks for signing up. Check your inbox for Chapter 1 and future FRAGMENTUN communications."}
      </p>
      <Link className="btn btnPrimary" href={`/${locale}`}>
        {locale==="es"?"Volver a FRAGMENTUN":"Back to FRAGMENTUN"}
      </Link>
    </div>
  </main>;
}
