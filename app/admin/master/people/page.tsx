import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterPeoplePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:profiles},
    {count:activity}
  ]=await Promise.all([
    supabase.from("admin_profiles").select("display_name,role,created_at").order("created_at",{ascending:true}),
    supabase.from("admin_activity_log").select("*",{count:"exact",head:true})
  ]);

  const rows=(profiles||[]) as any[];
  const controls=[
    ["People Master","READINESS","HRIS corporativo aún no implementado"],
    ["Roles administrativos","ACTIVO",String(rows.length)+" perfiles provisionados"],
    ["Skills matrix","READINESS","Pendiente de registro estructurado"],
    ["Performance","READINESS","Ciclos y objetivos pendientes"],
    ["Compensation","READINESS","Bandas y compensación fuera del sistema por ahora"],
    ["Workforce plan","READINESS","Capacidad y headcount se añadirán como capa dedicada"],
    ["Activity trail","ACTIVO",String(activity||0)+" eventos administrativos"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PERSONAS</span><h1>Personas</h1><p>Roles, workforce readiness y organización del estudio.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Perfiles admin</small><strong>{rows.length}</strong><span>Provisionados</span></article>
      <article><small>Roles únicos</small><strong>{new Set(rows.map(r=>r.role)).size}</strong><span>RBAC actual</span></article>
      <article><small>Actividad admin</small><strong>{(activity||0).toLocaleString()}</strong><span>Eventos</span></article>
      <article><small>HRIS</small><strong>READINESS</strong><span>Próxima capa</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>PEOPLE OPS</span><h2>Estado organizacional</h2></div><p>Se muestra únicamente lo que ya existe; no se infiere headcount ni compensación.</p></section>
    <section className={styles.grid}>
      {controls.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>PEOPLE</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
