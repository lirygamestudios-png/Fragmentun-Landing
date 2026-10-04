"use client";
import { useEffect,useState } from "react";
import Link from "next/link";
import type { Locale } from "../lib/i18n";
import { analyticsSessionId } from "../lib/analytics-client";

type Utm={
  source:string;
  medium:string;
  campaign:string;
  content:string;
};

export function LeadForm({
  locale,nameLabel,emailLabel,submitLabel,experiment,experimentVariant
}:{
  locale:Locale;
  nameLabel:string;
  emailLabel:string;
  submitLabel:string;
  experiment?:string;
  experimentVariant?:string;
}){
  const[utm,setUtm]=useState<Utm>({source:"",medium:"",campaign:"",content:""});
  const[sessionId,setSessionId]=useState("");

  useEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    setUtm({
      source:qs.get("utm_source")||sessionStorage.getItem("utm_source")||"",
      medium:qs.get("utm_medium")||sessionStorage.getItem("utm_medium")||"",
      campaign:qs.get("utm_campaign")||sessionStorage.getItem("utm_campaign")||"",
      content:qs.get("utm_content")||sessionStorage.getItem("utm_content")||""
    });
    setSessionId(analyticsSessionId());
  },[]);

  return <form className="leadCaptureForm" action="/api/subscribe" method="post">
    <input type="hidden" name="locale" value={locale}/>
    <input type="hidden" name="utm_source" value={utm.source}/>
    <input type="hidden" name="utm_medium" value={utm.medium}/>
    <input type="hidden" name="utm_campaign" value={utm.campaign}/>
    <input type="hidden" name="utm_content" value={utm.content}/>
    <input type="hidden" name="session_id" value={sessionId}/>
    <input type="hidden" name="consent_version" value="2026-09-30"/>
    <input type="hidden" name="experiment" value={experiment||""}/>
    <input type="hidden" name="experiment_variant" value={experimentVariant||""}/>

    <div className="leadFields">
      <label className="leadField">
        <span>{locale==="es"?"Nombre":"Name"}</span>
        <input
          aria-label={locale==="es"?"Nombre":"Name"}
          name="name"
          placeholder={nameLabel}
          autoComplete="name"
          maxLength={200}
          required
        />
      </label>

      <label className="leadField">
        <span>{locale==="es"?"Correo electrónico":"Email address"}</span>
        <input
          aria-label={locale==="es"?"Correo electrónico":"Email address"}
          name="email"
          type="email"
          placeholder={emailLabel}
          autoComplete="email"
          maxLength={320}
          required
        />
      </label>
    </div>

    <label className="consentRow">
      <input name="consent_marketing" type="checkbox" value="yes" required/>
      <span>
        {locale==="es"
          ?"Acepto recibir el Capítulo 1 y la secuencia de correos de FRAGMENTUN. Puedo darme de baja en cualquier momento."
          :"I agree to receive Chapter 1 and the FRAGMENTUN email sequence. I can unsubscribe at any time."}
        {" "}
        <Link href={`/${locale}/privacidad`}>
          {locale==="es"?"Política de privacidad.":"Privacy policy."}
        </Link>
      </span>
    </label>

    <input className="hpField" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true"/>
    <button className="btn btnPrimary leadSubmit" type="submit">{submitLabel}</button>
  </form>;
}
