import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";
import { PreviewValidationButton } from "../../../../components/PreviewValidationButton";

async function requireObservabilityAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function validateCurrentPreview(){
  "use server";
  const {supabase,user}=await requireObservabilityAdmin();
  const host=process.env.VERCEL_URL;
  const commitSha=process.env.VERCEL_GIT_COMMIT_SHA||null;
  const deploymentId=process.env.VERCEL_DEPLOYMENT_ID||null;
  if(!host) throw new Error("preview_url_unavailable");
  const baseUrl="https://"+host;
  const runCode="PRUEBA-"+new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,14);
  const{data:run,error:runError}=await supabase.from("runtime_validation_runs").insert({
    run_code:runCode,environment:"preview",deployment_id:deploymentId,commit_sha:commitSha,base_url:baseUrl,
    status:"running",executed_by:user.id,notes:"Prueba automática de la versión actual desde Master Admin."
  }).select("id").single();
  if(runError||!run) throw new Error(runError?.message||"validation_run_create_failed");

  const checks=[
    {name:"Landing ES",path:"/es",expected:200},
    {name:"Admin login",path:"/admin/login",expected:200},
    {name:"Master protegido",path:"/admin/master",expected:307},
    {name:"API status protegida",path:"/api/admin/status",expected:403},
    {name:"API commerce protegida",path:"/api/admin/commerce",expected:403},
    {name:"Reportes protegidos",path:"/admin/master/reports",expected:307},
    {name:"Copias protegidas",path:"/admin/master/backups",expected:307},
    {name:"Integraciones protegidas",path:"/admin/master/integrations",expected:307},
    {name:"Mantenimiento protegido",path:"/admin/master/maintenance",expected:307},
    {name:"Checklist protegido",path:"/admin/master/checklist",expected:307},
    {name:"QA final protegido",path:"/admin/master/qa",expected:307}
  ];

  let failed=0;
  for(const check of checks){
    const started=Date.now();
    try{
      const response=await fetch(baseUrl+check.path,{method:"GET",redirect:"manual",cache:"no-store"});
      const actual=response.status;
      const location=response.headers.get("location");
      const protectedPage=check.expected===307;
      const validRedirect=protectedPage&&[302,303,307,308].includes(actual)&&Boolean(location?.includes("/admin/login"));
      const passed=protectedPage?validRedirect:actual===check.expected;
      if(!passed) failed++;
      const{error}=await supabase.from("runtime_validation_results").insert({
        run_id:run.id,check_name:check.name,request_path:check.path,method:"GET",
        expected_status:check.expected,actual_status:actual,redirect_location:location,
        status:passed?"passed":"failed",latency_ms:Date.now()-started,
        detail:passed
          ?(protectedPage?"Acceso protegido: redirección correcta al inicio de sesión.":"Respuesta esperada.")
          :"Respuesta distinta a la esperada."
      });
      if(error) throw error;
    }catch(error:any){
      failed++;
      await supabase.from("runtime_validation_results").insert({
        run_id:run.id,check_name:check.name,request_path:check.path,method:"GET",
        expected_status:check.expected,actual_status:null,redirect_location:null,
        status:"failed",latency_ms:Date.now()-started,
        detail:"Error de runtime: "+String(error?.message||error)
      });
    }
  }

  const finalStatus=failed===0?"passed":"failed";
  const{error:closeError}=await supabase.from("runtime_validation_runs").update({
    status:finalStatus,notes:failed===0
      ?"Prueba automática completa: todas las comprobaciones superadas."
      :`Prueba automática con ${failed} comprobación(es) fallida(s).`,
    updated_at:new Date().toISOString()
  }).eq("id",run.id);
  if(closeError) throw new Error(closeError.message);
  revalidatePath("/admin/master/observability");
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
  if((expectedStatus!==null&&(!Number.isInteger(expectedStatus)||expectedStatus<100||expectedStatus>599))||(actualStatus!==null&&(!Number.isInteger(actualStatus)||actualStatus<100||actualStatus>599))) throw new Error("invalid_http_status");
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
    if((results||[]).some((r:any)=>r.status!=="passed")) throw new Error("incomplete_checks_present");
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
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

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
  const statusText=(value:string|undefined)=>{
    if(value==="passed") return "CORRECTO";
    if(value==="failed") return "REVISAR";
    if(value==="running") return "EN CURSO";
    if(value==="partial") return "INCOMPLETO";
    if(value==="canceled") return "CANCELADO";
    if(value==="skipped") return "OMITIDO";
    return "—";
  };

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleObservability}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CONTROL</span><h1>Estado y Pruebas</h1><p>Comprueba que la versión de prueba funciona correctamente antes de avanzar.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">OP</span>
      <div className={styles.moduleStripCopy}><small>ESTADO Y PRUEBAS</small><strong>Validación, historial y señales</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Pruebas de versión conectadas</span>
        <span>Validación protegida · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Pruebas realizadas</small><strong>{runRows.length}</strong><span>{passedRuns} correctas · {failedRuns} por revisar</span></article>
      <article><small>Última prueba</small><strong className={styles.kpiCompactValue}>{statusText(latestRun?.status)}</strong><span>{latestRun?new Date(latestRun.executed_at).toLocaleString("es-US"):"Sin pruebas todavía"}</span></article>
      <article><small>Comprobaciones correctas</small><strong>{latestPassed}/{latestChecks.length}</strong><span>De la última prueba</span></article>
      <article><small>Acciones registradas</small><strong>{(auditEvents||0).toLocaleString()}</strong><span>Historial de seguridad</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>HISTORIAL</span><h2>Pruebas anteriores</h2></div>
      <p>Aquí puedes consultar qué versión se comprobó, cuándo se hizo y si todo salió bien. Producción permanece protegida.</p>
    </section>

    <section className={styles.grid}>
      {runRows.map((r:any)=>{
        const checks=resultRows.filter(x=>x.run_id===r.id);
        const passed=checks.filter(x=>x.status==="passed").length;
        return <article key={r.id} className={styles.card}>
          <div className={styles.cardTop}><span className={r.status==="passed"?styles.badgeActive:styles.badgePlanned}>{statusText(r.status)}</span><em>{r.environment==="preview"?"VERSIÓN DE PRUEBA":"PREPARACIÓN"}</em></div>
          <h3>{r.run_code}</h3>
          <p>{r.deployment_id||"Sin identificador de versión"}<br/>{r.commit_sha||"Sin código de versión"}<br/>{passed}/{checks.length} comprobaciones correctas<br/>{new Date(r.executed_at).toLocaleString("es-US")}</p>
        </article>
      })}
      {!runRows.length&&<article className={styles.card}><h3>Aún no hay pruebas</h3><p>Cuando ejecutes una comprobación, aparecerá aquí.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ÚLTIMA PRUEBA</span><h2>Detalle de la última comprobación</h2></div></section>
    <section className={styles.grid}>
      {latestChecks.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="passed"?styles.badgeActive:styles.badgePlanned}>{statusText(c.status)}</span></div>
        <h3>{c.check_name}</h3>
        <p>{c.status==="passed"?"Funcionó correctamente.":"Necesita revisión."}<br/>{c.detail||"Sin observaciones adicionales."}</p>
      </article>)}
      {!latestChecks.length&&<article className={styles.card}><h3>Sin resultados todavía</h3><p>Ejecuta una comprobación para ver el detalle.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>ESTADO ACTUAL</span><h2>Estado actual</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Actividad del sitio</small><strong>{latestAnalytics?"ACTIVA":"—"}</strong><span>{latestAnalytics?.created_at?new Date(latestAnalytics.created_at).toLocaleString("es-US"):"Sin actividad registrada"}</span></article>
      <article><small>Captación de contactos</small><strong>{latestLead?"ACTIVA":"—"}</strong><span>{latestLead?.created_at?new Date(latestLead.created_at).toLocaleString("es-US"):"Sin contactos registrados"}</span></article>
      <article><small>Acceso seguro</small><strong>PROTEGIDO</strong><span>Login y permisos verificados</span></article>
      <article><small>Sitio público</small><strong>PROTEGIDO</strong><span>Esta sección no publica cambios</span></article>
    </section>

    {profile.role==="admin"&&<section className={styles.notice}>
      <div><strong>Comprobación rápida</strong><span>Revisa automáticamente esta versión de prueba y guarda el resultado.</span></div>
      <PreviewValidationButton/>
    </section>}

    {profile.role==="admin"&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Solo necesarias para pruebas manuales o soporte técnico.</p>
      <section className={styles.adminForms}>
      <MasterActionForm action={createValidationRun} className={styles.adminForm} successText="Prueba registrada correctamente.">
        <div className={styles.formTitle}><span>NUEVA PRUEBA MANUAL</span><h2>Registrar prueba manual</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="run_code" required placeholder="PRUEBA-2026-10-07-02"/></label>
          <label>Tipo de versión<select name="environment" defaultValue="preview"><option value="preview">Versión de prueba</option><option value="staging">Preparación</option></select></label>
          <label>Identificador de versión<input name="deployment_id"/></label>
          <label>Código de versión<input name="commit_sha"/></label>
          <label className={styles.span2}>Dirección base<input name="base_url" placeholder="https://...vercel.app"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton}>Crear prueba</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={addValidationResult} className={styles.adminForm} successText="Comprobación registrada correctamente.">
        <div className={styles.formTitle}><span>NUEVA COMPROBACIÓN</span><h2>Añadir comprobación</h2></div>
        <div className={styles.formGrid}>
          <label>Prueba<select name="run_id" required defaultValue=""><option value="" disabled>Seleccionar prueba</option>{runRows.map((r:any)=><option key={r.id} value={r.id}>{r.run_code} · {r.status}</option>)}</select></label>
          <label>Nombre<input name="check_name" required placeholder="Admin login"/></label>
          <label>Dirección interna<input name="request_path" required placeholder="/admin/login"/></label>
          <label>Tipo de consulta<select name="method" defaultValue="GET"><option value="GET">Lectura</option><option value="POST">Envío</option><option value="HEAD">Cabecera</option></select></label>
          <label>Estado esperado<input type="number" min="100" max="599" name="expected_status"/></label>
          <label>Estado obtenido<input type="number" min="100" max="599" name="actual_status"/></label>
          <label>Estado<select name="status" defaultValue="passed"><option value="passed">Correcto</option><option value="failed">Revisar</option><option value="skipped">Omitido</option></select></label>
          <label>Redirección<input name="redirect_location"/></label>
          <label className={styles.span2}>Detalle<textarea name="detail" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!runRows.length} disabledReason="Primero registra o ejecuta una prueba para poder guardar una comprobación.">Guardar comprobación</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={closeValidationRun} className={styles.adminForm} successText="Prueba cerrada correctamente.">
        <div className={styles.formTitle}><span>CERRAR PRUEBA</span><h2>Definir estado final</h2></div>
        <div className={styles.formGrid}>
          <label>Prueba<select name="run_id" required defaultValue=""><option value="" disabled>Seleccionar prueba</option>{runRows.map((r:any)=><option key={r.id} value={r.id}>{r.run_code} · {r.status}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="partial"><option value="passed">Correcto</option><option value="failed">Revisar</option><option value="partial">Incompleto</option><option value="canceled">Cancelado</option></select></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!runRows.length} disabledReason="No hay ninguna prueba registrada para cerrar.">Cerrar prueba</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>}

    <section className={styles.notice}>
      <div><strong>Fuente de referencia</strong><span>Los resultados históricos provienen del registro interno de pruebas. Las modificaciones desde esta pantalla requieren verificación en dos pasos.</span></div>
      <code>Pruebas ≠ Publicación</code>
    </section>
  </main>;
}
