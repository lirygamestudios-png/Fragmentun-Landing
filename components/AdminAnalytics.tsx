"use client";
import { useEffect,useState } from "react";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

function pct(v:any){return Number(v||0).toFixed(1)+"%";}

function sourceLabel(value:unknown){
  const source=String(value||"").toLowerCase();
  if(source==="google")return "Google";
  if(source==="meta")return "Meta";
  if(source==="facebook")return "Facebook";
  if(source==="instagram")return "Instagram";
  if(source==="tiktok")return "TikTok";
  if(source==="youtube")return "YouTube";
  if(source==="direct")return "Directo";
  return String(value||"Otro");
}

function trafficLabel(value:unknown){
  const medium=String(value||"").toLowerCase().replace(/[\s-]+/g,"_");
  if(["cpc","ppc","paid","paid_search"].includes(medium))return "Anuncios";
  if(["paid_social","social_paid"].includes(medium))return "Anuncios en redes";
  if(["display","retargeting","remarketing"].includes(medium))return "Publicidad";
  if(["organic","organic_search"].includes(medium))return "Orgánico";
  if(medium==="organic_social")return "Orgánico en redes";
  if(medium==="organic_video")return "Video orgánico";
  if(medium==="email")return "Email";
  if(medium==="social")return "Redes sociales";
  if(medium==="referral")return "Referido";
  if(medium==="none")return "Directo";
  return String(value||"—");
}

