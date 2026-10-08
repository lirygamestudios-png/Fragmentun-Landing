import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import styles from "./master-admin.module.css";
import {getMasterLiveSnapshot} from "../../../lib/master-live";
import {MasterCommanderLive} from "../../../components/MasterCommanderLive";

type Domain={
  title:string;
  subtitle:string;
  href:string;
  phase:string;
  status:"active"|"planned";
};

const domains:Domain[]=[
  {title:"Inicio",subtitle:"Resumen general, alertas y decisiones pendientes",href:"/admin/master",phase:"60",status:"active"},
  {title:"Operaciones",subtitle:"Trabajo diario, continuidad y estado general",href:"/admin/master/operations",phase:"60",status:"active"},
  {title:"Juegos",subtitle:"Desarrollo, lanzamientos y operación por título",href:"/admin/master/games",phase:"57",status:"active"},
  {title:"Publicación",subtitle:"Plataformas, lanzamientos, catálogo y franquicias",href:"/admin/master/publishing",phase:"59",status:"active"},
  {title:"Crecimiento",subtitle:"Captación, conversión, contactos y retención",href:"/admin/master/growth",phase:"53",status:"active"},
  {title:"Monetización",subtitle:"Precios, planes, freemium, paquetes e ingresos",href:"/admin/master/monetization",phase:"54",status:"active"},
  {title:"Comercio",subtitle:"Pedidos, pagos, entregas y devoluciones",href:"/admin/master/commerce",phase:"55",status:"active"},
      {title:"Clientes y Comunidad",subtitle:"Miembros, participación, betas y comunidad",href:"/admin/master/community",phase:"53-55",status:"active"},
  {title:"Finanzas",subtitle:"Ingresos, gastos, caja, impuestos y reportes",href:"/admin/master/finance",phase:"39",status:"active"},
  {title:"Personas",subtitle:"Equipo, talento, desempeño y compensación",href:"/admin/master/people",phase:"48",status:"active"},
  {title:"Tecnología",subtitle:"Infraestructura, cambios, pruebas y operación técnica",href:"/admin/master/technology",phase:"58",status:"active"},
  {title:"Datos",subtitle:"Métricas, indicadores y apoyo a decisiones",href:"/admin/master/data",phase:"43",status:"active"},
  {title:"Reportes",subtitle:"Vista ejecutiva, impresión, PDF y exportación de indicadores",href:"/admin/master/reports",phase:"60",status:"active"},
  {title:"Integraciones",subtitle:"Conexiones externas, correo, publicidad e historial",href:"/admin/master/integrations",phase:"60",status:"active"},
  {title:"Copias y Recuperación",subtitle:"Copias externas protegidas y referencia de recuperación",href:"/admin/master/backups",phase:"60",status:"active"},
  {title:"Mantenimiento",subtitle:"Rutinas, soporte, pruebas y continuidad operativa",href:"/admin/master/maintenance",phase:"60",status:"active"},
  {title:"Revisión visual",subtitle:"Revisión pantalla por pantalla antes de las pruebas finales",href:"/admin/master/checklist",phase:"60",status:"active"},
  {title:"Pruebas finales",subtitle:"Preparación de pruebas funcionales y decisión de publicación",href:"/admin/master/qa",phase:"60",status:"active"},
  {title:"Automatización e IA",subtitle:"Automatizaciones, agentes, permisos y control",href:"/admin/master/automation",phase:"44",status:"active"},
  {title:"Riesgos y Controles",subtitle:"Riesgos, cumplimiento, controles y seguimiento",href:"/admin/master/risk",phase:"46",status:"active"},
  {title:"Seguridad",subtitle:"Accesos, incidentes y continuidad",href:"/admin/master/security",phase:"45",status:"active"},
  {title:"Legal e IP",subtitle:"Contratos, derechos, propiedad intelectual y registros",href:"/admin/master/legal",phase:"47",status:"active"},
  {title:"Alianzas y Licencias",subtitle:"Alianzas, distribución, licencias y expansión",href:"/admin/master/partners",phase:"51",status:"active"},
  {title:"Proveedores",subtitle:"Compras, suplidores, contratos y costos",href:"/admin/master/suppliers",phase:"56",status:"active"},
  {title:"Marca y Comunicaciones",subtitle:"Marca, prensa, reputación y comunicación",href:"/admin/master/brand",phase:"52",status:"active"},
  {title:"Estrategia",subtitle:"Objetivos, prioridades, decisiones y recursos",href:"/admin/master/strategy",phase:"49",status:"active"},
  {title:"Capital e Inversionistas",subtitle:"Inversión, relaciones con inversionistas y operaciones estratégicas",href:"/admin/master/capital",phase:"50",status:"active"},
      {title:"Configuración",subtitle:"Ajustes generales y funciones del sistema",href:"/admin/master/settings",phase:"60",status:"active"},
  {title:"Revisión antes de publicar",subtitle:"Comprobaciones, evidencia y aprobación antes de publicar",href:"/admin/master/releases",phase:"60",status:"active"},
  {title:"Estado y Pruebas",subtitle:"Comprobaciones, historial y estado de la versión de prueba",href:"/admin/master/observability",phase:"60",status:"active"},
  {title:"FRAGMENTUN",subtitle:"Administración de la IP y su sitio público",href:"/admin",phase:"Actual",status:"active"}
];

