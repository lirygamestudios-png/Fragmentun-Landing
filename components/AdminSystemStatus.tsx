"use client";
import { useEffect,useState } from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

export function AdminSystemStatus(){
  const[data,setData]=useState<any>(null);

  useEffect(()=>{
    fetch("/api/admin/status").then(r=>r.json()).then(setData);
  },[]);

  if(!data)return <FragmentunProcessOverlay compact state="loading" title="CARGANDO ESTADO…"/>;
  if(data.error)return <p>No fue posible cargar el estado.</p>;

  const ops=data.operations||{};

  return <div className="adminSecondaryModule adminStatusModule">
    <div className="kpis">
      <div className="kpi"><span>Estado lanzamiento</span><strong>{data.launch_status==="GO"?"LISTO":"NO LISTO"}</strong></div>
      <div className="kpi"><span>Bloqueos críticos</span><strong>{data.blocker_count||0}</strong></div>
      <div className="kpi"><span>Configuraciones detectadas</span><strong>{data.configured}/{data.total}</strong></div>
      <div className="kpi"><span>Requisitos críticos</span><strong>{data.ready_required?"OK":"Pendientes"}</strong></div>
    </div>

    {(data.blockers||[]).length>0&&<div className="card adminSecondaryPanel">
      <h2>Bloqueos de lanzamiento</h2>
      <ul className="statusList">
        {data.blockers.map((b:any)=><li key={b.key}>✕ {b.label}</li>)}
      </ul>
    </div>}

    <div className="card adminSecondaryPanel">
      <h2>Salud operativa</h2>
      <div className="kpis">
        <div className="kpi"><span>Contenido web</span><strong>{ops.content_blocks||0}</strong><small>bloques</small></div>
        <div className="kpi"><span>Personajes</span><strong>{ops.published_characters||0}</strong><small>publicados</small></div>
        <div className="kpi"><span>Medios</span><strong>{ops.public_media||0}</strong><small>recursos</small></div>
        <div className="kpi"><span>Analítica</span><strong>{ops.analytics_events||0}</strong><small>eventos</small></div>
        <div className="kpi"><span>Registros</span><strong>{ops.leads||0}</strong></div>
        <div className="kpi"><span>MailerLite</span><strong>{ops.mailerlite_reachable?"EN LÍNEA":"REVISAR"}</strong></div>
      </div>
      <div className="adminTableWrap" style={{marginTop:18}}>
        <table className="adminTable"><tbody>
          <tr><td>Último evento de analítica</td><td>{ops.latest_analytics_at?new Date(ops.latest_analytics_at).toLocaleString():"—"}</td></tr>
          <tr><td>Último registro</td><td>{ops.latest_lead_at?new Date(ops.latest_lead_at).toLocaleString():"—"}</td></tr>
          <tr><td>Tiempo de respuesta</td><td>{ops.query_ms??"—"} ms</td></tr>
          <tr><td>Almacenamiento</td><td>{(ops.storage_buckets||[]).join(", ")||"—"}</td></tr>
        </tbody></table>
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Recuperación</h2>
      <p className="note">Genera una copia de seguridad versionada del contenido y metadatos públicos. No incluye registros de usuarios, credenciales ni otros datos sensibles.</p>
      <a className="btn btnPrimary" href="/api/admin/backup">Descargar copia de seguridad</a>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Configuración de producción</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Área</th><th>Servicio</th><th>Estado</th><th>Detalle</th><th>Prioridad</th></tr></thead>
          <tbody>{(data.checks||[]).map((c:any)=><tr key={c.key}>
            <td>{c.category||"General"}</td>
            <td>{c.label}</td>
            <td><strong>{c.ok?"✓ OK":"✕ Pendiente"}</strong></td>
            <td>{c.detail||"—"}</td>
            <td>{c.required?"Requerido":"Opcional / según fase"}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="note">El panel combina configuración y comprobaciones operativas sin exponer valores sensibles.</p>
    </div>
  </div>;
}
