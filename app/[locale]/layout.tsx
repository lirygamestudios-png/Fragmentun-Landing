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

  return {
    title: isEs
      ? "FRAGMENTUN I — El Despertar Emocional | José Liranzo"
      : "FRAGMENTUN I — The Emotional Awakening | José Liranzo",
    description: isEs
      ? "Sitio oficial de FRAGMENTUN, saga de ciencia ficción emocional de José Liranzo."
      : "Official site of FRAGMENTUN, José Liranzo's emotional science-fiction saga.",
    alternates: {
      canonical: `${site}/${locale}`,
      languages: {
        es: `${site}/es`,
        en: `${site}/en`,
      },
    },
    openGraph: {
      type: "website",
      url: `${site}/${locale}`,
      siteName: "FRAGMENTUN",
      title: isEs
        ? "FRAGMENTUN I — El Despertar Emocional"
        : "FRAGMENTUN I — The Emotional Awakening",
      description: isEs
        ? "¿Y si sentir fuera el acto más peligroso del mundo?"
        : "What if feeling became the most dangerous act in the world?",
    },
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
