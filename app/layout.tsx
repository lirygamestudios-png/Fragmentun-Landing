import "./globals.css";
import type { Metadata } from "next";

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
  robots:{
    index:true,
    follow:true,
    googleBot:{index:true,follow:true,"max-image-preview":"large","max-snippet":-1,"max-video-preview":-1}
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
