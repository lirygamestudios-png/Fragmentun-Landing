"use client";

import {useEffect} from "react";

export function ScrollTopOnEntry(){
  useEffect(()=>{
    const previous=history.scrollRestoration;
    history.scrollRestoration="manual";

    const shouldStartAtTop=!window.location.hash&&!new URLSearchParams(window.location.search).has("signup");
    if(shouldStartAtTop){
      window.scrollTo({top:0,left:0,behavior:"auto"});
      requestAnimationFrame(()=>window.scrollTo({top:0,left:0,behavior:"auto"}));
      window.setTimeout(()=>window.scrollTo({top:0,left:0,behavior:"auto"}),80);
    }

    return()=>{history.scrollRestoration=previous};
  },[]);

  return null;
}
