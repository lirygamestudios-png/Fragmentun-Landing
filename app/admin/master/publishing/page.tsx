import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterPublishingPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:editions},
    {count:amazonClicks},
    {count:campaigns},
    {data:books}
  ]=await Promise.all([
    supabase.from("book_editions").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("books").select("title_es,status,amazon_url_es").order("sort_order",{ascending:true})
  ]);

  const items=[
    ["Game storefronts","READINESS","Steam/console/mobile store registry pendiente"],
    ["Release calendar","READINESS","Calendario maestro de lanzamientos pendiente"],
    ["Ratings & certification","READINESS","Registro por plataforma pendiente"],
    ["Pricing & promos","READINESS","Se conectará a monetización por SKU/plataforma"],
    ["Franchise roadmap","READINESS","Roadmap de IP por medio y territorio pendiente"],
    ["Book editions","ACTIVO",String(editions||0)+" ediciones"],
    ["Amazon intent","ACTIVO",String(amazonClicks||0)+" clicks acumulados"],
    ["Campaigns","ACTIVO",String(campaigns||0)+" campañas"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PUBLISHING</span><h1>Publishing</h1><p>Distribución, lanzamientos, plataformas y operación de franquicia.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo editorial</span></article>
      <article><small>Amazon clicks</small><strong>{(amazonClicks||0).toLocaleString()}</strong><span>Intento comercial</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Go-to-market</span></article>
      <article><small>Game stores</small><strong>READINESS</strong><span>Próxima capa</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>PUBLISHING OPS</span><h2>Estado de preparación</h2></div></section>
    <section className={styles.grid}>
      {items.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>PUBLISHING</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
      {(books||[]).map((b:any)=><article key={b.title_es} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{String(b.status||"").toUpperCase()}</span><em>BOOK</em></div>
        <h3>{b.title_es}</h3><p>{b.amazon_url_es?"Amazon conectado":"Sin URL comercial"}</p>
      </article>)}
    </section>
  </main>;
}
