"use client";

export type AdvertisingEventName="registration"|"chapter_read"|"amazon_click"|"patreon_click";

export function advertisingEvent(name:AdvertisingEventName,detail:Record<string,unknown>={}){
  if(typeof window==="undefined")return;
  window.dispatchEvent(new CustomEvent("fragmentun:ad-event",{detail:{name,...detail}}));
}
