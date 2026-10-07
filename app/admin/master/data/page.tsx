import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterDataPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since=new Date(Date.now()-30*86400000).toISOString();
  const[
    {count:events},
    {count:pageViews},
    {count:leads},
    {count:amazonClicks},
    {data:recentEvents}
  ]=await Promise.all([
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since),
    supabase.from("analytics_events").select("event_name,source,medium,created_at").order("created_at",{ascending:false}).limit(20)
  ]);

  const conversion=(pageViews||0)>0?((leads||0)/(pageViews||1))*100:0;
  const amazonCtr=(pageViews||0)>0?((amazonClicks||0)/(pageViews||1))*100:0;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · DATOS</span><h1>Datos & Analytics</h1><p>Vista corporativa inicial sobre señales reales de FRAGMENTUN.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Eventos 30D</small><strong>{(events||0).toLocaleString()}</strong><span>analytics_events</span></article>
      <article><small>Page Views 30D</small><strong>{(pageViews||0).toLocaleString()}</strong><span>Tráfico medido</span></article>
      <article><small>Conversión Lead</small><strong>{conversion.toFixed(1)}%</strong><span>Leads / page views</span></article>
      <article><small>CTR Amazon</small><strong>{amazonCtr.toFixed(1)}%</strong><span>Amazon clicks / page views</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>SEÑALES RECIENTES</span><h2>Últimos eventos</h2></div><p>Esta vista reutiliza el pipeline actual; luego se ampliará al resto de IPs y juegos.</p></section>
    <section className={styles.grid}>
      {(recentEvents||[]).map((e:any,i:number)=><article key={i} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>REAL</span><em>{new Date(e.created_at).toLocaleString("es-US")}</em></div>
        <h3>{e.event_name}</h3>
        <p>{[e.source,e.medium].filter(Boolean).join(" · ")||"Directo / sin atribución"}</p>
      </article>)}
    </section>
  </main>;
}
