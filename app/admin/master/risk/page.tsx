import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function riskStatusLabel(value:string){
  const map:Record<string,string>={open:"ABIERTO",mitigating:"EN MITIGACIÓN",accepted:"ACEPTADO",monitoring:"EN SEGUIMIENTO",closed:"CERRADO"};
  return map[value]||String(value||"").toUpperCase();
}

function controlStatusLabel(value:string){
  const map:Record<string,string>={planned:"PLANIFICADO",implemented:"IMPLEMENTADO",effective:"EFECTIVO",needs_improvement:"REQUIERE MEJORA",failed:"FALLIDO",not_applicable:"NO APLICA"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function categoryLabel(value:string){
  const map:Record<string,string>={strategic:"ESTRATÉGICO",financial:"FINANCIERO",operational:"OPERATIVO",security:"SEGURIDAD",legal:"LEGAL",compliance:"CUMPLIMIENTO",technology:"TECNOLOGÍA",reputation:"REPUTACIÓN",vendor:"PROVEEDORES",people:"PERSONAS",other:"OTRO"};
  return map[value]||String(value||"").toUpperCase();
}

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
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  const systemSignals=[
    {name:"Protección de producción",state:"CONTROLADO",detail:"La versión de prueba permanece separada de la versión pública."},
    {name:"Control antiabuso",state:"CONTROLADO",detail:"La protección contra exceso de solicitudes permanece activa."},
    {name:"Dependencias de software",state:"CONTROLADO",detail:"No hay vulnerabilidades conocidas registradas en la revisión actual."},
    {name:"Protección de contraseñas",state:"ABIERTO",detail:"Existe una protección adicional pendiente de activación en el sistema de acceso."},
    {name:"Preparación fiscal",state:commerce?.tax_registration_status==="configured"?"CONTROLADO":"ABIERTO",detail:commerce?.tax_registration_status==="configured"?"Configuración fiscal registrada":"Configuración fiscal pendiente"},
    {name:"Pagos",state:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"ACTIVO":"CONTROLADO",detail:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"Proveedor habilitado":"Proveedores permanecen deshabilitados"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · RIESGOS Y CONTROLES</span><h1>Riesgos y Controles</h1><p>Riesgos, controles, evidencias y señales actuales del sistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Riesgos abiertos</small><strong>{open.length}</strong><span>{riskRows.length} registrados</span></article>
      <article><small>Altos o críticos</small><strong>{high.length}</strong><span>Nivel ≥15</span></article>
      <article><small>Vencidos</small><strong>{overdue.length}</strong><span>Fecha límite vencida</span></article>
      <article><small>Evidencias</small><strong>{evidenceRows.length}</strong><span>Evidencias de control</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>RIESGOS</span><h2>Riesgos formales</h2></div><p>Los riesgos solo pasan al registro formal cuando tienen tratamiento y responsable asignados.</p></section>
    <section className={styles.grid}>
      {riskRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}><span className={Number(r.inherent_score)>=15?styles.badgePlanificado:styles.badgeActive}>{riskStatusLabel(r.status)}</span><em>Nivel {r.inherent_score}</em></div>
        <h3>{r.title}</h3>
        <p>{r.domain} · {categoryLabel(r.category)}<br/>Responsable: {ownerName(r.owner_user_id)}<br/>Probabilidad {r.likelihood} × Impacto {r.impact}<br/>{r.control_name||"Control por definir"} · {controlStatusLabel(r.control_status)}<br/>{r.due_date?"Fecha límite: "+r.due_date:"Sin fecha límite"}</p>
      </article>)}
      {!riskRows.length&&<article className={styles.card}><h3>Registro de riesgos preparado</h3><p>No se han formalizado riesgos todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>SEÑALES DEL SISTEMA</span><h2>Señales técnicas actuales</h2></div><p>Observaciones automáticas del sistema; no equivalen por sí solas a riesgos corporativos formales.</p></section>
    <section className={styles.grid}>
      {systemSignals.map(s=><article key={s.name} className={styles.card}>
        <div className={styles.cardTop}><span className={s.state==="ABIERTO"?styles.badgePlanificado:styles.badgeActive}>{s.state}</span><em>SISTEMA</em></div>
        <h3>{s.name}</h3><p>{s.detail}</p>
      </article>)}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar riesgos, controles y evidencias manualmente.</p>
      <section className={styles.adminForms}>
      <form action={createRisk} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO RIESGO</span><h2>Registrar riesgo</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="sec-auth-001"/></label>
          <label>Título<input name="title" required/></label>
          <label>Dominio<input name="domain" required placeholder="Seguridad / Juegos / Finanzas"/></label>
          <label>Categoría<select name="category" defaultValue="operational">
            <option value="strategic">Estratégico</option><option value="financial">Financiero</option><option value="operational">Operativo</option>
            <option value="security">Seguridad</option><option value="legal">Legal</option><option value="compliance">Cumplimiento</option>
            <option value="technology">Tecnología</option><option value="reputation">Reputación</option><option value="vendor">Proveedores</option><option value="people">Personas</option><option value="other">Otro</option>
          </select></label>
          <label>Probabilidad<select name="likelihood" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Impacto<select name="impact" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Control<input name="control_name"/></label>
          <label>Fecha de revisión<input type="date" name="review_date"/></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Mitigación<textarea name="mitigation" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar riesgo</MasterSubmitButton>
      </form>

      <form action={createEvidence} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA EVIDENCIA</span><h2>Registrar evidencia de control</h2></div>
        <div className={styles.formGrid}>
          <label>Riesgo<select name="risk_id" required defaultValue=""><option value="" disabled>Seleccionar riesgo</option>{riskRows.map((r:any)=><option key={r.id} value={r.id}>{r.title}</option>)}</select></label>
          <label>Control<input name="control_name" required/></label>
          <label>Tipo<select name="evidence_type" defaultValue="note">
            <option value="note">Nota</option><option value="screenshot">Captura</option><option value="log">Registro</option>
            <option value="report">Reporte</option><option value="policy">Política</option><option value="test">Prueba</option><option value="approval">Aprobación</option><option value="other">Otro</option>
          </select></label>
          <label>URL evidencia<input name="evidence_url"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!riskRows.length} disabledReason="Primero registra un riesgo para poder añadir evidencia.">Registrar evidencia</MasterSubmitButton>
      </form>
      </section>

      <section className={styles.adminForms}>
      <form action={updateRisk} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR RIESGO</span><h2>Actualizar tratamiento</h2></div>
        <div className={styles.formGrid}>
          <label>Riesgo<select name="risk_id" required defaultValue=""><option value="" disabled>Seleccionar riesgo</option>{riskRows.map((r:any)=><option key={r.id} value={r.id}>{r.code} · {r.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="mitigating"><option value="open">Abierto</option><option value="mitigating">En mitigación</option><option value="accepted">Aceptado</option><option value="monitoring">En seguimiento</option><option value="closed">Cerrado</option></select></label>
          <label>Probabilidad<select name="likelihood" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Impacto<select name="impact" defaultValue="2">{[1,2,3,4,5].map(n=><option key={n} value={n}>{n}</option>)}</select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Estado del control<select name="control_status" defaultValue="planned"><option value="planned">Planificado</option><option value="implemented">Implementado</option><option value="effective">Efectivo</option><option value="needs_improvement">Requiere mejora</option><option value="failed">Fallido</option><option value="not_applicable">No aplica</option></select></label>
          <label>Control<input name="control_name"/></label>
          <label>Fecha de revisión<input type="date" name="review_date"/></label>
          <label>Fecha límite<input type="date" name="due_date"/></label>
          <label className={styles.span2}>Mitigación<textarea name="mitigation" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!riskRows.length} disabledReason="No hay riesgos registrados para actualizar.">Actualizar riesgo</MasterSubmitButton>
      </form>
      </section>
    </details>}

    <section className={styles.sectionHead}><div><span>CONTEXTO ACTUAL</span><h2>Exposición actual</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Productos</small><strong>{(products||0).toLocaleString()}</strong><span>Comercio</span></article>
      <article><small>Órdenes</small><strong>{(orders||0).toLocaleString()}</strong><span>Comercio</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Crecimiento</span></article>
      <article><small>Acceso a datos</small><strong>PROTEGIDO</strong><span>Administración y edición</span></article>
    </section>
  </main>;
}
