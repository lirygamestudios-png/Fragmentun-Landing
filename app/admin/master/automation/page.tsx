import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterAutomationPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:campaigns},
    {count:adminEvents},
    {count:rateRows},
    {data:adIntegrations}
  ]=await Promise.all([
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("admin_activity_log").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("ad_integrations").select("provider,enabled").order("provider",{ascending:true})
  ]);

  const integrations=(adIntegrations||[]) as any[];
  const agents=[
    ["Workflow orchestration","READINESS","Motor corporativo aún no persistido"],
    ["Agent registry","READINESS","Registro de agentes pendiente"],
    ["Approvals","READINESS","Matriz de aprobación se implementará por dominio"],
    ["Kill switch","READINESS","Control global pendiente"],
    ["Campaign automation","ACTIVO",String(campaigns||0)+" campañas configuradas"],
    ["Audit trail","ACTIVO",String(adminEvents||0)+" eventos administrativos"],
    ["Abuse controls","ACTIVO",String(rateRows||0)+" registros de rate limiting"],
    ["Ad integrations","ACTIVO",integrations.map(x=>x.provider+":"+(x.enabled?"on":"off")).join(" · ")||"Sin integraciones"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · AUTOMATIZACIÓN & IA</span><h1>Automatización & IA</h1><p>Control plane inicial para workflows, agentes e integraciones.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Automatización comercial</span></article>
      <article><small>Audit events</small><strong>{(adminEvents||0).toLocaleString()}</strong><span>Trazabilidad</span></article>
      <article><small>Rate controls</small><strong>{(rateRows||0).toLocaleString()}</strong><span>Guardrails</span></article>
      <article><small>Ad providers</small><strong>{integrations.length}</strong><span>Integraciones configurables</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>AI GOVERNANCE</span><h2>Readiness de automatización</h2></div><p>No se activan agentes autónomos sin registro, permisos y controles explícitos.</p></section>
    <section className={styles.grid}>
      {agents.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>AI/OPS</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
