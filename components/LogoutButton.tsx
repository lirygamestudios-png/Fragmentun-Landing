"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function LogoutButton(){
  const router=useRouter();
  const[loading,setLoading]=useState(false);

  async function logout(){
    setLoading(true);
    await fetch("/api/auth/logout",{method:"POST"});
    router.replace("/admin/login");
    router.refresh();
  }

  return <button className="btn btnGhost" type="button" onClick={logout} disabled={loading}>
    {loading?"Saliendo…":"Cerrar sesión"}
  </button>;
}
