import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {INITIAL_WORLDS_PER_GAME,PORTFOLIO_GAME_LIMIT} from "../../../../../lib/games/world-model";
import styles from "../../master-admin.module.css";

export default async function InternalGameWorldsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile,error:profileError}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(profileError||!profile)redirect("/admin/lirygames/login?unauthorized=1");

  const{data:games,error}=await supabase.from("game_titles")
    .select("id,name,lifecycle_stage").order("created_at",{ascending:true}).limit(PORTFOLIO_GAME_LIMIT);
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
      <span>Estas tarjetas representan la estructura aprobada. Hasta conectar la base de datos de mundos y el ejecutable, ningún mundo se anuncia como jugable.</span>
    </div><code>MODELO A</code></section>
    <section className={styles.kpis}>
      <article><small>Videojuegos del portafolio</small><strong>{error?"NO DISPONIBLE":rows.length+" / "+PORTFOLIO_GAME_LIMIT}</strong><span>Incorporación progresiva</span></article>
      <article><small>Mundos previstos por juego</small><strong>{INITIAL_WORLDS_PER_GAME}</strong><span>Todos con entrada gratuita</span></article>
      <article><small>Monetización</small><strong>OPCIONAL</strong><span>Skins y artículos dentro del juego</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>PLAN DE MUNDOS</span><h2>Primeros tres mundos de cada juego</h2></div></section>
    <section className={styles.grid}>
      {error&&<article className={styles.card}><h3>Videojuegos no disponibles</h3><p>No se pudo consultar el portafolio. No se muestran juegos ficticios.</p></article>}
      {!error&&!rows.length&&<article className={styles.card}><h3>Primer videojuego pendiente</h3><p>Registra el primer videojuego en el módulo Videojuegos antes de conectar sus mundos internos.</p></article>}
      {!error&&rows.flatMap(game=>Array.from({length:INITIAL_WORLDS_PER_GAME},(_,index)=>
        <article key={game.id+"-"+index} className={styles.card}>
          <div className={styles.cardTop}><span className={styles.badgePlanned}>PLANIFICADO</span><em>ACCESO GRATIS</em></div>
          <h3>{game.name} · Mundo {index+1}</h3>
          <p>Etapa del videojuego: {game.lifecycle_stage}. Mundo interno {index+1} de {INITIAL_WORLDS_PER_GAME}. Compras virtuales opcionales; sin enlace jugable publicado.</p>
        </article>))}
    </section>
  </main>;
}
