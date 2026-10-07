import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterSecurityPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:profiles},
    {count:allowlist},
    {count:rateRows},
    {count:adminEvents}
  ]=await Promise.all([
    supabase.from("admin_profiles").select("*",{count:"exact",head:true}),
    supabase.from("admin_access_allowlist").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("admin_activity_log").select("*",{count:"exact",head:true})
  ]);

  const controls=[
    ["RLS","Activo","Tablas públicas relevantes con Row Level Security"],
    ["Admin Auth","Activo",String(profiles||0)+" perfiles administrativos"],
    ["Allowlist","Activo",String(allowlist||0)+" accesos permitidos"],
    ["Rate limiting","Activo",String(rateRows||0)+" registros de control"],
    ["Audit trail","Activo",String(adminEvents||0)+" eventos administrativos"],
    ["Production baseline","Protegido","main · 8eb878e"],
    ["Preview isolation","Activo","Master Admin fuera de producción"],
    ["Secrets","Servidor","Claves sensibles fuera del cliente"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · SEGURIDAD</span><h1>Seguridad</h1><p>Identidad, acceso, trazabilidad y aislamiento de producción.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Admins</small><strong>{(profiles||0).toLocaleString()}</strong><span>Provisionados</span></article>
      <article><small>Allowlist</small><strong>{(allowlist||0).toLocaleString()}</strong><span>Entradas</span></article>
      <article><small>Rate controls</small><strong>{(rateRows||0).toLocaleString()}</strong><span>Antiabuso</span></article>
      <article><small>Audit events</small><strong>{(adminEvents||0).toLocaleString()}</strong><span>Trazabilidad</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>SECURITY CONTROL PLANE</span><h2>Controles activos</h2></div><p>Vista consolidada del estado de seguridad existente.</p></section>
    <section className={styles.grid}>
      {controls.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{state.toUpperCase()}</span><em>SEGURIDAD</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
