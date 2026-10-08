"use client";

import {useState} from "react";

export function MasterBackupDownload(){
  const[loading,setLoading]=useState(false);
  const[message,setMessage]=useState("");
  const[state,setState]=useState<"info"|"success"|"warning"|"error">("info");

  async function download(){
    if(loading)return;
    setLoading(true);
    setState("info");
    setMessage("Preparando copia…");
    try{
      const response=await fetch("/api/admin/backup",{credentials:"include",cache:"no-store"});
      if(!response.ok){
        const body=await response.json().catch(()=>({}));
        throw new Error(body?.error||"backup_failed");
      }
      const status=(response.headers.get("x-fragmentun-backup-status")||"complete").toLowerCase();
      const blob=await response.blob();
      const disposition=response.headers.get("content-disposition")||"";
      const match=disposition.match(/filename="([^"]+)"/);
      const filename=match?.[1]||"fragmentun-backup.json";
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download=filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setState(status==="partial"?"warning":"success");
      setMessage(status==="partial"
        ?"La copia se descargó parcialmente. Revisa los elementos pendientes antes de usarla para recuperación."
        :"Copia completa preparada y descargada.");
    }catch(error:any){
      const reason=String(error?.message||error);
      setState("error");
      setMessage(reason==="mfa_required"?"Debes completar la verificación en dos pasos antes de descargar la copia.":reason==="forbidden"?"Tu usuario no tiene permiso para descargar copias.":"No fue posible preparar la copia.");
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button type="button" className="masterQaButton" onClick={download} disabled={loading} aria-busy={loading}>
      {loading?"Preparando…":"Descargar copia externa"}
    </button>
    {message&&<p role={state==="error"?"alert":"status"} aria-live="polite" style={{margin:"8px 0 0",fontSize:".76rem",color:state==="error"?"#ffaaaa":state==="success"?"#8aebbd":state==="warning"?"#e7c878":"#9fb0c6"}}>{message}</p>}
  </div>;
}
