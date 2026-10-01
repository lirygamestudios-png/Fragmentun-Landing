"use client";
import { useEffect,useState } from "react";

export function AdminSystemStatus(){
  const[data,setData]=useState<any>(null);

  useEffect(()=>{
    fetch("/api/admin/status").then(r=>r.json()).then(setData);
  },[]);

  if(!data)return <p>Cargando estado…</p>;
  if(data.error)return <p>No fue posible cargar el estado.</p>;

  return <div>
    <div className="kpis">
      <div className="kpi"><span>Configuraciones detectadas</span><strong>{data.configured}/{data.total}</strong></div>
      <div className="kpi"><span>Requisitos críticos</span><strong>{data.ready_required?"OK":"Pendientes"}</strong></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Configuración de producción</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Servicio</th><th>Estado</th><th>Prioridad</th></tr></thead>
          <tbody>{(data.checks||[]).map((c:any)=><tr key={c.key}>
            <td>{c.label}</td>
            <td><strong>{c.ok?"✓ Configurado":"✕ Pendiente"}</strong></td>
            <td>{c.required?"Requerido":"Opcional / según fase"}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <p className="note">Este panel solo muestra si una variable existe; nunca expone tokens, claves ni valores secretos.</p>
    </div>
  </div>;
}
