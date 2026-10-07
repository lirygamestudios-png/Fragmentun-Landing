import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

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
    {count:total}
  ]=await Promise.all([
    supabase.from("admin_audit_log")
      .select("id,user_id,action,table_name,record_id,created_at")
      .order("created_at",{ascending:false})
      .limit(100),
    supabase.from("admin_audit_log").select("*",{count:"exact",head:true})
  ]);

  const rows=(events||[]) as any[];
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
        <span className={styles.eyebrow}>MASTER ADMIN · AUDITORÍA</span>
        <h1>Auditoría transversal</h1>
        <p>Cambios administrativos registrados automáticamente mediante triggers de base de datos.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Eventos totales</small><strong>{(total||0).toLocaleString()}</strong><span>admin_audit_log</span></article>
      <article><small>INSERT recientes</small><strong>{inserts}</strong><span>Últimos 100 eventos</span></article>
      <article><small>UPDATE recientes</small><strong>{updates}</strong><span>Últimos 100 eventos</span></article>
      <article><small>DELETE recientes</small><strong>{deletes}</strong><span>Últimos 100 eventos</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>CHANGE STREAM</span><h2>Actividad reciente</h2></div>
      <p>Se muestran metadatos del cambio. Los payloads old/new permanecen fuera de esta vista resumida.</p>
    </section>

    <section className={styles.grid}>
      {rows.map((row:any)=><article key={row.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={row.action==="DELETE"?styles.badgePlanned:styles.badgeActive}>{row.action}</span>
          <em>{new Date(row.created_at).toLocaleString("es-US")}</em>
        </div>
        <h3>{row.table_name}</h3>
        <p>Registro: {row.record_id||"—"}<br/>Actor: {row.user_id||"sistema / trigger"}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin eventos</h3><p>Los cambios futuros en registros maestros aparecerán automáticamente aquí.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>HOTSPOTS</span><h2>Tablas con más cambios recientes</h2></div>
    </section>
    <section className={styles.grid}>
      {topTables.map(([name,count])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>AUDITADO</span><em>{count} eventos</em></div>
        <h3>{name}</h3><p>Presencia dentro de los últimos 100 cambios administrativos.</p>
      </article>)}
      {!topTables.length&&<article className={styles.card}><h3>Sin hotspots</h3><p>La auditoría está activa y lista para registrar cambios.</p></article>}
    </section>

    <section className={styles.notice}>
      <div><strong>Cobertura</strong><span>37 tablas maestras del Master Admin con INSERT / UPDATE / DELETE auditados.</span></div>
      <code>admin_audit_log</code>
    </section>
  </main>;
}