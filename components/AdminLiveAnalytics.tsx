"use client";
import {useEffect,useState} from "react";

type LiveData={
  generated_at:string;
  active_now:number;
  sessions_5m:number;
  sessions_30m:number;
  pages:{path:string;active:number}[];
  sources:{source:string;active:number}[];
  action_counts:{leads:number;amazon:number;patreon:number;test:number;share:number;merch:number};
  recent_leads:{name:string;email:string;locale:string;created_at:string}[];
  recent_events:{event_name:string;label:string;path:string;source:string;locale:string;created_at:string}[];
  error?:string;
};

function since(value:string){
  const s=Math.max(0,Math.round((Date.now()-new Date(value).getTime())/1000));
  if(s<60)return `${s}s`;
  return `${Math.floor(s/60)}m`;
}

export function AdminLiveAnalytics(){
  const[data,setData]=useState<LiveData|null>(null);
  const[paused,setPaused]=useState(false);

  useEffect(()=>{
    let timer:number|undefined;
    const load=()=>fetch("/api/admin/live-analytics",{cache:"no-store"})
      .then(r=>r.json()).then(setData).catch(()=>{});
    load();
    if(!paused)timer=window.setInterval(load,15000);
    return()=>{if(timer)window.clearInterval(timer)};
  },[paused]);

  if(!data)return <section className="card adminLivePanel"><p>Cargando actividad en vivo…</p></section>;
  if(data.error)return <section className="card adminLivePanel"><p>No fue posible cargar la actividad en vivo.</p></section>;

  const actions=[
    ["Leads",data.action_counts.leads],
    ["Amazon",data.action_counts.amazon],
    ["Patreon",data.action_counts.patreon],
    ["Test",data.action_counts.test],
    ["Share",data.action_counts.share],
    ["Merch",data.action_counts.merch]
  ] as const;

  return <section className="card adminLivePanel">
    <div className="adminPanelHeader">
      <div>
        <div className="kicker">ACTIVIDAD EN VIVO</div>
        <h2>Tráfico en tiempo real</h2>
        <p className="note">Actualización automática cada 15 segundos. “En línea ahora” usa presencia registrada en los últimos 2 minutos.</p>
      </div>
      <div className="adminLiveTools">
        <span className="adminLivePulse"><i/>LIVE</span>
        <button type="button" className="btn btnGhost" onClick={()=>setPaused(v=>!v)}>{paused?"Reanudar":"Pausar"}</button>
      </div>
    </div>

    <div className="adminLiveKpis" style={{gap:8}}>
      <article style={{minHeight:74,padding:"10px 12px"}}><span>Usuarios en línea ahora</span><strong>{data.active_now}</strong><small>últimos 2 min</small></article>
      <article style={{minHeight:74,padding:"10px 12px"}}><span>Sesiones recientes</span><strong>{data.sessions_5m}</strong><small>últimos 5 min</small></article>
      <article style={{minHeight:74,padding:"10px 12px"}}><span>Sesiones recientes</span><strong>{data.sessions_30m}</strong><small>últimos 30 min</small></article>
      <article style={{minHeight:74,padding:"10px 12px"}}><span>Última actualización</span><strong>{new Date(data.generated_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</strong><small>{paused?"pausado":"automático"}</small></article>
    </div>

    <div
      className="adminLiveActions"
      style={{
        display:"grid",
        gridTemplateColumns:"repeat(3,minmax(0,1fr))",
        gap:6,
        margin:"8px 0 10px"
      }}
    >
      {actions.map(([label,value])=><article
        key={label}
        style={{
          minHeight:46,
          padding:"6px 8px",
          display:"grid",
          gridTemplateColumns:"minmax(0,1fr) auto",
          gridTemplateRows:"auto auto",
          columnGap:6,
          rowGap:0,
          alignItems:"center"
        }}
      >
        <span style={{fontSize:".62rem",lineHeight:1.1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{label}</span>
        <strong style={{fontSize:"1.05rem",lineHeight:1,textAlign:"right"}}>{value}</strong>
        <small style={{gridColumn:"1 / -1",fontSize:".50rem",lineHeight:1.1,marginTop:1}}>30 min</small>
      </article>)}
    </div>

    <div className="adminLiveGrid" style={{display:"grid",gridTemplateColumns:"repeat(2,minmax(0,1fr))",gap:10,alignItems:"start"}}>
      <div className="adminLiveBlock" style={{minHeight:0,maxHeight:230,overflow:"auto",padding:12}}>
        <div className="adminLiveBlockHead"><h3>Páginas activas</h3><span>{data.pages.length}</span></div>
        {data.pages.length?data.pages.map(p=><div className="adminLiveRow" key={p.path}><span title={p.path} style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.path}</span><strong>{p.active}</strong></div>):<p className="note">No hay usuarios activos en este momento.</p>}
      </div>
      <div className="adminLiveBlock" style={{minHeight:0,maxHeight:230,overflow:"auto",padding:12}}>
        <div className="adminLiveBlockHead"><h3>Origen activo</h3><span>{data.sources.length}</span></div>
        {data.sources.length?data.sources.map(s=><div className="adminLiveRow" key={s.source}><span title={s.source} style={{minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.source}</span><strong>{s.active}</strong></div>):<p className="note">Sin fuentes activas ahora.</p>}
      </div>
      <div className="adminLiveBlock" style={{minHeight:0,maxHeight:230,overflow:"auto",padding:12}}>
        <div className="adminLiveBlockHead"><h3>Leads recientes</h3><span>30 min</span></div>
        {data.recent_leads.length?data.recent_leads.map((lead,i)=><div className="adminLiveEvent" key={lead.email+lead.created_at+i}>
          <i className="eventDot lead_submit"/>
          <div style={{minWidth:0}}><strong>{lead.name||"Nuevo lead"}</strong><span title={lead.email} style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lead.email}{lead.locale?` · ${lead.locale.toUpperCase()}`:""}</span></div>
          <time>{since(lead.created_at)}</time>
        </div>):<p className="note">No hay leads recientes.</p>}
      </div>
      <div className="adminLiveBlock adminLiveFeed" style={{minHeight:0,maxHeight:230,overflow:"auto",padding:12}}>
        <div className="adminLiveBlockHead"><h3>Eventos recientes</h3><span>30 min</span></div>
        {data.recent_events.length?data.recent_events.map((e,i)=><div className="adminLiveEvent" key={e.created_at+e.event_name+i}>
          <i className={"eventDot "+e.event_name}/>
          <div style={{minWidth:0}}><strong>{e.label}</strong><span title={`${e.path} · ${e.source}`} style={{display:"block",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{e.path} · {e.source}{e.locale?` · ${e.locale.toUpperCase()}`:""}</span></div>
          <time>{since(e.created_at)}</time>
        </div>):<p className="note">Aún no hay eventos recientes.</p>}
      </div>
    </div>
  </section>;
}
