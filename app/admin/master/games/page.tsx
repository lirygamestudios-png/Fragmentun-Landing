import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

function stageLabel(stage:string){
  const map:Record<string,string>={
    concept:"Concept",
    pre_production:"Pre-Production",
    vertical_slice:"Vertical Slice",
    production:"Production",
    alpha:"Alpha",
    beta:"Beta",
    release_candidate:"Release Candidate",
    launch:"Launch",
    liveops:"LiveOps",
    sunset:"Sunset"
  };
  return map[stage]||stage;
}

export default async function MasterGamesPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:games},
    {data:milestones},
    {count:books},
    {count:characters},
    {count:media}
  ]=await Promise.all([
    supabase.from("game_titles").select("id,slug,name,ip_name,platform_scope,lifecycle_stage,health_status,target_release_date,budget_cents,currency,summary,created_at").order("created_at",{ascending:true}),
    supabase.from("game_milestones").select("id,game_id,name,milestone_type,status,target_date,progress_percent,exit_criteria,notes,created_at").order("target_date",{ascending:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true})
  ]);

  const gameRows=(games||[]) as any[];
  const milestoneRows=(milestones||[]) as any[];
  const activeMilestones=milestoneRows.filter(m=>!["completed","canceled"].includes(m.status));
  const blocked=milestoneRows.filter(m=>m.status==="blocked"||m.status==="at_risk");
  const redGames=gameRows.filter(g=>g.health_status==="red"||g.health_status==="paused");

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · JUEGOS</span><h1>Juegos & Operaciones</h1><p>Registro operativo real de títulos, milestones y salud de producción.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Títulos</small><strong>{gameRows.length}</strong><span>game_titles</span></article>
      <article><small>Milestones abiertos</small><strong>{activeMilestones.length}</strong><span>Producción activa</span></article>
      <article><small>En riesgo/bloqueados</small><strong>{blocked.length}</strong><span>Excepciones</span></article>
      <article><small>Salud crítica</small><strong>{redGames.length}</strong><span>Red/paused</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>GAME PORTFOLIO</span><h2>Registro de títulos</h2></div>
      <p>Esta vista ya consume las nuevas tablas persistentes del estudio. No se crean títulos ficticios: el registro comienza vacío hasta cargar cada proyecto real.</p>
    </section>

    <section className={styles.grid}>
      {gameRows.map((g:any)=><article key={g.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={g.health_status==="green"?styles.badgeActive:styles.badgePlanned}>{String(g.health_status).toUpperCase()}</span>
          <em>{stageLabel(g.lifecycle_stage)}</em>
        </div>
        <h3>{g.name}</h3>
        <p>{g.ip_name||"IP sin asignar"}<br/>{(g.platform_scope||[]).length?(g.platform_scope||[]).join(" · "):"Plataformas por definir"}<br/>{g.target_release_date?"Target: "+g.target_release_date:"Sin fecha objetivo"}</p>
      </article>)}
      {!gameRows.length&&<article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>LISTO</span><em>GAME REGISTRY</em></div>
        <h3>Registro preparado</h3>
        <p>La base de datos ya está lista para registrar los videojuegos reales de LIRYGAMES STUDIOS con etapa, salud, plataformas, presupuesto y release target.</p>
      </article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>MILESTONES</span><h2>Control de producción</h2></div>
      <p>Milestones conectados por título con progreso, owner, fecha objetivo, exit criteria y estado.</p>
    </section>

    <section className={styles.grid}>
      {milestoneRows.map((m:any)=><article key={m.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={m.status==="completed"?styles.badgeActive:styles.badgePlanned}>{String(m.status).toUpperCase()}</span>
          <em>{m.progress_percent}%</em>
        </div>
        <h3>{m.name}</h3>
        <p>{m.milestone_type} · {m.target_date||"Sin fecha"}<br/>{m.exit_criteria||"Exit criteria pendiente"}</p>
      </article>)}
      {!milestoneRows.length&&<article className={styles.card}><h3>Sin milestones cargados</h3><p>Cuando registremos cada juego, aquí controlaremos Vertical Slice, Alpha, Beta, RC, Launch y LiveOps.</p></article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>IP SOURCE</span><h2>Activos ya disponibles</h2></div>
      <p>El sistema conecta el futuro portfolio de juegos con el contenido editorial y multimedia existente.</p>
    </section>
    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>IP base</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Worldbuilding</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets registrados</span></article>
      <article><small>RLS</small><strong>ACTIVO</strong><span>Acceso administrativo</span></article>
    </section>
  </main>;
}
