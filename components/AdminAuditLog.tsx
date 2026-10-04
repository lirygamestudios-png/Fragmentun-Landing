"use client";
import { useEffect,useState } from "react";

export function AdminAuditLog(){
  const[data,setData]=useState<any>(null);

  useEffect(()=>{
    fetch("/api/admin/audit").then(r=>r.json()).then(setData);
  },[]);

  if(!data)return <p>Cargando auditoría…</p>;
  if(data.error)return <p>No fue posible cargar la auditoría.</p>;

  return <div className="card">
    <h2>Actividad administrativa reciente</h2>
    <div className="adminTableWrap">
      <table className="adminTable">
        <thead><tr><th>Fecha</th><th>Acción</th><th>Tabla</th><th>Registro</th><th>Usuario</th></tr></thead>
        <tbody>{(data.items||[]).map((r:any)=>{
          const actor=r.actor_name ? [r.actor_name,r.actor_role].filter(Boolean).join(" · ") : (r.user_id||"Sistema");
          return <tr key={r.id}>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td>{r.action}</td>
            <td>{r.table_name}</td>
            <td>{r.record_id||"—"}</td>
            <td>{actor}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
