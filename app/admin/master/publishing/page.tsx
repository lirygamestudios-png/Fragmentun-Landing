import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

export default async function MasterPublishingPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:storefronts},
    {data:releases},
    {data:games},
    {count:editions},
    {count:amazonClicks},
    {count:campaigns}
  ]=await Promise.all([
    supabase.from("publishing_storefronts").select("id,code,name,platform,region_scope,active,account_status,created_at").order("name",{ascending:true}),
    supabase.from("publishing_releases").select("id,game_id,storefront_id,sku,release_name,release_type,status,target_date,price_cents,currency,territories,certification_status,store_url,created_at").order("target_date",{ascending:true}),
    supabase.from("game_titles").select("id,name,ip_name,lifecycle_stage,health_status").order("name",{ascending:true}),
    supabase.from("book_editions").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("campaigns").select("*",{count:"exact",head:true})
  ]);

  const stores=(storefronts||[]) as any[];
  const releaseRows=(releases||[]) as any[];
  const gameRows=(games||[]) as any[];
  const gameById=new Map(gameRows.map(g=>[g.id,g]));
  const storeById=new Map(stores.map(s=>[s.id,s]));
  const live=releaseRows.filter(r=>r.status==="live");
  const open=releaseRows.filter(r=>!["live","canceled","sunset"].includes(r.status));
  const certRisk=releaseRows.filter(r=>r.certification_status==="failed"||r.status==="blocked"||r.status==="delayed");

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PUBLISHING</span><h1>Publishing</h1><p>Storefronts, releases, certificación y calendario comercial conectados a registros persistentes.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Storefronts</small><strong>{stores.length}</strong><span>Plataformas registradas</span></article>
      <article><small>Releases abiertas</small><strong>{open.length}</strong><span>Pipeline</span></article>
      <article><small>Live</small><strong>{live.length}</strong><span>Lanzamientos activos</span></article>
      <article><small>Riesgo cert/release</small><strong>{certRisk.length}</strong><span>Failed / blocked / delayed</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>PLATFORMS</span><h2>Storefronts</h2></div>
      <p>Registro real de cuentas/plataformas. Comienza vacío hasta configurar Steam, PlayStation, Xbox, Nintendo, Epic u otros canales reales.</p>
    </section>
    <section className={styles.grid}>
      {stores.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.active?styles.badgeActive:styles.badgePlanned}>{s.active?"ACTIVO":"INACTIVO"}</span><em>{s.account_status}</em></div>
        <h3>{s.name}</h3>
        <p>{s.platform}<br/>{(s.region_scope||[]).length?(s.region_scope||[]).join(" · "):"Regiones por definir"}</p>
      </article>)}
      {!stores.length&&<article className={styles.card}><h3>Storefront registry preparado</h3><p>La estructura ya existe; no se cargarán plataformas hasta que exista una cuenta o canal real que registrar.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>RELEASE PIPELINE</span><h2>Lanzamientos</h2></div>
      <p>Cada release queda vinculada a un juego y opcionalmente a un storefront, con estado, certificación, territorio, precio y fecha objetivo.</p>
    </section>
    <section className={styles.grid}>
      {releaseRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={r.status==="live"?styles.badgeActive:styles.badgePlanned}>{String(r.status).toUpperCase()}</span>
          <em>{r.certification_status}</em>
        </div>
        <h3>{r.release_name}</h3>
        <p>{gameById.get(r.game_id)?.name||"Juego"} · {storeById.get(r.storefront_id)?.name||"Sin storefront"}<br/>{r.target_date||"Sin fecha"} · {r.price_cents!=null?money(r.price_cents,r.currency||"USD"):"Precio por definir"}</p>
      </article>)}
      {!releaseRows.length&&<article className={styles.card}><h3>Sin releases cargadas</h3><p>El pipeline queda listo para demos, base game, DLC, expansiones, seasons, bundles y patches.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>COMMERCIAL SIGNALS</span><h2>Señales actuales</h2></div>
      <p>Publishing de videojuegos se incorpora sin perder las señales editoriales existentes.</p>
    </section>
    <section className={styles.kpis}>
      <article><small>Juegos registrados</small><strong>{gameRows.length}</strong><span>Fuente: game_titles</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo editorial</span></article>
      <article><small>Amazon clicks</small><strong>{(amazonClicks||0).toLocaleString()}</strong><span>Intento comercial</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Go-to-market</span></article>
    </section>
  </main>;
}
