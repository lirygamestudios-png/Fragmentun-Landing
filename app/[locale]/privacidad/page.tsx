import Link from "next/link";
import { notFound } from "next/navigation";
import { locales,type Locale } from "../../../lib/i18n";

export default async function Privacy({params}:{params:Promise<{locale:string}>}){
  const {locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const es=locale==="es";

  return <main className="section">
    <div className="container" style={{maxWidth:900}}>
      <div className="kicker">FRAGMENTUN</div>
      <h1>{es?"Política de privacidad":"Privacy Policy"}</h1>
      <p className="lead">
        {es
          ?"Esta página explica qué información recoge FRAGMENTUN a través de este sitio y cómo se utiliza."
          :"This page explains what information FRAGMENTUN collects through this website and how it is used."}
      </p>

      <div className="card privacyCard">
        <h2>{es?"Información que recopilamos":"Information we collect"}</h2>
        <p>{es
          ?"Cuando te registras para recibir el Capítulo 1, podemos guardar tu correo electrónico, nombre si decides proporcionarlo, idioma, datos de campaña (UTM), fecha del registro y evidencia de tu consentimiento."
          :"When you sign up to receive Chapter 1, we may store your email address, name if you choose to provide it, language, campaign data (UTM), signup date, and evidence of your consent."}</p>

        <h2>{es?"Para qué la utilizamos":"How we use it"}</h2>
        <p>{es
          ?"Usamos estos datos para entregar el contenido solicitado, enviarte comunicaciones de FRAGMENTUN que hayas aceptado recibir, medir el rendimiento del sitio y entender qué campañas generan registros y clics hacia la página oficial del libro en Amazon."
          :"We use this data to deliver requested content, send FRAGMENTUN communications you agreed to receive, measure website performance, and understand which campaigns generate signups and clicks to the book's official Amazon page."}</p>

        <h2>{es?"Proveedores":"Service providers"}</h2>
        <p>{es
          ?"El sitio utiliza Supabase para almacenamiento y analítica propia. La entrega y automatización de correo puede realizarse mediante MailerLite cuando la integración esté activa. Los clics de compra pueden dirigirte a Amazon, cuya política de privacidad se aplica una vez que abandonas este sitio."
          :"The site uses Supabase for storage and first-party analytics. Email delivery and automation may be handled by MailerLite when the integration is active. Purchase clicks may take you to Amazon, whose privacy policy applies once you leave this site."}</p>

        <h2>{es?"Tus opciones":"Your choices"}</h2>
        <p>{es
          ?"Puedes dejar de recibir comunicaciones utilizando el enlace de baja incluido en los correos. También puedes solicitar acceso, corrección o eliminación de la información asociada a tu correo mediante los canales oficiales de contacto de FRAGMENTUN/LIRYGAMES STUDIOS."
          :"You can stop receiving communications using the unsubscribe link included in emails. You may also request access, correction, or deletion of information associated with your email through the official FRAGMENTUN/LIRYGAMES STUDIOS contact channels."}</p>

        <h2>{es?"Conservación y seguridad":"Retention and security"}</h2>
        <p>{es
          ?"Conservamos los datos solo mientras sean necesarios para las finalidades descritas o para cumplir obligaciones aplicables. Aplicamos controles técnicos de acceso y seguridad en la infraestructura utilizada por el sitio."
          :"We retain data only as long as needed for the purposes described or to meet applicable obligations. Technical access and security controls are applied to the infrastructure used by the site."}</p>

        <p className="note">{es?"Última actualización: 30 de septiembre de 2026.":"Last updated: September 30, 2026."}</p>
      </div>

      <div style={{marginTop:24}}>
        <Link className="btn btnGhost" href={`/${locale}`}>{es?"Volver a FRAGMENTUN":"Back to FRAGMENTUN"}</Link>
      </div>
    </div>
  </main>;
}