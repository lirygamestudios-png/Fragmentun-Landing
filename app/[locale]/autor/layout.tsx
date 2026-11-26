import type { Metadata } from "next";
import { locales, type Locale } from "../../../lib/i18n";

export async function generateMetadata({
  params
}: {
  params: Promise<{locale:string}>
}): Promise<Metadata> {
  const {locale:raw}=await params;
  if(!locales.includes(raw as Locale)) return {};

  const es=raw==="es";
  const site=(process.env.NEXT_PUBLIC_SITE_URL||
    "https://www.fragmentun.com").replace(/\/$/,"");

  const title=es
    ?"Jos\u00e9 Liranzo, autor de FRAGMENTUN | Biograf\u00eda y saga"
    :"Jose Liranzo, Author of FRAGMENTUN | About the Author";

  const description=es
    ?"Conoce a Jos\u00e9 Liranzo, autor de FRAGMENTUN I: El Despertar Emocional, y descubre Lumen, Elyon Voss y la saga de cuatro libros."
    :"Meet Jose Liranzo, author of FRAGMENTUN I: El Despertar Emocional. Explore Lumen, Elyon Voss and the four-book saga.";

  return {
    title,
    description,
    alternates:{
      canonical:`${site}/${raw}/autor`,
      languages:{
        es:`${site}/es/autor`,
        en:`${site}/en/autor`,
        "x-default":`${site}/es/autor`
      }
    },
    openGraph:{
      type:"profile",
      url:`${site}/${raw}/autor`,
      title,
      description,
      siteName:"FRAGMENTUN",
      images:[{
        url:"/jose-liranzo.jpg",
        alt:es
          ?"Jos\u00e9 Liranzo, autor de FRAGMENTUN"
          :"Jose Liranzo, author of FRAGMENTUN"
      }]
    },
    twitter:{
      card:"summary_large_image",
      title,
      description,
      images:["/jose-liranzo.jpg"]
    }
  };
}

export default function AuthorLayout({
  children
}: {
  children:React.ReactNode
}) {
  return children;
}