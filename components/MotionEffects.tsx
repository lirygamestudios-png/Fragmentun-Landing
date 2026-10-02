"use client";
import { useEffect } from "react";

export function MotionEffects(){
  useEffect(()=>{
    const reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if(reduce)return;

    document.documentElement.classList.add("motion-ready");

    const targets=Array.from(document.querySelectorAll<HTMLElement>(
      ".heroGrid > *, .section, .band, .ctaFinal, .card, .territory, .masterDualRow > *, .masterCommunityRow > *"
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
    const hero=document.querySelector<HTMLElement>(".hero");
    const lumen=document.querySelector<HTMLElement>(".masterLumenSection");

    const parallax=()=>{
      const y=window.scrollY;
      hero?.style.setProperty("--hero-shift",`${Math.min(34,y*.055)}px`);
      if(lumen){
        const rect=lumen.getBoundingClientRect();
        const center=(window.innerHeight-rect.top)/(window.innerHeight+rect.height);
        lumen.style.setProperty("--lumen-shift",`${Math.max(-20,Math.min(20,(center-.5)*34))}px`);
      }
    };
    parallax();
    window.addEventListener("scroll",parallax,{passive:true});

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
      window.removeEventListener("scroll",parallax);
      stage?.removeEventListener("mousemove",move);
      stage?.removeEventListener("mouseleave",reset);
      document.documentElement.classList.remove("motion-ready");
    };
  },[]);

  return null;
}
