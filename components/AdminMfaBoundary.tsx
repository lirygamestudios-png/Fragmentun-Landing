"use client";
import {useEffect,useState} from "react";
import {usePathname} from "next/navigation";
import {createSupabaseBrowserClient} from "../lib/supabase/browser";
import {AdminMfaGate} from "./AdminMfaGate";

const publicAdminPaths=["/admin/login","/admin/forgot-password","/admin/reset-password"];

export function AdminMfaBoundary({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const[checking,setChecking]=useState(true);
  const[needsMfa,setNeedsMfa]=useState(false);

  useEffect(()=>{
    if(publicAdminPaths.some(path=>pathname.startsWith(path))){
      setNeedsMfa(false);setChecking(false);return;
    }
    let active=true;
    (async()=>{
      const supabase=createSupabaseBrowserClient();
      const{data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if(!active)return;
      if(error){setNeedsMfa(false);setChecking(false);return}
      setNeedsMfa(data.currentLevel==="aal1"&&data.nextLevel==="aal2");
      setChecking(false);
    })();
    return()=>{active=false};
  },[pathname]);

  if(checking)return <>{children}</>;
  if(needsMfa)return <AdminMfaGate/>;
  return <>{children}</>;
}
