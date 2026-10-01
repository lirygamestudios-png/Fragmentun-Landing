"use client";
import { useEffect,useState } from "react";
import { LeadForm } from "./LeadForm";
import type { Locale } from "../lib/i18n";

const KEY="fragmentun_exp_chapter_cta_v1";

export function ChapterLeadExperiment({
  locale,nameLabel,emailLabel,defaultLabel
}:{
  locale:Locale;
  nameLabel:string;
  emailLabel:string;
  defaultLabel:string;
}){
  const[variant,setVariant]=useState<"A"|"B">("A");

  useEffect(()=>{
    let v=sessionStorage.getItem(KEY) as "A"|"B"|null;
    if(v!=="A"&&v!=="B"){
      v=Math.random()<0.5?"A":"B";
      sessionStorage.setItem(KEY,v);
    }
    setVariant(v);

    fetch("/api/analytics",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        event_name:"experiment_view",
        locale,
        path:`/${locale}`,
        source:sessionStorage.getItem("utm_source")||"",
        medium:sessionStorage.getItem("utm_medium")||"",
        campaign:sessionStorage.getItem("utm_campaign")||"",
        content:sessionStorage.getItem("utm_content")||"",
        metadata:{experiment:"chapter_cta_v1",variant:v}
      }),
      keepalive:true
    }).catch(()=>{});
  },[locale]);

  const label=variant==="A"
    ?defaultLabel
    :(locale==="es"?"Leer gratis el Capítulo 1":"Read Chapter 1 free");

  return <LeadForm
    locale={locale}
    nameLabel={nameLabel}
    emailLabel={emailLabel}
    submitLabel={label}
    experiment="chapter_cta_v1"
    experimentVariant={variant}
  />;
}
