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
  const checks=data.checks||[];
  const emailEs=checks.find((c:any)=>c.key==="mailerlite_automation_es");
  const emailEn=checks.find((c:any)=>c.key==="mailerlite_automation_en");
  const emailReady=!!emailEs?.ok&&!!emailEn?.ok;

  return <div className="adminSecondaryModule adminStatusModule">
    <div className="kpis">
      <div className="kpi"><span>Web</span><strong>{data.launch_status==="GO"?"LISTA":"NO LISTA"}</strong></div>
      <div className="kpi"><span>Email</span><strong>{emailReady?"LISTO":"PENDIENTE"}</strong></div>
      <div className="kpi"><span>Bloqueos críticos web</span><strong>{data.blocker_count||0}</strong></div>
      <div className="kpi"><span>Configuración</span><strong>{data.configured}/{data.total}</strong></div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Lectura rápida</h2>
      <p className="note">{data.launch_status==="GO"
        ?"La web puede operar y captar registros. "
        :"La web todavía tiene requisitos críticos pendientes. "}
        {emailReady
          ?"La secuencia automática de email está activa."
          :"La secuencia automática de email permanece inactiva deliberadamente hasta cerrar el acceso multidispositivo y el remitente institucional."}</p>
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
