import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function QaFinalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:latestValidation},
    {data:latestGate},
    {count:openIncidents},
    {count:pendingApprovals},
    {count:failedChecks},
    {count:virtualItems},
    {count:virtualOffers},
    {data:latestGamePurchase},
    {data:latestGameMetric},
    {data:gameEntitlements}
  ]=await Promise.all([
    supabase.from("runtime_validation_runs").select("status,executed_at,run_code,deployment_id,commit_sha").order("executed_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("release_gates").select("status,gate_code,created_at,target_deployment_id,target_commit").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("security_incidents").select("*",{count:"exact",head:true}).not("status","in","(resolved,closed)"),
    supabase.from("automation_approvals").select("*",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("release_gate_checks").select("*",{count:"exact",head:true}).eq("status","failed").eq("blocking",true),
    supabase.from("game_virtual_items").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("game_virtual_item_offers").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("game_purchase_events").select("status,purchased_at").order("purchased_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("game_engagement_daily").select("metric_date,updated_at").order("updated_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("game_entitlements").select("status").limit(5000)
  ]);

  const validationOk=latestValidation?.status==="passed";
  const currentDeployment=process.env.VERCEL_DEPLOYMENT_ID||null;
  const currentCommit=process.env.VERCEL_GIT_COMMIT_SHA||null;
  const validationMatchesCurrentDeployment=Boolean(currentDeployment&&latestValidation?.deployment_id===currentDeployment);
  const validationMatchesCurrentCommit=Boolean(currentCommit&&latestValidation?.commit_sha===currentCommit);
  const validationIsCurrent=validationMatchesCurrentDeployment&&validationMatchesCurrentCommit;
  const validationLabel=!latestValidation?"SIN PRUEBA":!validationOk?"REVISAR":validationIsCurrent?"CORRECTA":"DESACTUALIZADA";
  const gateApproved=latestGate?.status==="approved";
  const gateMatchesValidation=Boolean(
    currentDeployment&&currentCommit&&latestValidation?.deployment_id===currentDeployment&&
    latestValidation?.commit_sha===currentCommit&&latestGate?.target_deployment_id===currentDeployment&&
    latestGate?.target_commit===currentCommit
  );
  const gateReady=gateApproved&&validationOk&&gateMatchesValidation&&validationIsCurrent;
  const gateLabel=!latestGate?"SIN REVISIÓN":!gateApproved?"REVISAR":!validationIsCurrent?"NUEVA PRUEBA":gateMatchesValidation?"APROBADA":"VERSIÓN DISTINTA";
  const incidentsOk=(openIncidents||0)===0;
  const approvalsOk=(pendingApprovals||0)===0;
  const checksOk=(failedChecks||0)===0;
  const entitlementIssues=((gameEntitlements||[]) as any[]).filter(e=>["pending","failed"].includes(e.status)).length;
  const freemiumPrepared=(virtualItems||0)>0&&(virtualOffers||0)>0&&entitlementIssues===0;
  const ready=validationOk&&validationIsCurrent&&gateReady&&incidentsOk&&approvalsOk&&checksOk;

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleQa}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · PRUEBAS FINALES</span>
        <h1>Preparación de pruebas finales</h1>
        <p>Resumen de condiciones necesarias antes de considerar el sistema listo para publicación.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">QA</span>
      <div className={styles.moduleStripCopy}><small>PRUEBAS FINALES</small><strong>Condiciones, evidencia y decisión</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Condiciones finales conectadas</span>
        <span>Publicación manual obligatoria</span>
      </div>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>{ready?"Condiciones completas":"Aún no listo para publicar"}</strong>
        <span>{ready?"Las condiciones automáticas principales están correctas. La decisión final sigue siendo humana.":"Todavía existen condiciones pendientes. Esta pantalla no publica cambios."}</span>
      </div>
      <code>{ready?"LISTO PARA DECISIÓN":"VERSIÓN DE PRUEBA"}</code>
    </section>

    <section className={styles.kpis}>
      <article><small>Última prueba</small><strong className={styles.kpiCompactValue}>{validationLabel}</strong><span>{latestValidation?.executed_at?new Date(latestValidation.executed_at).toLocaleString("es-US"):"Sin prueba registrada"}</span></article>
      <article><small>Revisión de publicación</small><strong className={styles.kpiCompactValue}>{gateLabel}</strong><span>{!gateMatchesValidation&&latestGate?"La revisión aprobada corresponde a otra versión":latestGate?.created_at?new Date(latestGate.created_at).toLocaleString("es-US"):"Sin revisión registrada"}</span></article>
      <article><small>Incidentes abiertos</small><strong>{openIncidents||0}</strong><span>{incidentsOk?"Sin bloqueos":"Requiere revisión"}</span></article>
      <article><small>Comprobaciones bloqueantes fallidas</small><strong>{failedChecks||0}</strong><span>{checksOk?"Sin fallos":"Requiere corrección"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · PRELANZAMIENTO</span><h2>Preparación del primer juego online</h2></div>
      <p>Estas comprobaciones miden preparación del circuito de juego. No equivalen a aprobación del Release Gate ni publican producción.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Catálogo virtual activo</small><strong>{virtualItems||0}</strong><span>{(virtualItems||0)>0?"Artículos disponibles":"Pendiente de catálogo real"}</span></article>
      <article><small>Ofertas activas</small><strong>{virtualOffers||0}</strong><span>{(virtualOffers||0)>0?"Precios/plataformas configurados":"Pendiente de ofertas reales"}</span></article>
      <article className={entitlementIssues?styles.kpiAttention:undefined}><small>Entregas por revisar</small><strong>{entitlementIssues}</strong><span>{entitlementIssues?"Pendientes o fallidas":"Sin incidencias"}</span></article>
      <article><small>Estado FREEMIUM</small><strong className={styles.kpiCompactValue}>{freemiumPrepared?"PREPARADO":"EN PREPARACIÓN"}</strong><span>{latestGamePurchase||latestGameMetric?"Hay actividad de juego registrada":"Sin tráfico real todavía"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>PREPARACIÓN</span><h2>Pasos previos a la prueba final</h2></div>
      <p>Las pruebas finales deben combinar revisión visual, pruebas funcionales, seguridad, integraciones y evidencia antes de cualquier publicación.</p>
    </section>

    <section className={styles.grid}>
      <a className={styles.card} href="/admin/master/checklist">
        <div className={styles.cardTop}><span className={styles.badgePlanned}>MANUAL</span><em>VISUAL</em></div>
        <h3>Revisión de pantallas</h3>
        <p>Recorrer todas las pantallas en escritorio y móvil.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/observability">
        <div className={styles.cardTop}><span className={validationOk?styles.badgeActive:styles.badgePlanned}>{validationOk?"CORRECTO":"PENDIENTE"}</span><em>FUNCIONAMIENTO</em></div>
        <h3>Estado y Pruebas</h3>
        <p>Ejecutar la comprobación automática y revisar el historial.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/releases">
        <div className={styles.cardTop}><span className={gateReady?styles.badgeActive:styles.badgePlanned}>{gateReady?"APROBADO":"PENDIENTE"}</span><em>PUBLICACIÓN</em></div>
        <h3>Revisión antes de publicar</h3>
        <p>Confirmar evidencia, comprobaciones bloqueantes y aprobación humana.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/integrations">
        <div className={styles.cardTop}><span className={styles.badgeActive}>REVISAR</span><em>INTEGRACIONES</em></div>
        <h3>Servicios externos</h3>
        <p>Confirmar MailerLite, publicidad y registros recientes.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <a className={styles.card} href="/admin/master/backups">
        <div className={styles.cardTop}><span className={styles.badgeActive}>RECOMENDADO</span><em>COPIA</em></div>
        <h3>Copia previa</h3>
        <p>Descargar una copia externa antes de cualquier cambio importante.</p>
        <span className={styles.cardLink}>Abrir →</span>
      </a>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={approvalsOk?styles.badgeActive:styles.badgePlanned}>{approvalsOk?"SIN PENDIENTES":"PENDIENTES"}</span><em>APROBACIONES</em></div>
        <h3>Aprobaciones pendientes</h3>
        <p>{pendingApprovals||0} decisiones pendientes de aprobación.</p>
      </article>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>Publicación manual obligatoria</strong>
        <span>Incluso con todas las comprobaciones correctas, esta pantalla no publica la versión de prueba ni modifica producción automáticamente.</span>
      </div>
      <code>PUBLICACIÓN MANUAL</code>
    </section>
  </main>;
}
