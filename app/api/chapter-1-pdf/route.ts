import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { chapterAccessCookieName,verifyChapterAccessToken } from "../../../lib/chapter-access";

export const runtime="nodejs";

const PARAGRAPHS=[
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

const win1252:Record<string,number>={
  "€":128,"‚":130,"ƒ":131,"„":132,"…":133,"†":134,"‡":135,"ˆ":136,"‰":137,
  "Š":138,"‹":139,"Œ":140,"Ž":142,"‘":145,"’":146,"“":147,"”":148,
  "•":149,"–":150,"—":151,"˜":152,"™":153,"š":154,"›":155,"œ":156,"ž":158,"Ÿ":159
};

function encode(s:string){
  return Uint8Array.from(Array.from(s).map(ch=>win1252[ch]??(ch.charCodeAt(0)<=255?ch.charCodeAt(0):63)));
}
function concat(parts:Uint8Array[]){
  const len=parts.reduce((n,p)=>n+p.length,0);
  const out=new Uint8Array(len); let o=0;
  for(const p of parts){out.set(p,o);o+=p.length;}
  return out;
}
function esc(s:string){return s.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");}
function wrap(text:string,size:number,maxWidth:number){
  const words=text.split(/\s+/); const lines:string[]=[]; let line="";
  for(const word of words){
    const candidate=line?line+" "+word:word;
    if(candidate.length*size*.49<=maxWidth) line=candidate;
    else{if(line)lines.push(line);line=word;}
  }
  if(line)lines.push(line);
  return lines;
}

function buildPdf(){
  const W=419.53,H=595.28,M=52,MAX=W-M*2;
  const pageStreams:string[]=[];
  let cmds:string[]=[]; let y=H-58;

  const newPage=()=>{if(cmds.length)pageStreams.push(cmds.join("\n"));cmds=[];y=H-58;};
  const text=(value:string,size=10.5,bold=false,color="0.86 0.89 0.93",gap=5)=>{
    const lines=wrap(value,size,MAX);
    for(const line of lines){
      if(y<62)newPage();
      cmds.push(`BT ${color} rg /${bold?"F2":"F1"} ${size} Tf ${M} ${y.toFixed(2)} Td (${esc(line)}) Tj ET`);
      y-=size*1.42;
    }
    y-=gap;
  };

  cmds.push(`0.039 0.086 0.157 rg 0 0 ${W} ${H} re f`);
  cmds.push("0.788 0.659 0.298 rg /F2 27 Tf 111 370 Td (FRAGMENTUN) Tj ET");
  cmds.push("0.29 0.565 0.851 rg /F2 9.5 Tf 126 342 Td (EL DESPERTAR EMOCIONAL) Tj ET");
  cmds.push("1 1 1 rg /F2 17 Tf 147 288 Td (CAPITULO 1) Tj ET");
  cmds.push("1 1 1 rg /F2 12 Tf 125 264 Td (EL SILENCIO PERFECTO) Tj ET");
  cmds.push("0.788 0.659 0.298 rg /F1 10.5 Tf 174 220 Td (Jose Liranzo) Tj ET");
  newPage();

  text("CAPÍTULO 1: EL SILENCIO PERFECTO",17,true,"0.788 0.659 0.298",4);
  text("—48 horas antes del Pulso",9.5,true,"0.29 0.565 0.851",14);
  for(const p of PARAGRAPHS) text(p,10.2,false,"0.12 0.16 0.22",7);
  text("El despertar apenas comienza.",13,true,"0.788 0.659 0.298",6);
  text("Continúa la historia completa de Elyon Voss en FRAGMENTUN I.",9.8,false,"0.12 0.16 0.22",4);
  text("www.fragmentun.com",10,true,"0.29 0.565 0.851",4);
  text("© 2026 José Liranzo · FRAGMENTUN · Todos los derechos reservados.",8,false,"0.35 0.39 0.44",0);
  if(cmds.length)pageStreams.push(cmds.join("\n"));

  const objects:string[]=[];
  objects[1]="<< /Type /Catalog /Pages 2 0 R >>";
  objects[3]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>";
  objects[4]="<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>";

  const kids:string[]=[]; let next=5;
  for(const stream of pageStreams){
    const pageObj=next++, contentObj=next++;
    kids.push(`${pageObj} 0 R`);
    objects[contentObj]=`<< /Length ${encode(stream).length} >>\nstream\n${stream}\nendstream`;
    objects[pageObj]=`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${W} ${H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;
  }
  objects[2]=`<< /Type /Pages /Count ${kids.length} /Kids [${kids.join(" ")}] >>`;

  const header=encode("%PDF-1.4\n%FRAGMENTUN\n");
  const parts=[header]; const offsets:number[]=[0]; let total=header.length;
  for(let i=1;i<objects.length;i++){
    const obj=encode(`${i} 0 obj\n${objects[i]}\nendobj\n`);
    offsets[i]=total; parts.push(obj); total+=obj.length;
  }
  const xrefStart=total;
  let xref=`xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for(let i=1;i<objects.length;i++)xref+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
  xref+=`trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;
  parts.push(encode(xref));
  return concat(parts);
}

export async function GET(){
  const cookieStore=await cookies();
  const access=verifyChapterAccessToken(cookieStore.get(chapterAccessCookieName())?.value);
  if(!access){
    return NextResponse.json({error:"chapter_access_required"},{status:403});
  }

  const pdf=buildPdf();
  return new NextResponse(pdf,{
    status:200,
    headers:{
      "Content-Type":"application/pdf",
      "Content-Disposition":'attachment; filename="FRAGMENTUN-Capitulo-1-El-Silencio-Perfecto.pdf"',
      "Cache-Control":"public, max-age=3600, s-maxage=86400"
    }
  });
}
