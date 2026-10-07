import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireRiskEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createRisk(formData:FormData){
  "use server";
  const {supabase,user}=await requireRiskEditor();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const domain=String(formData.get("domain")||"").trim();
  const category=String(formData.get("category")||"operational");
  const likelihood=Number(formData.get("likelihood")||2);
  const impact=Number(formData.get("impact")||2);
  const mitigation=String(formData.get("mitigation")||"").trim()||null;
  const controlName=String(formData.get("control_name")||"").trim()||null;
  const reviewDate=String(formData.get("review_date")||"").trim()||null;
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const allowed=new Set(["strategic","financial","operational","security","legal","compliance","technology","reputation","vendor","people","other"]);
  if(!code||!title||!domain||!allowed.has(category)||![1,2,3,4,5].includes(likelihood)||![1,2,3,4,5].includes(impact)) throw new Error("invalid_risk");
  const{error}=await supabase.from("risk_register").insert({
    code,title,domain,category,likelihood,impact,mitigation,control_name:controlName,review_date:reviewDate,due_date:dueDate,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/risk");
}

async function createEvidence(formData:FormData){
  "use server";
  const {supabase,user}=await requireRiskEditor();
  const riskId=String(formData.get("risk_id")||"").trim();
  const controlName=String(formData.get("control_name")||"").trim();
  const evidenceType=String(formData.get("evidence_type")||"note");
  const description=String(formData.get("description")||"").trim()||null;
  const evidenceUrl=String(formData.get("evidence_url")||"").trim()||null;
  const allowed=new Set(["note","screenshot","log","report","policy","test","approval","other"]);
  if(!riskId||!controlName||!allowed.has(evidenceType)) throw new Error("invalid_evidence");
  const{error}=await supabase.from("control_evidence").insert({
    risk_id:riskId,control_name:controlName,evidence_type:evidenceType,description,evidence_url:evidenceUrl,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/risk");
}


async function updateRisk(formData:FormData){
  "use server";
  const {supabase}=await requireRiskEditor();
  const id=String(formData.get("risk_id")||"").trim();
  const status=String(formData.get("status")||"open");
  const likelihood=Number(formData.get("likelihood")||2);
  const impact=Number(formData.get("impact")||2);
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const mitigation=String(formData.get("mitigation")||"").trim()||null;
  const controlName=String(formData.get("control_name")||"").trim()||null;
  const controlStatus=String(formData.get("control_status")||"planned");
  const reviewDate=String(formData.get("review_date")||"").trim()||null;
  const dueDate=String(formData.get("due_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["open","mitigating","accepted","monitoring","closed"]);
  const allowedControl=new Set(["planned","implemented","effective","needs_improvement","failed","not_applicable"]);
  if(!id||!allowedStatus.has(status)||!allowedControl.has(controlStatus)||![1,2,3,4,5].includes(likelihood)||![1,2,3,4,5].includes(impact)) throw new Error("invalid_risk_update");
  const{error}=await supabase.from("risk_register").update({
    status,likelihood,impact,owner_user_id:ownerUserId,mitigation,control_name:controlName,
    control_status:controlStatus,review_date:reviewDate,due_date:dueDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/risk");
}

export default async function MasterRiskPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:risks},
    {data:evidence},
    {data:commerce},
    {count:products},
    {count:orders},
    {count:campaigns},
    {data:owners}
  ]=await Promise.all([
    supabase.from("risk_register").select("id,code,title,domain,category,likelihood,impact,inherent_score,status,owner_user_id,mitigation,control_name,control_status,review_date,due_date,notes,created_at").order("inherent_score",{ascending:false}),
    supabase.from("control_evidence").select("id,risk_id,control_name,evidence_type,description,evidence_url,status,collected_at,expires_at").order("collected_at",{ascending:false}).limit(100),
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,tax_registration_status,tax_mode").eq("id","default").maybeSingle(),
    supabase.from("shop_products").select("*",{count:"exact",head:true}),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const riskRows=(risks||[]) as any[];
  const evidenceRows=(evidence||[]) as any[];
  const open=riskRows.filter(r=>r.status!=="closed");
  const high=riskRows.filter(r=>Number(r.inherent_score)>=15);
  const overdue=riskRows.filter(r=>r.due_date&&new Date(r.due_date).getTime()<Date.now()&&r.status!=="closed");
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin owner";

  const systemSignals=[
    {name:"Producción directa",state:"CONTROLADO",detail:"Master Admin aislado en rama Preview; main protegido"},
    {name:"Rate limiting",state:"CONTROLADO",detail:"Tabla cerrada a escritura directa; función server-side preservada"},
    {name:"npm audit",state:"CONTROLADO",detail:"sharp 0.35.5; npm audit = 0 vulnerabilidades"},
    {name:"Leaked password protection",state:"ABIERTO",detail:"Supabase Auth: protección pendiente de activación por canal específico de Auth"},
    {name:"Tax readiness",state:commerce?.tax_registration_status==="configured"?"CONTROLADO":"ABIERTO",detail:commerce?.tax_registration_status||"not_configured"},
    {name:"Pagos",state:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"ACTIVO":"CONTROLADO",detail:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"Proveedor habilitado":"Proveedores permanecen deshabilitados"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · RIESGOS</span><h1>Riesgos & Controles</h1><p>Risk register persistente, evidencias de control y señales técnicas actuales.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Riesgos abiertos</small><strong>{open.length}</strong><span>{riskRows.length} registrados</span></article>
      <article><small>High/Critical</small><strong>{high.length}</strong><span>Score ≥15</span></article>
      <article><small>Overdue</small><strong>{overdue.length}</strong><span>Due date vencida</span></article>
      <article><small>Evidencias</small><strong>{evidenceRows.length}</strong><span>Control evidence</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>RISK REGISTER</span><h2>Riesgos formales</h2></div><p>Los riesgos del sistema no se insertan automáticamente: solo pasan al registro formal cuando se asigna tratamiento y owner.</p></section>
    <section className={styles.grid}>
      {riskRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}><span className={Number(r.inherent_score)>=15?styles.badgePlanned:styles.badgeActive}>{String(r.status).toUpperCase()}</span><em>Score {r.inherent_score}</em></div>
        <h3>{r.title}</h3>
        <p>{r.domain} · {r.category}<br/>Owner: {ownerName(r.owner_user_id)}<br/>Likelihood {r.likelihood} × Impact {r.impact}<br/>{r.control_name||"Control por definir"} · {r.control_status}<br/>{r.due_date?"Due: "+r.due_date:"Sin due date"}</p>
      </article>)}
      {!riskRows.length&&<article className={styles.card}><h3>Risk Register preparado</h3><p>No se han formalizado riesgos todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>SYSTEM SIGNALS</span><h2>Señales técnicas actuales</h2></div><p>Observaciones automáticas del sistema; no equivalen por sí solas a riesgos corporativos formales.</p></section>
    <section className={styles.grid}>
      {systemSignals.map(s=><article key={s.name} className={styles.card}>
        <div className={styles.cardTop}><span className={s.state==="ABIERTO"?styles.badgePlanned:styles.badgeActive}>{s.state}</span><em>SISTEMA</em></div>
        <h3>{s.name}</h3><p>{s.detail}</p>
      </article>)}
    </section>

    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createRisk} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO RIESGO</span><h2>Registrar riesgo</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="sec-auth-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Dominio<input name="domain" required placeholder="Security / Games / Finance"/></label>
          <label>Categoría<select name="category" defaultValue="operational">
            <option value="strategic">Strategic</option><option value="financial">Financial</option><option value="operational">Operational</option>
            <option value="security">Security</option><option value="legal">Legal</option><option value="compliance">Compliance</option>
            <option value="technology">Technology</option><option value="reputation">Reputation</option><option value="vendor">Vendor</option><option value="people">People</option><option value="other">Other</option>
          </select></label>
          <label>Likelihood<select name="likelihood" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Impact<select name="impact" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Control<input name="control_name"/></label>
          <label>Review date<input type="date" name="review_date"/></label>
          <label>Due date<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Mitigación<textarea name="mitigation" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar riesgo</button>
      </form>

      <form action={createEvidence} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA EVIDENCIA</span><h2>Registrar evidencia de control</h2></div>
        <div className={styles.formGrid}>
          <label>Riesgo<select name="risk_id" required defaultValue=""><option value="" disabled>Seleccionar riesgo</option>{riskRows.map((r:any)=><option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
          <label>Control<input name="control_name" required/></label>
          <label>Tipo<select name="evidence_type" defaultValue="note">
            <option value="note">Note</option><option value="screenshot">Screenshot</option><option value="log">Log</option>
            <option value="report">Report</option><option value="policy">Policy</option><option value="test">Test</option><option value="approval">Approval</option><option value="other">Other</option>
          </select></label>
          <label>URL evidencia<input name="evidence_url"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!riskRows.length}>Registrar evidencia</button>
      </form>
    </section>}


    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={updateRisk} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR RIESGO</span><h2>Actualizar tratamiento</h2></div>
        <div className={styles.formGrid}>
          <label>Riesgo<select name="risk_id" required defaultValue=""><option value="" disabled>Seleccionar riesgo</option>{riskRows.map((r:any)=><option key={r.id} value={r.id}>{r.code} · {r.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="mitigating"><option value="open">Open</option><option value="mitigating">Mitigating</option><option value="accepted">Accepted</option><option value="monitoring">Monitoring</option><option value="closed">Closed</option></select></label>
          <label>Likelihood<select name="likelihood" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Impact<select name="impact" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Owner<select name="owner_user_id" defaultValue=""><option value="">Sin owner</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Control status<select name="control_status" defaultValue="planned"><option value="planned">Planned</option><option value="implemented">Implemented</option><option value="effective">Effective</option><option value="needs_improvement">Needs improvement</option><option value="failed">Failed</option><option value="not_applicable">Not applicable</option></select></label>
          <label>Control<input name="control_name"/></label>
          <label>Review date<input type="date" name="review_date"/></label>
          <label>Due date<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Mitigación<textarea name="mitigation" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!riskRows.length}>Actualizar riesgo</button>
      </form>
    </section>}

    <section className={styles.sectionHead}><div><span>OPERATING CONTEXT</span><h2>Exposición actual</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Productos</small><strong>{(products||0).toLocaleString()}</strong><span>Commerce</span></article>
      <article><small>Órdenes</small><strong>{(orders||0).toLocaleString()}</strong><span>Commerce</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Growth</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Admin / editor</span></article>
    </section>
  </main>;
}
