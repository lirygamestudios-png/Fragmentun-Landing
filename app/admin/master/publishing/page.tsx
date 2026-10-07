import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}


async function requirePublishingEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createStorefront(formData:FormData){
  "use server";
  const {supabase,user}=await requirePublishingEditor();
  const name=String(formData.get("name")||"").trim();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const platform=String(formData.get("platform")||"").trim();
  const regions=String(formData.get("region_scope")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const accountStatus=String(formData.get("account_status")||"not_configured");
  const allowedStatus=new Set(["not_configured","configured","verified","restricted","suspended"]);
  if(!name||!code||!platform) throw new Error("storefront_required_fields");
  if(!allowedStatus.has(accountStatus)) throw new Error("invalid_account_status");
  const{error}=await supabase.from("publishing_storefronts").insert({
    name,code,platform,region_scope:regions,account_status:accountStatus,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/publishing");
}

async function createRelease(formData:FormData){
  "use server";
  const {supabase,user}=await requirePublishingEditor();
  const gameId=String(formData.get("game_id")||"").trim();
  const storefrontRaw=String(formData.get("storefront_id")||"").trim();
  const storefrontId=storefrontRaw||null;
  const releaseName=String(formData.get("release_name")||"").trim();
  const releaseType=String(formData.get("release_type")||"base_game");
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const sku=String(formData.get("sku")||"").trim()||null;
  const territories=String(formData.get("territories")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const priceRaw=String(formData.get("price")||"").trim();
  const priceCents=priceRaw?Math.round(Number(priceRaw)*100):null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  if(!gameId||!releaseName) throw new Error("release_required_fields");
  const allowedTypes=new Set(["base_game","demo","prologue","dlc","expansion","season","bundle","patch","other"]);
  if(!allowedTypes.has(releaseType)) throw new Error("invalid_release_type");
  if(priceCents!==null&&(!Number.isFinite(priceCents)||priceCents<0)) throw new Error("invalid_price");
  const{error}=await supabase.from("publishing_releases").insert({
    game_id:gameId,storefront_id:storefrontId,release_name:releaseName,release_type:releaseType,
    target_date:targetDate,sku,territories,price_cents:priceCents,currency,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/publishing");
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


    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createStorefront} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO STOREFRONT</span><h2>Registrar plataforma</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Steam"/></label>
          <label>Código<input name="code" required placeholder="steam"/></label>
          <label>Plataforma<input name="platform" required placeholder="PC"/></label>
          <label>Regiones<input name="region_scope" placeholder="US, LATAM, EU"/></label>
          <label>Estado de cuenta<select name="account_status" defaultValue="not_configured">
            <option value="not_configured">Not configured</option>
            <option value="configured">Configured</option>
            <option value="verified">Verified</option>
            <option value="restricted">Restricted</option>
            <option value="suspended">Suspended</option>
          </select></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar storefront</button>
      </form>

      <form action={createRelease} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO RELEASE</span><h2>Registrar lanzamiento</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue="">
            <option value="" disabled>Seleccionar juego</option>
            {gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select></label>
          <label>Storefront<select name="storefront_id" defaultValue="">
            <option value="">Sin storefront</option>
            {stores.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
          <label>Nombre<input name="release_name" required placeholder="Launch PC"/></label>
          <label>SKU<input name="sku" placeholder="FRG-PC-BASE"/></label>
          <label>Tipo<select name="release_type" defaultValue="base_game">
            <option value="base_game">Base Game</option><option value="demo">Demo</option>
            <option value="prologue">Prologue</option><option value="dlc">DLC</option>
            <option value="expansion">Expansion</option><option value="season">Season</option>
            <option value="bundle">Bundle</option><option value="patch">Patch</option><option value="other">Other</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label>Precio<input type="number" name="price" min="0" step="0.01" placeholder="29.99"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Territorios<input name="territories" placeholder="US, LATAM, EU"/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!gameRows.length}>Registrar release</button>
      </form>
    </section>}

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
