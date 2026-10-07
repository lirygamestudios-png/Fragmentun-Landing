"use client";

import type {ButtonHTMLAttributes} from "react";
import {useFormStatus} from "react-dom";

type Props=ButtonHTMLAttributes<HTMLButtonElement>&{
  pendingText?:string;
};

export function MasterSubmitButton({children,disabled,pendingText="Procesando…",type,...props}:Props){
  const{pending}=useFormStatus();
  return <button
    {...props}
    type={type||"submit"}
    disabled={disabled||pending}
    aria-busy={pending}
  >
    {pending?pendingText:children}
  </button>;
}
