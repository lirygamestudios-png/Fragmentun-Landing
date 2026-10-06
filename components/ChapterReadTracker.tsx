"use client";

import {useEffect} from "react";
import type {Locale} from "../lib/i18n";
import {analyticsAttribution} from "../lib/analytics-client";

export function ChapterReadTracker({locale}:{locale:Locale}){
  useEffect(()=>{
    const key=`fragmentun_chapter_read_${locale}`;
    if(sessionStorage.getItem(key)==="1")return;
    sessionStorage.setItem(key,"1");
    fetch("/api/analytics",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        event_name:"chapter_read",
        locale,
        path:window.location.pathname,
        ...analyticsAttribution(),
        metadata:{chapter:1,book:"fragmentun-i"}
      }),
      keepalive:true
    }).catch(()=>{});
  },[locale]);
  return null;
}
