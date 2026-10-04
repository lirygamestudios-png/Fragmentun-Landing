"use client";
import { useEffect,useState } from "react";

export function AdminIntegrationLogs(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/integrations").then(r=>r.json()).then(setData)},[]);

  if(!data)return <p>Cargando integraciones…</p>;
  if(data.error)return <p>No fue posible cargar el historial de integraciones.</p>;

  const items=data.items||[];
  const health=data.health||{};
  const errors=items.filter((x:any)=>x.status==="error").length;
  const success=items.filter((x:any)=>x.status==="success").length;

  return <div>
    <div className="kpis">
      <div className="kpi"><span>Estado MailerLite</span><strong>{health.state||"—"}</strong></div>
      <div className="kpi"><span>Leads sincronizados</span><strong>{health.leads?.synced||0}</strong></div>
      <div className="kpi"><span>Pendientes / sin configurar</span><strong>{(health.leads?.pending||0)+(health.leads?.unconfigured||0)}</strong></div>
      <div className="kpi"><span>Errores de sincronización</span><strong>{health.leads?.error||0}</strong></div>
      <div className="kpi"><span>Eventos recientes</span><strong>{items.length}</strong></div>
      <div className="kpi"><span>Éxitos</span><strong>{success}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{errors}</strong></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Salud de MailerLite</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <tbody>
            <tr><td>API token</td><td><strong>{health.configured?.token?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo ES</td><td><strong>{health.configured?.group_es?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo EN</td><td><strong>{health.configured?.group_en?"✓ Configurado":"— Opcional / pendiente"}</strong></td></tr>
            <tr><td>Último éxito</td><td>{health.last_success_at?new Date(health.last_success_at).toLocaleString():"—"}</td></tr>
            <tr><td>Último error</td><td>{health.last_error_at?new Date(health.last_error_at).toLocaleString():"—"}</td></tr>
          </tbody>
        </table>
      </div>
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
