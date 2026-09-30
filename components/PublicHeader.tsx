"use client";

import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { copy } from "../lib/i18n";

export function PublicHeader({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const other = locale === "es" ? "en" : "es";
  return (
    <header className="header">
      <div className="container headerInner">
        <Link className="logo" href={`/${locale}`}>FRAGMENTUN</Link>
        <nav className="nav" aria-label="Principal">
          <a href="#historia">{t.nav.story}</a>
          <a href="#lumen">{t.nav.universe}</a>
          <a href="#test">{t.nav.test}</a>
          <a href="#mapa">{t.nav.map}</a>
          <a href="#autor">{t.nav.author}</a>
        </nav>
        <div style={{display:"flex",gap:10,alignItems:"center"}}>
          <div className="lang" aria-label="Language switcher">
            <Link className={locale==="es"?"active":""} href="/es">ES</Link>
            <Link className={locale==="en"?"active":""} href="/en">EN</Link>
          </div>
          <a className="btn btnPrimary" href="https://www.amazon.com/dp/B0HBLTHT8S" target="_blank" rel="noreferrer">
            {t.buy}
          </a>
        </div>
      </div>
    </header>
  );
}
