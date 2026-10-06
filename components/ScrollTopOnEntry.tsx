"use client";

import {useLayoutEffect} from "react";

export function ScrollTopOnEntry(){
  useLayoutEffect(()=>{
    const qs=new URLSearchParams(window.location.search);
    const isSignupReturn=qs.has("signup");

    // A browser can preserve an old #capitulo fragment across reloads/redirects
    // and apply the anchor scroll after hydration. On a normal site entry,
    // remove that inherited fragment before the browser can keep restoring it.
    if(!isSignupReturn&&window.location.hash){
      history.replaceState(
        history.state,
        "",
        window.location.pathname+window.location.search
      );
    }

    if(isSignupReturn) return;

    history.scrollRestoration="manual";

    const top=()=>window.scrollTo({top:0,left:0,behavior:"auto"});
    top();
    requestAnimationFrame(()=>requestAnimationFrame(top));

    const timers=[
      window.setTimeout(top,120),
      window.setTimeout(top,450),
      window.setTimeout(top,1000)
    ];

    const onPageShow=()=>top();
    window.addEventListener("pageshow",onPageShow);

    return()=>{
      timers.forEach(window.clearTimeout);
      window.removeEventListener("pageshow",onPageShow);
    };
  },[]);

  return null;
}
