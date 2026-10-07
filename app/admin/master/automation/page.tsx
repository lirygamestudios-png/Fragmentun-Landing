import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireAutomationEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function createWorkflow(formData:FormData){
  "use server";
  const {supabase,user}=await requireAutomationEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const triggerType=String(formData.get("trigger_type")||"manual");
  const autonomy=String(formData.get("autonomy_level")||"assistive");
  const requiresApproval=String(formData.get("requires_approval")||"true")==="true";
  const allowedTrigger=new Set(["manual","event","schedule","webhook","condition"]);
  const allowedAutonomy=new Set(["assistive","recommend","execute_low_risk","execute_with_approval"]);
  if(!code||!name||!domain||!allowedTrigger.has(triggerType)||!allowedAutonomy.has(autonomy)) throw new Error("invalid_workflow");
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
    {data:adIntegrations}
  ]=await Promise.all([
    supabase.from("automation_workflows").select("id,code,name,domain,trigger_type,status,autonomy_level,requires_approval,last_run_at,last_status,created_at").order("created_at",{ascending:true}),
    supabase.from("ai_agents").select("id,code,name,domain,purpose,status,autonomy_level,kill_switch,requires_approval,model_ref,cost_budget_cents,created_at").order("created_at",{ascending:true}),
    supabase.from("automation_approvals").select("id,workflow_id,agent_id,action_type,action_summary,risk_level,status,requested_at,decision_notes").order("requested_at",{ascending:false}).limit(50),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("ad_integrations").select("provider,enabled").order("provider",{ascending:true})
  ]);

  const workflowRows=(workflows||[]) as any[];
  const agentRows=(agents||[]) as any[];
  const approvalRows=(approvals||[]) as any[];
  const pending=approvalRows.filter(a=>a.status==="pending");
  const killCount=agentRows.filter(a=>a.kill_switch).length;
  const activeWorkflows=workflowRows.filter(w=>w.status==="active").length;
  const activeAgents=agentRows.filter(a=>a.status==="active").length;
  const integrations=(adIntegrations||[]) as any[];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · AUTOMATIZACIÓN & IA</span><h1>Automatización & IA</h1><p>Registry persistente de workflows, agentes, approvals y guardrails.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Workflows activos</small><strong>{activeWorkflows}</strong><span>{workflowRows.length} registrados</span></article>
      <article><small>Agentes activos</small><strong>{activeAgents}</strong><span>{agentRows.length} registrados</span></article>
      <article><small>Approvals pendientes</small><strong>{pending.length}</strong><span>Human-in-the-loop</span></article>
      <article><small>Kill switches</small><strong>{killCount}</strong><span>Agentes detenidos</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>WORKFLOW REGISTRY</span><h2>Workflows</h2></div><p>Los workflows empiezan vacíos y se activan únicamente después de configuración y pruebas.</p></section>
    <section className={styles.grid}>
      {workflowRows.map((w:any)=><article key={w.id} className={styles.card}>
        <div className={styles.cardTop}><span className={w.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(w.status).toUpperCase()}</span><em>{w.autonomy_level}</em></div>
        <h3>{w.name}</h3><p>{w.domain} · {w.trigger_type}<br/>Approval: {w.requires_approval?"Sí":"No"}</p>
      </article>)}
      {!workflowRows.length&&<article className={styles.card}><h3>Sin workflows registrados</h3><p>El registry está preparado para incorporar automatizaciones reales del estudio.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>AGENT REGISTRY</span><h2>Agentes IA</h2></div><p>Los agentes no se crean ni activan automáticamente; requieren configuración explícita.</p></section>
    <section className={styles.grid}>
      {agentRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={a.kill_switch?styles.badgePlanned:styles.badgeActive}>{a.kill_switch?"KILL ON":String(a.status).toUpperCase()}</span><em>{a.autonomy_level}</em></div>
        <h3>{a.name}</h3><p>{a.domain}<br/>{a.purpose||"Propósito pendiente"}</p>
        {profile.role==="admin"&&<form action={toggleKillSwitch}>
          <input type="hidden" name="agent_id" value={a.id}/><input type="hidden" name="next" value={String(!a.kill_switch)}/>
          <button className={styles.formButton} type="submit">{a.kill_switch?"Reactivar":"Activar kill switch"}</button>
        </form>}
      </article>)}
      {!agentRows.length&&<article className={styles.card}><h3>Sin agentes registrados</h3><p>El registry está listo, con aprobación humana y kill switch por agente.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>APPROVAL QUEUE</span><h2>Decisiones pendientes</h2></div><p>Acciones sensibles pueden quedar detenidas aquí hasta decisión humana.</p></section>
    <section className={styles.grid}>
      {pending.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{String(a.risk_level).toUpperCase()}</span><em>{a.action_type}</em></div>
        <h3>{a.action_summary}</h3>
        <p>Solicitado: {new Date(a.requested_at).toLocaleString("es-US")}</p>
        {profile.role==="admin"&&<div>
          <form action={decideApproval}><input type="hidden" name="approval_id" value={a.id}/><input type="hidden" name="decision" value="approved"/><button className={styles.formButton}>Aprobar</button></form>
          <form action={decideApproval}><input type="hidden" name="approval_id" value={a.id}/><input type="hidden" name="decision" value="rejected"/><button className={styles.formButton}>Rechazar</button></form>
        </div>}
      </article>)}
      {!pending.length&&<article className={styles.card}><h3>Sin approvals pendientes</h3><p>No hay acciones esperando decisión humana.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createWorkflow} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO WORKFLOW</span><h2>Registrar automatización</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="lead-nurture"/></label>
          <label>Nombre<input name="name" required placeholder="Lead Nurture"/></label>
          <label>Dominio<input name="domain" required placeholder="Growth"/></label>
          <label>Trigger<select name="trigger_type" defaultValue="manual">
            <option value="manual">Manual</option><option value="event">Event</option><option value="schedule">Schedule</option>
            <option value="webhook">Webhook</option><option value="condition">Condition</option>
          </select></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive">
            <option value="assistive">Assistive</option><option value="recommend">Recommend</option>
            <option value="execute_low_risk">Execute low risk</option><option value="execute_with_approval">Execute with approval</option>
          </select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true">
            <option value="true">Sí</option><option value="false">No</option>
          </select></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar workflow</button>
      </form>

      {profile.role==="admin"&&<form action={createAgent} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO AGENTE</span><h2>Registrar agente IA</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="growth-assistant"/></label>
          <label>Nombre<input name="name" required placeholder="Growth Assistant"/></label>
          <label>Dominio<input name="domain" required placeholder="Growth"/></label>
          <label>Autonomía<select name="autonomy_level" defaultValue="assistive">
            <option value="assistive">Assistive</option><option value="recommend">Recommend</option>
            <option value="execute_low_risk">Execute low risk</option><option value="execute_with_approval">Execute with approval</option>
          </select></label>
          <label>Requiere aprobación<select name="requires_approval" defaultValue="true">
            <option value="true">Sí</option><option value="false">No</option>
          </select></label>
          <label className={styles.span2}>Propósito<textarea name="purpose" rows={3} placeholder="Qué puede hacer y qué no puede hacer"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar agente</button>
      </form>}
    </section>}

    <section className={styles.sectionHead}><div><span>EXISTING CONTROLS</span><h2>Guardrails del ecosistema</h2></div></section>
    <section className={styles.grid}>
      {[
        ["Campañas",String(campaigns||0)+" configuradas"],
        ["Audit trail",String(adminEvents||0)+" eventos"],
        ["Rate limiting",String(rateRows||0)+" registros"],
        ["Ad integrations",integrations.map(x=>x.provider+":"+(x.enabled?"on":"off")).join(" · ")||"Sin integraciones"]
      ].map(([name,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONTROL</span><em>AI/OPS</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
