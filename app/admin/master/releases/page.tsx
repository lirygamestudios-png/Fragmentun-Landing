import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function environmentLabel(value:string){
  const map:Record<string,string>={preview:"VERSIÓN DE PRUEBA",staging:"PREPARACIÓN",production:"PRODUCCIÓN"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}
function checkTypeLabel(value:string){
  const map:Record<string,string>={build:"COMPILACIÓN",runtime:"FUNCIONAMIENTO",security:"SEGURIDAD",data:"DATOS",business:"NEGOCIO",manual:"MANUAL"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}
function relationLabel(value:string){
  const map:Record<string,string>={depends_on:"DEPENDE DE",blocks:"BLOQUEA",supports:"APOYA",related_to:"RELACIONADO",derived_from:"DERIVADO DE",governs:"GOBIERNA"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireLinkEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function requireReleaseAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
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
  const{data:gate,error:gateError}=await supabase.from("release_gates").select("status").eq("id",gateId).maybeSingle();
  if(gateError) throw new Error(gateError.message);
  if(!gate||!["draft","in_review","blocked"].includes(gate.status)) throw new Error("gate_not_editable");
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
  const{data:existingCheck,error:existingCheckError}=await supabase.from("release_gate_checks").select("blocking,release_gate_id,check_code").eq("id",id).maybeSingle();
  if(existingCheckError) throw new Error(existingCheckError.message);
  if(!existingCheck) throw new Error("check_not_found");
  const{data:gate,error:gateError}=await supabase.from("release_gates").select("status").eq("id",existingCheck.release_gate_id).maybeSingle();
  if(gateError) throw new Error(gateError.message);
  if(!gate||!["draft","in_review","blocked"].includes(gate.status)) throw new Error("gate_not_editable");
  if(existingCheck.check_code==="human-release-approval") throw new Error("human_approval_check_protected");
  if(existingCheck.check_code==="runtime-smoke"&&status==="passed") throw new Error("use_authenticated_runtime_validation");
  if(status==="waived"&&existingCheck.blocking&&!evidence) throw new Error("waiver_evidence_required");
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
  const{data:gate,error:gateLookupError}=await supabase.from("release_gates")
    .select("id,status,environment,target_commit,target_deployment_id").eq("id",gateId).maybeSingle();
  if(gateLookupError) throw new Error(gateLookupError.message);
  if(!gate||gate.environment!=="preview") throw new Error("preview_gate_required");
  if(!["draft","in_review","blocked"].includes(gate.status)) throw new Error("gate_not_editable");

  const{data:latest}=await supabase
    .from("runtime_validation_runs")
    .select("id,run_code,deployment_id,commit_sha,status,environment,executed_at,notes")
    .eq("environment","preview")
    .order("executed_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  if(!latest) throw new Error("no_validation_available");
  if(latest.status!=="passed") throw new Error("latest_validation_not_passed");
  const currentDeployment=process.env.VERCEL_DEPLOYMENT_ID||null;
  const currentCommit=process.env.VERCEL_GIT_COMMIT_SHA||null;
  if(!currentDeployment||!latest.deployment_id||latest.deployment_id!==currentDeployment) throw new Error("release_deployment_not_verified");
  if(!currentCommit||!latest.commit_sha||latest.commit_sha!==currentCommit) throw new Error("release_commit_not_verified");
  if(gate.target_commit&&gate.target_commit!==currentCommit) throw new Error("gate_target_commit_mismatch");
  if(gate.target_deployment_id&&gate.target_deployment_id!==currentDeployment) throw new Error("gate_target_deployment_mismatch");

  const evidence=`Prueba autenticada ${latest.run_code}: todas las comprobaciones registradas como correctas. Versión ${latest.deployment_id||"—"} · código ${latest.commit_sha||"—"}.`;

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
  const humanConfirmation=String(formData.get("human_confirmation")||"");
  if(!id||!["draft","in_review","blocked","approved","canceled"].includes(status)) throw new Error("invalid_gate_status");
  const{data:existingGate,error:existingGateError}=await supabase.from("release_gates").select("status,environment").eq("id",id).maybeSingle();
  if(existingGateError) throw new Error(existingGateError.message);
  if(!existingGate) throw new Error("gate_not_found");
  if(["approved","canceled"].includes(existingGate.status)) throw new Error("gate_finalized");
  if(status==="approved"&&existingGate.environment!=="preview") throw new Error("preview_approval_only");
  if(status==="approved"&&humanConfirmation!=="confirm_release_review") throw new Error("explicit_human_confirmation_required");
  if(status==="approved"){
    const[{data:checks},{data:gate},{data:latestValidation}]=await Promise.all([
      supabase.from("release_gate_checks").select("status,blocking,check_code").eq("release_gate_id",id),
      supabase.from("release_gates").select("target_deployment_id,target_commit").eq("id",id).maybeSingle(),
      supabase.from("runtime_validation_runs").select("status,deployment_id,commit_sha").eq("environment","preview").order("executed_at",{ascending:false}).limit(1).maybeSingle()
    ]);
    if(!(checks||[]).length) throw new Error("release_checks_required");
    const blockers=(checks||[]).filter((c:any)=>
      c.blocking&&
      c.check_code!=="human-release-approval"&&
      !["passed","waived"].includes(c.status)
    );
    if(blockers.length) throw new Error("blocking_checks_incomplete");
    const runtimeCheck=(checks||[]).find((c:any)=>c.check_code==="runtime-smoke");
    if(!runtimeCheck||runtimeCheck.status!=="passed") throw new Error("runtime_validation_required");
    if(!latestValidation||latestValidation.status!=="passed") throw new Error("latest_validation_not_passed");
    const currentDeployment=process.env.VERCEL_DEPLOYMENT_ID||null;
    const currentCommit=process.env.VERCEL_GIT_COMMIT_SHA||null;
    if(currentDeployment&&latestValidation.deployment_id&&latestValidation.deployment_id!==currentDeployment) throw new Error("release_deployment_mismatch");
    if(currentCommit&&latestValidation.commit_sha&&latestValidation.commit_sha!==currentCommit) throw new Error("release_commit_mismatch");
    if(latestValidation.deployment_id&&gate?.target_deployment_id&&latestValidation.deployment_id!==gate.target_deployment_id) throw new Error("release_deployment_mismatch");
    if(latestValidation.commit_sha&&gate?.target_commit&&latestValidation.commit_sha!==gate.target_commit) throw new Error("release_commit_mismatch");
    if(!currentCommit||!gate?.target_commit||!latestValidation.commit_sha||gate.target_commit!==currentCommit||latestValidation.commit_sha!==currentCommit) throw new Error("release_commit_not_verified");
    if(!currentDeployment||!gate?.target_deployment_id||!latestValidation.deployment_id||gate.target_deployment_id!==currentDeployment||latestValidation.deployment_id!==currentDeployment) throw new Error("release_deployment_not_verified");
  }
  const now=new Date().toISOString();
  const patch:any={status,notes,updated_at:now};

  if(status==="approved"){
    patch.approved_by=user.id;
    patch.approved_at=now;

    const{data:humanCheck,error:humanCheckLookupError}=await supabase
      .from("release_gate_checks")
      .select("id")
      .eq("release_gate_id",id)
      .eq("check_code","human-release-approval")
      .maybeSingle();
    if(humanCheckLookupError) throw new Error(humanCheckLookupError.message);

    if(humanCheck?.id){
      const{error:humanCheckError}=await supabase.from("release_gate_checks").update({
        status:"passed",
        evidence:"Aprobación humana registrada explícitamente desde LIRYGAMES Commander Center.",
        checked_by:user.id,
        checked_at:now,
        updated_at:now
      }).eq("id",humanCheck.id);
      if(humanCheckError) throw new Error(humanCheckError.message);
    }else{
      const{error:humanCheckError}=await supabase.from("release_gate_checks").insert({
        release_gate_id:id,
        check_code:"human-release-approval",
        label:"Human release approval",
        check_type:"manual",
        blocking:true,
        status:"passed",
        evidence:"Aprobación humana registrada explícitamente desde LIRYGAMES Commander Center.",
        checked_by:user.id,
        checked_at:now
      });
      if(humanCheckError) throw new Error(humanCheckError.message);
    }
  }

  const{error}=await supabase.from("release_gates").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/releases");
}

export default async function ReleaseGatePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role,display_name").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:gates},
    {data:checks},
    {data:links},
    {data:actors},
    {data:latestValidation},
    {count:virtualItemCount,error:virtualItemError},
    {count:virtualOfferCount,error:virtualOfferError},
    {count:pendingEntitlementCount,error:pendingEntitlementError},
    {count:failedEntitlementCount,error:failedEntitlementError}
  ]=await Promise.all([
    supabase.from("release_gates").select("*").order("created_at",{ascending:false}),
    supabase.from("release_gate_checks").select("*").order("created_at",{ascending:true}),
    supabase.from("master_entity_links").select("*").eq("status","active").order("created_at",{ascending:false}).limit(100),
    supabase.from("admin_profiles").select("user_id,display_name,role"),
    supabase.from("runtime_validation_runs").select("status,deployment_id,commit_sha,executed_at").eq("environment","preview").order("executed_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("game_virtual_items").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("game_virtual_item_offers").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("game_entitlements").select("*",{count:"exact",head:true}).eq("status","pending"),
    supabase.from("game_entitlements").select("*",{count:"exact",head:true}).eq("status","failed")
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
  const activeGate=gateRows[0];
  const activeGateChecks=activeGate?checkRows.filter(c=>c.release_gate_id===activeGate.id):[];
  const runtimeEvidence=activeGateChecks.find(c=>c.check_code==="runtime-smoke");
  const validationPassed=latestValidation?.status==="passed";
  const latestDeployment=latestValidation?.deployment_id||null;
  const gateDeployment=activeGate?.target_deployment_id||null;
  const latestCommit=latestValidation?.commit_sha||null;
  const gateCommit=activeGate?.target_commit||null;
  const currentCommit=process.env.VERCEL_GIT_COMMIT_SHA||null;
  const currentDeployment=process.env.VERCEL_DEPLOYMENT_ID||null;
  const gateCommitCurrent=Boolean(currentCommit&&gateCommit&&currentCommit===gateCommit);
  const gateDeploymentCurrent=Boolean(currentDeployment&&gateDeployment&&currentDeployment===gateDeployment);
  const gateIsCurrent=gateCommitCurrent&&gateDeploymentCurrent;
  const validationIsCurrent=Boolean(currentCommit&&currentDeployment&&latestCommit===currentCommit&&latestDeployment===currentDeployment);
  const evidenceIntegrated=runtimeEvidence?.status==="passed"&&validationPassed&&gateIsCurrent&&validationIsCurrent;
  const freemiumDataOk=![virtualItemError,virtualOfferError,pendingEntitlementError,failedEntitlementError].some(Boolean);
  const entitlementIssues=(pendingEntitlementCount||0)+(failedEntitlementCount||0);
  const freemiumPrepared=freemiumDataOk&&(virtualItemCount||0)>0&&(virtualOfferCount||0)>0&&entitlementIssues===0;
  const gateVersionLabel=!activeGate?"SIN REVISIÓN":!currentCommit||!currentDeployment?"SIN IDENTIFICAR":gateIsCurrent?"VIGENTE":"DESACTUALIZADO";

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleReleases}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CONTROL DE PUBLICACIÓN</span><h1>Revisión antes de publicar</h1><p>Comprueba que una versión esté lista antes de cualquier publicación. Esta pantalla no publica por sí sola.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">RL</span>
      <div className={styles.moduleStripCopy}><small>REVISIÓN PARA PUBLICAR</small><strong>Evidencia, bloqueos y aprobación</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Validación de versión conectada</span>
        <span>Aprobación humana obligatoria</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Revisiones</small><strong>{gateRows.length}</strong><span>{approved} aprobados</span></article>
      <article><small>Con problemas</small><strong>{blocked}</strong><span>Requieren resolución</span></article>
      <article><small>Pendientes importantes</small><strong>{failedChecks+pendingChecks}</strong><span>{failedChecks} por revisar · {pendingChecks} pendientes</span></article>
      <article><small>Vínculos</small><strong>{linkRows.length}</strong><span>Relaciones entre áreas activas</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>VERSIÓN ACTUAL</span><h2>Vigencia de la aprobación</h2></div><p>Una aprobación histórica no autoriza automáticamente otro código o despliegue.</p></section>
    <section className={styles.notice}>
      <div><strong>{gateVersionLabel}</strong><span>{gateVersionLabel==="VIGENTE"?"La revisión corresponde a este Preview; la aprobación se verifica por separado.":gateVersionLabel==="SIN IDENTIFICAR"?"No se pudo comprobar la versión completa de este Preview. No existe autorización vigente.":"La revisión más reciente no corresponde a este Preview. Se requiere nueva aprobación humana."}</span></div>
      <code>{activeGate?.gate_code||"SIN GATE"}</code>
    </section>
    <section className={styles.kpis}>
      <article><small>Commit actual</small><strong className={styles.kpiCompactValue}>{currentCommit?currentCommit.slice(0,12):"NO DISPONIBLE"}</strong><span>{gateCommitCurrent?"Coincide":"No verificado"}</span></article>
      <article><small>Deployment actual</small><strong className={styles.kpiCompactValue}>{currentDeployment?currentDeployment.slice(0,18):"NO DISPONIBLE"}</strong><span>{gateDeploymentCurrent?"Coincide":"No verificado"}</span></article>
      <article><small>Última revisión</small><strong className={styles.kpiCompactValue}>{activeGate?.status==="approved"?"APROBADA":"NO APROBADA"}</strong><span>{activeGate?.gate_code||"Sin revisión"}</span></article>
      <article><small>Autorización Preview</small><strong className={styles.kpiCompactValue}>{gateIsCurrent&&activeGate?.status==="approved"?"VIGENTE":"NO VIGENTE"}</strong><span>Publicación siempre manual</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>FREEMIUM · PRELANZAMIENTO</span><h2>Preparación de bienes digitales</h2></div><p>Datos reales. Preparación técnica no equivale a aprobación de publicación.</p></section>
    <section className={styles.kpis}>
      <article><small>Artículos virtuales activos</small><strong>{freemiumDataOk?virtualItemCount||0:"—"}</strong><span>Catálogo de juegos</span></article>
      <article><small>Ofertas activas</small><strong>{freemiumDataOk?virtualOfferCount||0:"—"}</strong><span>Precios por plataforma</span></article>
      <article className={entitlementIssues?styles.kpiAttention:undefined}><small>Entregas por revisar</small><strong>{freemiumDataOk?entitlementIssues:"—"}</strong><span>Pendientes y fallidas</span></article>
      <article><small>Estado FREEMIUM</small><strong className={styles.kpiCompactValue}>{freemiumPrepared?"PREPARADO":"EN PREPARACIÓN"}</strong><span>{freemiumDataOk?"Indicador preliminar":"Datos no disponibles"}</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>REVISIONES</span><h2>Estado de la revisión</h2></div><p>La revisión permanece abierta hasta que todas las comprobaciones importantes estén correctas y exista aprobación humana.</p></section>
    <section className={styles.grid}>
      {gateRows.map((g:any)=>{
        const gateChecks=checkRows.filter(c=>c.release_gate_id===g.id);
        const bad=gateChecks.filter(c=>c.blocking&&["failed","pending"].includes(c.status)).length;
        return <article key={g.id} className={styles.card}>
          <div className={styles.cardTop}><span className={g.status==="approved"?styles.badgeActive:styles.badgePlanned}>{g.status==="approved"?"APROBADA":g.status==="blocked"?"REVISAR":g.status==="in_review"?"EN REVISIÓN":g.status==="canceled"?"CANCELADA":"BORRADOR"}</span><em>{environmentLabel(g.environment)}</em></div>
          <h3>{g.title}</h3>
          <p>{gateChecks.length} comprobaciones · {bad} bloqueos<br/>Solicitado por {actorName(g.requested_by)}<br/>{g.target_deployment_id?"Versión asociada registrada":"Sin versión asociada"}</p>
        </article>
      })}
      {!gateRows.length&&<article className={styles.card}><h3>Sin revisiones</h3><p>Aquí aparecerán las revisiones antes de publicar.</p></article>}
    </section>

    {gateRows.length>0&&<section className={styles.notice}>
      {evidenceIntegrated
        ?<div><strong>Evidencia integrada</strong><span>La última prueba correcta quedó registrada como evidencia. Las demás comprobaciones y la aprobación humana siguen siendo obligatorias.</span></div>
        :<><div><strong>Integrar última prueba</strong><span>Solo puede usarse la prueba más reciente si terminó correctamente. Si la última prueba falló, primero debe corregirse y repetirse.</span></div>
          <MasterActionForm action={useLatestPassedValidation} successText="Última prueba integrada correctamente.">
            <input type="hidden" name="gate_id" value={gateRows[0].id}/>
            <MasterSubmitButton className={styles.formButton}>Usar última prueba</MasterSubmitButton>
          </MasterActionForm></>}
      {evidenceIntegrated&&<code>{activeGate?.status==="approved"?"APROBACIÓN HUMANA REGISTRADA":"APROBACIÓN HUMANA PENDIENTE"}</code>}
    </section>}

    <section className={styles.sectionHead}><div><span>COMPROBACIONES</span><h2>Evidencia de la revisión</h2></div></section>
    <section className={styles.grid}>
      {checkRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="passed"||c.status==="waived"?styles.badgeActive:styles.badgePlanned}>{c.status==="passed"?"CORRECTO":c.status==="failed"?"REVISAR":c.status==="waived"?"ACEPTADO":"PENDIENTE"}</span><em>{checkTypeLabel(c.check_type)}{c.blocking?" · IMPORTANTE":""}</em></div>
        <h3>{c.label}</h3><p>{c.evidence||"Evidencia pendiente"}<br/>{c.checked_at?new Date(c.checked_at).toLocaleString("es-US"):"Sin verificación"}</p>
      </article>)}
      {!checkRows.length&&<article className={styles.card}><h3>Sin comprobaciones</h3><p>La revisión necesita comprobaciones antes de aprobarse.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>RELACIONES</span><h2>Vínculos transversales</h2></div><p>Relaciona información de distintas áreas sin duplicarla.</p></section>
    <section className={styles.grid}>
      {linkRows.map((l:any)=><article key={l.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{relationLabel(l.relation_type)}</span><em>{l.source_domain} → {l.target_domain}</em></div>
        <h3>{l.source_domain} → {l.target_domain}</h3><p>{l.notes||"Relación registrada entre áreas."}</p>
      </article>)}
      {!linkRows.length&&<article className={styles.card}><h3>Sin relaciones manuales</h3><p>Las relaciones naturales entre registros siguen activas; aquí aparecerán dependencias entre áreas.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Solo necesarias para gestión técnica o soporte.</p>
      <section className={styles.adminForms}>
      <MasterActionForm action={createLink} className={styles.adminForm} successText="Relación entre áreas registrada correctamente.">
        <div className={styles.formTitle}><span>NUEVA RELACIÓN</span><h2>Vincular dominios</h2></div>
        <div className={styles.formGrid}>
          <label>Dominio origen<input name="source_domain" required placeholder="Tecnología"/></label>
          <label>Entidad origen<input name="source_entity" required placeholder="Cambios técnicos"/></label>
          <label>Identificador origen<input name="source_id" required/></label>
          <label>Relación<select name="relation_type" defaultValue="related_to"><option value="depends_on">Depende de</option><option value="blocks">Bloquea</option><option value="supports">Apoya</option><option value="related_to">Relacionado con</option><option value="derived_from">Derivado de</option><option value="governs">Gobierna</option></select></label>
          <label>Dominio destino<input name="target_domain" required placeholder="Publicación"/></label>
          <label>Entidad destino<input name="target_entity" required placeholder="Lanzamientos"/></label>
          <label>Identificador destino<input name="target_id" required/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton}>Crear relación</MasterSubmitButton>
      </MasterActionForm>

      {profile.role==="admin"&&<>
        <MasterActionForm action={createGate} className={styles.adminForm} successText="Revisión previa a publicación registrada correctamente.">
          <div className={styles.formTitle}><span>NUEVA REVISIÓN</span><h2>Registrar revisión previa a publicación</h2></div>
          <div className={styles.formGrid}>
            <label>Código<input name="gate_code" required placeholder="RG-2026-001"/></label>
            <label>Título<input name="title" required/></label>
            <label>Entorno<select name="environment" defaultValue="preview"><option value="preview">Versión de prueba</option><option value="staging">Preparación</option><option value="production">Producción</option></select></label>
            <label>Referencia de versión<input name="target_ref"/></label>
            <label>Código de versión<input name="target_commit"/></label>
            <label>Identificador de versión<input name="target_deployment_id"/></label>
            <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
          </div>
          <MasterSubmitButton className={styles.formButton}>Registrar revisión</MasterSubmitButton>
        </MasterActionForm>

        <MasterActionForm action={addCheck} className={styles.adminForm} successText="Comprobación añadida correctamente.">
          <div className={styles.formTitle}><span>NUEVA COMPROBACIÓN</span><h2>Añadir evidencia requerida</h2></div>
          <div className={styles.formGrid}>
            <label>Revisión<select name="release_gate_id" required defaultValue=""><option value="" disabled>Seleccionar revisión</option>{gateRows.map((g:any)=><option key={g.id} value={g.id}>{g.gate_code} · {g.title}</option>)}</select></label>
            <label>Código<input name="check_code" required placeholder="comprobacion-funcional"/></label>
            <label>Nombre visible<input name="label" required placeholder="Comprobación funcional"/></label>
            <label>Tipo<select name="check_type" defaultValue="manual"><option value="build">Compilación</option><option value="runtime">Funcionamiento</option><option value="security">Seguridad</option><option value="data">Datos</option><option value="business">Negocio</option><option value="manual">Manual</option></select></label>
            <label>Bloqueante<select name="blocking" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
          </div>
          <MasterSubmitButton className={styles.formButton} disabled={!gateRows.length} disabledReason="Primero registra una revisión antes de añadir comprobaciones.">Añadir comprobación</MasterSubmitButton>
        </MasterActionForm>

        <MasterActionForm action={updateCheck} className={styles.adminForm} successText="Comprobación actualizada correctamente.">
          <div className={styles.formTitle}><span>GESTIONAR COMPROBACIÓN</span><h2>Registrar resultado</h2></div>
          <div className={styles.formGrid}>
            <label>Comprobación<select name="check_id" required defaultValue=""><option value="" disabled>Seleccionar comprobación</option>{checkRows.map((c:any)=><option key={c.id} value={c.id}>{c.check_code} · {c.label}</option>)}</select></label>
            <label>Estado<select name="status" defaultValue="pending"><option value="pending">Pendiente</option><option value="passed">Correcta</option><option value="failed">Revisar</option><option value="waived">Aceptada</option></select></label>
            <label className={styles.span2}>Evidencia<textarea name="evidence" rows={3}/></label>
          </div>
          <MasterSubmitButton className={styles.formButton} disabled={!checkRows.length} disabledReason="No hay comprobaciones registradas para actualizar.">Actualizar comprobación</MasterSubmitButton>
        </MasterActionForm>

        <MasterActionForm action={updateGate} className={styles.adminForm} successText="Revisión de publicación actualizada correctamente.">
          <div className={styles.formTitle}><span>DECISIÓN DE REVISIÓN</span><h2>Actualizar estado final</h2></div>
          <div className={styles.formGrid}>
            <label>Revisión<select name="gate_id" required defaultValue=""><option value="" disabled>Seleccionar revisión</option>{gateRows.map((g:any)=><option key={g.id} value={g.id}>{g.gate_code} · {g.title}</option>)}</select></label>
            <label>Estado<select name="status" defaultValue="in_review"><option value="draft">Borrador</option><option value="in_review">En revisión</option><option value="blocked">Bloqueada</option><option value="approved">Aprobada</option><option value="canceled">Cancelada</option></select></label>
            <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
            <label className={styles.span2}>Confirmación humana para aprobar<select name="human_confirmation" defaultValue=""><option value="">Sin confirmar</option><option value="confirm_release_review">Confirmo que he revisado la versión y autorizo la aprobación manual de esta revisión (no publica producción)</option></select></label>
          </div>
          <MasterSubmitButton className={styles.formButton} disabled={!gateRows.length} disabledReason="No hay revisiones registradas para actualizar.">Actualizar revisión</MasterSubmitButton>
        </MasterActionForm>
      </>}
      </section>
    </details>}

    <section className={styles.notice}>
      <div><strong>Protección</strong><span>Esta sección registra la revisión, pero no publica cambios en el sitio público.</span></div>
      <code>Producción protegida</code>
    </section>
  </main>;
}
