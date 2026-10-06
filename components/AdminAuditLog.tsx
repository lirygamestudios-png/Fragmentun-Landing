"use client";
import { useEffect,useState } from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

const ACTION_LABELS:Record<string,string>={
  insert:"Creación",update:"Actualización",delete:"Eliminación",login:"Acceso",logout:"Salida"
};
const TABLE_LABELS:Record<string,string>={
  localized_content:"Contenido web",books:"Saga",book_editions:"Ediciones",characters:"Personajes",
  media_assets:"Medios",leads:"Suscriptores",reviews:"Reseñas",admin_profiles:"Usuarios",
  admin_access_allowlist:"Accesos",campaigns:"Campañas",map_regions:"Territorios",map_points:"Puntos del mapa"
};
function actionLabel(v:string){return ACTION_LABELS[String(v||"").toLowerCase()]||String(v||"—").replace(/_/g," ")}
function tableLabel(v:string){return TABLE_LABELS[String(v||"")]||String(v||"—").replace(/_/g," ")}

export function AdminAuditLog(){
  const[data,setData]=useState<any>(null);

  useEffect(()=>{
    fetch("/api/admin/audit").then(r=>r.json()).then(setData);
  },[]);

  if(!data)return <FragmentunProcessOverlay compact state="loading" title="CARGANDO AUDITORÍA…"/>;
  if(data.error)return <p className="adminSaveFeedback error">No fue posible cargar la auditoría.</p>;

  return <div className="card">
    <h2>Actividad administrativa reciente</h2>
    <div className="adminTableWrap">
      <table className="adminTable">
        <thead><tr><th>Fecha</th><th>Acción</th><th>Área</th><th>Referencia</th><th>Usuario</th></tr></thead>
        <tbody>{(data.items||[]).map((r:any)=>{
          const actor=r.actor_name ? [r.actor_name,r.actor_role].filter(Boolean).join(" · ") : (r.user_id||"Sistema");
          return <tr key={r.id}>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td>{actionLabel(r.action)}</td>
            <td>{tableLabel(r.table_name)}</td>
            <td>{r.record_id||"—"}</td>
            <td>{actor}</td>
          </tr>;
        })}</tbody>
      </table>
    </div>
  </div>;
}
