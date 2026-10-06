import Link from "next/link";
import { locales, type Locale } from "../../../lib/i18n";
import { notFound } from "next/navigation";
import { RegistrationAdvertisingTracker } from "../../../components/RegistrationAdvertisingTracker";
import { TrackLink } from "../../../components/TrackLink";
import { PageView } from "../../../components/PageView";

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
            ?"Registro confirmado. Tu acceso al Capítulo 1 ya está disponible aquí. La secuencia de correos de FRAGMENTUN se activará cuando finalicemos la configuración de entrega."
            :"Signup confirmed. Your Chapter 1 access is available here now. The FRAGMENTUN email sequence will begin once delivery setup is finalized.")
          :(locale==="es"
            ?"Tu registro fue recibido correctamente. Puedes leer el Capítulo 1 ahora desde este dispositivo."
            :"Your signup was received successfully. You can read Chapter 1 now from this device.")}
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