import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {MasterReportsActions} from "../../../../components/MasterReportsActions";
import styles from "../master-admin.module.css";

function money(cents:number,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

export default async function MasterReportsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {count:leads},
    {count:community},
    {count:games},
    {count:openWork},
    {count:incidents},
    {data:finance},
    {data:fundraising},
    {data:risks}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("community_members").select("*",{count:"exact",head:true}).eq("status","active"),
    supabase.from("game_titles").select("*",{count:"exact",head:true}),
    supabase.from("ops_work_items").select("*",{count:"exact",head:true}).not("status","in","(completed,canceled)"),
    supabase.from("security_incidents").select("*",{count:"exact",head:true}).not("status","in","(resolved,closed)"),
    supabase.from("finance_transactions").select("amount_cents,currency,status").in("status",["posted","reconciled"]).limit(500),
    supabase.from("fundraising_opportunities").select("target_amount_cents,committed_amount_cents,currency,status,probability").limit(250),
    supabase.from("risk_register").select("status,inherent_score").limit(250)
  ]);

  const financeRows=(finance||[]) as any[];
  const financeNet=financeRows.reduce((a,x)=>a+Number(x.amount_cents||0),0);
  const financeCurrency=financeRows[0]?.currency||"USD";

  const fundraisingRows=(fundraising||[]) as any[];
  const openCapital=fundraisingRows.filter(x=>["open","on_hold"].includes(x.status));
  const pipeline=openCapital.reduce((a,x)=>a+Number(x.target_amount_cents||0),0);
  const committed=openCapital.reduce((a,x)=>a+Number(x.committed_amount_cents||0),0);
  const capitalCurrency=openCapital[0]?.currency||fundraisingRows[0]?.currency||"USD";

  const riskRows=(risks||[]) as any[];
  const highRisks=riskRows.filter(x=>x.status!=="closed"&&Number(x.inherent_score)>=15).length;

  const rows=[
    {label:"Contactos captados",value:leads||0},
    {label:"Miembros activos de comunidad",value:community||0},
    {label:"Juegos registrados",value:games||0},
    {label:"Trabajo abierto",value:openWork||0},
    {label:"Incidentes abiertos",value:incidents||0},
    {label:"Riesgos altos o críticos",value:highRisks},
    {label:"Balance financiero registrado",value:money(financeNet,financeCurrency)},
    {label:"Capital objetivo abierto",value:money(pipeline,capitalCurrency)},
    {label:"Capital comprometido",value:money(committed,capitalCurrency)}
  ];

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleReports}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · REPORTES</span>
        <h1>Reportes</h1>
        <p>Resumen ejecutivo del estudio para consulta, impresión, guardado en PDF y exportación.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">RP</span>
      <div className={styles.moduleStripCopy}><small>REPORTES EJECUTIVOS</small><strong>Indicadores, exportación y resumen</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Datos corporativos conectados</span>
        <span>Consulta protegida</span>
      </div>
    </section>

    <section className={styles.reportActions}>
      <div>
        <small className={styles.reportKicker}>REPORTE CONSOLIDADO</small>
        <strong>Reporte ejecutivo de LIRYGAMES</strong>
        <span>Vista actual de los principales indicadores corporativos, preparada para compartir o archivar.</span>
      </div>
      <MasterReportsActions rows={rows}/>
    </section>

    <section className={styles.kpis}>
      <article><small>Contactos captados</small><strong>{(leads||0).toLocaleString()}</strong><span>Base comercial</span></article>
      <article><small>Comunidad activa</small><strong>{(community||0).toLocaleString()}</strong><span>Miembros activos</span></article>
      <article><small>Trabajo abierto</small><strong>{(openWork||0).toLocaleString()}</strong><span>Operación pendiente</span></article>
      <article className={highRisks?styles.kpiAttention:undefined}><small>Riesgos altos</small><strong>{highRisks}</strong><span>{highRisks?"Requieren atención":"Sin alertas altas registradas"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>RESUMEN EJECUTIVO</span><h2>Indicadores del estudio</h2></div>
      <p>Los valores se toman de los registros actuales del Panel LIRYGAMES. No se generan cifras ficticias.</p>
    </section>

    <section className={styles.reportSheet}>
      <header>
        <div><span>LIRYGAMES STUDIOS</span><h2>Reporte Ejecutivo</h2></div>
        <small>Generado desde el Panel LIRYGAMES</small>
      </header>
      <div className={styles.reportTable}>
        {rows.map(row=><div key={row.label}><span>{row.label}</span><strong>{row.value}</strong></div>)}
      </div>
    </section>

    <section className={styles.sectionHead}>
      <div><span>REPORTES ESPECIALIZADOS</span><h2>Accesos directos</h2></div>
      <p>Los reportes especializados conservan sus propios datos y presentación.</p>
    </section>

    <section className={styles.grid}>
      <a className={styles.card} href="/admin/reportes">
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>FRAGMENTUN</em></div>
        <h3>Reporte FRAGMENTUN</h3>
        <p>Audiencia, conversión, comunidad y captación. Preparado para impresión o PDF.</p>
        <span className={styles.cardLink}>Abrir reporte →</span>
      </a>
      <a className={styles.card} href="/admin/master/finance">
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>FINANZAS</em></div>
        <h3>Detalle financiero</h3>
        <p>Ingresos, gastos, cuentas, movimientos, costes y margen.</p>
        <span className={styles.cardLink}>Abrir Finanzas →</span>
      </a>
      <a className={styles.card} href="/admin/master/growth">
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>CRECIMIENTO</em></div>
        <h3>Detalle comercial</h3>
        <p>Contactos, conversión, captación y seguimiento comercial.</p>
        <span className={styles.cardLink}>Abrir Crecimiento →</span>
      </a>
      <a className={styles.card} href="/admin/master/operations">
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>OPERACIONES</em></div>
        <h3>Detalle operativo</h3>
        <p>Trabajo abierto, decisiones, prioridades y continuidad operativa.</p>
        <span className={styles.cardLink}>Abrir Operaciones →</span>
      </a>
    </section>
  </main>;
}
