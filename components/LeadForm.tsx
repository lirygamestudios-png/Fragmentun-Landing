"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import type { Locale } from "../lib/i18n";

type Utm={
  source:string;
  medium:string;
  campaign:string;
  content:string;
};

export function LeadForm({locale,nameLabel,emailLabel,submitLabel}:{locale:Locale;nameLabel:string;emailLabel:string;submitLabel:string}){
  const[utm,setUtm]=useState<Utm>({source:"",medium:"",campaign:"",content:""});

  useEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    setUtm({
      source:qs.get("utm_source")||"",
      medium:qs.get("utm_medium")||"",
      campaign:qs.get("utm_campaign")||"",
      content:qs.get("utm_content")||""
    });
  },[]);

  return <form className="formGrid" action="/api/subscribe" method="post">
    <input type="hidden" name="locale" value={locale}/>
    <input type="hidden" name="utm_source" value={utm.source}/>
    <input type="hidden" name="utm_medium" value={utm.medium}/>
    <input type="hidden" name="utm_campaign" value={utm.campaign}/>
    <input type="hidden" name="utm_content" value={utm.content}/>
    <input type="hidden" name="consent_version" value="2026-09-30"/>
    <input
      name="name"
      placeholder={locale==="es"?`${nameLabel} (opcional)`:`${nameLabel} (optional)`}
      autoComplete="name"
      maxLength={200}
    />
    <input name="email" type="email" placeholder={emailLabel} autoComplete="email" maxLength={320} required/>
    <label className="consentRow">
      <input name="consent_marketing" type="checkbox" value="yes" required/>
      <span>
        {locale==="es"
          ?"Acepto recibir el Capítulo 1 y comunicaciones de FRAGMENTUN por correo electrónico. Puedo darme de baja en cualquier momento."
          :"I agree to receive Chapter 1 and FRAGMENTUN email communications. I can unsubscribe at any time."}
        {" "}
        <Link href={`/${locale}/privacidad`}>
          {locale==="es"?"Política de privacidad.":"Privacy policy."}
        </Link>
      </span>
    </label>
    <input className="hpField" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <button className="btn btnPrimary" type="submit">{submitLabel}</button>
  </form>;
}
