import {redirect} from "next/navigation";
import {revalidatePath} from "next/cache";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";
import {MasterActionForm} from "../../../../../components/MasterActionForm";
import {MasterSubmitButton} from "../../../../../components/MasterSubmitButton";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {INITIAL_WORLDS_PER_GAME,PORTFOLIO_GAME_LIMIT} from "../../../../../lib/games/world-model";
import styles from "../../master-admin.module.css";

async function saveInternalWorld(formData:FormData){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase)))throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role))throw new Error("forbidden");
  const gameId=String(formData.get("game_id")||"").trim();
  const number=Number(formData.get("world_number"));
  const title=String(formData.get("title")||"").trim();
  const summary=String(formData.get("summary")||"").trim()||null;
  const artworkUrl=String(formData.get("artwork_url")||"").trim()||null;
  const playUrl=String(formData.get("play_url")||"").trim()||null;
  const status=String(formData.get("publication_status")||"planned");
  if(!gameId||!Number.isInteger(number)||number<1||number>INITIAL_WORLDS_PER_GAME||!title||title.length>160||(summary&&summary.length>2000)||!["planned","beta","available","retired"].includes(status))throw new Error("invalid_world");
  for(const url of [artworkUrl,playUrl])if(url){try{const parsed=new URL(url);if(parsed.protocol!=="https:")throw new Error("invalid_url");}catch{throw new Error("invalid_url");}}
  // No autorizar publicación ni acceso beta hasta conectar pruebas de ejecutable y Release Gate.
  if(status!=="planned"&&status!=="retired")throw new Error("publication_requires_release_gate");
  const{data:game,error:gameError}=await supabase.from("game_titles").select("id").eq("id",gameId).maybeSingle();
  if(gameError||!game)throw new Error("game_not_found");
  const{error}=await supabase.from("game_internal_worlds").upsert({
    game_id:gameId,world_number:number,title,summary,artwork_url:artworkUrl,play_url:playUrl,
    publication_status:status,access_type:"free",beta_enabled:false,updated_at:new Date().toISOString()
  },{onConflict:"game_id,world_number"});
  if(error)throw new Error(error.message);
  revalidatePath("/admin/master/games/worlds");
}

export default async function InternalGameWorldsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile,error:profileError}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(profileError||!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const{data:games,error}=await supabase.from("game_titles")
    .select("id,name,lifecycle_stage").order("created_at",{ascending:true}).limit(PORTFOLIO_GAME_LIMIT);
  const{data:worlds,error:worldsError}=await supabase.from("game_internal_worlds")
    .select("game_id,world_number,title,summary,publication_status,artwork_url,play_url").order("world_number",{ascending:true});
  const worldRows=worlds||[];
  const worldsSchemaReady=!worldsError;
  const rows=games||[];
  return <main className={`${styles.workspace} ${styles.modulePage}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · VIDEOJUEGOS</span><h1>Mundos internos</h1>
        <p>Modelo A: tres mundos jugables gratis por videojuego y compras opcionales de artículos. Un mundo interno no es otro videojuego.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master/games">← Videojuegos</a>
    </header>
    <section className={styles.notice}><div>
      <strong>Plan de lanzamiento, no publicación activa</strong>
      <span>Los formularios solo permiten planificar o retirar mundos. La activación jugable y beta requiere pruebas y autorización posterior.</span>
    </div><code>MODELO A</code></section>
    {!worldsSchemaReady&&<section className={styles.notice}><div><strong>Persistencia pendiente</strong><span>La tabla de mundos internos todavía no está disponible o no es accesible. El formulario permanecerá oculto hasta validar la migración y sus permisos.</span></div><code>NO DISPONIBLE</code></section>}
    <section className={styles.kpis}>
      <article><small>Videojuegos del portafolio</small><strong>{error?"NO DISPONIBLE":rows.length+" / "+PORTFOLIO_GAME_LIMIT}</strong><span>Incorporación progresiva</span></article>
      <article><small>Mundos previstos por juego</small><strong>{INITIAL_WORLDS_PER_GAME}</strong><span>Todos con entrada gratuita</span></article>
      <article><small>Monetización</small><strong>OPCIONAL</strong><span>Skins y artículos dentro del juego</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>PLAN DE MUNDOS</span><h2>Primeros tres mundos de cada juego</h2></div></section>
    {worldsSchemaReady&&["admin","editor"].includes(profile.role)&&rows.length>0&&<details className={styles.advancedPanel}>
      <summary>Opciones avanzadas · Configurar mundo interno</summary>
      <p className={styles.advancedHint}>Acceso gratuito obligatorio. Este formulario no publica videojuegos y únicamente registra planes o retira mundos.</p>
      <MasterActionForm action={saveInternalWorld} className={styles.adminForm} successText="Configuración del mundo guardada.">
        <div className={styles.formGrid}>
          <label>Videojuego<select name="game_id" required defaultValue=""><option value="" disabled>Seleccionar videojuego</option>{rows.map(g=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label>Mundo interno<select name="world_number" required defaultValue="1"><option value="1">Mundo 1</option><option value="2">Mundo 2</option><option value="3">Mundo 3</option></select></label>
          <label>Nombre<input name="title" required maxLength={160}/></label>
          <label>Estado<select name="publication_status" defaultValue="planned"><option value="planned">Planificado</option><option value="retired">Retirado</option></select></label>
          <label>Imagen HTTPS<input name="artwork_url" type="url" placeholder="https://..." /></label>
          <label>Enlace del juego HTTPS<input name="play_url" type="url" placeholder="https://..." /></label>
          <label className={styles.span2}>Descripción<textarea name="summary" rows={3} maxLength={2000}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton}>Guardar configuración</MasterSubmitButton>
      </MasterActionForm>
    </details>}
    <section className={styles.grid}>
      {error&&<article className={styles.card}><h3>Videojuegos no disponibles</h3><p>No se pudo consultar el portafolio. No se muestran juegos ficticios.</p></article>}
      {!error&&!rows.length&&<article className={styles.card}><h3>Primer videojuego pendiente</h3><p>Registra el primer videojuego en el módulo Videojuegos antes de conectar sus mundos internos.</p></article>}
      {!error&&rows.flatMap(game=>Array.from({length:INITIAL_WORLDS_PER_GAME},(_,index)=>
        <article key={game.id+"-"+index} className={styles.card}>
          <div className={styles.cardTop}><span className={styles.badgePlanned}>PLANIFICADO</span><em>ACCESO GRATIS</em></div>
          <h3>{worldRows.find(w=>w.game_id===game.id&&w.world_number===index+1)?.title||game.name+" · Mundo "+(index+1)}</h3>
          <p>{worldRows.find(w=>w.game_id===game.id&&w.world_number===index+1)?.summary||"Mundo pendiente de configuración."} Etapa del videojuego: {game.lifecycle_stage}. Acceso gratuito y compras opcionales; el juego no se anuncia como disponible.</p>
        </article>))}
    </section>
  </main>;
}
