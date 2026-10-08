import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function statusLabel(value:string|undefined){
  const map:Record<string,string>={
    open:"ABIERTO",investigating:"INVESTIGANDO",contained:"CONTENIDO",monitoring:"EN SEGUIMIENTO",
    resolved:"RESUELTO",closed:"CERRADO",planned:"PLANIFICADO",approved:"APROBADO",in_progress:"EN CURSO",
    completed:"COMPLETADO",failed:"REVISAR",passed:"CORRECTA",canceled:"CANCELADO",paused:"PAUSADO",
    pending:"PENDIENTE",rolled_back:"REVERTIDO"
  };
  return value?(map[value]||String(value).replaceAll("_"," ").toUpperCase()):"—";
}

function riskLabel(value:string|undefined){
  const map:Record<string,string>={low:"BAJO",medium:"MEDIO",high:"ALTO",critical:"CRÍTICO"};
  return value?(map[value]||String(value).replaceAll("_"," ").toUpperCase()):"—";
}

export default async function MaintenancePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {count:auditCount},
    {data:lastValidation},
    {data:lastIncident},
    {data:lastChange}
  ]=await Promise.all([
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("runtime_validation_runs").select("status,executed_at,run_code").order("executed_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("security_incidents").select("status,severity,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("tech_changes").select("status,risk_level,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleMaintenance}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · MANTENIMIENTO</span>
        <h1>Mantenimiento</h1>
        <p>Centro operativo para revisar copias, integraciones, seguridad, cambios técnicos y pruebas del sistema.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">MT</span>
      <div className={styles.moduleStripCopy}><small>MANTENIMIENTO</small><strong>Rutinas, pruebas y continuidad</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Estado operativo conectado</span>
        <span>Mantenimiento controlado</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Acciones registradas</small><strong>{(auditCount||0).toLocaleString()}</strong><span>Historial administrativo</span></article>
      <article className={lastValidation?.status==="failed"?styles.kpiAttention:undefined}><small>Última prueba</small><strong>{lastValidation?.status==="passed"?"CORRECTA":lastValidation?.status==="failed"?"REVISAR":"—"}</strong><span>{lastValidation?.executed_at?new Date(lastValidation.executed_at).toLocaleString("es-US"):"Sin pruebas"}</span></article>
      <article className={lastIncident&&!["resolved","closed"].includes(lastIncident.status)&&["high","critical"].includes(lastIncident.severity)?styles.kpiAttention:undefined}><small>Último incidente</small><strong>{statusLabel(lastIncident?.status)}</strong><span>{lastIncident?.severity?riskLabel(lastIncident.severity):"Sin incidentes registrados"}</span></article>
      <article className={lastChange&&["high","critical"].includes(lastChange.risk_level)&&!["completed","canceled","rolled_back"].includes(lastChange.status)?styles.kpiAttention:undefined}><small>Último cambio técnico</small><strong>{statusLabel(lastChange?.status)}</strong><span>{lastChange?.risk_level?riskLabel(lastChange.risk_level):"Sin cambios registrados"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>RUTINAS</span><h2>Mantenimiento recomendado</h2></div>
      <p>Estas tareas concentran el mantenimiento periódico del ecosistema sin modificar producción por sí solas.</p>
    </section>

    <section className={styles.grid}>
      <a className={styles.card} href="/admin/master/backups">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>COPIAS</em></div>
        <h3>Copias y Recuperación</h3>
        <p>Descargar una copia externa protegida y conservarla fuera del sistema.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/integrations">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>CONEXIONES</em></div>
        <h3>Integraciones</h3>
        <p>Revisar correo, publicidad y actividad de servicios externos.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={`${styles.card} ${lastValidation?.status==="failed"?styles.cardAttention:styles.cardPriority}`} href="/admin/master/observability">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>PRUEBAS</em></div>
        <h3>Estado y Pruebas</h3>
        <p>Ejecutar comprobaciones de la versión de prueba y consultar resultados históricos.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={`${styles.card} ${styles.cardDecision}`} href="/admin/master/releases">
        <div className={styles.cardTop}><span className={styles.badgePlanned}>CONTROL</span><em>PUBLICACIÓN</em></div>
        <h3>Revisión antes de publicar</h3>
        <p>Ver evidencia, bloqueos y aprobación humana antes de cualquier publicación.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={`${styles.card} ${lastIncident&&!["resolved","closed"].includes(lastIncident.status)&&["high","critical"].includes(lastIncident.severity)?styles.cardAttention:""}`} href="/admin/master/security">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>SEGURIDAD</em></div>
        <h3>Seguridad</h3>
        <p>Revisar accesos, incidentes y continuidad.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={`${styles.card} ${lastChange&&["high","critical"].includes(lastChange.risk_level)&&!["completed","canceled","rolled_back"].includes(lastChange.status)?styles.cardWarning:""}`} href="/admin/master/technology">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>CAMBIOS</em></div>
        <h3>Tecnología</h3>
        <p>Consultar infraestructura, cambios técnicos, pruebas y riesgos.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/audit">
        <div className={styles.cardTop}><span className={styles.badgeActive}>DISPONIBLE</span><em>HISTORIAL</em></div>
        <h3>Auditoría</h3>
        <p>Consultar acciones administrativas y trazabilidad.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={`${styles.card} ${styles.cardDecision}`} href="/admin/master/checklist">
        <div className={styles.cardTop}><span className={styles.badgePlanned}>REVISIÓN</span><em>PANTALLAS</em></div>
        <h3>Revisión visual</h3>
        <p>Recorrer todas las pantallas del Master Admin antes de las pruebas finales.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>Regla operativa</strong>
        <span>Las rutinas de mantenimiento preparan evidencia y diagnóstico; ninguna de estas pantallas publica cambios en producción por sí sola.</span>
      </div>
      <code>Versión de prueba primero</code>
    </section>
  </main>;
}
