import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

function accountStatusLabel(value:string){
  const map:Record<string,string>={not_configured:"SIN CONFIGURAR",configured:"CONFIGURADA",verified:"VERIFICADA",restricted:"RESTRINGIDA",suspended:"SUSPENDIDA"};
  return map[value]||String(value||"").toUpperCase();
}

function releaseStatusLabel(value:string){
  const map:Record<string,string>={planned:"PLANIFICADO",preparing:"PREPARANDO",submitted:"ENVIADO",certification:"EN CERTIFICACIÓN",approved:"APROBADO",scheduled:"PROGRAMADO",live:"PUBLICADO",delayed:"RETRASADO",blocked:"BLOQUEADO",canceled:"CANCELADO",sunset:"RETIRADO"};
  return map[value]||String(value||"").toUpperCase();
}

function certificationLabel(value:string){
  const map:Record<string,string>={not_started:"NO INICIADA",in_progress:"EN CURSO",passed:"APROBADA",failed:"FALLIDA",waived:"NO REQUERIDA"};
  return map[value]||String(value||"").toUpperCase();
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

async function createPlataforma(formData:FormData){
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


async function updatePlataforma(formData:FormData){
  "use server";
  const {supabase}=await requirePublishingEditor();
  const id=String(formData.get("storefront_id")||"").trim();
  const accountStatus=String(formData.get("account_status")||"not_configured");
  const active=String(formData.get("active")||"true")==="true";
  const regions=String(formData.get("region_scope")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const allowedStatus=new Set(["not_configured","configured","verified","restricted","suspended"]);
  if(!id||!allowedStatus.has(accountStatus)) throw new Error("invalid_storefront_update");
  const{error}=await supabase.from("publishing_storefronts").update({
    account_status:accountStatus,active,region_scope:regions,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/publishing");
}

async function updateRelease(formData:FormData){
  "use server";
  const {supabase}=await requirePublishingEditor();
  const id=String(formData.get("release_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const certification=String(formData.get("certification_status")||"not_started");
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const priceRaw=String(formData.get("price")||"").trim();
  const priceCents=priceRaw?Math.round(Number(priceRaw)*100):null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const territories=String(formData.get("territories")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const storeUrl=String(formData.get("store_url")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","preparing","submitted","certification","approved","scheduled","live","delayed","blocked","canceled","sunset"]);
  const allowedCertification=new Set(["not_started","in_progress","passed","failed","waived"]);
  if(!id||!allowedStatus.has(status)||!allowedCertification.has(certification)|| (priceCents!==null&&(!Number.isFinite(priceCents)||priceCents<0))) throw new Error("invalid_release_update");
  const patch:any={
    status,certification_status:certification,target_date:targetDate,price_cents:priceCents,currency,
    territories,store_url:storeUrl,notes,updated_at:new Date().toISOString()
  };
  if(status==="live") patch.actual_release_at=new Date().toISOString();
  const{error}=await supabase.from("publishing_releases").update(patch).eq("id",id);
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
      <div><span className={styles.eyebrow}>LIRYGAMES · PUBLICACIÓN</span><h1>Publicación</h1><p>Plataformas, lanzamientos, certificación y calendario comercial.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Plataformas</small><strong>{stores.length}</strong><span>Plataformas registradas</span></article>
      <article><small>Lanzamientos abiertos</small><strong>{open.length}</strong><span>En preparación</span></article>
      <article><small>Publicados</small><strong>{live.length}</strong><span>Lanzamientos activos</span></article>
      <article><small>Riesgos</small><strong>{certRisk.length}</strong><span>Fallidos, bloqueados o retrasados</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>PLATAFORMAS</span><h2>Plataformas</h2></div>
      <p>Cuentas y canales reales como Steam, PlayStation, Xbox, Nintendo, Epic u otros.</p>
    </section>
    <section className={styles.grid}>
      {stores.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.active?styles.badgeActive:styles.badgePlanned}>{s.active?"ACTIVO":"INACTIVO"}</span><em>{accountStatusLabel(s.account_status)}</em></div>
        <h3>{s.name}</h3>
        <p>{s.platform}<br/>{(s.region_scope||[]).length?(s.region_scope||[]).join(" · "):"Regiones por definir"}</p>
      </article>)}
      {!stores.length&&<article className={styles.card}><h3>Registro de plataformas preparado</h3><p>El sistema está listo para registrar una plataforma cuando exista una cuenta o canal real.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>LANZAMIENTOS</span><h2>Lanzamientos</h2></div>
      <p>Cada lanzamiento queda vinculado a un juego y, cuando aplique, a una plataforma, con estado, certificación, territorios, precio y fecha objetivo.</p>
    </section>
    <section className={styles.grid}>
      {releaseRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={r.status==="live"?styles.badgeActive:styles.badgePlanned}>{releaseStatusLabel(r.status)}</span>
          <em>{certificationLabel(r.certification_status)}</em>
        </div>
        <h3>{r.release_name}</h3>
        <p>{gameById.get(r.game_id)?.name||"Juego"} · {storeById.get(r.storefront_id)?.name||"Sin plataforma"}<br/>{r.target_date||"Sin fecha"} · {r.price_cents!=null?money(r.price_cents,r.currency||"USD"):"Precio por definir"}</p>
      </article>)}
      {!releaseRows.length&&<article className={styles.card}><h3>Sin lanzamientos cargados</h3><p>El sistema está listo para demos, juego base, DLC, expansiones, temporadas, paquetes y actualizaciones.</p></article>}
    </section>


    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar plataformas y lanzamientos manualmente.</p>
      <section className={styles.adminForms}>
      <form action={createPlataforma} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA PLATAFORMA</span><h2>Registrar plataforma</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Steam"/></label>
          <label>Código<input name="code" required placeholder="steam"/></label>
          <label>Plataforma<input name="platform" required placeholder="PC"/></label>
          <label>Regiones<input name="region_scope" placeholder="US, LATAM, EU"/></label>
          <label>Estado de cuenta<select name="account_status" defaultValue="not_configured">
            <option value="not_configured">Sin configurar</option>
            <option value="configured">Configurada</option>
            <option value="verified">Verificada</option>
            <option value="restricted">Restringida</option>
            <option value="suspended">Suspendida</option>
          </select></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar plataforma</MasterSubmitButton>
      </form>

      <form action={createRelease} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO LANZAMIENTO</span><h2>Registrar lanzamiento</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue="">
            <option value="" disabled>Seleccionar juego</option>
            {gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select></label>
          <label>Plataforma<select name="storefront_id" defaultValue="">
            <option value="">Sin plataforma</option>
            {stores.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}
          </select></label>
          <label>Nombre<input name="release_name" required placeholder="Lanzamiento PC"/></label>
          <label>SKU<input name="sku" placeholder="FRG-PC-BASE"/></label>
          <label>Tipo<select name="release_type" defaultValue="base_game">
            <option value="base_game">Juego base</option><option value="demo">Demo</option>
            <option value="prologue">Prólogo</option><option value="dlc">DLC</option>
            <option value="expansion">Expansión</option><option value="season">Temporada</option>
            <option value="bundle">Paquete</option><option value="patch">Actualización</option><option value="other">Otro</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label>Precio<input type="number" name="price" min="0" step="0.01" placeholder="29.99"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Territorios<input name="territories" placeholder="US, LATAM, EU"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!gameRows.length}>Registrar lanzamiento</MasterSubmitButton>
      </form>
      </section>

      <section className={styles.adminForms}>
      <form action={updatePlataforma} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR PLATAFORMA</span><h2>Actualizar plataforma</h2></div>
        <div className={styles.formGrid}>
          <label>Plataforma<select name="storefront_id" required defaultValue=""><option value="" disabled>Seleccionar plataforma</option>{stores.map((s:any)=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
          <label>Estado cuenta<select name="account_status" defaultValue="configured"><option value="not_configured">Sin configurar</option><option value="configured">Configurada</option><option value="verified">Verificada</option><option value="restricted">Restringida</option><option value="suspended">Suspendida</option></select></label>
          <label>Activo<select name="active" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
          <label className={styles.span2}>Regiones<input name="region_scope" placeholder="US, LATAM, EU"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!stores.length}>Actualizar plataforma</MasterSubmitButton>
      </form>

      <form action={updateRelease} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR LANZAMIENTO</span><h2>Actualizar lanzamiento</h2></div>
        <div className={styles.formGrid}>
          <label>Lanzamiento<select name="release_id" required defaultValue=""><option value="" disabled>Seleccionar lanzamiento</option>{releaseRows.map((r:any)=><option key={r.id} value={r.id}>{r.release_name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="preparing"><option value="planned">Planificado</option><option value="preparing">Preparando</option><option value="submitted">Enviado</option><option value="certification">En certificación</option><option value="approved">Aprobado</option><option value="scheduled">Programado</option><option value="live">Publicados</option><option value="delayed">Retrasado</option><option value="blocked">Bloqueado</option><option value="canceled">Cancelado</option><option value="sunset">Retirado</option></select></label>
          <label>Certificación<select name="certification_status" defaultValue="not_started"><option value="not_started">No iniciada</option><option value="in_progress">En curso</option><option value="passed">Aprobada</option><option value="failed">Fallida</option><option value="waived">No requerida</option></select></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label>Precio<input type="number" min="0" step="0.01" name="price"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Territorios<input name="territories" placeholder="US, LATAM, EU"/></label>
          <label className={styles.span2}>Enlace de la tienda<input name="store_url"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!releaseRows.length}>Actualizar lanzamiento</MasterSubmitButton>
      </form>
      </section>
    </details>}

    <section className={styles.sectionHead}>
      <div><span>SEÑALES COMERCIALES</span><h2>Señales actuales</h2></div>
      <p>La publicación de videojuegos se conecta con las señales comerciales y editoriales existentes.</p>
    </section>
    <section className={styles.kpis}>
      <article><small>Juegos registrados</small><strong>{gameRows.length}</strong><span>Juegos del estudio</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo editorial</span></article>
      <article><small>Clics en Amazon</small><strong>{(amazonClicks||0).toLocaleString()}</strong><span>Intento comercial</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Campañas activas</span></article>
    </section>
  </main>;
}
