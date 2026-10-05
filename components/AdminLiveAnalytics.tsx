"use client";
import {useEffect,useState} from "react";

type LiveData={
  generated_at:string;
  active_now:number;
  sessions_5m:number;
  sessions_30m:number;
  pages:{path:string;active:number}[];
  sources:{source:string;active:number}[];
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

    <div className="adminLiveKpis">
      <article><span>Usuarios en línea ahora</span><strong>{data.active_now}</strong><small>últimos 2 min</small></article>
      <article><span>Sesiones recientes</span><strong>{data.sessions_5m}</strong><small>últimos 5 min</small></article>
      <article><span>Sesiones recientes</span><strong>{data.sessions_30m}</strong><small>últimos 30 min</small></article>
      <article><span>Última actualización</span><strong>{new Date(data.generated_at).toLocaleTimeString([],{hour:"2-digit",minute:"2-digit",second:"2-digit"})}</strong><small>{paused?"pausado":"automático"}</small></article>
    </div>

    <div className="adminLiveGrid">
      <div className="adminLiveBlock">
        <div className="adminLiveBlockHead"><h3>Páginas activas</h3><span>{data.pages.length}</span></div>
        {data.pages.length?data.pages.map(p=><div className="adminLiveRow" key={p.path}><span>{p.path}</span><strong>{p.active}</strong></div>):<p className="note">No hay usuarios activos en este momento.</p>}
      </div>
      <div className="adminLiveBlock">
        <div className="adminLiveBlockHead"><h3>Origen activo</h3><span>{data.sources.length}</span></div>
        {data.sources.length?data.sources.map(s=><div className="adminLiveRow" key={s.source}><span>{s.source}</span><strong>{s.active}</strong></div>):<p className="note">Sin fuentes activas ahora.</p>}
      </div>
      <div className="adminLiveBlock adminLiveFeed">
        <div className="adminLiveBlockHead"><h3>Eventos recientes</h3><span>30 min</span></div>
        {data.recent_events.length?data.recent_events.map((e,i)=><div className="adminLiveEvent" key={e.created_at+e.event_name+i}>
          <i className={"eventDot "+e.event_name}/>
          <div><strong>{e.label}</strong><span>{e.path} · {e.source}{e.locale?` · ${e.locale.toUpperCase()}`:""}</span></div>
          <time>{since(e.created_at)}</time>
        </div>):<p className="note">Aún no hay eventos recientes.</p>}
      </div>
    </div>
  </section>;
}
