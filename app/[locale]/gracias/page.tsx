import Link from "next/link";
import { locales, type Locale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
import { RegistrationAdvertisingTracker } from "../../../components/RegistrationAdvertisingTracker";
import { TrackLink } from "../../../components/TrackLink";

export default async function Gracias({
  params,
  searchParams
}:{
  params:Promise<{locale:string}>;
  searchParams:Promise<{delivery?:string}>;
}) {
  const [{locale: raw},{delivery}] = await Promise.all([params,searchParams]);
  if(!locales.includes(raw as Locale)) notFound();
  const locale = raw as Locale;
  const emailReady=delivery==="email";

  return <main className="hero">
    <RegistrationAdvertisingTracker locale={locale}/>
    <div className="container" style={{maxWidth:760,textAlign:"center"}}>
      <div className="kicker">FRAGMENTUN</div>
      <h1 style={{fontSize:"clamp(2.6rem,7vw,5rem)"}}>
        {locale==="es"?"Tu entrada a Lumen comienza aquí.":"Your journey into Lumen begins here."}
      </h1>
      <p className="lead">
        {emailReady
          ?(locale==="es"
            ?"Registro confirmado. Revisa tu correo para recibir el Capítulo 1 y las próximas comunicaciones de FRAGMENTUN."
            :"Signup confirmed. Check your inbox for Chapter 1 and upcoming FRAGMENTUN communications.")
          :(locale==="es"
            ?"Tu registro fue recibido correctamente. Tu acceso al Capítulo 1 quedará asociado a este correo mientras terminamos de activar la entrega automática."
            :"Your signup was received successfully. Your Chapter 1 access will remain associated with this email while automated delivery is being activated.")}
      </p>
      <div className="heroActions" style={{justifyContent:"center"}}>
        <TrackLink className="btn btnPrimary" href={`/${locale}/capitulo-1`} eventName="chapter_click" locale={locale} metadata={{placement:"thank_you"}}>
          {locale==="es"?"Leer el Capítulo 1 ahora":"Read Chapter 1 now"}
        </TrackLink>
        <Link className="btn btnSecondary" href={`/${locale}/test`}>
          {locale==="es"?"Descubrir mi perfil emocional":"Discover my emotional profile"}
        </Link>
        <Link className="btn btnGhost" href={`/${locale}`}>
          {locale==="es"?"Volver a FRAGMENTUN":"Back to FRAGMENTUN"}
        </Link>
      </div>
    </div>
  </main>;
}