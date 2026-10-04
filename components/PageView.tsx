"use client";
import { useEffect } from "react";
import { analyticsAttribution } from "../lib/analytics-client";

const keys=["utm_source","utm_medium","utm_campaign","utm_content"] as const;

export function PageView({locale}:{locale:"es"|"en"}){
  useEffect(()=>{
    const url=new URL(window.location.href);
    for(const key of keys){
      const value=url.searchParams.get(key);
      if(value) sessionStorage.setItem(key,value);
    }

    const attribution=analyticsAttribution();

    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"page_view",locale,path:window.location.pathname,
      ...attribution
    }),keepalive:true}).catch(()=>{});
  },[locale]);
  return null;
}
