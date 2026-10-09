import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {INITIAL_WORLDS_PER_GAME} from "../../../../../lib/games/world-model";
import styles from "../../master-admin.module.css";

/** Read-only administrative checklist, never an approval button. */
export default async function GameReleaseReadinessPage(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const{data:profile,error:profileError}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(profileError||!profile)redirect("/admin/lirygames/login?unauthorized=1");
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
        return {number:i+1,valid:!!item&&item.access_type==="free"&&item.publication_status==="available"&&!!item.play_url?.startsWith("https://")};
      });
      return <article key={game.id} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>PUBLICACIÓN BLOQUEADA</span></div>
        <h3>{game.name}</h3>
        <p>Etapa de desarrollo: {game.lifecycle_stage}. La etapa no equivale a aprobación.</p>
        {configured.map(w=><p key={w.number}>Mundo {w.number}: {w.valid?"Configuración técnica aparente; falta autorización individual":"Pendiente de completar y verificar"} · acceso gratuito obligatorio</p>)}
        <p>Aprobación vinculada al videojuego: pendiente. Release Gate de producción: sin verificar.</p>
      </article>;
    })}
   </section>}
   <p><a href="/admin/master/releases">Consultar Release Gate →</a> · <a href="/admin/master/games/worlds">Configurar mundos internos →</a></p>
 </main>;
}
