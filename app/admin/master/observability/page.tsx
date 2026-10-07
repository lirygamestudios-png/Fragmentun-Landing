import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function ObservabilityPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:runs},
    {data:results},
    {count:auditEvents},
    {data:latestAnalytics},
    {data:latestLead}
  ]=await Promise.all([
    supabase.from("runtime_validation_runs").select("*").order("executed_at",{ascending:false}).limit(50),
    supabase.from("runtime_validation_results").select("*").order("created_at",{ascending:false}).limit(300),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("event_name,created_at").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("leads").select("created_at").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);

  const runRows=(runs||[]) as any[];
  const resultRows=(results||[]) as any[];
  const passedRuns=runRows.filter(r=>r.status==="passed").length;
  const failedRuns=runRows.filter(r=>r.status==="failed").length;
  const latestRun=runRows[0];
  const latestChecks=latestRun?resultRows.filter(r=>r.run_id===latestRun.id):[];
  const latestPassed=latestChecks.filter(c=>c.status==="passed").length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · OBSERVABILIDAD</span><h1>Observabilidad</h1><p>Historial persistente de smoke tests y señales operativas por deployment.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Validaciones</small><strong>{runRows.length}</strong><span>{passedRuns} passed · {failedRuns} failed</span></article>
      <article><small>Último run</small><strong>{latestRun?.status?.toUpperCase()||"—"}</strong><span>{latestRun?.run_code||"Sin ejecuciones"}</span></article>
      <article><small>Últimos checks</small><strong>{latestPassed}/{latestChecks.length}</strong><span>Checks passed</span></article>
      <article><small>Audit events</small><strong>{(auditEvents||0).toLocaleString()}</strong><span>Trazabilidad acumulada</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>VALIDATION RUNS</span><h2>Ejecuciones por deployment</h2></div>
      <p>El historial conserva el artefacto exacto probado. Production no se prueba ni modifica desde este módulo.</p>
    </section>

    <section className={styles.grid}>
      {runRows.map((r:any)=>{
        const checks=resultRows.filter(x=>x.run_id===r.id);
        const passed=checks.filter(x=>x.status==="passed").length;
        return <article key={r.id} className={styles.card}>
          <div className={styles.cardTop}><span className={r.status==="passed"?styles.badgeActive:styles.badgePlanned}>{String(r.status).toUpperCase()}</span><em>{r.environment}</em></div>
          <h3>{r.run_code}</h3>
          <p>{r.deployment_id||"Sin deployment"}<br/>{r.commit_sha||"Sin commit"}<br/>{passed}/{checks.length} checks passed<br/>{new Date(r.executed_at).toLocaleString("es-US")}</p>
        </article>
      })}
      {!runRows.length&&<article className={styles.card}><h3>Sin validaciones</h3><p>Los smoke tests aparecerán aquí cuando se registren.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>LAST RUN</span><h2>Detalle del último smoke test</h2></div></section>
    <section className={styles.grid}>
      {latestChecks.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="passed"?styles.badgeActive:styles.badgePlanned}>{String(c.status).toUpperCase()}</span><em>{c.method}</em></div>
        <h3>{c.check_name}</h3>
        <p>{c.request_path}<br/>Esperado: {c.expected_status??"—"} · Real: {c.actual_status??"—"}<br/>{c.redirect_location?"Redirect: "+c.redirect_location:"Sin redirect"}<br/>{c.detail||"Sin detalle"}</p>
      </article>)}
      {!latestChecks.length&&<article className={styles.card}><h3>Sin resultados</h3><p>No existe un run con detalle todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>LIVE SIGNALS</span><h2>Señales actuales</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Último analytics</small><strong>{latestAnalytics?.event_name||"—"}</strong><span>{latestAnalytics?.created_at?new Date(latestAnalytics.created_at).toLocaleString("es-US"):"Sin eventos"}</span></article>
      <article><small>Último lead</small><strong>{latestLead?"ACTIVO":"—"}</strong><span>{latestLead?.created_at?new Date(latestLead.created_at).toLocaleString("es-US"):"Sin leads"}</span></article>
      <article><small>Auth boundary</small><strong>VALIDADA</strong><span>Master→login · APIs→403</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>Sin promociones desde Observabilidad</span></article>
    </section>

    <section className={styles.notice}>
      <div><strong>Fuente de verdad</strong><span>Los resultados históricos provienen de runtime_validation_runs + runtime_validation_results.</span></div>
      <code>observability ≠ release</code>
    </section>
  </main>;
}
