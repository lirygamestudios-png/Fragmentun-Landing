"use client";
import type { MouseEvent,ReactNode } from "react";
import { analyticsAttribution } from "../lib/analytics-client";

export function TrackLink({
  href,eventName,locale,className,children,newTab=false,metadata
}:{
  href:string;
  eventName:string;
  locale:"es"|"en";
  className?:string;
  children:ReactNode;
  newTab?:boolean;
  metadata?:Record<string,unknown>;
}){
  async function track(_e:MouseEvent<HTMLAnchorElement>){
    try{
      const attribution=analyticsAttribution();
      await fetch("/api/analytics",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          event_name:eventName,
          locale,
          path:window.location.pathname,
          ...attribution,
          metadata:metadata||undefined
        }),
        keepalive:true
      });
    }catch{}
  }

  return <a
    className={className}
    href={href}
    target={newTab?"_blank":undefined}
    rel={newTab?"noreferrer":undefined}
    onClick={track}
  >{children}</a>;
}
