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
  communityBalances?:Record<string,number>;
};

export function MasterSubmitButton({
  children,
  disabled,
  pendingText="Procesando…",
  successText="Acción completada.",
  confirmText,
  disabledReason="Esta acción no está disponible todavía.",
  communityBalances,
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
    let message=confirmText;
    if(communityBalances&&event.currentTarget.form){
      const fields=new FormData(event.currentTarget.form);
      const memberId=String(fields.get("member_id")||"");
      const raw=String(fields.get("points_delta")||"");
      const delta=Number(raw);
      const balance=communityBalances[memberId];
      if(Number.isSafeInteger(balance)&&balance>=0&&raw.trim()!==""&&Number.isSafeInteger(delta)&&Math.abs(delta)<=100000){
        const applied=Math.max(-balance,delta);
        message="¿Confirmas el movimiento de puntos?\n\nSaldo consultado: "+balance+"\nSolicitado: "+delta+"\nAplicación estimada: "+applied+"\nSaldo estimado: "+(balance+applied)+"\n\nEl servidor recalculará el saldo al guardar.";
        if(balance+applied>100000000){
          event.preventDefault();
          window.alert("El saldo estimado superaría el límite de 100.000.000 puntos. Reduce la cantidad antes de continuar.");
          return;
        }
      }
    }
    if(message&&!window.confirm(message)){
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
