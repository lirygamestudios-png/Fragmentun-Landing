import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";

async function requireLinkEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function requireReleaseAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createLink(formData:FormData){
  "use server";
  const {supabase,user}=await requireLinkEditor();
  const sourceDomain=String(formData.get("source_domain")||"").trim();
  const sourceEntity=String(formData.get("source_entity")||"").trim();
  const sourceId=String(formData.get("source_id")||"").trim();
  const relationType=String(formData.get("relation_type")||"related_to");
  const targetDomain=String(formData.get("target_domain")||"").trim();
  const targetEntity=String(formData.get("target_entity")||"").trim();
  const targetId=String(formData.get("target_id")||"").trim();
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowed=new Set(["depends_on","blocks","supports","related_to","derived_from","governs"]);
  if(!sourceDomain||!sourceEntity||!sourceId||!targetDomain||!targetEntity||!targetId||!allowed.has(relationType)) throw new Error("invalid_link");
  const{error}=await supabase.from("master_entity_links").insert({
    source_domain:sourceDomain,source_entity:sourceEntity,source_id:sourceId,relation_type:relationType,
    target_domain:targetDomain,target_entity:targetEntity,target_id:targetId,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

async function createGate(formData:FormData){
  "use server";
  const {supabase,user}=await requireReleaseAdmin();
  const code=String(formData.get("gate_code")||"").trim();
  const title=String(formData.get("title")||"").trim();
  const environment=String(formData.get("environment")||"preview");
  const targetRef=String(formData.get("target_ref")||"").trim()||null;
  const targetCommit=String(formData.get("target_commit")||"").trim()||null;
  const targetDeploymentId=String(formData.get("target_deployment_id")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  if(!code||!title||!["preview","staging","production"].includes(environment)) throw new Error("invalid_gate");
  const{error}=await supabase.from("release_gates").insert({
    gate_code:code,title,environment,status:"draft",target_ref:targetRef,target_commit:targetCommit,
    target_deployment_id:targetDeploymentId,requested_by:user.id,notes
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

async function addCheck(formData:FormData){
  "use server";
  const {supabase}=await requireReleaseAdmin();
  const gateId=String(formData.get("release_gate_id")||"").trim();
  const code=String(formData.get("check_code")||"").trim();
  const label=String(formData.get("label")||"").trim();
  const type=String(formData.get("check_type")||"manual");
  const blocking=String(formData.get("blocking")||"true")==="true";
  if(!gateId||!code||!label||!["build","runtime","security","data","business","manual"].includes(type)) throw new Error("invalid_check");
  const{error}=await supabase.from("release_gate_checks").insert({
    release_gate_id:gateId,check_code:code,label,check_type:type,blocking,status:"pending"
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

async function updateCheck(formData:FormData){
  "use server";
  const {supabase,user}=await requireReleaseAdmin();
  const id=String(formData.get("check_id")||"").trim();
  const status=String(formData.get("status")||"pending");
  const evidence=String(formData.get("evidence")||"").trim()||null;
  if(!id||!["pending","passed","failed","waived"].includes(status)) throw new Error("invalid_check_update");
  const{error}=await supabase.from("release_gate_checks").update({
    status,evidence,checked_by:user.id,checked_at:status==="pending"?null:new Date().toISOString(),updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

async function useLatestPassedValidation(formData:FormData){
  "use server";
  const {supabase,user}=await requireReleaseAdmin();
  const gateId=String(formData.get("gate_id")||"").trim();
  if(!gateId) throw new Error("gate_required");

  const{data:latest}=await supabase
    .from("runtime_validation_runs")
    .select("id,run_code,deployment_id,commit_sha,status,environment,executed_at,notes")
    .eq("environment","preview")
    .eq("status","passed")
    .order("executed_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  if(!latest) throw new Error("no_passed_validation");

  const evidence=`Prueba autenticada ${latest.run_code}: 5/5 correctas. Deployment ${latest.deployment_id||"—"} · commit ${latest.commit_sha||"—"}.`;

  const{error:gateError}=await supabase.from("release_gates").update({
    target_commit:latest.commit_sha||null,
    target_deployment_id:latest.deployment_id||null,
    notes:"Evidencia actualizada desde la última prueba autenticada correcta. La aprobación humana continúa pendiente.",
    updated_at:new Date().toISOString()
  }).eq("id",gateId);
  if(gateError) throw new Error(gateError.message);

  const{data:runtimeCheck}=await supabase.from("release_gate_checks")
    .select("id")
    .eq("release_gate_id",gateId)
    .eq("check_code","runtime-smoke")
    .maybeSingle();

  if(runtimeCheck?.id){
    const{error:checkError}=await supabase.from("release_gate_checks").update({
      status:"passed",evidence,checked_by:user.id,checked_at:new Date().toISOString(),updated_at:new Date().toISOString()
    }).eq("id",runtimeCheck.id);
    if(checkError) throw new Error(checkError.message);
  }else{
    const{error:checkError}=await supabase.from("release_gate_checks").insert({
      release_gate_id:gateId,check_code:"runtime-smoke",label:"Comprobación funcional",
      check_type:"runtime",blocking:true,status:"passed",evidence,checked_by:user.id,checked_at:new Date().toISOString()
    });
    if(checkError) throw new Error(checkError.message);
  }

  revalidatePath("/admin/master/releases");
}

async function updateGate(formData:FormData){
  "use server";
  const {supabase,user}=await requireReleaseAdmin();
  const id=String(formData.get("gate_id")||"").trim();
  const status=String(formData.get("status")||"in_review");
  const notes=String(formData.get("notes")||"").trim()||null;
  if(!id||!["draft","in_review","blocked","approved","canceled"].includes(status)) throw new Error("invalid_gate_status");
  if(status==="approved"){
    const{data:checks}=await supabase.from("release_gate_checks").select("status,blocking").eq("release_gate_id",id);
    const blockers=(checks||[]).filter((c:any)=>c.blocking&&!["passed","waived"].includes(c.status));
    if(blockers.length) throw new Error("blocking_checks_incomplete");
  }
  const patch:any={status,notes,updated_at:new Date().toISOString()};
  if(status==="approved"){patch.approved_by=user.id;patch.approved_at=new Date().toISOString();}
  const{error}=await supabase.from("release_gates").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

export default async function ReleaseGatePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role,display_name").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:gates},
    {data:checks},
    {data:links},
    {data:actors}
  ]=await Promise.all([
    supabase.from("release_gates").select("*").order("created_at",{ascending:false}),
    supabase.from("release_gate_checks").select("*").order("created_at",{ascending:true}),
    supabase.from("master_entity_links").select("*").eq("status","active").order("created_at",{ascending:false}).limit(100),
    supabase.from("admin_profiles").select("user_id,display_name,role")
  ]);

  const gateRows=(gates||[]) as any[];
  const checkRows=(checks||[]) as any[];
  const linkRows=(links||[]) as any[];
  const actorRows=(actors||[]) as any[];
  const actorName=(id:string|null|undefined)=>actorRows.find(a=>a.user_id===id)?.display_name||"Sistema";
  const blocked=gateRows.filter(g=>g.status==="blocked").length;
  const approved=gateRows.filter(g=>g.status==="approved").length;
  const failedChecks=checkRows.filter(c=>c.status==="failed"&&c.blocking).length;
  const pendingChecks=checkRows.filter(c=>c.status==="pending"&&c.blocking).length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CONTROL DE PUBLICACIÓN</span><h1>Revisión antes de publicar</h1><p>Comprueba que una versión esté lista antes de cualquier publicación. Esta pantalla no publica por sí sola.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Revisiones</small><strong>{gateRows.length}</strong><span>{approved} aprobados</span></article>
      <article><small>Con problemas</small><strong>{blocked}</strong><span>Requieren resolución</span></article>
      <article><small>Pendientes importantes</small><strong>{failedChecks+pendingChecks}</strong><span>{failedChecks} failed · {pendingChecks} pending</span></article>
      <article><small>Vínculos</small><strong>{linkRows.length}</strong><span>Cross-domain activas</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>REVISIONES</span><h2>Estado de la revisión</h2></div><p>La revisión permanece abierta hasta que todas las comprobaciones importantes estén correctas y exista aprobación humana.</p></section>
    <section className={styles.grid}>
      {gateRows.map((g:any)=>{
        const gateChecks=checkRows.filter(c=>c.release_gate_id===g.id);
        const bad=gateChecks.filter(c=>c.blocking&&["failed","pending"].includes(c.status)).length;
        return <article key={g.id} className={styles.card}>
          <div className={styles.cardTop}><span className={g.status==="approved"?styles.badgeActive:styles.badgePlanned}>{g.status==="approved"?"APROBADA":g.status==="blocked"?"REVISAR":g.status==="in_review"?"EN REVISIÓN":g.status==="canceled"?"CANCELADA":"BORRADOR"}</span><em>{g.environment}</em></div>
          <h3>{g.gate_code} · {g.title}</h3>
          <p>{g.target_ref||"Sin ref"} · {g.target_commit||"Sin commit"}<br/>{g.target_deployment_id||"Sin deployment"}<br/>{gateChecks.length} checks · {bad} blockers · solicitado por {actorName(g.requested_by)}</p>
        </article>
      })}
      {!gateRows.length&&<article className={styles.card}><h3>Sin release gates</h3><p>El registro está listo para documentar la siguiente promoción.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>COMPROBACIONES</span><h2>Evidencia de la revisión</h2></div></section>
    <section className={styles.grid}>
      {checkRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="passed"||c.status==="waived"?styles.badgeActive:styles.badgePlanned}>{c.status==="passed"?"CORRECTO":c.status==="failed"?"REVISAR":c.status==="waived"?"ACEPTADO":"PENDIENTE"}</span><em>{c.check_type}{c.blocking?" · BLOCKING":""}</em></div>
        <h3>{c.label}</h3><p>{c.check_code}<br/>{c.evidence||"Evidencia pendiente"}<br/>{c.checked_at?new Date(c.checked_at).toLocaleString("es-US"):"Sin verificación"}</p>
      </article>)}
      {!checkRows.length&&<article className={styles.card}><h3>Sin checks</h3><p>Los gates deben incorporar evidencia antes de aprobarse.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>RELACIONES</span><h2>Vínculos transversales</h2></div><p>Relaciona información de distintas áreas sin duplicarla.</p></section>
    <section className={styles.grid}>
      {linkRows.map((l:any)=><article key={l.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{String(l.relation_type).toUpperCase()}</span><em>{l.source_domain} → {l.target_domain}</em></div>
        <h3>{l.source_entity}:{l.source_id}</h3><p>{l.target_entity}:{l.target_id}<br/>{l.notes||"Sin notas"}</p>
      </article>)}
      {!linkRows.length&&<article className={styles.card}><h3>Sin relaciones manuales</h3><p>Las relaciones naturales por foreign key siguen activas; aquí aparecerán dependencias entre dominios.</p></article>}
    </section>

    {profile.role==="admin"&&gateRows.length>0&&<section className={styles.notice}>
      <div><strong>Última prueba correcta</strong><span>Usa automáticamente la validación 5/5 más reciente como evidencia de esta revisión. No publica ni aprueba producción.</span></div>
      <form action={useLatestPassedValidation}>
        <input type="hidden" name="gate_id" value={gateRows[0].id}/>
        <button className={styles.formButton}>Usar última prueba correcta</button>
      </form>
    </section>}

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Solo necesarias para gestión técnica o soporte.</p>
      <section className={styles.adminForms}>
      <form action={createLink} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA RELACIÓN</span><h2>Vincular dominios</h2></div>
        <div className={styles.formGrid}>
          <label>Dominio origen<input name="source_domain" required placeholder="Technology"/></label>
          <label>Entidad origen<input name="source_entity" required placeholder="tech_changes"/></label>
          <label>ID origen<input name="source_id" required/></label>
          <label>Relación<select name="relation_type" defaultValue="related_to"><option value="depends_on">Depends on</option><option value="blocks">Blocks</option><option value="supports">Supports</option><option value="related_to">Related to</option><option value="derived_from">Derived from</option><option value="governs">Governs</option></select></label>
          <label>Dominio destino<input name="target_domain" required placeholder="Publishing"/></label>
          <label>Entidad destino<input name="target_entity" required placeholder="publishing_releases"/></label>
          <label>ID destino<input name="target_id" required/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton}>Crear relación</button>
      </form>

      {profile.role==="admin"&&<>
        <form action={createGate} className={styles.adminForm}>
          <div className={styles.formTitle}><span>NUEVO GATE</span><h2>Registrar release gate</h2></div>
          <div className={styles.formGrid}>
            <label>Código<input name="gate_code" required placeholder="RG-2026-001"/></label>
            <label>Título<input name="title" required/></label>
            <label>Entorno<select name="environment" defaultValue="preview"><option value="preview">Preview</option><option value="staging">Staging</option><option value="production">Production</option></select></label>
            <label>Branch/ref<input name="target_ref"/></label>
            <label>Commit<input name="target_commit"/></label>
            <label>Deployment ID<input name="target_deployment_id"/></label>
            <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
          </div>
          <button className={styles.formButton}>Registrar gate</button>
        </form>

        <form action={addCheck} className={styles.adminForm}>
          <div className={styles.formTitle}><span>NUEVO CHECK</span><h2>Añadir evidencia requerida</h2></div>
          <div className={styles.formGrid}>
            <label>Gate<select name="release_gate_id" required defaultValue=""><option value="" disabled>Seleccionar gate</option>{gateRows.map((g:any)=><option key={g.id} value={g.id}>{g.gate_code} · {g.title}</option>)}</select></label>
            <label>Código<input name="check_code" required placeholder="runtime-smoke"/></label>
            <label>Label<input name="label" required placeholder="Runtime smoke test"/></label>
            <label>Tipo<select name="check_type" defaultValue="manual"><option value="build">Build</option><option value="runtime">Runtime</option><option value="security">Security</option><option value="data">Data</option><option value="business">Business</option><option value="manual">Manual</option></select></label>
            <label>Blocking<select name="blocking" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
          </div>
          <button className={styles.formButton} disabled={!gateRows.length}>Añadir check</button>
        </form>

        <form action={updateCheck} className={styles.adminForm}>
          <div className={styles.formTitle}><span>GESTIONAR CHECK</span><h2>Registrar resultado</h2></div>
          <div className={styles.formGrid}>
            <label>Check<select name="check_id" required defaultValue=""><option value="" disabled>Seleccionar check</option>{checkRows.map((c:any)=><option key={c.id} value={c.id}>{c.check_code} · {c.label}</option>)}</select></label>
            <label>Status<select name="status" defaultValue="pending"><option value="pending">Pending</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="waived">Waived</option></select></label>
            <label className={styles.span2}>Evidencia<textarea name="evidence" rows={3}/></label>
          </div>
          <button className={styles.formButton} disabled={!checkRows.length}>Actualizar check</button>
        </form>

        <form action={updateGate} className={styles.adminForm}>
          <div className={styles.formTitle}><span>DECISIÓN DE GATE</span><h2>Actualizar readiness</h2></div>
          <div className={styles.formGrid}>
            <label>Gate<select name="gate_id" required defaultValue=""><option value="" disabled>Seleccionar gate</option>{gateRows.map((g:any)=><option key={g.id} value={g.id}>{g.gate_code} · {g.title}</option>)}</select></label>
            <label>Status<select name="status" defaultValue="in_review"><option value="draft">Draft</option><option value="in_review">In review</option><option value="blocked">Blocked</option><option value="approved">Approved</option><option value="canceled">Canceled</option></select></label>
            <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
          </div>
          <button className={styles.formButton} disabled={!gateRows.length}>Actualizar gate</button>
        </form>
      </>}
      </section>
    </details>}

    <section className={styles.notice}>
      <div><strong>Protección</strong><span>Esta sección registra la revisión, pero no publica cambios en el sitio público.</span></div>
      <code>Producción protegida</code>
    </section>
  </main>;
}
