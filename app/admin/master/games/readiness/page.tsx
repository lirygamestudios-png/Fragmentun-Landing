import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {INITIAL_WORLDS_PER_GAME} from "../../../../../lib/games/world-model";
import styles from "../../master-admin.module.css";

function validGamePlayUrl(value:string|null|undefined){
 if(!value)return false;
 try{const url=new URL(value);return url.protocol==="https:"&&!!url.hostname&&!url.username&&!url.password;}catch{return false;}
}

/** Read-only administrative checklist, never an approval button. */
export default async function GameReleaseReadinessPage(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const{data:profile,error:profileError}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(profileError||!profile)redirect("/admin/lirygames/login?unauthorized=1");
 if(process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED!=="true"||!process.env.NEXT_PUBLIC_SUPABASE_URL||process.env.NEXT_PUBLIC_SUPABASE_URL.includes("pasoapugmsazziflaomp")){
  return <main className={`${styles.workspace} ${styles.modulePage}`}><header className={styles.topbar}><div><span className={styles.eyebrow}>LIRYGAMES · PREPARACIÓN</span><h1>Preparación por videojuego</h1></div></header><section className={styles.notice}><div><strong>Datos de LIRYGAMES no aislados</strong><span>La comprobación de los mundos internos permanece bloqueada hasta verificar el backend exclusivo de LIRYGAMES. No se consultan datos del entorno compartido con FRAGMENTUN.</span></div><code>NO VERIFICADO</code></section></main>;
 }
 const{data:games,error:gameError}=await supabase.from("game_titles").select("id,name,lifecycle_stage").order("created_at",{ascending:true}).limit(9);
 const{data:worlds,error:worldError}=await supabase.from("game_internal_worlds").select("game_id,world_number,access_type,publication_status,play_url").order("world_number",{ascending:true});
 const failed=!!gameError||!!worldError;
 return <main className={`${styles.workspace} ${styles.modulePage}`}>
   <header className={styles.topbar}><div><span className={styles.eyebrow}>CONTROL DE PUBLICACIÓN</span><h1>Preparación por videojuego</h1>
   <p>Verifica la situación real de cada título y sus tres mundos internos gratuitos. Esta pantalla no autoriza lanzamientos.</p></div>
   <a className={styles.publicSite} href="/admin/master/games">← Videojuegos</a></header>
   <section className={styles.notice}><div><strong>Autorización independiente pendiente</strong><span>El Release Gate actual no vincula aún su aprobación a un ID específico de videojuego. No se puede declarar ningún lanzamiento listo sin esa asociación y una revisión humana.</span></div><code>BLOQUEADO</code></section>
   {failed?<section className={styles.notice}><div><strong>Datos no disponibles</strong><span>La tabla de mundos internos no está migrada o alguna consulta falló. No se mostrarán comprobaciones positivas ficticias.</span></div><code>NO VERIFICADO</code></section>:
   <section className={styles.grid}>
    {!(games||[]).length&&<article className={styles.card}><h3>Sin videojuegos registrados</h3><p>Registra primero un título en el módulo Videojuegos.</p></article>}
    {(games||[]).map(game=>{
      const assigned=(worlds||[]).filter(w=>w.game_id===game.id);
      const configured=Array.from({length:INITIAL_WORLDS_PER_GAME},(_,i)=>{
        const item=assigned.find(w=>w.world_number===i+1);
        return {number:i+1,valid:!!item&&item.access_type==="free"&&item.publication_status==="available"&&validGamePlayUrl(item.play_url),detail:!item?"No registrado":item.access_type!=="free"?"Acceso gratuito por corregir":!validGamePlayUrl(item.play_url)?"Enlace HTTPS pendiente o inválido":item.publication_status!=="available"?"Configuración registrada; publicación aún no autorizada":"Configuración técnica aparente; falta autorización individual"};
      });
      const registeredWorlds=configured.filter(w=>w.detail!=="No registrado").length;
      const technicallyConfigured=configured.filter(w=>{const item=assigned.find(a=>a.world_number===w.number);return !!item&&item.access_type==="free"&&validGamePlayUrl(item.play_url);}).length;
      return <article key={game.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>PUBLICACIÓN BLOQUEADA</span></div>
        <h3>{game.name}</h3>
        <p>Identificador del videojuego: <code>{game.id}</code></p>
        <p>Etapa de desarrollo: {game.lifecycle_stage}. La etapa no equivale a aprobación.</p>
        <p>Mundos registrados: {registeredWorlds} de {INITIAL_WORLDS_PER_GAME} · Configuración técnica: {technicallyConfigured} de {INITIAL_WORLDS_PER_GAME}. La configuración no concede permiso de publicación.</p>
        {configured.map(w=><p key={w.number}>Mundo {w.number}: {w.detail} · acceso gratuito obligatorio</p>)}
        <p>Aprobación vinculada al videojuego: pendiente. Release Gate de producción: sin verificar.</p>
      </article>;
    })}
   </section>}
   <p><a href="/admin/master/releases">Consultar Release Gate →</a> · <a href="/admin/master/games/worlds">Configurar mundos internos →</a></p>
 </main>;
}
