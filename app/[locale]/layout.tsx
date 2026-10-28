import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { locales, type Locale } from "../../lib/i18n";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!locales.includes(raw as Locale)) return {};
  const locale = raw as Locale;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "https://www.fragmentun.com";
  const isEs = locale === "es";
  const title=isEs
    ? "FRAGMENTUN I — El Despertar Emocional | José Liranzo"
    : "FRAGMENTUN I — The Emotional Awakening | José Liranzo";
  const description=isEs
    ? "En Lumen, las emociones están reguladas. Descubre FRAGMENTUN I: El Despertar Emocional, la saga de ciencia ficción de José Liranzo."
    : "In Lumen, emotions are regulated. Discover FRAGMENTUN I: The Emotional Awakening, José Liranzo's science-fiction saga.";

  return {
    title,
    description,
    alternates: {
      canonical: `${site}/${locale}`,
      languages: {
        es: `${site}/es`,
        en: `${site}/en`,
        "x-default": `${site}/es`
      },
    },
    openGraph: {
      type: "website",
      locale:isEs?"es_US":"en_US",
      alternateLocale:isEs?["en_US"]:["es_US"],
      url: `${site}/${locale}`,
      siteName: "FRAGMENTUN",
      title,
      description,
      images:[{
        url:`${site}/elyon-hero.jpg`,
        width:1200,
        height:630,
        alt:isEs
          ?"Elyon Voss — protagonista de FRAGMENTUN, de José Liranzo"
          :"Elyon Voss — protagonist of FRAGMENTUN by José Liranzo"
      }]
    },
    twitter:{
      card:"summary_large_image",
      title,
      description,
      images:[`${site}/elyon-hero.jpg`]
    }
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!locales.includes(locale as Locale)) notFound();

  return children;
}
