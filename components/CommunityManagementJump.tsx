"use client";
import {useEffect} from "react";

export function CommunityManagementJump(){
 useEffect(()=>{
  const nav=document.querySelector<HTMLAnchorElement>('[data-open-community-management="true"]');
  const panel=document.getElementById("comunidad-gestion") as HTMLDetailsElement|null;
  if(!nav||!panel)return;
  const openPanel=()=>{panel.open=true;};
  nav.addEventListener("click",openPanel);
  if(window.location.hash==="#comunidad-gestion")openPanel();
  return()=>nav.removeEventListener("click",openPanel);
 },[]);
 return null;
}
