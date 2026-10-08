import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function QaFinalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/login?unauthorized=1");

  const[
    {data:latestValidation},
    {data:latestGate},
    {count:openIncidents},
    {count:pendingApprovals},
    {count:failedChecks}
  ]=await Promise.all([
    supabase.from("runtime_validation_runs").select("status,executed_at,run_code").order("executed_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("release_gates").select("status,gate_code,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("security_incidents").select("*",{count:"exact",head:true}).not("status","in","(resolved,closed)"),
    supabase.from("automation_approvals").select("*",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("release_gate_checks").select("*",{count:"exact",head:true}).eq("status","failed").eq("blocking",true)
  ]);

  const validationOk=latestValidation?.status==="passed";
  const gateReady=latestGate?.status==="approved";
  const incidentsOk=(openIncidents||0)===0;
  const approvalsOk=(pendingApprovals||0)===0;
  const checksOk=(failedChecks||0)===0;
  const ready=validationOk&&gateReady&&incidentsOk&&approvalsOk&&checksOk;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · PRUEBAS FINALES</span>
        <h1>Preparación de pruebas finales</h1>
        <p>Resumen de condiciones necesarias antes de considerar el sistema listo para publicación.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.notice}>
      <div>
        <strong>{ready?"Condiciones completas":"Aún no listo para publicar"}</strong>
        <span>{ready?"Las condiciones automáticas principales están correctas. La decisión final sigue siendo humana.":"Todavía existen condiciones pendientes. Esta pantalla no publica cambios."}</span>
      </div>
      <code>{ready?"LISTO PARA DECISIÓN":"VERSIÓN DE PRUEBA"}</code>
    </section>

    <section className={styles.kpis}>
      <article><small>Última prueba</small><strong>{validationOk?"CORRECTA":"PENDIENTE"}</strong><span>{latestValidation?.executed_at?new Date(latestValidation.executed_at).toLocaleString("es-US"):"Sin prueba registrada"}</span></article>
      <article><small>Revisión de publicación</small><strong>{gateReady?"APROBADA":"PENDIENTE"}</strong><span>{latestGate?.created_at?new Date(latestGate.created_at).toLocaleString("es-US"):"Sin revisión registrada"}</span></article>
      <article><small>Incidentes abiertos</small><strong>{openIncidents||0}</strong><span>{incidentsOk?"Sin bloqueos":"Requiere revisión"}</span></article>
      <article><small>Comprobaciones bloqueantes fallidas</small><strong>{failedChecks||0}</strong><span>{checksOk?"Sin fallos":"Requiere corrección"}</span></article>
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
