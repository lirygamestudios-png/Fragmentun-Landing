import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function actionLabel(value:string){
  const map:Record<string,string>={INSERT:"CREACIÓN",UPDATE:"ACTUALIZACIÓN",DELETE:"ELIMINACIÓN"};
  return map[value]||String(value||"").toUpperCase();
}
function resourceLabel(value:string){
  const map:Record<string,string>={
    admin_profiles:"Perfiles administrativos",
    admin_access_allowlist:"Lista de acceso",
    leads:"Contactos",
    books:"Libros",
    media_assets:"Recursos multimedia",
    characters:"Personajes",
    campaigns:"Campañas",
    ops_work_items:"Trabajo operativo",
    ops_decisions:"Decisiones",
    security_incidents:"Incidentes de seguridad",
    security_access_reviews:"Revisiones de acceso",
    finance_transactions:"Movimientos financieros",
    feature_flags:"Controles de activación",
    corporate_settings:"Configuración",
    release_gates:"Revisiones de publicación",
    release_gate_checks:"Comprobaciones de publicación"
  };
  return map[value]||String(value||"").replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

export default async function MasterAuditPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role,display_name")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||!["admin","editor"].includes(profile.role)) redirect("/admin/master");

  const[
    {data:events},
    {count:total},
    {data:actors}
  ]=await Promise.all([
    supabase.from("admin_audit_log")
      .select("id,user_id,action,table_name,record_id,created_at")
      .order("created_at",{ascending:false})
      .limit(100),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role")
  ]);

  const rows=(events||[]) as any[];
  const actorRows=(actors||[]) as any[];
  const actorName=(id:string|null|undefined)=>{
    const actor=actorRows.find(a=>a.user_id===id);
    return actor?((actor.display_name||actor.user_id)+" · "+actor.role):(id?"Usuario fuera del roster":"Sistema / trigger");
  };
  const tableCounts=rows.reduce((acc:Record<string,number>,row:any)=>{
    acc[row.table_name]=(acc[row.table_name]||0)+1;
    return acc;
  },{});
  const topTables=Object.entries(tableCounts).sort((a,b)=>b[1]-a[1]).slice(0,8);
  const inserts=rows.filter(r=>r.action==="INSERT").length;
  const updates=rows.filter(r=>r.action==="UPDATE").length;
  const deletes=rows.filter(r=>r.action==="DELETE").length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · AUDITORÍA</span>
        <h1>Auditoría</h1>
        <p>Cambios administrativos registrados automáticamente para mantener trazabilidad.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Eventos totales</small><strong>{(total||0).toLocaleString()}</strong><span>Historial administrativo</span></article>
      <article><small>Creaciones recientes</small><strong>{inserts}</strong><span>Últimos 100 eventos</span></article>
      <article><small>Actualizaciones recientes</small><strong>{updates}</strong><span>Últimos 100 eventos</span></article>
      <article><small>Eliminaciones recientes</small><strong>{deletes}</strong><span>Últimos 100 eventos</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>HISTORIAL</span><h2>Actividad reciente</h2></div>
      <p>Se muestran los datos básicos de cada cambio; el detalle sensible permanece fuera de esta vista resumida.</p>
    </section>

    <section className={styles.grid}>
      {rows.map((row:any)=><article key={row.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={row.action==="DELETE"?styles.badgePlanned:styles.badgeActive}>{actionLabel(row.action)}</span>
          <em>{new Date(row.created_at).toLocaleString("es-US")}</em>
        </div>
        <h3>{resourceLabel(row.table_name)}</h3>
        <p>Registro: {row.record_id||"—"}<br/>Responsable: {actorName(row.user_id)}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin eventos</h3><p>Los cambios futuros en registros maestros aparecerán automáticamente aquí.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>ACTIVIDAD</span><h2>Áreas con más cambios recientes</h2></div>
    </section>
    <section className={styles.grid}>
      {topTables.map(([name,count])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>AUDITADO</span><em>{count} eventos</em></div>
        <h3>{resourceLabel(name)}</h3><p>Presencia dentro de los últimos 100 cambios administrativos.</p>
      </article>)}
      {!topTables.length&&<article className={styles.card}><h3>Sin áreas destacadas</h3><p>La auditoría está activa y lista para registrar cambios.</p></article>}
    </section>

    <section className={styles.notice}>
      <div><strong>Cobertura</strong><span>El historial administrativo registra creaciones, actualizaciones y eliminaciones relevantes del ecosistema.</span></div>
      <code>Trazabilidad activa</code>
    </section>
  </main>;
}