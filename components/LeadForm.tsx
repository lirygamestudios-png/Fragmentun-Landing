"use client";
import { useEffect,useState } from "react";
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
    <input name="name" placeholder={nameLabel} autoComplete="name" required/>
    <input name="email" type="email" placeholder={emailLabel} autoComplete="email" required/>
    <button className="btn btnPrimary" type="submit">{submitLabel}</button>
  </form>;
}
