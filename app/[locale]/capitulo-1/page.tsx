import type { Metadata } from "next";
import Link from "next/link";
import { notFound,redirect } from "next/navigation";
import { cookies } from "next/headers";
import { locales,type Locale } from "../../../lib/i18n";
import { TrackLink } from "../../../components/TrackLink";
import {ChapterReadTracker} from "../../../components/ChapterReadTracker";
import {chapterAccessCookieName,verifyChapterAccessToken} from "../../../lib/chapter-access";
import { PageView } from "../../../components/PageView";

export async function generateMetadata({params}:{params:Promise<{locale:string}>}):Promise<Metadata>{
  const {locale:raw}=await params;
  const en=raw==="en";
  return {
    title:en?"Chapter 1 · FRAGMENTUN I":"Capítulo 1 · FRAGMENTUN I",
    robots:{index:false,follow:false}
  };
}

const paragraphsEs=[
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

const paragraphsEn=[
  "The city of Lumen breathed to the mechanical rhythm of an artificial heart. From his window on the 187th floor, Elyon Voss watched the sunrise. On his wrists, beneath his gloves, the thin golden lines pulsed softly. They always had, for as long as he could remember. The Council doctors called it “Grade 1 Affective Resonance Disorder.” The young man called it his private curse. Because he felt what others felt. Not because he wanted to. Not because he could stop it.",
  "If a woman on the train cried in silence, his own cheeks grew wet. If a man laughed on a street corner, his chest filled with a joy that did not belong to him. It was like living inside a room with paper walls: every scream, whisper, and song in the world seeped through to him.",
  "The suppressors helped. Two blue pills a day dulled the torrent. But lately, the walls had begun to leak.",
  "“Your route has been optimized,” said the apartment’s synthetic voice. “Estimated time: four hours, twelve minutes. Recommended suppression level: standard.”",
  "He took three blue pills instead of one. The taste of industrial mint dissolved on his tongue, followed by the familiar emptiness, that buffer between him and the world. But lately, even the emptiness had begun to leak.",
  "In the street, the crowd moved like a single organism. Neutral faces, synchronized steps, eyes that never met. The courier joined the flow, his backpack loaded with emotional-resonance packages. Small spherical containers glowed faintly, holding what remained of what had once been joy, sadness, anger... distilled and neutralized for study at the Purity Base.",
  "As he walked, he felt the city’s low hum. Not a sound, but a sensation. As if Lumen were a sleeping giant and he could feel its breathing through the concrete. That was new. Like the golden lines.",
  "In the financial district, he delivered his first package. The receptionist, a woman exactly forty-two years old according to her badge, held out her hand without looking at him. The instant their fingers nearly touched, Elyon felt the familiar emptiness of office workers: not an absence of emotion, but suppression so perfect it felt like death while living.",
  "Then a different package appeared.",
  "It was a frosted-glass sphere, heavier than the others. The label carried a name: Dr. Kaelis Vorm — Purity Base — Restricted Level 9.",
  "When his fingers brushed the surface, he felt something he had never experienced before. It was not a borrowed emotion from a stranger. It was an echo, an imprint left deliberately. As if the sender had infused the glass with her own essence.",
  "Passion. Pain. A love so deep it hurt physically. And beneath it all, a question: “What if we could feel without fear?”",
  "Elyon pulled his hand away quickly, gasping. The golden lines on his wrists burned.",
  "“Are you all right?” the receptionist asked in a flat voice.",
  "“Yes,” he lied. “Just... static interference.”",
  "But it was not static. It was an invitation. And although he did not know it yet, that sphere contained the first whisper of everything that was about to come. The name Kaelis Vorm branded itself into his memory like an ember."
];

export default async function ChapterOne({params}:{params:Promise<{locale:string}>}){
  const {locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const en=locale==="en";
  const cookieStore=await cookies();
  const access=verifyChapterAccessToken(cookieStore.get(chapterAccessCookieName())?.value);
  if(!access)redirect(`/${locale}?signup=required#capitulo`);
  const patreonUrl=process.env.NEXT_PUBLIC_PATREON_URL||"https://patreon.com/sagaFragmentun?utm_source=fragmentun&utm_medium=website&utm_campaign=patreon_support&utm_content=chapter_end";
  const paragraphs=en?paragraphsEn:paragraphsEs;

  return <main className="section">
    <PageView locale={locale}/>
    <ChapterReadTracker locale={locale}/>
    <article className="container chapterReader">
      <div className="kicker">FRAGMENTUN I · {en?"THE EMOTIONAL AWAKENING":"EL DESPERTAR EMOCIONAL"}</div>
      <h1>{en?"CHAPTER 1: THE PERFECT SILENCE":"CAPÍTULO 1: EL SILENCIO PERFECTO"}</h1>
      <p className="chapterTime">{en?"—48 hours before the Pulse":"—48 horas antes del Pulso"}</p>

      <div className="chapterBody">
        {paragraphs.map((p,i)=><p key={i}>{p}</p>)}
      </div>

      <div className="chapterEnd card">
        <div className="kicker">{en?"End of sample":"Fin de la muestra"}</div>
        <h2>{en?"The awakening has only just begun.":"El despertar apenas comienza."}</h2>
        <p>{en
          ?"Continue Elyon Voss’s full story in the published edition of FRAGMENTUN I."
          :"Continúa la historia completa de Elyon Voss en la edición publicada de FRAGMENTUN I."}</p>
        <div className="heroActions">
          <TrackLink
            className="btn btnPrimary"
            href="https://www.amazon.com/dp/B0HBLTHT8S"
            eventName="amazon_click"
            locale={locale}
            metadata={{book:"fragmentun-i",placement:"chapter_end",marketplace:"amazon.com"}}
            newTab
          >
            {en?"Continue on Amazon":"Continuar en Amazon"}
          </TrackLink>
          <TrackLink
            className="btn btnPatreon"
            href={patreonUrl}
            eventName="patreon_click"
            locale={locale}
            metadata={{placement:"chapter_end",creator:"sagaFragmentun"}}
            newTab
          >
            {en?"Support FRAGMENTUN":"Patrocinar FRAGMENTUN"}
          </TrackLink>
          <Link className="btn btnGhost" href={`/${locale}`}>{en?"Back to FRAGMENTUN":"Volver a FRAGMENTUN"}</Link>
        </div>
      </div>

      <p className="note" style={{textAlign:"center",marginTop:24}}>
        © 2026 José Liranzo · {en?"All rights reserved.":"Todos los derechos reservados."}
      </p>
    </article>
  </main>;
}
