"use client";
import { useEffect,useState } from "react";

export function AdminAnalytics(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/analytics").then(r=>r.json()).then(setData)},[]);
  if(!data)return <p>Cargando analytics…</p>;
  const t=data.totals||{};
  return <div>
    <div className="kpis">
      <div className="kpi"><span>Page views · 30 días</span><strong>{t.page_view||0}</strong></div>
      <div className="kpi"><span>Leads</span><strong>{data.lead_count||0}</strong></div>
      <div className="kpi"><span>Clics Amazon</span><strong>{t.amazon_click||0}</strong></div>
      <div className="kpi"><span>Conversión</span><strong>{Number(data.conversion_rate||0).toFixed(1)}%</strong></div>
    </div>
    <div className="card" style={{marginTop:24}}>
      <h2>Conversión por fuente</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Fuente</th><th>Visitas</th><th>Leads</th><th>Conversión</th></tr></thead><tbody>
        {(data.by_source||[]).map((r:any)=><tr key={r.source}><td>{r.source}</td><td>{r.visits}</td><td>{r.leads}</td><td>{Number(r.conversion||0).toFixed(1)}%</td></tr>)}
      </tbody></table></div>
    </div>
  </div>;
}
