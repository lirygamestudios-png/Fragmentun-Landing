import type { Metadata } from "next";
import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { cookies } from "next/headers";
import { locales,type Locale } from "../../../lib/i18n";
import { TrackLink } from "../../../components/TrackLink";
import {ChapterReadTracker} from "../../../components/ChapterReadTracker";
import {chapterAccessCookieName,verifyChapterAccessToken} from "../../../lib/chapter-access";

export const metadata:Metadata={
  title:"Capítulo 1 · FRAGMENTUN I",
  robots:{index:false,follow:false}
};

const paragraphs=[
  "La ciudad de Lumen respiraba con el ritmo mecánico de un corazón artificial. Desde su ventana en el piso 187, Elyon Voss observaba el amanecer. En sus muñecas, bajo los guantes, las finas líneas doradas palpitaban suavemente. Siempre lo habían hecho, desde que tenía memoria. Los médicos del Consejo lo llamaban «Trastorno de Resonancia Afectiva Grado 1». El joven lo llamaba su maldición privada. Porque él sentía lo que otros sentían. No porque quisiera. No porque pudiera evitarlo.",
  "Si una mujer en el tren lloraba en silencio, sus propias mejillas se humedecían. Si un hombre reía en una esquina, su pecho se llenaba de una alegría que no le pertenecía. Era como vivir dentro de una habitación con paredes de papel: todos los gritos, susurros y canciones del mundo se filtraban hacia él.",
  "Los supresores ayudaban. Dos pastillas azules al día amortiguaban el torrente. Pero últimamente, los muros tenían fugas.",
  "—Tu ruta está optimizada —dijo la voz sintética del apartamento—. Tiempo estimado: cuatro horas, doce minutos. Nivel de supresión recomendado: estándar.",
  "Tomó tres pastillas azules en lugar de una. El sabor a menta industrial se disolvió en su lengua, seguido por el vacío familiar, ese amortiguador entre él y el mundo. Pero últimamente, el vacío tenía fugas.",
  "En la calle, la multitud se movía como un organismo único. Rostros neutrales, pasos sincronizados, ojos que nunca se encontraban. El mensajero se unió al flujo, su mochila cargada con paquetes de resonancia emocional. Pequeños contenedores esféricos que brillaban débilmente, conteniendo lo que quedaba de lo que alguna vez fue alegría, tristeza, ira... destiladas y neutralizadas para estudio en la Base de Pureza.",
  "Mientras caminaba, sintió el zumbido sordo de la ciudad. No un sonido, sino una sensación. Como si Lumen fuera un gigante dormido y él pudiera sentir su respiración a través del hormigón. Eso era nuevo. Como las líneas doradas.",
  "En el distrito financiero, entregó su primer paquete. La recepcionista, una mujer de exactamente cuarenta y dos años según su placa, extendió la mano sin mirarlo. En el instante en que sus dedos casi se tocaron, Elyon sintió el vacío habitual de los empleados de oficina: no ausencia de emociones, sino una supresión tan perfecta que parecía muerte en vida.",
  "Pero entonces, apareció un paquete diferente.",
  "Era una esfera de vidrio esmerilado, más pesada que las demás. En la etiqueta, un nombre: Dra. Kaelis Vorm — Base de Pureza — Nivel Restringido 9.",
  "Cuando sus dedos rozaron la superficie, sintió algo que nunca había experimentado antes. No era una emoción prestada de un extraño. Era un eco, una huella dejada a propósito. Como si la remitente hubiera impregnado el cristal con su propia esencia.",
  "Pasión. Dolor. Un amor tan profundo que dolía físicamente. Y debajo de todo, una pregunta: «¿Y si pudiéramos sentir sin miedo?».",
  "Elyon apartó la mano rápidamente, jadeando. Las líneas doradas en sus muñecas ardieron.",
  "—¿Estás bien? —preguntó la recepcionista con voz plana.",
  "—Sí —mintió él—. Solo... interferencia estática.",
  "Pero no era estática. Era una invitación. Y aunque aún no lo sabía, esa esfera contenía el primer susurro de todo lo que estaba por venir. El nombre de Kaelis Vorm se grabó en su memoria como una brasa."
];

export default async function ChapterOne({params}:{params:Promise<{locale:string}>}){
  const {locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const cookieStore=await cookies();
  const access=verifyChapterAccessToken(cookieStore.get(chapterAccessCookieName())?.value);
  if(!access)redirect(`/${locale}?signup=required#capitulo`);
  const patreonUrl=process.env.NEXT_PUBLIC_PATREON_URL||"https://patreon.com/sagaFragmentun?utm_source=fragmentun&utm_medium=website&utm_campaign=patreon_support&utm_content=chapter_end";

  if(locale==="en"){
    return <main className="section">
    <ChapterReadTracker locale={locale}/><div className="container" style={{maxWidth:760,textAlign:"center"}}>
      <div className="kicker">FRAGMENTUN I</div>
      <h1>Chapter 1</h1>
      <p className="lead">The English reading sample is being prepared. The published Spanish edition is currently available.</p>
      <Link className="btn btnGhost" href="/en">Back to FRAGMENTUN</Link>
    </div></main>;
  }

  return <main className="section">
    <ChapterReadTracker locale={locale}/>
    <article className="container chapterReader">
      <div className="kicker">FRAGMENTUN I · EL DESPERTAR EMOCIONAL</div>
      <h1>CAPÍTULO 1: EL SILENCIO PERFECTO</h1>
      <p className="chapterTime">—48 horas antes del Pulso</p>

      <div className="chapterBody">
        {paragraphs.map((p,i)=><p key={i}>{p}</p>)}
      </div>

      <div className="chapterEnd card">
        <div className="kicker">Fin de la muestra</div>
        <h2>El despertar apenas comienza.</h2>
        <p>Continúa la historia completa de Elyon Voss en la edición publicada de FRAGMENTUN I.</p>
        <div className="heroActions">
          <TrackLink
            className="btn btnPrimary"
            href="https://www.amazon.com/dp/B0HBLTHT8S"
            eventName="amazon_click"
            locale="es"
            metadata={{book:"fragmentun-i",placement:"chapter_end",marketplace:"amazon.com"}}
            newTab
          >
            Continuar en Amazon
          </TrackLink>
          <TrackLink
            className="btn btnPatreon"
            href={patreonUrl}
            eventName="patreon_click"
            locale="es"
            metadata={{placement:"chapter_end",creator:"sagaFragmentun"}}
            newTab
          >
            Patrocinar FRAGMENTUN
          </TrackLink>
          <Link className="btn btnGhost" href="/es">Volver a FRAGMENTUN</Link>
        </div>
      </div>

      <p className="note" style={{textAlign:"center",marginTop:24}}>
        © 2026 José Liranzo · Todos los derechos reservados.
      </p>
    </article>
  </main>;
}