export default async function MasterAdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("display_name,role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile) redirect("/admin/login?unauthorized=1");

  const liveSnapshotPromise=getMasterLiveSnapshot(supabase);

  const [
    {count:leadCount},
    {count:eventCount},
    {count:bookCount},
    {count:mediaCount},
    {data:games},
    {data:milestones},
    {data:releases},
    {data:crmContacts},
    {data:financeTx},
    {data:approvals},
    {data:workItems},
    {data:risks},
    {data:incidents},
    {data:community},
    {data:accessReviews},
    {data:contracts},
    {data:techChanges},
    {data:fundraising}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("game_titles").select("id,name,lifecycle_stage,health_status,target_release_date"),
    supabase.from("game_milestones").select("id,status,target_date,progress_percent"),
    supabase.from("publishing_releases").select("id,status,certification_status,target_date"),
    supabase.from("crm_contacts").select("id,lifecycle_stage,status,score,next_action_at"),
    supabase.from("finance_transactions").select("id,status,transaction_type,amount_cents,currency,transaction_date").limit(500),
    supabase.from("automation_approvals").select("id,status,risk_level,action_summary,requested_at").eq("status","pending").limit(25),
    supabase.from("ops_work_items").select("id,status,priority,due_date,domain"),
    supabase.from("risk_register").select("id,status,inherent_score,domain,due_date"),
    supabase.from("security_incidents").select("id,status,severity,category"),
    supabase.from("community_members").select("id,status,tier,points,beta_priority"),
    supabase.from("security_access_reviews").select("id,review_status,risk_level,due_date"),
    supabase.from("legal_contracts").select("id,status,expiration_date,auto_renew,renewal_notice_days"),
    supabase.from("tech_changes").select("id,status,risk_level,planned_at,target_environment"),
    supabase.from("fundraising_opportunities").select("id,status,stage,probability,expected_close_date,next_action_at")
  ]);

  const liveSnapshot=await liveSnapshotPromise;

  const gameRows=(games||[]) as any[];
  const milestoneRows=(milestones||[]) as any[];
  const releaseRows=(releases||[]) as any[];
  const crmRows=(crmContacts||[]) as any[];
  const financeRows=(financeTx||[]) as any[];
  const approvalRows=(approvals||[]) as any[];
  const workRows=(workItems||[]) as any[];
  const riskRows=(risks||[]) as any[];
  const incidentRows=(incidents||[]) as any[];
  const communityRows=(community||[]) as any[];
  const reviewRows=(accessReviews||[]) as any[];
  const contractRows=(contracts||[]) as any[];
  const techChangeRows=(techChanges||[]) as any[];
  const fundraisingRows=(fundraising||[]) as any[];

  const gamesAtRisk=gameRows.filter(g=>["red","paused"].includes(g.health_status)).length;
  const milestonesAtRisk=milestoneRows.filter(m=>["blocked","at_risk"].includes(m.status)).length;
  const releaseRisks=releaseRows.filter(r=>["blocked","delayed"].includes(r.status)||r.certification_status==="failed").length;
  const qualifiedContacts=crmRows.filter(x=>["mql","sql","opportunity","customer"].includes(x.lifecycle_stage)).length;
  const highRiskAprobaciones=approvalRows.filter(a=>["high","critical"].includes(a.risk_level)).length;
  const postedFinance=financeRows.filter(x=>x.status==="posted"||x.status==="reconciled");
  const financeNet=postedFinance.reduce((a,x)=>a+Number(x.amount_cents||0),0);
  const financeCurrency=postedFinance[0]?.currency||"USD";
  const financeNetLabel=new Intl.NumberFormat("en-US",{style:"currency",currency:financeCurrency}).format(financeNet/100);
  const blockedWork=workRows.filter(w=>w.status==="blocked"||w.priority==="critical").length;
  const openWork=workRows.filter(w=>!["completed","canceled"].includes(w.status)).length;
  const highRisks=riskRows.filter(r=>r.status!=="closed"&&Number(r.inherent_score)>=15).length;
  const securityIncidents=incidentRows.filter(i=>!["resolved","closed"].includes(i.status)).length;
  const criticalSecurity=incidentRows.filter(i=>!["resolved","closed"].includes(i.status)&&["high","critical"].includes(i.severity)).length;
  const betaPriority=communityRows.filter(m=>m.status==="active"&&(m.beta_priority||m.tier==="beta_priority")).length;
  const advocates=communityRows.filter(m=>m.status==="active"&&m.tier==="advocate").length;
  const now=Date.now();
  const overdueWork=workRows.filter(w=>w.due_date&&new Date(w.due_date).getTime()<now&&!["completed","canceled"].includes(w.status)).length;
  const overdueRisks=riskRows.filter(r=>r.due_date&&new Date(r.due_date).getTime()<now&&r.status!=="closed").length;
  const overdueReviews=reviewRows.filter(r=>r.due_date&&new Date(r.due_date).getTime()<now&&!["approved","revoked","expired"].includes(r.review_status)).length;
  const expiringContracts=contractRows.filter(c=>{
    if(!c.expiration_date||!["active","signature","review"].includes(c.status)) return false;
    const days=(new Date(c.expiration_date).getTime()-now)/86400000;
    return days>=0&&days<=60;
  }).length;
  const riskyTechChanges=techChangeRows.filter(c=>!["completed","rolled_back","canceled"].includes(c.status)&&["high","critical"].includes(c.risk_level)).length;
  const fundraisingDue=fundraisingRows.filter(f=>{
    const date=f.next_action_at||f.expected_close_date;
    return date&&new Date(date).getTime()<now&&!["won","lost","canceled"].includes(f.status);
  }).length;
  const overdueTotal=overdueWork+overdueRisks+overdueReviews+fundraisingDue;
  const criticalExceptions=gamesAtRisk+milestonesAtRisk+releaseRisks+highRiskAprobaciones+blockedWork+highRisks+criticalSecurity+riskyTechChanges;

  return <main className={`${styles.workspace} ${styles.commanderWorkspace}`}>
      <header className={styles.commandHero}>
        <div className={styles.commandHeroCopy}>
          <div className={styles.commandHeroKicker}><i className={styles.signalLive}></i>LIRYGAMES STUDIOS · COMMAND CENTER</div>
          <h1>Centro de mando</h1>
          <p>Lectura ejecutiva del ecosistema completo: jugadores, ingresos, producto, operación, seguridad y decisiones que requieren atención.</p>
        </div>
        <div className={styles.commandHeroSide}>
          <span>ESTADO DEL ECOSISTEMA</span>
          <strong>{criticalExceptions>0?"ATENCIÓN REQUERIDA":"OPERACIÓN ESTABLE"}</strong>
          <small>{criticalExceptions} excepciones críticas · {overdueTotal} seguimientos vencidos</small>
        </div>
      </header>

      <MasterCommanderLive initial={liveSnapshot}/>

      <section className={styles.commandSectionHead}>
        <div><span>ALERTAS EJECUTIVAS</span><h2>Lo que requiere atención</h2></div>
        <p>Las señales se alimentan de los módulos ya construidos. Un clic abre el área responsable para actuar.</p>
      </section>

      <section className={styles.commandAlertGrid}>
        <a href="/admin/master/games" className={gamesAtRisk+milestonesAtRisk?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>PRODUCTO</span><strong>{gamesAtRisk+milestonesAtRisk}</strong></div>
          <h3>Juegos e hitos</h3>
          <p>{gameRows.length} juegos registrados · {milestoneRows.length} hitos · {gamesAtRisk+milestonesAtRisk} excepciones.</p>
        </a>
        <a href="/admin/master/publishing" className={releaseRisks?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>PUBLICACIÓN</span><strong>{releaseRisks}</strong></div>
          <h3>Lanzamientos</h3>
          <p>{releaseRows.length} lanzamientos · {releaseRisks} con riesgo, retraso o certificación fallida.</p>
        </a>
        <a href="/admin/master/operations" className={blockedWork||overdueWork?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>OPERACIONES</span><strong>{blockedWork+overdueWork}</strong></div>
          <h3>Trabajo operativo</h3>
          <p>{openWork} abiertos · {blockedWork} bloqueados/críticos · {overdueWork} vencidos.</p>
        </a>
        <a href="/admin/master/security" className={criticalSecurity||overdueReviews?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>SEGURIDAD</span><strong>{criticalSecurity+overdueReviews}</strong></div>
          <h3>Incidentes y accesos</h3>
          <p>{securityIncidents} incidentes abiertos · {criticalSecurity} críticos · {overdueReviews} revisiones vencidas.</p>
        </a>
        <a href="/admin/master/risk" className={highRisks||overdueRisks?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>RIESGOS</span><strong>{highRisks+overdueRisks}</strong></div>
          <h3>Riesgos y controles</h3>
          <p>{highRisks} riesgos altos/críticos · {overdueRisks} seguimientos vencidos.</p>
        </a>
        <a href="/admin/master/automation" className={approvalRows.length?styles.commandAlertCritical:styles.commandAlertStable}>
          <div><span>DECISIONES</span><strong>{approvalRows.length}</strong></div>
          <h3>Aprobaciones pendientes</h3>
          <p>{approvalRows.length} pendientes · {highRiskAprobaciones} de riesgo alto o crítico.</p>
        </a>
      </section>

      <section className={styles.commandSectionHead}>
        <div><span>PULSO DEL ESTUDIO</span><h2>Situación ejecutiva</h2></div>
        <p>Indicadores complementarios de crecimiento, comunidad, finanzas, legal, tecnología y capital.</p>
      </section>

      <section className={styles.commandPulseGrid}>
        <a href="/admin/master/growth"><span>CRECIMIENTO</span><strong>{qualifiedContacts}</strong><small>contactos cualificados</small></a>
        <a href="/admin/master/community"><span>COMUNIDAD</span><strong>{communityRows.length}</strong><small>{betaPriority} prioridad beta · {advocates} promotores</small></a>
        <a href="/admin/master/finance"><span>FINANZAS</span><strong>{financeNetLabel}</strong><small>balance registrado</small></a>
        <a href="/admin/master/legal"><span>LEGAL</span><strong>{expiringContracts}</strong><small>contratos vencen en ≤60 días</small></a>
        <a href="/admin/master/technology"><span>TECNOLOGÍA</span><strong>{riskyTechChanges}</strong><small>cambios de riesgo alto/crítico</small></a>
        <a href="/admin/master/capital"><span>CAPITAL</span><strong>{fundraisingDue}</strong><small>seguimientos vencidos</small></a>
      </section>

      <section className={styles.commandFooterNote}>
        <div><strong>Áreas de gestión</strong><span>Operaciones, Juegos, Publicación, Negocio, Estudio y Control permanecen disponibles en el menú lateral como subáreas del Commander Center.</span></div>
        <a href="/admin/master/reports">Abrir reportes ejecutivos →</a>
      </section>

  </main>;
}
