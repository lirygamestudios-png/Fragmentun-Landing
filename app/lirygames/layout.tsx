import type {Metadata} from "next";

/** Identidad local de LIRYGAMES; no modificar la metadata raíz de FRAGMENTUN. */
export const metadata:Metadata={
 title:{default:"LIRYGAMES STUDIOS",template:"%s | LIRYGAMES STUDIOS"},
 applicationName:"LIRYGAMES STUDIOS",
 icons:{
  icon:[{url:"/lirygames-brand-icon.svg",type:"image/svg+xml"}],
  shortcut:"/lirygames-brand-icon.svg",
  apple:"/lirygames-brand-icon.svg"
 }
};
export default function LirygamesLayout({children}:{children:React.ReactNode}){return children;}
