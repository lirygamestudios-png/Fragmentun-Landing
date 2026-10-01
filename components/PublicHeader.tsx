"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Locale } from "../lib/i18n";
import { copy } from "../lib/i18n";
import { TrackLink } from "./TrackLink";

export function PublicHeader({locale,amazonUrl,patreonUrl}:{locale:Locale;amazonUrl?:string|null;patreonUrl?:string|null}){
  const t=copy[locale];
  const pathname=usePathname();
  const[open,setOpen]=useState(false);
  const items=[
    [t.nav.story,`/${locale}#historia`],
    [t.nav.universe,`/${locale}#lumen`],
    ["Saga",`/${locale}#saga`],
    [t.nav.test,`/${locale}/test`],
    [t.nav.map,`/${locale}/mapa`],
    [t.nav.author,`/${locale}#autor`],
    [locale==="es"?"Patrocinar":"Support",`/${locale}#patreon`]
  ];

  const localizedPath=(target:Locale)=>{
    if(!pathname)return `/${target}`;
    const parts=pathname.split("/").filter(Boolean);
    if(parts[0]==="es"||parts[0]==="en") parts[0]=target;
    else parts.unshift(target);
    return "/"+parts.join("/");
  };

  return <header className="header">
    <div className="container headerInner">
      <Link className="logo" href={`/${locale}`}>FRAGMENTUN</Link>
      <nav className="nav">{items.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="headerActions">
        <div className="lang">
          <Link className={locale==="es"?"active":""} href={localizedPath("es")}>ES</Link>
          <Link className={locale==="en"?"active":""} href={localizedPath("en")}>EN</Link>
        </div>
        {amazonUrl
          ? <TrackLink className="btn btnPrimary desktopBuy" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{book:"fragmentun-i",edition_locale:locale}} newTab>{t.buy}</TrackLink>
          : <span className="btn btnGhost desktopBuy">{locale==="es"?"Próximamente":"Coming soon"}</span>}
        <button className="menuButton" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={locale==="es"?"Abrir menú":"Open menu"}>☰</button>
      </div>
    </div>
    {open&&<div className="mobileMenu"><div className="container mobileMenuInner">
      {items.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
      {amazonUrl
        ? <TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} newTab>{t.buy}</TrackLink>
        : <span className="btn btnGhost">{locale==="es"?"Próximamente":"Coming soon"}</span>}
      {patreonUrl&&<TrackLink className="btn btnPatreon" href={patreonUrl} eventName="patreon_click" locale={locale} metadata={{placement:"mobile_menu",creator:"sagaFragmentun"}} newTab>
        {locale==="es"?"Patrocinar en Patreon":"Support on Patreon"}
      </TrackLink>}
    </div></div>}
  </header>;
}
