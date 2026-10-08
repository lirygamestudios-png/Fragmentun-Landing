"use client";
import { useEffect,useState } from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

export function AdminLeads(){
  const[rows,setRows]=useState<any[]>([]);
  const[summary,setSummary]=useState<any>({});
  const[q,setQ]=useState("");
  const[locale,setLocale]=useState("");
  const[status,setStatus]=useState("");
  const[profile,setProfile]=useState("");
  const[loading,setLoading]=useState(true);
  const[loadError,setLoadError]=useState(false);
  const[actionMsg,setActionMsg]=useState("");

  async function load(){
    setLoading(true);
    try{
      const p=new URLSearchParams();
      if(q)p.set("q",q);
      if(locale)p.set("locale",locale);
      if(status)p.set("status",status);
      if(profile)p.set("profile",profile);
      const r=await fetch("/api/admin/leads?"+p.toString());
      const j=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error("load_failed");
      setRows(j.data||[]);
      setSummary(j.summary||{});
      setLoadError(false);
    }catch{
      setLoadError(true);
    }finally{
      setLoading(false);
    }
  }

  useEffect(()=>{load()},[]);

  async function retry(id:string){
    setActionMsg("Reintentando sincronización…");
    try{
      const r=await fetch("/api/admin/leads/retry",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id})
      });
      const j=await r.json().catch(()=>({}));
      setActionMsg(r.ok?"Sincronizado con MailerLite ✓":j.error==="mailerlite_unconfigured"?"MailerLite todavía no está configurado.":"No se pudo sincronizar.");
      await load();
    }catch{
      setActionMsg("No fue posible reintentar la sincronización. Revisa la conexión.");
    }
  }

  async function deleteLead(id:string,email:string){
    const ok=window.confirm(`Eliminar permanentemente el registro ${email}? Esta acción no se puede deshacer.`);
    if(!ok)return;

    setActionMsg("Eliminando registro…");
    try{
      const r=await fetch("/api/admin/leads/delete",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id,confirmation:"DELETE"})
      });
      const j=await r.json().catch(()=>({}));

      if(r.ok){
        setActionMsg(j.warning
          ?"Registro eliminado de la base de datos. MailerLite devolvió una advertencia; revisa Integraciones."
          :"Registro eliminado correctamente.");
        await load();
      }else{
        setActionMsg("No se pudo eliminar el registro.");
      }
    }catch{
      setActionMsg("No fue posible eliminar el registro. Revisa la conexión e inténtalo nuevamente.");
    }
  }

  async function exportCsv(){
    setActionMsg("Preparando lista…");
    try{
      const p=new URLSearchParams({format:"csv"});
      if(q)p.set("q",q);
      if(locale)p.set("locale",locale);
      if(status)p.set("status",status);
      if(profile)p.set("profile",profile);
      const r=await fetch("/api/admin/leads?"+p.toString());
      if(!r.ok)throw new Error("export_failed");
      const blob=await r.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;a.download="fragmentun-registros.csv";
      document.body.appendChild(a);a.click();a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setActionMsg("Lista descargada correctamente.");
    }catch{
      setActionMsg("No fue posible descargar la lista.");
    }
  }

  if(loadError)return <section className="card"><p className="adminSaveFeedback error">No fue posible cargar los registros.</p><button type="button" className="btn btnGhost" onClick={()=>window.location.reload()}>Reintentar</button></section>;

  return <div className="adminLeadsModule">
    <div className="kpis">
      <div className="kpi"><span>Resultados</span><strong>{summary.total||0}</strong></div>
      <div className="kpi"><span>MailerLite sincronizados</span><strong>{summary.synced||0}</strong></div>
      <div className="kpi"><span>Pendientes</span><strong>{summary.pending||0}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{summary.errors||0}</strong></div>
    </div>

    <div className="card adminFilterPanel">
      <div className="adminPanelHeader"><div><div className="kicker">Segmentación</div><h2>Buscar y filtrar</h2></div><span className="adminPanelBadge">{summary.total||0} registros</span></div>
      <div className="adminFormGrid">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Correo o nombre"/>
        <select value={locale} onChange={e=>setLocale(e.target.value)}>
          <option value="">Todos los idiomas</option><option value="es">ES</option><option value="en">EN</option>
        </select>
        <select value={status} onChange={e=>setStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="synced">Sincronizado</option>
          <option value="pending">Pendiente</option>
          <option value="unconfigured">MailerLite sin configurar</option>
          <option value="error">Error</option>
        </select>
        <select value={profile} onChange={e=>setProfile(e.target.value)}>
          <option value="">Todos los perfiles</option>
          <option value="vorax">Vorax</option>
          <option value="umbral">Umbral</option>
          <option value="ethelis">Ethelis</option>
          <option value="nara">Nara</option>
          <option value="balance">Balance</option>
        </select>
        <button className="btn btnPrimary" onClick={load}>Aplicar</button>
        <button className="btn btnGhost" onClick={exportCsv}>Descargar lista</button>
      </div>
    </div>

    <div className="card adminLeadTableCard">
      <div className="adminPanelHeader"><div><div className="kicker">Base de datos</div><h2>Registros</h2></div><span className="adminPanelBadge">{loading?"Cargando":rows.length+" visibles"}</span></div>
      {loading?<FragmentunProcessOverlay compact state="loading" title="CARGANDO REGISTROS…"/>:<div className="adminTableWrap"><table className="adminTable">
        <thead><tr><th>Fecha</th><th>Correo</th><th>Nombre</th><th>Idioma</th><th>Fuente</th><th>Campaña</th><th>Perfil</th><th>MailerLite</th><th>Consentimiento</th><th></th></tr></thead>
        <tbody>{rows.map((r:any)=><tr key={r.id}>
          <td>{new Date(r.created_at).toLocaleDateString()}</td>
          <td>{r.email}</td>
          <td>{r.name||"—"}</td>
          <td>{String(r.locale||"").toUpperCase()}</td>
          <td>{r.source||"direct"}</td>
          <td>{r.campaign||"—"}</td>
          <td>{r.emotional_profile?String(r.emotional_profile).toUpperCase():"—"}</td>
          <td>{r.mailerlite_status||"—"}</td>
          <td>{r.consent_marketing?"Sí":"No"}</td>
          <td>
            <div className="heroActions">
              {r.mailerlite_status!=="synced"
                ?<button className="btn btnGhost" onClick={()=>retry(r.id)}>Volver a intentar</button>
                :null}
              <button className="btn btnGhost" onClick={()=>deleteLead(r.id,r.email)}>Eliminar</button>
            </div>
          </td>
        </tr>)}</tbody>
      </table></div>}
    </div>
    {actionMsg&&<p className={actionMsg.toLowerCase().includes("no fue")||actionMsg.toLowerCase().includes("no se pudo")?"adminSaveFeedback error":actionMsg.toLowerCase().includes("correctamente")||actionMsg.includes("✓")?"adminSaveFeedback success":"adminSaveFeedback"} role="status">{actionMsg}</p>}
  </div>;
}
