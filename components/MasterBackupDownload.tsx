"use client";

import {useState} from "react";

export function MasterBackupDownload(){
  const[loading,setLoading]=useState(false);
  const[message,setMessage]=useState("");
  const[ok,setOk]=useState<boolean|null>(null);

  async function download(){
    if(loading)return;
    setLoading(true);
    setOk(null);
    setMessage("Preparando copia…");
    try{
      const response=await fetch("/api/admin/backup",{credentials:"include",cache:"no-store"});
      if(!response.ok){
        const body=await response.json().catch(()=>({}));
        throw new Error(body?.error||"backup_failed");
      }
      const status=response.headers.get("x-fragmentun-backup-status")||"complete";
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
      setOk(status!=="partial");
      setMessage(status==="partial"
        ?"La copia se descargó, pero contiene elementos pendientes de recuperación."
        :"Copia completa preparada y descargada.");
    }catch(error:any){
      const reason=String(error?.message||error);
      setOk(false);
      setMessage(reason==="mfa_required"?"Debes completar la verificación en dos pasos antes de descargar la copia.":"No fue posible preparar la copia.");
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button type="button" className="masterQaButton" onClick={download} disabled={loading}>
      {loading?"Preparando…":"Descargar copia externa"}
    </button>
    {message&&<p role="status" style={{margin:"8px 0 0",fontSize:".76rem",color:ok===false?"#ffaaaa":ok===true?"#8aebbd":"#9fb0c6"}}>{message}</p>}
  </div>;
}
