import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterTechnologyPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:events},
    {count:rateRows},
    {count:media},
    {count:profiles}
  ]=await Promise.all([
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("ingress_rate_limits").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("*",{count:"exact",head:true})
  ]);

  const stack=[
    ["Frontend","Next.js 15.5.27","Vercel"],
    ["Runtime","Node.js 24.x","Vercel Functions"],
    ["Database/Auth","Supabase","Postgres + Auth + Storage"],
    ["Source control","GitHub","Fragmentun-Landing"],
    ["Production branch","main","Protegida por baseline"],
    ["Master Admin branch","work/master-admin-implementation","Preview only"],
    ["Analytics","Supabase events",String(events||0)+" eventos"],
    ["Rate limiting","Database-backed",String(rateRows||0)+" ventanas registradas"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · TECNOLOGÍA</span><h1>Tecnología</h1><p>Infraestructura, stack, entornos y salud técnica del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Eventos</small><strong>{(events||0).toLocaleString()}</strong><span>Pipeline acumulado</span></article>
      <article><small>Rate windows</small><strong>{(rateRows||0).toLocaleString()}</strong><span>Protección antiabuso</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets registrados</span></article>
      <article><small>Admins</small><strong>{(profiles||0).toLocaleString()}</strong><span>Perfiles provisionados</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>TECH STACK</span><h2>Arquitectura actual</h2></div><p>Vista técnica inicial del entorno ya desplegado.</p></section>
    <section className={styles.grid}>
      {stack.map(([name,value,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>TECH</em></div>
        <h3>{name}</h3><p><strong>{value}</strong><br/>{detail}</p>
      </article>)}
    </section>
  </main>;
}
