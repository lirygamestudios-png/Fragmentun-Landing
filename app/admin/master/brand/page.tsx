import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterBrandPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:content},
    {count:media},
    {count:campaigns},
    {count:reviews},
    {count:shareClicks}
  ]=await Promise.all([
    supabase.from("localized_content").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("reviews").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click")
  ]);

  const areas=[
    ["Narrativa corporativa","READINESS","Message House corporativo pendiente de persistencia"],
    ["Contenido localizado","ACTIVO",String(content||0)+" bloques ES/EN"],
    ["Media library","ACTIVO",String(media||0)+" assets"],
    ["Campañas","ACTIVO",String(campaigns||0)+" campañas"],
    ["Reviews","ACTIVO",String(reviews||0)+" registros"],
    ["Shares","ACTIVO",String(shareClicks||0)+" eventos de compartir"],
    ["PR / Media Relations","READINESS","Pipeline de medios y press desk pendiente"],
    ["Reputation","READINESS","Issues log y crisis workflow pendientes"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · MARCA</span><h1>Marca & Comunicaciones</h1><p>Narrativa, contenido, campañas, reputación y activos de comunicación.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Contenido</small><strong>{(content||0).toLocaleString()}</strong><span>Bloques localizados</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Configuradas</span></article>
      <article><small>Shares</small><strong>{(shareClicks||0).toLocaleString()}</strong><span>Eventos acumulados</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>BRAND SYSTEM</span><h2>Estado de comunicación</h2></div></section>
    <section className={styles.grid}>
      {areas.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>BRAND</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
