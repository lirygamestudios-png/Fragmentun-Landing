"use client";
import { useEffect } from "react";

export function PageView({locale}:{locale:"es"|"en"}){
  useEffect(()=>{
    const url=new URL(window.location.href);
    fetch("/api/analytics",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({
      event_name:"page_view",locale,path:window.location.pathname,
      source:url.searchParams.get("utm_source")||"",
      medium:url.searchParams.get("utm_medium")||"",
      campaign:url.searchParams.get("utm_campaign")||"",
      content:url.searchParams.get("utm_content")||""
    }),keepalive:true}).catch(()=>{});
  },[locale]);
  return null;
}