export function AdminAnalytics(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/analytics").then(r=>r.json()).then(setData)},[]);
  if(!data)return <FragmentunProcessOverlay compact state="loading" title="CARGANDO ANALÍTICA…"/>;
  if(data.error)return <p className="adminSaveFeedback error">No fue posible cargar la analítica.</p>;

  const t=data.totals||{};
  const ml=data.mailerlite||{};
  const tp=data.test_profiles||{};
  const experiments=data.experiments||{};
  const community=data.community||{};

  function exportCsv(){window.location.href="/api/admin/analytics?format=csv"}
  function printReport(){window.print()}
  const funnelSteps=[
    ["Sesiones",data.funnel?.sessions||0],
    ["Registros",data.funnel?.lead_sessions||0],
    ["Lectores Cap. 1",data.funnel?.chapter_read_sessions||0],
    ["Amazon",data.funnel?.amazon_sessions||0],
    ["Patreon",data.funnel?.patreon_sessions||0]
  ] as const;
  const funnelMax=Math.max(1,...funnelSteps.map(x=>Number(x[1]||0)));
  const paidMedium=(value:unknown)=>{
    const medium=String(value||"").toLowerCase().replace(/[\s-]+/g,"_");
    return ["cpc","ppc","paid","paid_search","paid_social","social_paid","display","retargeting","remarketing"].includes(medium);
  };
  const paidChannels=(data.by_source||[]).filter((r:any)=>paidMedium(r.medium));
  const organicMedium=(value:unknown)=>{
    const medium=String(value||"").toLowerCase().replace(/[\\s-]+/g,"_");
    return ["organic","organic_search","organic_social","organic_video","social"].includes(medium);
  };
  const organicChannels=(data.by_source||[]).filter((r:any)=>organicMedium(r.medium));
  const organicCampaigns=(data.by_campaign||[]).filter((r:any)=>organicMedium(r.medium));

  return <div className="adminAnalyticsModule">
    <div className="adminModuleToolbar adminNoPrint"><div><div className="kicker">Inteligencia del embudo</div><h2>Rendimiento y conversión</h2></div><div className="adminReportActions"><button className="btn btnGhost" onClick={printReport}>Imprimir / Guardar PDF</button><button className="btn btnGhost" onClick={exportCsv}>Descargar CSV</button></div></div>
    <section className="adminReportCover" id="reportes">
      <div className="adminReportBrand"><img src="/fragmentun-mark.png" alt="" width="48" height="48"/><div><strong>FRAGMENTUN</strong><span>REPORTE EJECUTIVO · ANALÍTICA</span></div></div>
      <div className="adminReportSummary">
        <div><span>Sesiones · 30 días</span><strong>{data.sessions||0}</strong></div>
        <div><span>Conversión a registro</span><strong>{pct(data.conversion_rate)}</strong></div>
        <div><span>Paso a Amazon</span><strong>{pct(data.amazon_ctr)}</strong></div>
        <div><span>Test completados</span><strong>{t.test_complete||0}</strong></div>
      </div>
    </section>
    <section className="card adminInsightPanel adminFunnelVisual">
      <div className="adminPanelHeader"><div><div className="kicker">Visualización ejecutiva</div><h2>Embudo principal</h2></div><span className="adminPanelBadge">30 días</span></div>
      <div className="adminFunnelBars">
        {funnelSteps.map(([label,value])=><div className="adminFunnelRow" key={label}>
          <div><span>{label}</span><strong>{value}</strong></div>
          <i><b style={{width:`${Math.max(4,(Number(value||0)/funnelMax)*100)}%`}}/></i>
        </div>)}
      </div>
    </section>
    <div className="kpis">
      <div className="kpi"><span>Sesiones · 30 días</span><strong>{data.sessions||0}</strong></div>
      <div className="kpi"><span>Vistas de página</span><strong>{t.page_view||0}</strong></div>
      <div className="kpi"><span>Registros</span><strong>{data.lead_count||0}</strong></div>
      <div className="kpi"><span>Conversión sesión → registro</span><strong>{pct(data.conversion_rate)}</strong></div>
      <div className="kpi"><span>Lecturas Capítulo 1</span><strong>{t.chapter_read||0}</strong></div>
      <div className="kpi"><span>Clics Amazon</span><strong>{t.amazon_click||0}</strong></div>
      <div className="kpi"><span>Paso a Amazon</span><strong>{pct(data.amazon_ctr)}</strong></div>
      <div className="kpi"><span>Clics Patreon</span><strong>{t.patreon_click||0}</strong></div>
      <div className="kpi"><span>Paso a Patreon</span><strong>{pct(data.patreon_ctr)}</strong></div>
      <div className="kpi"><span>Clics Comunidad</span><strong>{t.community_click||0}</strong></div>
      <div className="kpi"><span>Paso a Comunidad</span><strong>{pct(data.community_ctr)}</strong></div>
      <div className="kpi"><span>Test completados</span><strong>{t.test_complete||0}</strong></div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Embudo comercial · sesiones</h2>
      <p className="note">Cobertura del nuevo seguimiento por sesión: {pct(data.session_tracking_coverage)}. Los eventos históricos anteriores se conservan por separado y no se mezclan con este embudo.</p>
      <div className="kpis">
        <div className="kpi"><span>Sesiones</span><strong>{data.funnel?.sessions||0}</strong></div>
        <div className="kpi"><span>Clics al Capítulo</span><strong>{data.funnel?.chapter_click_sessions||0}</strong></div>
        <div className="kpi"><span>Registros</span><strong>{data.funnel?.lead_sessions||0}</strong></div>
        <div className="kpi"><span>Lectores Cap. 1</span><strong>{data.funnel?.chapter_read_sessions||0}</strong></div>
        <div className="kpi"><span>Registro → lectura</span><strong>{pct(data.lead_to_chapter_read_ratio)}</strong></div>
        <div className="kpi"><span>Lectura → Amazon</span><strong>{pct(data.chapter_read_to_amazon_ratio)}</strong></div>
        <div className="kpi"><span>Amazon</span><strong>{data.funnel?.amazon_sessions||0}</strong></div>
        <div className="kpi"><span>Patreon</span><strong>{data.funnel?.patreon_sessions||0}</strong></div>
        <div className="kpi"><span>Recompensa desbloqueada</span><strong>{data.funnel?.share_unlock_sessions||0}</strong></div>
        <div className="kpi"><span>Arte descargado</span><strong>{data.funnel?.share_download_sessions||0}</strong></div>
        <div className="kpi"><span>Compartir → descarga</span><strong>{pct(data.share_download_rate)}</strong></div>
      </div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Histórico agregado</h2>
      <div className="kpis">
        <div className="kpi"><span>Vistas de página históricos</span><strong>{data.historical?.page_views||0}</strong></div>
        <div className="kpi"><span>Clics Amazon históricos</span><strong>{data.historical?.amazon_clicks||0}</strong></div>
        <div className="kpi"><span>Paso a Amazon histórico</span><strong>{pct(data.historical?.amazon_ctr_event)}</strong></div>
        <div className="kpi"><span>Clics Patreon históricos</span><strong>{data.historical?.patreon_clicks||0}</strong></div>
      </div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Comunidad y redes sociales</h2>
      <div className="kpis">
        <div className="kpi"><span>Instagram</span><strong>{community.instagram||0}</strong></div>
        <div className="kpi"><span>YouTube</span><strong>{community.youtube||0}</strong></div>
        <div className="kpi"><span>Facebook</span><strong>{community.facebook||0}</strong></div>
        <div className="kpi"><span>Otros</span><strong>{(community.tiktok||0)+(community.x||0)+(community.unknown||0)}</strong></div>
      </div>
    </div>

    {Object.keys(experiments).length>0&&<div className="card adminInsightPanel">
      <h2>Pruebas comparativas</h2>
      <div className="adminTableWrap"><table className="adminTable">
        <thead><tr><th>Experimento</th><th>Variante</th><th>Vistas</th><th>Registros</th><th>Conversión</th></tr></thead>
        <tbody>{Object.entries(experiments).flatMap(([exp,v]:any)=>
          Array.from(new Set([...Object.keys(v.views||{}),...Object.keys(v.leads||{})])).map((variant:any)=>{
            const views=v.views?.[variant]||0;
            const leads=v.leads?.[variant]||0;
            return <tr key={exp+variant}><td>{exp}</td><td>{variant}</td><td>{views}</td><td>{leads}</td><td>{pct(views?leads/views*100:0)}</td></tr>
          })
        )}</tbody>
      </table></div>
    </div>}

    <div className="card adminInsightPanel">
      <h2>Perfiles del Test Emocional</h2>
      <div className="kpis">
        <div className="kpi"><span>Vorax</span><strong>{tp.vorax||0}</strong></div>
        <div className="kpi"><span>Umbral</span><strong>{tp.umbral||0}</strong></div>
        <div className="kpi"><span>Ethelis</span><strong>{tp.ethelis||0}</strong></div>
        <div className="kpi"><span>Nara</span><strong>{tp.nara||0}</strong></div>
        <div className="kpi"><span>Balance</span><strong>{tp.balance||0}</strong></div>
      </div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Estado de captación</h2>
      <div className="kpis">
        <div className="kpi"><span>MailerLite sincronizados</span><strong>{ml.synced||0}</strong></div>
        <div className="kpi"><span>Pendientes / sin configurar</span><strong>{(ml.pending||0)+(ml.unconfigured||0)}</strong></div>
        <div className="kpi"><span>Errores de sincronización</span><strong>{ml.error||0}</strong></div>
      </div>
    </div>

    <div className="card adminInsightPanel">
      <div className="adminPanelHeader"><div><div className="kicker">Tráfico orgánico</div><h2>Redes y contenido orgánico</h2></div><span className="adminPanelBadge">DATOS REALES</span></div>
      {organicChannels.length===0
        ?<p className="note">Todavía no hay tráfico orgánico identificado con seguimiento de campaña. Los enlaces generados desde “Campañas y enlaces” aparecerán aquí cuando reciban visitas reales.</p>
        :<>
          <div className="adminTableWrap"><table className="adminTable">
            <thead><tr><th>Origen</th><th>Tipo de tráfico</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Patreon</th></tr></thead>
            <tbody>{organicChannels.map((r:any)=><tr key={`organic:${r.source}:${r.medium}`}>
              <td>{sourceLabel(r.source)}</td><td>{trafficLabel(r.medium)}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks||0}</td><td>{r.patreonClicks||0}</td>
            </tr>)}</tbody>
          </table></div>
          {organicCampaigns.length>0&&<div style={{marginTop:18}}>
            <div className="kicker">Por campaña / publicación</div>
            <div className="adminTableWrap"><table className="adminTable">
              <thead><tr><th>Campaña</th><th>Origen</th><th>Publicación / video</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Patreon</th></tr></thead>
              <tbody>{organicCampaigns.map((r:any)=><tr key={`organic-campaign:${r.source}:${r.medium}:${r.campaign}:${r.content}`}>
                <td>{r.campaign}</td><td>{sourceLabel(r.source)}</td><td>{r.content||"—"}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks||0}</td><td>{r.patreonClicks||0}</td>
              </tr>)}</tbody>
            </table></div>
          </div>}
        </>}
    </div>

    <div className="card adminInsightPanel">
      <div className="adminPanelHeader"><div><div className="kicker">Tráfico pagado</div><h2>Google + Meta + TikTok Ads</h2></div><span className="adminPanelBadge">LISTO</span></div>
      {paidChannels.length===0
        ?<p className="note">Todavía no hay campañas pagadas registradas. Cuando comiencen Google, Meta o TikTok Ads, sus resultados aparecerán aquí automáticamente.</p>
        :<div className="adminTableWrap"><table className="adminTable">
          <thead><tr><th>Plataforma</th><th>Tipo de tráfico</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Patreon</th></tr></thead>
          <tbody>{paidChannels.map((r:any)=><tr key={`${r.source}:${r.medium}`}>
            <td>{sourceLabel(r.source)}</td><td>{trafficLabel(r.medium)}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks||0}</td><td>{r.patreonClicks||0}</td>
          </tr>)}</tbody>
        </table></div>}
    </div>

    <div className="card adminInsightPanel">
      <h2>Conversión por origen</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Origen</th><th>Tipo de tráfico</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Paso a Amazon</th><th>Patreon</th></tr></thead><tbody>
        {(data.by_source||[]).map((r:any)=><tr key={`${r.source}:${r.medium}`}>
          <td>{sourceLabel(r.source)}</td><td>{trafficLabel(r.medium)}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks}</td><td>{pct(r.amazon_ctr)}</td><td>{r.patreonClicks||0}</td>
        </tr>)}
      </tbody></table></div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Rendimiento por campaña</h2>
      <div className="adminTableWrap"><table className="adminTable">
        <thead><tr><th>Campaña</th><th>Origen</th><th>Tipo de tráfico</th><th>Anuncio / publicación</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Patreon</th></tr></thead>
        <tbody>{(data.by_campaign||[]).map((r:any)=><tr key={`${r.source}:${r.medium}:${r.campaign}:${r.content}`}>
          <td>{r.campaign}</td><td>{sourceLabel(r.source)}</td><td>{trafficLabel(r.medium)}</td><td>{r.content||"—"}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks||0}</td><td>{r.patreonClicks||0}</td>
        </tr>)}</tbody>
      </table></div>
    </div>

    <div className="card adminInsightPanel">
      <h2>Rendimiento por idioma</h2>
      <div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Idioma</th><th>Visitas</th><th>Registros</th><th>Conversión</th><th>Amazon</th><th>Patreon</th></tr></thead><tbody>
        {(data.by_locale||[]).map((r:any)=><tr key={r.locale}>
          <td>{String(r.locale).toUpperCase()}</td><td>{r.visits}</td><td>{r.leads}</td><td>{pct(r.conversion)}</td><td>{r.amazonClicks}</td><td>{r.patreonClicks||0}</td>
        </tr>)}
      </tbody></table></div>
    </div>
  </div>;
}
