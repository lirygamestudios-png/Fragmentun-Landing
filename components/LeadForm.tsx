"use client";
import { useSearchParams } from "next/navigation";
import type { Locale } from "../lib/i18n";

export function LeadForm({locale,nameLabel,emailLabel,submitLabel}:{locale:Locale;nameLabel:string;emailLabel:string;submitLabel:string}){
  const qs=useSearchParams();
  return <form className="formGrid" action="/api/subscribe" method="post">
    <input type="hidden" name="locale" value={locale}/>
    <input type="hidden" name="utm_source" value={qs.get("utm_source")??""}/>
    <input type="hidden" name="utm_medium" value={qs.get("utm_medium")??""}/>
    <input type="hidden" name="utm_campaign" value={qs.get("utm_campaign")??""}/>
    <input type="hidden" name="utm_content" value={qs.get("utm_content")??""}/>
    <input name="name" placeholder={nameLabel} autoComplete="name" required/>
    <input name="email" type="email" placeholder={emailLabel} autoComplete="email" required/>
    <button className="btn btnPrimary" type="submit">{submitLabel}</button>
  </form>;
}
