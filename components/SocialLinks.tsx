"use client";
import type { Locale } from "../lib/i18n";
import { TrackLink } from "./TrackLink";

type SocialItem={key:string;label:string;url:string};

export function SocialLinks({locale,items,placement="footer"}:{
  locale:Locale;
  items:SocialItem[];
  placement?:string;
}){
  const visible=items.filter(x=>x.url);
  if(!visible.length) return null;

  return <div className="socialLinks" aria-label={locale==="es"?"Redes sociales de FRAGMENTUN":"FRAGMENTUN social media"}>
    {visible.map(item=>
      <TrackLink
        key={item.key}
        className="socialLink"
        href={item.url}
        eventName="community_click"
        locale={locale}
        metadata={{network:item.key,placement}}
        newTab
      >
        {item.label}
      </TrackLink>
    )}
  </div>;
}
