"use client";
import { useEffect,useState } from "react";

function pct(v:any){return Number(v||0).toFixed(1)+"%";}

export function AdminAnalytics(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/analytics").then(r=>r.json()).then(setData)},[]);
  if(!data)return <p>Cargando analytics…</p>;
  if(data.error)return <p>No fue posible cargar analytics.</p>;

  const t=data.totals||{};
  const ml=data.mailerlite||{};

  return <div>
    <div className="kpis">
      <div className="kpi"><span>Visitas · 30 días</span><strong>{t.page_view||0}</strong></div>
      <div className="kpi"><span>Leads</span><strong>{data.lead_count||0}</strong></div>
      <div className="kpi"><span>Conversión visita → lead</span><strong>{pct(data.conversion_rate)}</strong></div>
      <div className="kpi"><span>Clics Amazon</span><strong>{t.amazon_click||0}</strong></div>
      <div className="kpi"><span>CTR Amazon</span><strong>{pct(data.amazon_ctr)}</strong></div>
      <div className="kpi"><span>Test completados</span><strong>{t.test_complete||0}</strong></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Estado de captación</h2>
      <div className="kpis">
        <div className="kpi"><span>MailerLite sincronizados</span><strong>{ml.synced||0}</strong></div>
        <div className="kpi"><span>Pendientes / sin configurar</span><strong>{(ml.pending||0)+(ml.unconfigured||0)}</strong></div>
        <div className="kpi"><span>Errores de sincronización</span><strong>{ml.error||0}</strong></div>
      </div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Conversión por fuente</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Fuente</th><th>Visitas</th><th>Leads</th><th>Conv.</th><th>Amazon</th><th>CTR Amazon</th></tr></thead><tbody>
        {(data.by_source||[]).map((r:any)=><tr key={r.source}>
          <td>{r.source}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks}</td><td>{pct(r.amazon_ctr)}</td>
        </tr>)}
      </tbody></table></div>
    </div>

    <div className="card" style={{marginTop:24}}>
      <h2>Rendimiento por idioma</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Idioma</th><th>Visitas</th><th>Leads</th><th>Conv.</th><th>Amazon</th></tr></thead><tbody>
        {(data.by_locale||[]).map((r:any)=><tr key={r.locale}>
          <td>{String(r.locale).toUpperCase()}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks}</td>
        </tr>)}
      </tbody></table></div>
    </div>
  </div>;
}
