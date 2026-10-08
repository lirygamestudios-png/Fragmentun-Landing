import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function integrationStatusLabel(value:string|undefined){
  const map:Record<string,string>={success:"CORRECTO",error:"ERROR",pending:"PENDIENTE",warning:"ATENCIÓN",skipped:"OMITIDO"};
  return value?(map[value]||String(value).replaceAll("_"," ").toUpperCase()):"—";
}

function eventLabel(value:string|undefined){
  const map:Record<string,string>={
    lead_sync:"Sincronización de contacto",
    lead_created:"Contacto creado",
    lead_updated:"Contacto actualizado",
    campaign_sync:"Sincronización de campaña",
    campaign_created:"Campaña creada",
    webhook_received:"Evento recibido",
    ads_sync:"Sincronización de publicidad",
    config_update:"Configuración actualizada",
    test_connection:"Prueba de conexión",
    automation_trigger:"Automatización ejecutada",
    email_send:"Envío de correo"
  };
  if(!value)return "Evento";
  return map[value]||String(value).replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

export default async function MasterIntegrationsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const[{data:logs},{count:leads},{data:gamePurchases},{data:gameMetrics}]=await Promise.all([
    supabase.from("integration_logs").select("id,integration,event_type,status,message,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("game_purchase_events").select("platform,provider,status,purchased_at").order("purchased_at",{ascending:false}).limit(500),
    supabase.from("game_engagement_daily").select("metric_date,platform,active_players").order("metric_date",{ascending:false}).limit(500)
  ]);

  const rows=(logs||[]) as any[];
  const ok=rows.filter(x=>x.status==="success").length;
  const errors=rows.filter(x=>x.status==="error").length;
  const latest=rows[0];
  const providers=Array.from(new Set(rows.map(x=>x.integration).filter(Boolean)));
  const gamePurchaseRows=(gamePurchases||[]) as any[];
  const gameMetricRows=(gameMetrics||[]) as any[];
  const gamePlatforms=Array.from(new Set([
    ...gamePurchaseRows.map(x=>x.platform).filter(Boolean),
    ...gameMetricRows.map(x=>x.platform).filter(Boolean)
  ]));
  const gameProviders=Array.from(new Set(gamePurchaseRows.map(x=>x.provider).filter(Boolean)));
  const gameErrors=gamePurchaseRows.filter(x=>["failed","chargeback"].includes(x.status)).length;
  const latestGameEvent=gamePurchaseRows[0]?.purchased_at||gameMetricRows[0]?.metric_date||null;
  const gameIngestConfigured=Boolean(process.env.GAME_INGEST_SECRET);

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleIntegrations}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · INTEGRACIONES</span>
        <h1>Integraciones</h1>
        <p>Estado resumido de las conexiones externas utilizadas por el ecosistema.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">IN</span>
      <div className={styles.moduleStripCopy}><small>INTEGRACIONES</small><strong>Conexiones externas y actividad</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Servicios externos conectados</span>
        <span>Credenciales protegidas</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Servicios detectados</small><strong>{providers.length}</strong><span>Con actividad registrada</span></article>
      <article><small>Eventos correctos</small><strong>{ok}</strong><span>Últimos 100 registros</span></article>
      <article className={errors?styles.kpiAttention:undefined}><small>Errores</small><strong>{errors}</strong><span>{errors?"Últimos 100 registros":"Sin errores recientes"}</span></article>
      <article><small>Contactos</small><strong>{(leads||0).toLocaleString()}</strong><span>Base de captación</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · VIDEOJUEGOS</span><h2>Canal de compras y telemetría</h2></div>
      <p>Preparación del ingreso firmado desde videojuegos y plataformas. No se muestran secretos ni credenciales.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Ingreso firmado</small><strong className={styles.kpiCompactValue}>{gameIngestConfigured?"CONFIGURADO":"PENDIENTE"}</strong><span>{gameIngestConfigured?"Secreto disponible en servidor":"Se activará con el primer juego online"}</span></article>
      <article><small>Plataformas detectadas</small><strong>{gamePlatforms.length}</strong><span>{gamePlatforms.length?gamePlatforms.join(" · "):"Sin actividad todavía"}</span></article>
      <article><small>Proveedores detectados</small><strong>{gameProviders.length}</strong><span>{gameProviders.length?gameProviders.join(" · "):"Sin compras registradas"}</span></article>
      <article className={gameErrors?styles.kpiAttention:undefined}><small>Incidencias in-game</small><strong>{gameErrors}</strong><span>{gameErrors?"Fallos o chargebacks":"Sin incidencias registradas"}</span></article>
    </section>

    <section className={styles.grid}>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>PREPARADO</span><em>HMAC</em></div>
        <h3>Endpoint firmado</h3>
        <p>Compras y telemetría entran por un endpoint de servidor con firma, timestamp, rate limit e idempotencia.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>SEPARADO</span><em>IDENTIDAD</em></div>
        <h3>Jugador / FrontDesk</h3>
        <p>No se cruzan automáticamente identidades de jugador y contactos web hasta disponer de una cuenta unificada válida.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONTROLADO</span><em>ACTIVACIÓN</em></div>
        <h3>Primer juego online</h3>
        <p>El secreto y proveedores reales se configurarán cuando exista el primer juego listo para enviar eventos.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVIDAD</span><em>ÚLTIMA SEÑAL</em></div>
        <h3>Eventos de juego</h3>
        <p>{latestGameEvent?String(latestGameEvent):"Sin actividad in-game todavía."}</p>
      </article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>ESTADO GENERAL</span><h2>Conexiones externas</h2></div>
      <p>Este resumen no muestra secretos ni credenciales. La configuración técnica detallada permanece en el panel especializado.</p>
    </section>

    <section className={styles.grid}>
      <a className={styles.card} href="/admin/integrations">
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONFIGURABLE</span><em>CORREO Y PUBLICIDAD</em></div>
        <h3>Panel de Integraciones</h3>
        <p>MailerLite, Meta Ads, Google Ads y TikTok Ads, con historial y configuración existente.</p>
        <span className={styles.cardLink}>Abrir configuración →</span>
      </a>
      <article className={`${styles.card} ${errors?styles.cardAttention:""}`}>
        <div className={styles.cardTop}><span className={errors?styles.badgePlanned:styles.badgeActive}>{errors?"ATENCIÓN":"ESTABLE"}</span><em>HISTORIAL</em></div>
        <h3>Actividad reciente</h3>
        <p>{latest?String(latest.integration||"Servicio")+" · "+eventLabel(latest.event_type)+" · "+integrationStatusLabel(latest.status):"Sin actividad registrada todavía."}</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>PROTEGIDO</span><em>SEGURIDAD</em></div>
        <h3>Credenciales</h3>
        <p>Las credenciales sensibles permanecen fuera del Master Admin y no se muestran en esta pantalla.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>CONSENTIMIENTO</em></div>
        <h3>Publicidad</h3>
        <p>Los seguimientos publicitarios solo deben activarse cuando exista configuración y consentimiento correspondiente.</p>
      </article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>ÚLTIMOS EVENTOS</span><h2>Historial resumido</h2></div>
      <p>Se muestran los registros más recientes para detectar rápidamente errores o actividad pendiente.</p>
    </section>

    <section className={styles.grid}>
      {rows.slice(0,8).map((r:any)=><article key={r.id} className={`${styles.card} ${r.status==="success"?"":styles.cardAttention}`}>
        <div className={styles.cardTop}>
          <span className={r.status==="success"?styles.badgeActive:styles.badgePlanned}>{r.status==="success"?"CORRECTO":"REVISAR"}</span>
          <em>{r.integration||"SERVICIO"}</em>
        </div>
        <h3>{eventLabel(r.event_type)}</h3>
        <p>{r.message||"Sin mensaje adicional."}<br/>{new Date(r.created_at).toLocaleString("es-US")}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin eventos registrados</h3><p>El historial aparecerá aquí cuando las integraciones generen actividad.</p></article>}
    </section>
  </main>;
}
