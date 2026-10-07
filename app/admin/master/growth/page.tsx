import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterGrowthPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since30=new Date(Date.now()-30*86400000).toISOString();
  const[
    {count:views},
    {count:leads},
    {count:amazonClicks},
    {count:shareClicks},
    {count:campaigns},
    {data:recentLeads}
  ]=await Promise.all([
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since30),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click").gte("created_at",since30),
    supabase.from("campaigns").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("leads").select("name,email,locale,source,medium,campaign,created_at").order("created_at",{ascending:false}).limit(12)
  ]);

  const leadRate=(views||0)>0?((leads||0)/(views||1))*100:0;
  const amazonCtr=(views||0)>0?((amazonClicks||0)/(views||1))*100:0;
  const shareRate=(views||0)>0?((shareClicks||0)/(views||1))*100:0;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · GROWTH</span><h1>Growth & CRM</h1><p>Adquisición, conversión y captación conectadas al embudo real de FRAGMENTUN.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Visitas 30D</small><strong>{(views||0).toLocaleString()}</strong><span>Top of funnel</span></article>
      <article><small>Leads 30D</small><strong>{(leads||0).toLocaleString()}</strong><span>{leadRate.toFixed(1)}% conversión</span></article>
      <article><small>Paso a Amazon</small><strong>{amazonCtr.toFixed(1)}%</strong><span>{(amazonClicks||0).toLocaleString()} clicks</span></article>
      <article><small>Compartidos</small><strong>{shareRate.toFixed(1)}%</strong><span>{(shareClicks||0).toLocaleString()} share clicks</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>PIPELINE</span><h2>Captación reciente</h2></div>
      <p>{(campaigns||0).toLocaleString()} campañas activas. El siguiente nivel añadirá lifecycle, scoring y automatizaciones.</p>
    </section>

    <section className={styles.grid}>
      {(recentLeads||[]).map((lead:any,i:number)=><article key={i} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>LEAD</span><em>{lead.locale||"—"}</em></div>
        <h3>{lead.name||lead.email}</h3>
        <p>{[lead.source,lead.medium,lead.campaign].filter(Boolean).join(" · ")||"Directo / sin atribución"}<br/>{new Date(lead.created_at).toLocaleString("es-US")}</p>
      </article>)}
      {!(recentLeads||[]).length&&<article className={styles.card}><h3>Sin leads recientes</h3><p>El módulo quedará activo cuando entren nuevos registros.</p></article>}
    </section>
  </main>;
}
