"use client";

import {useEffect,useState} from "react";
import styles from "../app/admin/master/master-admin.module.css";
import type {MasterLiveSnapshot} from "../lib/master-live";

function money(cents:number,currency:string){
  if(currency==="MULTI") return "Varias monedas";
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format(cents/100);
}

function stageLabel(value:string){
  const labels:Record<string,string>={
    concept:"Concepto",pre_production:"Preproducción",vertical_slice:"Vertical slice",
    production:"Producción",alpha:"Alpha",beta:"Beta",release_candidate:"Candidato",
    launch:"Lanzamiento",liveops:"Live Ops",sunset:"Cierre"
  };
  return labels[value]||value.replaceAll("_"," ");
}

export function MasterCommanderLive({initial}:{initial:MasterLiveSnapshot}){
  const[snapshot,setSnapshot]=useState(initial);
  const[connected,setConnected]=useState(true);

  useEffect(()=>{
    let alive=true;
    const refresh=async()=>{
      try{
        const response=await fetch("/api/admin/master/live",{cache:"no-store"});
        const body=await response.json();
        if(alive&&response.ok&&body?.snapshot){
          setSnapshot(body.snapshot);
          setConnected(true);
        }else if(alive){
          setConnected(false);
        }
      }catch{
        if(alive)setConnected(false);
      }
    };
    const timer=window.setInterval(refresh,15000);
    return()=>{alive=false;window.clearInterval(timer);};
  },[]);

  const updated=new Date(snapshot.generatedAt).toLocaleTimeString("es-US",{hour:"2-digit",minute:"2-digit",second:"2-digit"});

  return <>
    <section className={styles.commandStatusBar}>
      <div><i className={connected?styles.signalLive:styles.signalOffline}></i><strong>{connected?"DATOS EN VIVO":"CONEXIÓN INTERRUMPIDA"}</strong><span>Actualización automática cada 15 segundos</span></div>
      <div><span>Última lectura</span><strong>{updated}</strong></div>
    </section>

    <section className={styles.commandKpis}>
      <article className={styles.commandKpiPrimary}><small>Usuarios activos ahora</small><strong>{snapshot.activeUsers.toLocaleString()}</strong><span>Sesiones con presencia en los últimos 5 minutos</span></article>
      <article><small>Jugadores activos hoy</small><strong>{snapshot.gamePlayersToday.toLocaleString()}</strong><span>Telemetría diaria de videojuegos</span></article>
      <article><small>Ventas hoy</small><strong>{money(snapshot.salesTodayCents,snapshot.salesCurrency)}</strong><span>{snapshot.paidOrdersToday} transacciones pagadas</span></article>
      <article><small>Ventas este mes</small><strong>{money(snapshot.salesMonthCents,snapshot.salesCurrency)}</strong><span>{snapshot.paidOrdersMonth} transacciones pagadas</span></article>
      <article><small>Pagos fallidos hoy</small><strong>{snapshot.failedPaymentsToday}</strong><span>{snapshot.failedPaymentsToday?"Requiere revisión":"Sin incidencias registradas"}</span></article>
      <article><small>Nuevos contactos hoy</small><strong>{snapshot.leadsToday}</strong><span>Captación registrada</span></article>
      <article><small>Videojuegos</small><strong>{snapshot.activeGames}/{snapshot.portfolioCapacity}</strong><span>Capacidad total del portafolio</span></article>
    </section>

    <section className={styles.commandSectionHead}>
      <div><span>FLOTA DE JUEGOS</span><h2>Situación por videojuego</h2></div>
      <p>Solo aparecen títulos reales. Las métricas individuales se activan cuando cada juego conecta su telemetría y comercio.</p>
    </section>

    <section className={styles.commandGameGrid}>
      {snapshot.games.map(game=><article key={game.id} className={styles.commandGameCard}>
        <div className={styles.commandGameTop}>
          <span className={game.healthStatus==="green"?styles.badgeActive:styles.badgePlanned}>{stageLabel(game.lifecycleStage)}</span>
          <em>{game.healthStatus.toUpperCase()}</em>
        </div>
        <h3>{game.name}</h3>
        <div className={styles.commandGameMetrics}>
          <div><small>Jugadores activos</small><strong>{game.activeUsers===null?"—":game.activeUsers.toLocaleString()}</strong><span>{game.telemetryConnected?"Telemetría conectada":"Pendiente de conexión"}</span></div>
          <div><small>Ventas hoy</small><strong>{game.salesTodayCents===null?"—":money(game.salesTodayCents,game.currency)}</strong><span>{game.commerceConnected?"Comercio conectado":"Pendiente de conexión"}</span></div>
          <div><small>Ventas mes</small><strong>{game.salesMonthCents===null?"—":money(game.salesMonthCents,game.currency)}</strong><span>{game.commerceConnected?"Dato real":"Sin fuente por juego"}</span></div>
        </div>
      </article>)}
      {!snapshot.games.length&&<article className={styles.commandEmptyFleet}>
        <span>PORTAFOLIO PREPARADO</span>
        <h3>0 de 9 videojuegos registrados</h3>
        <p>El Commander Center está listo para incorporar cada título a medida que se cargue. No se muestran videojuegos ficticios.</p>
        <a href="/admin/master/games">Gestionar videojuegos →</a>
      </article>}
    </section>
  </>;
}
