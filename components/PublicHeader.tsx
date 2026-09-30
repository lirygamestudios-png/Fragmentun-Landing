"use client";
import Link from "next/link";
import { useState } from "react";
import type { Locale } from "../lib/i18n";
import { copy } from "../lib/i18n";

export function PublicHeader({locale}:{locale:Locale}){
  const t=copy[locale];
  const[open,setOpen]=useState(false);
  const items=[
    [t.nav.story,`/${locale}#historia`],
    [t.nav.universe,`/${locale}#lumen`],
    ["Saga",`/${locale}#saga`],
    [t.nav.test,`/${locale}/test`],
    [t.nav.map,`/${locale}/mapa`],
    [t.nav.author,`/${locale}#autor`]
  ];
  return <header className="header">
    <div className="container headerInner">
      <Link className="logo" href={`/${locale}`}>FRAGMENTUN</Link>
      <nav className="nav">{items.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="headerActions">
        <div className="lang"><Link className={locale==="es"?"active":""} href="/es">ES</Link><Link className={locale==="en"?"active":""} href="/en">EN</Link></div>
        <a className="btn btnPrimary desktopBuy" href="https://www.amazon.com/dp/B0HBLTHT8S" target="_blank" rel="noreferrer">{t.buy}</a>
        <button className="menuButton" onClick={()=>setOpen(v=>!v)} aria-expanded={open}>☰</button>
      </div>
    </div>
    {open&&<div className="mobileMenu"><div className="container mobileMenuInner">{items.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<a className="btn btnPrimary" href="https://www.amazon.com/dp/B0HBLTHT8S" target="_blank" rel="noreferrer">{t.buy}</a></div></div>}
  </header>;
}
