"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton(){
  const router=useRouter();
  const[loading,setLoading]=useState(false);
  const[status,setStatus]=useState("");
  const[statusType,setStatusType]=useState<"info"|"success"|"error">("info");

  async function logout(){
    if(!window.confirm("¿Confirmas que deseas cerrar la sesión administrativa?"))return;
    setLoading(true);setStatusType("info");setStatus("Cerrando sesión…");
    try{
      const r=await fetch("/api/auth/logout",{method:"POST"});
      if(!r.ok)throw new Error("logout_failed");
      setStatusType("success");setStatus("Sesión cerrada correctamente.");
      router.replace("/admin/login");
      router.refresh();
    }catch{
      setStatusType("error");setStatus("No fue posible cerrar la sesión. Revisa tu conexión e inténtalo nuevamente.");
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button className="btn btnGhost" type="button" onClick={logout} disabled={loading}>
      {loading?"Saliendo…":"Cerrar sesión"}
    </button>
    {status&&<p className={`authStatus ${statusType}`} role="status" aria-live="polite">{status}</p>}
  </div>;
}
