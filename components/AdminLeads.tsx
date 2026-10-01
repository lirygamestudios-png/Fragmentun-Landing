"use client";
import { useEffect,useState } from "react";

export function AdminLeads(){
  const[rows,setRows]=useState<any[]>([]);
  const[summary,setSummary]=useState<any>({});
  const[q,setQ]=useState("");
  const[locale,setLocale]=useState("");
  const[status,setStatus]=useState("");
  const[loading,setLoading]=useState(true);

  async function load(){
    setLoading(true);
    const p=new URLSearchParams();
    if(q)p.set("q",q);
    if(locale)p.set("locale",locale);
    if(status)p.set("status",status);
    const r=await fetch("/api/admin/leads?"+p.toString());
    const j=await r.json();
    setRows(j.data||[]);
    setSummary(j.summary||{});
    setLoading(false);
  }

  useEffect(()=>{load()},[]);

  function exportCsv(){
    const p=new URLSearchParams({format:"csv"});
    if(q)p.set("q",q);
    if(locale)p.set("locale",locale);
    if(status)p.set("status",status);
    window.location.href="/api/admin/leads?"+p.toString();
  }

  return <div>
    <div className="kpis">
      <div className="kpi"><span>Resultados</span><strong>{summary.total||0}</strong></div>
      <div className="kpi"><span>MailerLite sincronizados</span><strong>{summary.synced||0}</strong></div>
      <div className="kpi"><span>Pendientes</span><strong>{summary.pending||0}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{summary.errors||0}</strong></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Buscar y filtrar</h2>
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
        <button className="btn btnPrimary" onClick={load}>Aplicar</button>
        <button className="btn btnGhost" onClick={exportCsv}>Exportar CSV</button>
      </div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Leads</h2>
      {loading?<p>Cargando…</p>:<div className="adminTableWrap"><table className="adminTable">
        <thead><tr><th>Fecha</th><th>Correo</th><th>Nombre</th><th>Idioma</th><th>Fuente</th><th>Campaña</th><th>MailerLite</th><th>Consentimiento</th></tr></thead>
        <tbody>{rows.map((r:any)=><tr key={r.id}>
          <td>{new Date(r.created_at).toLocaleDateString()}</td>
          <td>{r.email}</td>
          <td>{r.name||"—"}</td>
          <td>{String(r.locale||"").toUpperCase()}</td>
          <td>{r.source||"direct"}</td>
          <td>{r.campaign||"—"}</td>
          <td>{r.mailerlite_status||"—"}</td>
          <td>{r.consent_marketing?"Sí":"No"}</td>
        </tr>)}</tbody>
      </table></div>}
    </div>
  </div>;
}
