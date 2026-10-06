"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect,useState } from "react";
import type { Locale } from "../lib/i18n";
import { copy } from "../lib/i18n";
import { TrackLink } from "./TrackLink";
import { SocialLinks } from "./SocialLinks";

export function PublicHeader({locale,amazonUrl,patreonUrl,shopEnabled=false}:{locale:Locale;amazonUrl?:string|null;patreonUrl?:string|null;shopEnabled?:boolean}){
  const t=copy[locale];
  const pathname=usePathname();
  const[open,setOpen]=useState(false);

  useEffect(()=>{
    if(!open)return;
    const previous=document.body.style.overflow;
    document.body.style.overflow="hidden";
    const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")setOpen(false)};
    window.addEventListener("keydown",onKey);
    return()=>{document.body.style.overflow=previous;window.removeEventListener("keydown",onKey)};
  },[open]);

  const items=[
    [locale==="es"?"Inicio":"Home",`/${locale}`],
    [t.nav.story,`/${locale}#historia`],
    [t.nav.universe,`/${locale}#lumen`],
    [locale==="es"?"Personajes":"Characters",`/${locale}#personajes`],
    [t.nav.test,`/${locale}#test`],
    [locale==="es"?"Noticias":"News",`/${locale}#noticias`],
    [locale==="es"?"Comunidad":"Community",`/${locale}#comunidad-publica`],
    ...(shopEnabled?[[locale==="es"?"Tienda":"Store",`/${locale}#tienda`]]:[]),
    [t.nav.author,`/${locale}#autor`]
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
      <Link className="logo brandLogo" href={`/${locale}`} aria-label="FRAGMENTUN"><img className="brandMark" src="/fragmentun-mark.png" alt="" width={36} height={36}/><span className="brandWordmark">FRAGMENTUN</span></Link>
      <nav className="nav">{items.map(([label,href])=><Link key={href} href={href}>{label}</Link>)}</nav>
      <div className="headerActions">
        <div className="lang">
          <Link className={locale==="es"?"active":""} href={localizedPath("es")}>ES</Link>
          <Link className={locale==="en"?"active":""} href={localizedPath("en")}>EN</Link>
        </div>
        {amazonUrl
          ? <TrackLink className="btn btnPrimary desktopBuy" href={amazonUrl} eventName="amazon_click" locale={locale} metadata={{book:"fragmentun-i",edition_locale:locale}} newTab>{t.buy}</TrackLink>
          : <span className="btn btnGhost desktopBuy">{locale==="es"?"Próximamente":"Coming soon"}</span>}
        <button className="menuButton" onClick={()=>setOpen(v=>!v)} aria-expanded={open} aria-label={open?(locale==="es"?"Cerrar menú":"Close menu"):(locale==="es"?"Abrir menú":"Open menu")}>{open?"×":"☰"}</button>
      </div>
    </div>
    {open&&<div className="mobileMenu"><div className="container mobileMenuInner">
      {items.map(([label,href])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}
      {amazonUrl
        ? <TrackLink className="btn btnPrimary" href={amazonUrl} eventName="amazon_click" locale={locale} newTab>{t.buy}</TrackLink>
        : <span className="btn btnGhost">{locale==="es"?"Próximamente":"Coming soon"}</span>}
      {patreonUrl&&<TrackLink className="btn btnPatreon" href={patreonUrl} eventName="patreon_click" locale={locale} metadata={{placement:"mobile_menu",creator:"sagaFragmentun"}} newTab>
        {locale==="es"?"PATREON · Apoyar FRAGMENTUN":"PATREON · Support FRAGMENTUN"}
      </TrackLink>}
      <div className="mobileMenuShare">
        <SocialLinks locale={locale} items={[]} placement="mobile_menu"/>
      </div>
    </div></div>}
  </header>;
}
