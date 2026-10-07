import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireTechEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createService(formData:FormData){
  "use server";
  const {supabase,user}=await requireTechEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const serviceType=String(formData.get("service_type")||"application");
  const provider=String(formData.get("provider")||"").trim()||null;
  const environment=String(formData.get("environment")||"production");
  const criticality=String(formData.get("criticality")||"medium");
  const url=String(formData.get("url")||"").trim()||null;
  const version=String(formData.get("version")||"").trim()||null;
  const allowedType=new Set(["application","database","auth","storage","analytics","ci_cd","hosting","integration","monitoring","other"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  const allowedCrit=new Set(["low","medium","high","critical"]);
  if(!code||!name||!allowedType.has(serviceType)||!allowedEnv.has(environment)||!allowedCrit.has(criticality)) throw new Error("invalid_service");
  const{error}=await supabase.from("tech_services").insert({
    code,name,service_type:serviceType,provider,environment,criticality,url,version,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

async function createChange(formData:FormData){
  "use server";
  const {supabase,user}=await requireTechEditor();
  const code=String(formData.get("change_code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const type=String(formData.get("change_type")||"standard");
  const risk=String(formData.get("risk_level")||"medium");
  const serviceRaw=String(formData.get("service_id")||"").trim();
  const serviceId=serviceRaw||null;
  const env=String(formData.get("target_environment")||"preview");
  const plannedAt=String(formData.get("planned_at")||"").trim()||null;
  const rollback=String(formData.get("rollback_plan")||"").trim()||null;
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedType=new Set(["standard","normal","emergency","security","configuration","dependency","infrastructure","other"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!code||!title||!allowedType.has(type)||!allowedRisk.has(risk)||!allowedEnv.has(env)) throw new Error("invalid_change");
  const{error}=await supabase.from("tech_changes").insert({
    change_code:code,title,change_type:type,risk_level:risk,service_id:serviceId,target_environment:env,
    planned_at:plannedAt,rollback_plan:rollback,summary,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}


async function updateService(formData:FormData){
  "use server";
  const {supabase}=await requireTechEditor();
  const id=String(formData.get("service_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const criticality=String(formData.get("criticality")||"medium");
  const environment=String(formData.get("environment")||"production");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const provider=String(formData.get("provider")||"").trim()||null;
  const version=String(formData.get("version")||"").trim()||null;
  const url=String(formData.get("url")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["active","degraded","maintenance","deprecated","retired"]);
  const allowedCrit=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!id||!allowedStatus.has(status)||!allowedCrit.has(criticality)||!allowedEnv.has(environment)) throw new Error("invalid_service_update");
  const{error}=await supabase.from("tech_services").update({
    status,criticality,environment,owner_user_id:ownerUserId,provider,version,url,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

async function updateChange(formData:FormData){
  "use server";
  const {supabase,user}=await requireTechEditor();
  const id=String(formData.get("change_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const risk=String(formData.get("risk_level")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const env=String(formData.get("target_environment")||"preview");
  const plannedAt=String(formData.get("planned_at")||"").trim()||null;
  const rollback=String(formData.get("rollback_plan")||"").trim()||null;
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedStatus=new Set(["planned","approved","in_progress","completed","failed","rolled_back","canceled"]);
  const allowedRisk=new Set(["low","medium","high","critical"]);
  const allowedEnv=new Set(["development","preview","staging","production","shared"]);
  if(!id||!allowedStatus.has(status)||!allowedRisk.has(risk)||!allowedEnv.has(env)) throw new Error("invalid_change_update");
  const patch:any={
    status,risk_level:risk,owner_user_id:ownerUserId,target_environment:env,planned_at:plannedAt,
    rollback_plan:rollback,summary,updated_at:new Date().toISOString()
  };
  if(status==="approved") patch.approved_by=user.id;
  if(status==="completed") patch.completed_at=new Date().toISOString();
  const{error}=await supabase.from("tech_changes").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/technology");
}

export default async function MasterTechnologyPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:services},
    {data:changes},
    {count:events},
    {count:rateRows},
    {count:media},
    {count:profiles},
    {data:owners}
  ]=await Promise.all([
    supabase.from("tech_services").select("id,code,name,service_type,provider,environment,status,criticality,owner_user_id,url,version,notes,created_at").order("name",{ascending:true}),
    supabase.from("tech_changes").select("id,change_code,title,change_type,status,risk_level,service_id,target_environment,planned_at,completed_at,rollback_plan,summary,owner_user_id,approved_by,created_at").order("created_at",{ascending:false}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const serviceRows=(services||[]) as any[];
  const changeRows=(changes||[]) as any[];
  const degraded=serviceRows.filter(s=>["degraded","maintenance"].includes(s.status)).length;
  const openChanges=changeRows.filter(c=>!["completed","failed","rolled_back","canceled"].includes(c.status));
  const riskyChanges=openChanges.filter(c=>["high","critical"].includes(c.risk_level));
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin owner";

  const stack=[
    ["Frontend","Next.js 15.5.27","Vercel"],
    ["Runtime","Node.js 24.x","Vercel Functions"],
    ["Database/Auth","Supabase","Postgres + Auth + Storage"],
    ["Source control","GitHub","Fragmentun-Landing"],
    ["Production branch","main","Protegida por baseline"],
    ["Master Admin branch","work/master-admin-implementation","Preview only"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · TECNOLOGÍA</span><h1>Tecnología</h1><p>Inventario técnico, cambios controlados y salud del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Servicios</small><strong>{serviceRows.length}</strong><span>{degraded} degraded/maintenance</span></article>
      <article><small>Cambios abiertos</small><strong>{openChanges.length}</strong><span>{riskyChanges.length} high/critical</span></article>
      <article><small>Eventos</small><strong>{(events||0).toLocaleString()}</strong><span>Analytics acumulado</span></article>
      <article><small>Admins</small><strong>{(profiles||0).toLocaleString()}</strong><span>Perfiles provisionados</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>SERVICE CATALOG</span><h2>Servicios técnicos</h2></div><p>Registro persistente de componentes y proveedores técnicos.</p></section>
    <section className={styles.grid}>
      {serviceRows.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(s.status).toUpperCase()}</span><em>{s.criticality}</em></div>
        <h3>{s.name}</h3><p>{s.service_type} · {s.provider||"Proveedor no registrado"}<br/>Owner: {ownerName(s.owner_user_id)}<br/>{s.environment} · {s.version||"Sin versión"}<br/>{s.url||"URL no registrada"}</p>
      </article>)}
      {!serviceRows.length&&<article className={styles.card}><h3>Service Catalog preparado</h3><p>No se han formalizado servicios técnicos todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CHANGE REGISTER</span><h2>Cambios técnicos</h2></div><p>Registro de cambios con riesgo, entorno objetivo y rollback plan.</p></section>
    <section className={styles.grid}>
      {changeRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="completed"?styles.badgeActive:styles.badgePlanned}>{String(c.status).toUpperCase()}</span><em>{c.risk_level}</em></div>
        <h3>{c.title}</h3><p>{c.change_code} · {c.change_type}<br/>Owner: {ownerName(c.owner_user_id)}<br/>{c.target_environment} · {c.planned_at?new Date(c.planned_at).toLocaleString("es-US"):"Sin fecha"}<br/>{c.rollback_plan?"Rollback definido":"Rollback pendiente"}</p>
      </article>)}
      {!changeRows.length&&<article className={styles.card}><h3>Change Register vacío</h3><p>Los cambios técnicos formales se registrarán aquí.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createService} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO SERVICIO</span><h2>Registrar componente</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="vercel-web"/></label>
          <label>Nombre<input name="name" required placeholder="Web Platform"/></label>
          <label>Tipo<select name="service_type" defaultValue="application">
            <option value="application">Application</option><option value="database">Database</option><option value="auth">Auth</option>
            <option value="storage">Storage</option><option value="analytics">Analytics</option><option value="ci_cd">CI/CD</option>
            <option value="hosting">Hosting</option><option value="integration">Integration</option><option value="monitoring">Monitoring</option><option value="other">Other</option>
          </select></label>
          <label>Proveedor<input name="provider"/></label>
          <label>Entorno<select name="environment" defaultValue="production"><option value="development">Development</option><option value="preview">Preview</option><option value="staging">Staging</option><option value="production">Production</option><option value="shared">Shared</option></select></label>
          <label>Criticality<select name="criticality" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Versión<input name="version"/></label>
          <label>URL<input name="url"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar servicio</button>
      </form>

      <form action={createChange} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO CAMBIO</span><h2>Registrar cambio técnico</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="change_code" required placeholder="chg-2026-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Tipo<select name="change_type" defaultValue="standard"><option value="standard">Standard</option><option value="normal">Normal</option><option value="emergency">Emergency</option><option value="security">Security</option><option value="configuration">Configuration</option><option value="dependency">Dependency</option><option value="infrastructure">Infrastructure</option><option value="other">Other</option></select></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Servicio<select name="service_id" defaultValue=""><option value="">Sin servicio</option>{serviceRows.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Entorno objetivo<select name="target_environment" defaultValue="preview"><option value="development">Development</option><option value="preview">Preview</option><option value="staging">Staging</option><option value="production">Production</option><option value="shared">Shared</option></select></label>
          <label>Fecha planificada<input type="datetime-local" name="planned_at"/></label>
          <label className={styles.span2}>Rollback plan<textarea name="rollback_plan" rows={3}/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar cambio</button>
      </form>
    </section>}


    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={updateService} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR SERVICIO</span><h2>Actualizar componente</h2></div>
        <div className={styles.formGrid}>
          <label>Servicio<select name="service_id" required defaultValue=""><option value="" disabled>Seleccionar servicio</option>{serviceRows.map((s:any)=><option key={s.id} value={s.id}>{s.code} · {s.name}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="active"><option value="active">Active</option><option value="degraded">Degraded</option><option value="maintenance">Maintenance</option><option value="deprecated">Deprecated</option><option value="retired">Retired</option></select></label>
          <label>Criticality<select name="criticality" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Entorno<select name="environment" defaultValue="production"><option value="development">Development</option><option value="preview">Preview</option><option value="staging">Staging</option><option value="production">Production</option><option value="shared">Shared</option></select></label>
          <label>Owner<select name="owner_user_id" defaultValue=""><option value="">Sin owner</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Proveedor<input name="provider"/></label>
          <label>Versión<input name="version"/></label>
          <label>URL<input name="url"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!serviceRows.length}>Actualizar servicio</button>
      </form>

      <form action={updateChange} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR CAMBIO</span><h2>Actualizar change record</h2></div>
        <div className={styles.formGrid}>
          <label>Cambio<select name="change_id" required defaultValue=""><option value="" disabled>Seleccionar cambio</option>{changeRows.map((x:any)=><option key={x.id} value={x.id}>{x.change_code} · {x.title}</option>)}</select></label>
          <label>Status<select name="status" defaultValue="planned"><option value="planned">Planned</option><option value="approved">Approved</option><option value="in_progress">In progress</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="rolled_back">Rolled back</option><option value="canceled">Canceled</option></select></label>
          <label>Riesgo<select name="risk_level" defaultValue="medium"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></label>
          <label>Owner<select name="owner_user_id" defaultValue=""><option value="">Sin owner</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Entorno objetivo<select name="target_environment" defaultValue="preview"><option value="development">Development</option><option value="preview">Preview</option><option value="staging">Staging</option><option value="production">Production</option><option value="shared">Shared</option></select></label>
          <label>Fecha planificada<input type="datetime-local" name="planned_at"/></label>
          <label className={styles.span2}>Rollback plan<textarea name="rollback_plan" rows={3}/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!changeRows.length}>Actualizar cambio</button>
      </form>
    </section>}

    <section className={styles.sectionHead}><div><span>TECH STACK</span><h2>Contexto actual</h2></div></section>
    <section className={styles.grid}>
      {stack.map(([name,value,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>TECH</em></div>
        <h3>{name}</h3><p><strong>{value}</strong><br/>{detail}</p>
      </article>)}
    </section>

    <section className={styles.kpis}>
      <article><small>Rate controls</small><strong>{(rateRows||0).toLocaleString()}</strong><span>Antiabuso</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets registrados</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Admin/editor</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>main intacto</span></article>
    </section>
  </main>;
}
