import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function statusLabel(value:string){
  const map:Record<string,string>={draft:"BORRADOR",testing:"EN PRUEBA",active:"ACTIVO",paused:"PAUSADO",disabled:"DESACTIVADO",error:"ERROR",pending:"PENDIENTE",approved:"APROBADO",rejected:"RECHAZADO"};
  return map[value]||String(value||"").toUpperCase();
}

function autonomyLabel(value:string){
  const map:Record<string,string>={assistive:"ASISTENCIA",recommend:"RECOMENDACIÓN",execute_low_risk:"EJECUCIÓN DE BAJO RIESGO",execute_with_approval:"EJECUCIÓN CON APROBACIÓN"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function riskLabel(value:string){
  const map:Record<string,string>={low:"BAJO",medium:"MEDIO",high:"ALTO",critical:"CRÍTICO"};
  return map[value]||String(value||"").toUpperCase();
}

function triggerLabel(value:string){
  const map:Record<string,string>={manual:"MANUAL",event:"EVENTO",schedule:"PROGRAMACIÓN",webhook:"EVENTO EXTERNO",condition:"CONDICIÓN"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function actionTypeLabel(value:string){
  if(!value)return "ACCIÓN";
  return String(value).replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

async function requireAutomationEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function createAutomatización(formData:FormData){
  "use server";
  const {supabase,user}=await requireAutomationEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const triggerType=String(formData.get("trigger_type")||"manual");
  const autonomy=String(formData.get("autonomy_level")||"assistive");
  const requiresApproval=String(formData.get("requires_approval")||"true")==="true";
  const allowedActivación=new Set(["manual","event","schedule","webhook","condition"]);
  const allowedAutonomy=new Set(["assistive","recommend","execute_low_risk","execute_with_approval"]);
  if(!code||!name||!domain||!allowedActivación.has(triggerType)||!allowedAutonomy.has(autonomy)) throw new Error("invalid_workflow");
  const{error}=await supabase.from("automation_workflows").insert({
    code,name,domain,trigger_type:triggerType,autonomy_level:autonomy,requires_approval:requiresApproval,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}

async function createAgent(formData:FormData){
  "use server";
  const {supabase,user,profile}=await requireAutomationEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const purpose=String(formData.get("purpose")||"").trim()||null;
  const autonomy=String(formData.get("autonomy_level")||"assistive");
  const requiresApproval=String(formData.get("requires_approval")||"true")==="true";
  const allowedAutonomy=new Set(["assistive","recommend","execute_low_risk","execute_with_approval"]);
  if(!code||!name||!domain||!allowedAutonomy.has(autonomy)) throw new Error("invalid_agent");
  const{error}=await supabase.from("ai_agents").insert({
    code,name,domain,purpose,autonomy_level:autonomy,requires_approval:requiresApproval,kill_switch:false,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}

async function toggleKillSwitch(formData:FormData){
  "use server";
  const {supabase,profile}=await requireAutomationEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const agentId=String(formData.get("agent_id")||"").trim();
  const next=String(formData.get("next")||"false")==="true";
  if(!agentId) throw new Error("agent_required");
  const{error}=await supabase.from("ai_agents").update({kill_switch:next,updated_at:new Date().toISOString()}).eq("id",agentId);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}

async function decideApproval(formData:FormData){
  "use server";
  const {supabase,user,profile}=await requireAutomationEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const id=String(formData.get("approval_id")||"").trim();
  const decision=String(formData.get("decision")||"").trim();
  const notes=String(formData.get("decision_notes")||"").trim()||null;
  if(!id||!["approved","rejected"].includes(decision)) throw new Error("invalid_decision");
  const{error}=await supabase.from("automation_approvals").update({
    status:decision,decided_by:user.id,decided_at:new Date().toISOString(),decision_notes:notes
  }).eq("id",id).eq("status","pending");
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}


async function updateAutomatización(formData:FormData){
  "use server";
  const {supabase}=await requireAutomationEditor();
  const id=String(formData.get("workflow_id")||"").trim();
  const status=String(formData.get("status")||"testing");
  const autonomy=String(formData.get("autonomy_level")||"assistive");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const requiresApproval=String(formData.get("requires_approval")||"true")==="true";
  const allowedEstado=new Set(["draft","testing","active","paused","disabled","error"]);
  const allowedAutonomy=new Set(["assistive","recommend","execute_low_risk","execute_with_approval"]);
  if(!id||!allowedEstado.has(status)||!allowedAutonomy.has(autonomy)) throw new Error("invalid_workflow_update");
  const{error}=await supabase.from("automation_workflows").update({
    status,autonomy_level:autonomy,owner_user_id:ownerUserId,requires_approval:requiresApproval,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}

async function updateAgent(formData:FormData){
  "use server";
  const {supabase,profile}=await requireAutomationEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const id=String(formData.get("agent_id")||"").trim();
  const status=String(formData.get("status")||"testing");
  const autonomy=String(formData.get("autonomy_level")||"assistive");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const requiresApproval=String(formData.get("requires_approval")||"true")==="true";
  const modelRef=String(formData.get("model_ref")||"").trim()||null;
  const budgetRaw=String(formData.get("cost_budget")||"").trim();
  const budgetCents=budgetRaw?Math.round(Number(budgetRaw)*100):null;
  const purpose=String(formData.get("purpose")||"").trim()||null;
  const allowedEstado=new Set(["draft","testing","active","paused","disabled"]);
  const allowedAutonomy=new Set(["assistive","recommend","execute_low_risk","execute_with_approval"]);
  if(!id||!allowedEstado.has(status)||!allowedAutonomy.has(autonomy)||(budgetCents!==null&&(!Number.isFinite(budgetCents)||budgetCents<0))) throw new Error("invalid_agent_update");
  const{error}=await supabase.from("ai_agents").update({
    status,autonomy_level:autonomy,owner_user_id:ownerUserId,requires_approval:requiresApproval,
    model_ref:modelRef,cost_budget_cents:budgetCents,purpose,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/automation");
}

export default async function MasterAutomationPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:workflows},
    {data:agents},
    {data:approvals},
    {count:campaigns},
    {count:adminEvents},
    {count:rateRows},
    {data:adIntegrations},
    {data:owners}
  ]=await Promise.all([
    supabase.from("automation_workflows").select("id,code,name,domain,trigger_type,status,autonomy_level,requires_approval,owner_user_id,last_run_at,last_status,created_at").order("created_at",{ascending:true}),
    supabase.from("ai_agents").select("id,code,name,domain,purpose,status,autonomy_level,kill_switch,requires_approval,owner_user_id,model_ref,cost_budget_cents,created_at").order("created_at",{ascending:true}),
    supabase.from("automation_approvals").select("id,workflow_id,agent_id,action_type,action_summary,risk_level,status,requested_at,decision_notes").order("requested_at",{ascending:false}).limit(50),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("ad_integrations").select("provider,enabled").order("provider",{ascending:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const workflowRows=(workflows||[]) as any[];
  const agentRows=(agents||[]) as any[];
  const approvalRows=(approvals||[]) as any[];
  const pending=approvalRows.filter(a=>a.status==="pending");
  const killCount=agentRows.filter(a=>a.kill_switch).length;
  const activeAutomatizaciones=workflowRows.filter(w=>w.status==="active").length;
  const activeAgents=agentRows.filter(a=>a.status==="active").length;
  const integrations=(adIntegrations||[]) as any[];
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · AUTOMATIZACIÓN E IA</span><h1>Automatización e IA</h1><p>Automatizaciones, agentes, aprobaciones y controles de seguridad.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Automatizaciones activas</small><strong>{activeAutomatizaciones}</strong><span>{workflowRows.length} registrados</span></article>
      <article><small>Agentes activos</small><strong>{activeAgents}</strong><span>{agentRows.length} registrados</span></article>
      <article><small>Aprobaciones pendientes</small><strong>{pending.length}</strong><span>Decisión humana requerida</span></article>
      <article><small>Paradas de emergencia</small><strong>{killCount}</strong><span>Agentes detenidos</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>AUTOMATIZACIONES</span><h2>Automatizaciones</h2></div><p>Las automatizaciones empiezan vacías y se activan únicamente después de configuración y pruebas.</p></section>
    <section className={styles.grid}>
      {workflowRows.map((w:any)=><article key={w.id} className={styles.card}>
        <div className={styles.cardTop}><span className={w.status==="active"?styles.badgeActive:styles.badgePlanned}>{statusLabel(w.status)}</span><em>{autonomyLabel(w.autonomy_level)}</em></div>
        <h3>{w.name}</h3><p>{w.domain} · {triggerLabel(w.trigger_type)}<br/>Responsable: {ownerName(w.owner_user_id)}<br/>Requiere aprobación: {w.requires_approval?"Sí":"No"}</p>
      </article>)}
      {!workflowRows.length&&<article className={styles.card}><h3>Sin automatizaciones registradas</h3><p>El sistema está preparado para incorporar automatizaciones reales del estudio.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>AGENTES IA</span><h2>Agentes IA</h2></div><p>Los agentes no se crean ni activan automáticamente; requieren configuración explícita.</p></section>
    <section className={styles.grid}>
      {agentRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={a.kill_switch?styles.badgePlanned:styles.badgeActive}>{a.kill_switch?"PARADA ACTIVA":statusLabel(a.status)}</span><em>{autonomyLabel(a.autonomy_level)}</em></div>
        <h3>{a.name}</h3><p>{a.domain}<br/>Responsable: {ownerName(a.owner_user_id)}<br/>{a.purpose||"Propósito pendiente"}<br/>{a.model_ref||"Modelo no asignado"} · {a.cost_budget_cents!=null?new Intl.NumberFormat("en-US",{style:"currency",currency:"USD"}).format(Number(a.cost_budget_cents)/100):"Presupuesto no definido"}</p>
        {profile.role==="admin"&&<form action={toggleKillSwitch}>
          <input type="hidden" name="agent_id" value={a.id}/><input type="hidden" name="next" value={String(!a.kill_switch)}/>
          <MasterSubmitButton className={styles.formButton} type="submit" confirmText={a.kill_switch?"¿Confirmas que deseas reactivar este agente?":"¿Confirmas que deseas detener este agente? Esta acción puede interrumpir automatizaciones activas."}>{a.kill_switch?"Reactivar":"Detener agente"}</MasterSubmitButton>
        </form>}
      </article>)}
      {!agentRows.length&&<article className={styles.card}><h3>Sin agentes registrados</h3><p>El sistema está listo, con aprobación humana y parada de emergencia por agente.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>APROBACIONES</span><h2>Decisiones pendientes</h2></div><p>Acciones sensibles pueden quedar detenidas aquí hasta decisión humana.</p></section>
    <section className={styles.grid}>
      {pending.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{riskLabel(a.risk_level)}</span><em>{actionTypeLabel(a.action_type)}</em></div>
        <h3>{a.action_summary}</h3>
        <p>Solicitado: {new Date(a.requested_at).toLocaleString("es-US")}</p>
        {profile.role==="admin"&&<div>
          <form action={decideApproval}><input type="hidden" name="approval_id" value={a.id}/><input type="hidden" name="decision" value="approved"/><MasterSubmitButton className={styles.formButton} confirmText="¿Confirmas que deseas aprobar esta acción?">Aprobar</MasterSubmitButton></form>
          <form action={decideApproval}><input type="hidden" name="approval_id" value={a.id}/><input type="hidden" name="decision" value="rejected"/><MasterSubmitButton className={styles.formButton} confirmText="¿Confirmas que deseas rechazar esta acción?">Rechazar</MasterSubmitButton></form>
        </div>}
      </article>)}
      {!pending.length&&<article className={styles.card}><h3>Sin aprobaciones pendientes</h3><p>No hay acciones esperando decisión humana.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar automatizaciones y agentes manualmente.</p>
      <section className={styles.adminForms}>
      <form action={createAutomatización} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA AUTOMATIZACIÓN</span><h2>Registrar automatización</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lead-nurture"/></label>
          <label>Nombre<input name="name" required placeholder="Seguimiento de contactos"/></label>
          <label>Dominio<input name="domain" required placeholder="Crecimiento"/></label>
          <label>Activación<select name="trigger_type" defaultValue="manual">
            <option value="manual">Manual</option><option value="event">Evento</option><option value="schedule">Programación</option>
            <option value="webhook">Evento externo</option><option value="condition">Condición</option>
          </select></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive">
            <option value="assistive">Asistencia</option><option value="recommend">Recomendación</option>
            <option value="execute_low_risk">Ejecución de bajo riesgo</option><option value="execute_with_approval">Ejecución con aprobación</option>
          </select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true">
            <option value="true">Sí</option><option value="false">No</option>
          </select></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar automatización</MasterSubmitButton>
      </form>

      {profile.role==="admin"&&<form action={createAgent} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO AGENTE</span><h2>Registrar agente IA</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="asistente-crecimiento"/></label>
          <label>Nombre<input name="name" required placeholder="Asistente de Crecimiento"/></label>
          <label>Dominio<input name="domain" required placeholder="Crecimiento"/></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive">
            <option value="assistive">Asistencia</option><option value="recommend">Recomendación</option>
            <option value="execute_low_risk">Ejecución de bajo riesgo</option><option value="execute_with_approval">Ejecución con aprobación</option>
          </select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true">
            <option value="true">Sí</option><option value="false">No</option>
          </select></label>
          <label className={styles.span2}>Propósito<textarea name="purpose" rows={3} placeholder="Qué puede hacer y qué no puede hacer"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar agente</MasterSubmitButton>
      </form>}
      </section>

      <section className={styles.adminForms}>
      <form action={updateAutomatización} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR AUTOMATIZACIÓN</span><h2>Actualizar automatización</h2></div>
        <div className={styles.formGrid}>
          <label>Automatización<select name="workflow_id" required defaultValue=""><option value="" disabled>Seleccionar automatización</option>{workflowRows.map((w:any)=><option key={w.id} value={w.id}>{w.code} · {w.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="testing"><option value="draft">Borrador</option><option value="testing">En prueba</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="disabled">Desactivado</option><option value="error">Error</option></select></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive"><option value="assistive">Asistencia</option><option value="recommend">Recomendación</option><option value="execute_low_risk">Ejecución de bajo riesgo</option><option value="execute_with_approval">Ejecución con aprobación</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!workflowRows.length}>Actualizar automatización</MasterSubmitButton>
      </form>

      {profile.role==="admin"&&<form action={updateAgent} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR AGENTE</span><h2>Actualizar agente IA</h2></div>
        <div className={styles.formGrid}>
          <label>Agente<select name="agent_id" required defaultValue=""><option value="" disabled>Seleccionar agente</option>{agentRows.map((a:any)=><option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="testing"><option value="draft">Borrador</option><option value="testing">En prueba</option><option value="active">Activo</option><option value="paused">Pausado</option><option value="disabled">Desactivado</option></select></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive"><option value="assistive">Asistencia</option><option value="recommend">Recomendación</option><option value="execute_low_risk">Ejecución de bajo riesgo</option><option value="execute_with_approval">Ejecución con aprobación</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
          <label>Modelo<input name="model_ref" placeholder="Proveedor / modelo"/></label>
          <label>Presupuesto USD<input type="number" min="0" step="0.01" name="cost_budget"/></label>
          <label className={styles.span2}>Propósito<textarea name="purpose" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!agentRows.length}>Actualizar agente</MasterSubmitButton>
      </form>}
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>CONTROLES EXISTENTES</span><h2>Controles del ecosistema</h2></div></section>
    <section className={styles.grid}>
      {[
        ["Campañas",String(campaigns||0)+" configuradas"],
        ["Historial de auditoría",String(adminEvents||0)+" eventos"],
        ["Control antiabuso",String(rateRows||0)+" registros"],
        ["Integraciones publicitarias",integrations.map(x=>x.provider+" · "+(x.enabled?"Activo":"Inactivo")).join(" · ")||"Sin integraciones"]
      ].map(([name,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONTROL</span><em>IA / OPERACIONES</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
