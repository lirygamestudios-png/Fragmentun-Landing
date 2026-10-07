"use client";

import type {ButtonHTMLAttributes} from "react";
import {useEffect,useRef,useState} from "react";
import {useFormStatus} from "react-dom";

type Props=ButtonHTMLAttributes<HTMLButtonElement>&{
  pendingText?:string;
  successText?:string;
};

export function MasterSubmitButton({
  children,
  disabled,
  pendingText="Procesando…",
  successText="Acción completada.",
  type,
  ...props
}:Props){
  const{pending}=useFormStatus();
  const wasPending=useRef(false);
  const[success,setSuccess]=useState(false);

  useEffect(()=>{
    let timer:number|undefined;
    if(pending){
      wasPending.current=true;
      setSuccess(false);
    }else if(wasPending.current){
      wasPending.current=false;
      setSuccess(true);
      timer=window.setTimeout(()=>setSuccess(false),3500);
    }
    return()=>{if(timer)window.clearTimeout(timer);};
  },[pending]);

  return <>
    <button
      {...props}
      type={type||"submit"}
      disabled={disabled||pending}
      aria-busy={pending}
    >
      {pending?pendingText:children}
    </button>
    {success&&<span role="status" aria-live="polite" style={{
      display:"block",
      marginTop:"8px",
      color:"#8fd3a7",
      fontSize:".76rem",
      fontWeight:700
    }}>✓ {successText}</span>}
  </>;
}
