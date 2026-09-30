"use client";
import { useEffect } from "react";

export function MotionEffects(){
  useEffect(()=>{
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce)return;

    document.documentElement.classList.add("motion-ready");

    const targets=Array.from(document.querySelectorAll<HTMLElement>(
      ".heroGrid > *, .section, .band, .ctaFinal, .card, .territory"
    ));

    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          (entry.target as HTMLElement).classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:"0px 0px -5% 0px"});

    targets.forEach(el=>observer.observe(el));

    const stage=document.querySelector<HTMLElement>(".bookStage");

    const move=(event:MouseEvent)=>{
      if(!stage)return;
      const rect=stage.getBoundingClientRect();
      const x=(event.clientX-rect.left)/rect.width-.5;
      const y=(event.clientY-rect.top)/rect.height-.5;
      stage.style.setProperty("--ry",`${x*7}deg`);
      stage.style.setProperty("--rx",`${y*-6}deg`);
    };

    const reset=()=>{
      stage?.style.setProperty("--ry","0deg");
      stage?.style.setProperty("--rx","0deg");
    };

    stage?.addEventListener("mousemove",move);
    stage?.addEventListener("mouseleave",reset);

    return ()=>{
      observer.disconnect();
      stage?.removeEventListener("mousemove",move);
      stage?.removeEventListener("mouseleave",reset);
      document.documentElement.classList.remove("motion-ready");
    };
  },[]);

  return null;
}
