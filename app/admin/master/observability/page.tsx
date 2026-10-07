import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";

async function requireObservabilityAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createValidationRun(formData:FormData){
  "use server";
  const {supabase,user}=await requireObservabilityAdmin();
  const runCode=String(formData.get("run_code")||"").trim();
  const environment=String(formData.get("environment")||"preview");
  const deploymentId=String(formData.get("deployment_id")||"").trim()||null;
  const commitSha=String(formData.get("commit_sha")||"").trim()||null;
  const baseUrl=String(formData.get("base_url")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  if(!runCode||!["preview","staging"].includes(environment)) throw new Error("invalid_validation_run");
  const{error}=await supabase.from("runtime_validation_runs").insert({
    run_code:runCode,environment,deployment_id:deploymentId,commit_sha:commitSha,base_url:baseUrl,
    status:"running",executed_by:user.id,notes
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/observability");
}

async function addValidationResult(formData:FormData){
  "use server";
  const {supabase}=await requireObservabilityAdmin();
  const runId=String(formData.get("run_id")||"").trim();
  const checkName=String(formData.get("check_name")||"").trim();
  const requestPath=String(formData.get("request_path")||"").trim();
  const method=String(formData.get("method")||"GET").trim().toUpperCase();
  const status=String(formData.get("status")||"passed");
  const expectedRaw=String(formData.get("expected_status")||"").trim();
  const actualRaw=String(formData.get("actual_status")||"").trim();
  const redirectLocation=String(formData.get("redirect_location")||"").trim()||null;
  const detail=String(formData.get("detail")||"").trim()||null;
  const expectedStatus=expectedRaw?Number(expectedRaw):null;
  const actualStatus=actualRaw?Number(actualRaw):null;
  if(!runId||!checkName||!requestPath||!["GET","POST","HEAD"].includes(method)||!["passed","failed","skipped"].includes(status)) throw new Error("invalid_validation_result");
  if((expectedStatus!==null&&!Number.isInteger(expectedStatus))||(actualStatus!==null&&!Number.isInteger(actualStatus))) throw new Error("invalid_http_status");
  const{error}=await supabase.from("runtime_validation_results").insert({
    run_id:runId,check_name:checkName,request_path:requestPath,method,
    expected_status:expectedStatus,actual_status:actualStatus,redirect_location:redirectLocation,status,detail
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/observability");
}

async function closeValidationRun(formData:FormData){
  "use server";
  const {supabase}=await requireObservabilityAdmin();
  const runId=String(formData.get("run_id")||"").trim();
  const status=String(formData.get("status")||"partial");
  const notes=String(formData.get("notes")||"").trim()||null;
  if(!runId||!["passed","failed","partial","canceled"].includes(status)) throw new Error("invalid_validation_status");
  if(status==="passed"){
    const{data:results}=await supabase.from("runtime_validation_results").select("status").eq("run_id",runId);
    if(!(results||[]).length) throw new Error("validation_results_required");
    if((results||[]).some((r:any)=>r.status==="failed")) throw new Error("failed_checks_present");
  }
  const{error}=await supabase.from("runtime_validation_runs").update({
    status,notes,updated_at:new Date().toISOString()
  }).eq("id",runId);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/observability");
}

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

    {profile.role==="admin"&&<section className={styles.adminForms}>
      <form action={createValidationRun} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA VALIDACIÓN</span><h2>Registrar prueba de Preview</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="run_code" required placeholder="SMOKE-PREVIEW-2026-10-07-02"/></label>
          <label>Entorno<select name="environment" defaultValue="preview"><option value="preview">Preview</option><option value="staging">Staging</option></select></label>
          <label>Deployment ID<input name="deployment_id"/></label>
          <label>Commit<input name="commit_sha"/></label>
          <label className={styles.span2}>URL base<input name="base_url" placeholder="https://...vercel.app"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton}>Crear validación</button>
      </form>

      <form action={addValidationResult} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO RESULTADO</span><h2>Añadir check</h2></div>
        <div className={styles.formGrid}>
          <label>Validación<select name="run_id" required defaultValue=""><option value="" disabled>Seleccionar validación</option>{runRows.map((r:any)=><option key={r.id} value={r.id}>{r.run_code} · {r.status}</option>)}</select></label>
          <label>Nombre<input name="check_name" required placeholder="Admin login"/></label>
          <label>Ruta<input name="request_path" required placeholder="/admin/login"/></label>
          <label>Método<select name="method" defaultValue="GET"><option value="GET">GET</option><option value="POST">POST</option><option value="HEAD">HEAD</option></select></label>
          <label>Esperado<input type="number" min="100" max="599" name="expected_status"/></label>
          <label>Real<input type="number" min="100" max="599" name="actual_status"/></label>
          <label>Resultado<select name="status" defaultValue="passed"><option value="passed">Passed</option><option value="failed">Failed</option><option value="skipped">Skipped</option></select></label>
          <label>Redirect<input name="redirect_location"/></label>
          <label className={styles.span2}>Detalle<textarea name="detail" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!runRows.length}>Añadir resultado</button>
      </form>

      <form action={closeValidationRun} className={styles.adminForm}>
        <div className={styles.formTitle}><span>CERRAR VALIDACIÓN</span><h2>Definir resultado final</h2></div>
        <div className={styles.formGrid}>
          <label>Validación<select name="run_id" required defaultValue=""><option value="" disabled>Seleccionar validación</option>{runRows.map((r:any)=><option key={r.id} value={r.id}>{r.run_code} · {r.status}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="partial"><option value="passed">Passed</option><option value="failed">Failed</option><option value="partial">Partial</option><option value="canceled">Canceled</option></select></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!runRows.length}>Cerrar validación</button>
      </form>
    </section>}

    <section className={styles.notice}>
      <div><strong>Fuente de verdad</strong><span>Los resultados históricos provienen de runtime_validation_runs + runtime_validation_results. Las escrituras desde esta pantalla requieren MFA.</span></div>
      <code>observability ≠ release</code>
    </section>
  </main>;
}
