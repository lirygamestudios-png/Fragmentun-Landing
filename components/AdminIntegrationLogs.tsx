"use client";
import { useEffect,useState } from "react";

export function AdminIntegrationLogs(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/integrations").then(r=>r.json()).then(setData)},[]);

  if(!data)return <p>Cargando integraciones…</p>;
  if(data.error)return <p>No fue posible cargar el historial de integraciones.</p>;

  const items=data.items||[];
  const errors=items.filter((x:any)=>x.status==="error").length;
  const success=items.filter((x:any)=>x.status==="success").length;

  return <div>
    <div className="kpis">
      <div className="kpi"><span>Eventos recientes</span><strong>{items.length}</strong></div>
      <div className="kpi"><span>Éxitos</span><strong>{success}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{errors}</strong></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Historial de integraciones</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Fecha</th><th>Integración</th><th>Evento</th><th>Estado</th><th>Entidad</th><th>Mensaje</th></tr></thead>
          <tbody>{items.map((r:any)=><tr key={r.id}>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td>{r.integration}</td>
            <td>{r.event_type}</td>
            <td>{r.status}</td>
            <td>{r.entity_type ? r.entity_type+":"+(r.entity_id||"—") : "—"}</td>
            <td>{r.message||"—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}
