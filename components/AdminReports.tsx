"use client";
import {useEffect,useState} from "react";

function pct(v:any){return Number(v||0).toFixed(1)+"%";}

export function AdminReports(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/analytics").then(r=>r.json()).then(setData)},[]);
  if(!data)return <div className="adminReportLoading">Preparando reporte ejecutivo…</div>;
  if(data.error)return <div className="formNotice">No fue posible preparar el reporte.</div>;

  const t=data.totals||{};
  const community=data.community||{};
  const sources=(data.by_source||[]).slice(0,8);
  const locales=data.by_locale||[];
  const maxSource=Math.max(1,...sources.map((x:any)=>Number(x.visits||0)));
  const funnel=[
    ["Sesiones",data.funnel?.sessions||0],
    ["Capítulo 1",data.funnel?.chapter_sessions||0],
    ["Suscriptores",data.funnel?.lead_sessions||0],
    ["Amazon",data.funnel?.amazon_sessions||0]
  ];
  const maxFunnel=Math.max(1,...funnel.map((x:any)=>Number(x[1]||0)));

  return <div className="adminReportsPage">
    <div className="adminReportToolbar adminNoPrint">
      <div><div className="kicker">INTELIGENCIA EJECUTIVA</div><h2>Reportes FRAGMENTUN</h2><p>Resumen visual preparado para revisión, impresión o guardado en PDF.</p></div>
      <button className="btn btnPrimary" onClick={()=>window.print()}>Imprimir / Guardar PDF</button>
    </div>

    <section className="adminReportSheet">
      <header className="adminReportSheetHeader">
        <img src="/fragmentun-logo-official.webp" alt="FRAGMENTUN" width="150" height="150"/>
        <div><span>REPORTE EJECUTIVO</span><h1>FRAGMENTUN</h1><p>Audiencia · Conversión · Comunidad · Captación</p></div>
        <aside><b>30 DÍAS</b><small>Panel de administración</small></aside>
      </header>

      <section className="adminReportHeroMetrics">
        <article><span>Sesiones</span><strong>{data.sessions||0}</strong><small>últimos 30 días</small></article>
        <article><span>Suscriptores</span><strong>{data.lead_count||0}</strong><small>{pct(data.conversion_rate)} conversión</small></article>
        <article><span>CTR Amazon</span><strong>{pct(data.amazon_ctr)}</strong><small>{t.amazon_click||0} clics</small></article>
        <article><span>Test emocional</span><strong>{t.test_complete||0}</strong><small>completados</small></article>
      </section>

      <section className="adminReportTwoCol">
        <article className="adminReportBlock">
          <div className="adminReportBlockHead"><div><span>EMBUDO</span><h2>Conversión principal</h2></div><b>{pct(data.session_tracking_coverage)} cobertura</b></div>
          <div className="adminReportBarList">
            {funnel.map(([label,value])=><div key={String(label)} className="adminReportBar">
              <div><span>{label}</span><strong>{value}</strong></div>
              <i><b style={{width:`${Math.max(3,Number(value||0)/maxFunnel*100)}%`}}/></i>
            </div>)}
          </div>
        </article>

        <article className="adminReportBlock">
          <div className="adminReportBlockHead"><div><span>COMUNIDAD</span><h2>Interacciones sociales</h2></div></div>
          <div className="adminReportCommunity">
            <div><span>Instagram</span><strong>{community.instagram||0}</strong></div>
            <div><span>YouTube</span><strong>{community.youtube||0}</strong></div>
            <div><span>Facebook</span><strong>{community.facebook||0}</strong></div>
            <div><span>Otros</span><strong>{(community.tiktok||0)+(community.x||0)+(community.unknown||0)}</strong></div>
          </div>
        </article>
      </section>

      <section className="adminReportTwoCol">
        <article className="adminReportBlock">
          <div className="adminReportBlockHead"><div><span>ADQUISICIÓN</span><h2>Fuentes de tráfico</h2></div></div>
          <div className="adminReportBarList">
            {sources.length?sources.map((row:any)=><div key={row.source} className="adminReportBar compact">
              <div><span>{row.source||"Directo"}</span><strong>{row.visits||0}</strong></div>
              <i><b style={{width:`${Math.max(3,Number(row.visits||0)/maxSource*100)}%`}}/></i>
            </div>):<p className="note">Todavía no hay suficiente tráfico atribuido para este gráfico.</p>}
          </div>
        </article>

        <article className="adminReportBlock">
          <div className="adminReportBlockHead"><div><span>MERCADOS</span><h2>Rendimiento por idioma</h2></div></div>
          <div className="adminReportLocaleTable">
            <div className="head"><span>Idioma</span><span>Visitas</span><span>Leads</span><span>Conv.</span></div>
            {locales.map((row:any)=><div key={row.locale}><strong>{String(row.locale||"").toUpperCase()}</strong><span>{row.visits||0}</span><span>{row.leads||0}</span><span>{pct(row.conversion)}</span></div>)}
          </div>
        </article>
      </section>

      <section className="adminReportFootMetrics">
        <div><span>Patreon</span><strong>{t.patreon_click||0}</strong><small>{pct(data.patreon_ctr)} CTR</small></div>
        <div><span>Comunidad</span><strong>{t.community_click||0}</strong><small>{pct(data.community_ctr)} CTR</small></div>
        <div><span>Recompensa</span><strong>{data.funnel?.share_download_sessions||0}</strong><small>descargas</small></div>
        <div><span>MailerLite</span><strong>{data.mailerlite?.synced||0}</strong><small>sincronizados</small></div>
      </section>

      <footer className="adminReportSheetFooter"><span>José Liranzo · FRAGMENTUN</span><span>fragmentun.com · Reporte generado desde datos del panel</span></footer>
    </section>
  </div>;
}
