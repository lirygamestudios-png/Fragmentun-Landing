"use client";
import {useEffect} from "react";
import {advertisingEvent} from "../lib/advertising-events";

export function RegistrationAdvertisingTracker({locale}:{locale:"es"|"en"}){
  useEffect(()=>{
    const key=`fragmentun_ad_registration_${locale}`;
    if(sessionStorage.getItem(key)==="1")return;
    sessionStorage.setItem(key,"1");
    advertisingEvent("registration",{locale});
  },[locale]);
  return null;
}
