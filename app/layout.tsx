import "./globals.css";
import type { Metadata } from "next";
import { headers } from "next/headers";

const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";

export const metadata: Metadata = {
  metadataBase:new URL(site),
  title:{
    default:"FRAGMENTUN I — El Despertar Emocional",
    template:"%s | FRAGMENTUN"
  },
  description:"Sitio oficial de FRAGMENTUN, universo de ciencia ficción emocional de José Liranzo.",
  applicationName:"FRAGMENTUN",
  authors:[{name:"José Liranzo"}],
  creator:"José Liranzo",
  publisher:"LIRYGAMES STUDIOS",
  category:"Books",
  icons:{
    icon:[{url:"/fragmentun-mark.png",type:"image/png",sizes:"192x192"}],
    shortcut:"/fragmentun-mark.png",
    apple:"/fragmentun-mark.png"
  },
  openGraph:{
    type:"website",
    siteName:"FRAGMENTUN",
    title:"FRAGMENTUN I — El Despertar Emocional",
    description:"Universo de ciencia ficción emocional de José Liranzo.",
    url:site,
    images:[{url:"/lumen-frontdesk.webp",width:1152,height:648,alt:"Ciudad de Lumen — universo FRAGMENTUN"}]
  },
  twitter:{
    card:"summary_large_image",
    title:"FRAGMENTUN I — El Despertar Emocional",
    description:"Universo de ciencia ficción emocional de José Liranzo.",
    images:["/lumen-frontdesk.webp"]
  },
  robots:{
    index:true,
    follow:true,
    googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}
  }
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const requestHeaders=await headers();
  const locale=requestHeaders.get("x-fragmentun-locale")==="en"?"en":"es";

  return (
    <html lang={locale}>
      <body>{children}</body>
    </html>
  );
}
