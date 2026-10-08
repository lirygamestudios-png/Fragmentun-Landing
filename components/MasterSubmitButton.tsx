"use client";

import type {ButtonHTMLAttributes,MouseEvent} from "react";
import {useContext,useEffect,useRef,useState} from "react";
import {MasterActionFormContext} from "./MasterActionForm";
import {useFormStatus} from "react-dom";

type Props=ButtonHTMLAttributes<HTMLButtonElement>&{
  pendingText?:string;
  successText?:string;
  confirmText?:string;
  disabledReason?:string;
};

export function MasterSubmitButton({
  children,
  disabled,
  pendingText="Procesando…",
  successText="Acción completada.",
  confirmText,
  disabledReason="Esta acción no está disponible todavía.",
  type,
  onClick,
  ...props
}:Props){
  const{pending}=useFormStatus();
  const managedFeedback=useContext(MasterActionFormContext);
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

  function handleClick(event:MouseEvent<HTMLButtonElement>){
    if(confirmText&&!window.confirm(confirmText)){
      event.preventDefault();
      return;
    }
    onClick?.(event);
  }

  return <>
    <button
      {...props}
      type={type||"submit"}
      disabled={disabled||pending}
      aria-busy={pending}
      onClick={handleClick}
      title={disabled?disabledReason:props.title}
    >
      {pending?pendingText:children}
    </button>
    {disabled&&!pending&&<span aria-live="polite" style={{
      display:"block",
      marginTop:"7px",
      color:"#8e9bad",
      fontSize:".72rem"
    }}>{disabledReason}</span>}
    {success&&!managedFeedback&&<span role="status" aria-live="polite" style={{
      display:"block",
      marginTop:"8px",
      color:"#8fd3a7",
      fontSize:".76rem",
      fontWeight:700
    }}>✓ {successText}</span>}
  </>;
}
