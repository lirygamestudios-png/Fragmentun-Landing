import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireStrategyEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createObjective(formData:FormData){
  "use server";
  const {supabase,user}=await requireStrategyEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const description=String(formData.get("description")||"").trim()||null;
  const horizon=String(formData.get("horizon")||"quarter");
  const priority=String(formData.get("priority")||"medium");
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const allowedHorizon=new Set(["month","quarter","year","multi_year"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!code||!title||!allowedHorizon.has(horizon)||!allowedPriority.has(priority)) throw new Error("invalid_objective");
  const{error}=await supabase.from("strategy_objectives").insert({
    code,title,description,horizon,priority,start_date:startDate,target_date:targetDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/strategy");
}

async function createKeyResult(formData:FormData){
  "use server";
  const {supabase,user}=await requireStrategyEditor();
  const objectiveId=String(formData.get("objective_id")||"").trim();
  const title=String(formData.get("title")||"").trim();
  const metricName=String(formData.get("metric_name")||"").trim()||null;
  const unit=String(formData.get("unit")||"").trim()||null;
  const baselineRaw=String(formData.get("baseline")||"").trim();
  const targetRaw=String(formData.get("target_value")||"").trim();
  const currentRaw=String(formData.get("current_value")||"").trim();
  const baseline=baselineRaw?Number(baselineRaw):null;
  const target=targetRaw?Number(targetRaw):null;
  const current=currentRaw?Number(currentRaw):null;
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  if(!objectiveId||!title) throw new Error("invalid_key_result");
  if([baseline,target,current].some(v=>v!==null&&!Number.isFinite(v))) throw new Error("invalid_metric");
  const{error}=await supabase.from("strategy_key_results").insert({
    objective_id:objectiveId,title,metric_name:metricName,unit,baseline,target_value:target,current_value:current,target_date:targetDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/strategy");
}


async function updateObjective(formData:FormData){
  "use server";
  const {supabase}=await requireStrategyEditor();
  const id=String(formData.get("objective_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const priority=String(formData.get("priority")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const progress=Math.max(0,Math.min(100,Number(formData.get("progress_percent")||0)));
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","active","at_risk","completed","canceled"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!id||!allowedStatus.has(status)||!allowedPriority.has(priority)||!Number.isFinite(progress)) throw new Error("invalid_objective_update");
  const{error}=await supabase.from("strategy_objectives").update({
    status,priority,owner_user_id:ownerUserId,progress_percent:Math.trunc(progress),start_date:startDate,target_date:targetDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/strategy");
}

async function updateKeyResult(formData:FormData){
  "use server";
  const {supabase}=await requireStrategyEditor();
  const id=String(formData.get("key_result_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const currentRaw=String(formData.get("current_value")||"").trim();
  const targetRaw=String(formData.get("target_value")||"").trim();
  const current=currentRaw?Number(currentRaw):null;
  const target=targetRaw?Number(targetRaw):null;
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","active","at_risk","completed","canceled"]);
  if(!id||!allowedStatus.has(status)||[current,target].some(v=>v!==null&&!Number.isFinite(v))) throw new Error("invalid_kr_update");
  const{error}=await supabase.from("strategy_key_results").update({
    status,owner_user_id:ownerUserId,current_value:current,target_value:target,target_date:targetDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/strategy");
}

export default async function MasterStrategyPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since30=new Date(Date.now()-30*86400000).toISOString();
  const[
    {data:objectives},
    {data:keyResults},
    {count:views},
    {count:amazonClicks},
    {count:leads},
    {count:testCompletes},
    {count:campaigns},
    {count:paidOrders},
    {data:owners}
  ]=await Promise.all([
    supabase.from("strategy_objectives").select("id,code,title,description,horizon,status,priority,owner_user_id,start_date,target_date,progress_percent,notes,created_at").order("priority",{ascending:false}),
    supabase.from("strategy_key_results").select("id,objective_id,title,metric_name,unit,baseline,target_value,current_value,status,owner_user_id,target_date,notes,created_at").order("created_at",{ascending:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since30),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","test_complete").gte("created_at",since30),
    supabase.from("campaigns").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid"),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const objectiveRows=(objectives||[]) as any[];
  const krRows=(keyResults||[]) as any[];
  const activeObjectives=objectiveRows.filter(o=>o.status==="active");
  const atRiskObjectives=objectiveRows.filter(o=>o.status==="at_risk");
  const leadConversion=(views||0)>0?((leads||0)/(views||1))*100:0;
  const amazonCtr=(views||0)>0?((amazonClicks||0)/(views||1))*100:0;
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · ESTRATEGIA</span><h1>Estrategia</h1><p>Objetivos, resultados y métricas conectados a la operación real.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Objetivos activos</small><strong>{activeObjectives.length}</strong><span>{objectiveRows.length} totales</span></article>
      <article><small>En riesgo</small><strong>{atRiskObjectives.length}</strong><span>Objetivos en riesgo</span></article>
      <article><small>Resultados medibles</small><strong>{krRows.length}</strong><span>Medidas registradas</span></article>
      <article><small>Conversión de contactos 30 días</small><strong>{leadConversion.toFixed(1)}%</strong><span>Señal operativa</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>OBJETIVOS</span><h2>Objetivos estratégicos</h2></div><p>Cada objetivo debe registrarse de forma explícita y medible.</p></section>
    <section className={styles.grid}>
      {objectiveRows.map((o:any)=><article key={o.id} className={styles.card}>
        <div className={styles.cardTop}><span className={o.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(o.status).toUpperCase()}</span><em>{o.priority}</em></div>
        <h3>{o.title}</h3><p>{o.horizon} · {o.progress_percent}%<br/>Responsable: {ownerName(o.owner_user_id)}<br/>{o.start_date||"sin inicio"} → {o.target_date||"sin fecha objetivo"}<br/>{o.description||"Sin descripción"}</p>
      </article>)}
      {!objectiveRows.length&&<article className={styles.card}><h3>Registro de estrategia preparado</h3><p>No se han cargado objetivos todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>RESULTADOS</span><h2>Resultados medibles</h2></div></section>
    <section className={styles.grid}>
      {krRows.map((kr:any)=><article key={kr.id} className={styles.card}>
        <div className={styles.cardTop}><span className={kr.status==="completed"?styles.badgeActive:styles.badgePlanned}>{String(kr.status).toUpperCase()}</span><em>{kr.metric_name||"KPI"}</em></div>
        <h3>{kr.title}</h3><p>Responsable: {ownerName(kr.owner_user_id)}<br/>Base: {kr.baseline??"—"} {kr.unit||""}<br/>Actual: {kr.current_value??"—"} · Objetivo: {kr.target_value??"—"} {kr.unit||""}<br/>{kr.target_date||"Sin fecha"}</p>
      </article>)}
      {!krRows.length&&<article className={styles.card}><h3>Sin resultados medibles</h3><p>Los resultados se registrarán contra objetivos reales.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      <form action={createObjective} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO OBJETIVO</span><h2>Registrar objetivo</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="q4-growth"/></label>
          <label>Título<input name="title" required/></label>
          <label>Horizonte<select name="horizon" defaultValue="quarter"><option value="month">Mes</option><option value="quarter">Trimestre</option><option value="year">Año</option><option value="multi_year">Varios años</option></select></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar objetivo</button>
      </form>

      <form action={createKeyResult} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO RESULTADO</span><h2>Registrar resultado medible</h2></div>
        <div className={styles.formGrid}>
          <label>Objetivo<select name="objective_id" required defaultValue=""><option value="" disabled>Seleccionar objetivo</option>{objectiveRows.map((o:any)=><option key={o.id} value={o.id}>{o.title}</option>)}</select></label>
          <label>Título<input name="title" required/></label>
          <label>Métrica<input name="metric_name" placeholder="Contactos / ingresos / hito"/></label>
          <label>Unidad<input name="unit" placeholder="% / USD / cantidad"/></label>
          <label>Valor inicial<input type="number" step="any" name="baseline"/></label>
          <label>Actual<input type="number" step="any" name="current_value"/></label>
          <label>Objetivo<input type="number" step="any" name="target_value"/></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!objectiveRows.length}>Registrar resultado</button>
      </form>
    </section></details>}


    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      <form action={updateObjective} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR OBJETIVO</span><h2>Actualizar objetivo</h2></div>
        <div className={styles.formGrid}>
          <label>Objetivo<select name="objective_id" required defaultValue=""><option value="" disabled>Seleccionar objetivo</option>{objectiveRows.map((o:any)=><option key={o.id} value={o.id}>{o.code} · {o.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="planned">Planificado</option><option value="active">Activo</option><option value="at_risk">En riesgo</option><option value="completed">Completado</option><option value="canceled">Cancelado</option></select></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Progreso %<input type="number" min="0" max="100" name="progress_percent" defaultValue="0"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!objectiveRows.length}>Actualizar objetivo</button>
      </form>

      <form action={updateKeyResult} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR RESULTADO</span><h2>Actualizar resultado</h2></div>
        <div className={styles.formGrid}>
          <label>Resultado<select name="key_result_id" required defaultValue=""><option value="" disabled>Seleccionar resultado</option>{krRows.map((kr:any)=><option key={kr.id} value={kr.id}>{kr.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="planned">Planificado</option><option value="active">Activo</option><option value="at_risk">En riesgo</option><option value="completed">Completado</option><option value="canceled">Cancelado</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Actual<input type="number" step="any" name="current_value"/></label>
          <label>Objetivo<input type="number" step="any" name="target_value"/></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!krRows.length}>Actualizar resultado</button>
      </form>
    </section></details>}

    <section className={styles.sectionHead}><div><span>SEÑALES OPERATIVAS</span><h2>Línea base real</h2></div><p>Estas métricas sirven como referencia operativa; no sustituyen las metas definidas.</p></section>
    <section className={styles.kpis}>
      <article><small>Tráfico 30 días</small><strong>{(views||0).toLocaleString()}</strong><span>Inicio del embudo</span></article>
      <article><small>Clics a Amazon</small><strong>{amazonCtr.toFixed(1)}%</strong><span>Intento comercial</span></article>
      <article><small>Pruebas completadas</small><strong>{(testCompletes||0).toLocaleString()}</strong><span>Interacción</span></article>
      <article><small>Órdenes pagadas</small><strong>{(paidOrders||0).toLocaleString()}</strong><span>Monetización</span></article>
    </section>
  </main>;
}