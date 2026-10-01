"use client";
import { useEffect } from "react";

const keys=["utm_source","utm_medium","utm_campaign","utm_content"] as const;

export function PageView({locale}:{locale:"es"|"en"}){
  useEffect(()=>{
    const url=new URL(window.location.href);
    for(const key of keys){
      const value=url.searchParams.get(key);
      if(value) sessionStorage.setItem(key,value);
    }

    const source=url.searchParams.get("utm_source")||sessionStorage.getItem("utm_source")||"";
    const medium=url.searchParams.get("utm_medium")||sessionStorage.getItem("utm_medium")||"";
    const campaign=url.searchParams.get("utm_campaign")||sessionStorage.getItem("utm_campaign")||"";
    const content=url.searchParams.get("utm_content")||sessionStorage.getItem("utm_content")||"";

    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"page_view",locale,path:window.location.pathname,
      source,medium,campaign,content
    }),keepalive:true}).catch(()=>{});
  },[locale]);
  return null;
}
