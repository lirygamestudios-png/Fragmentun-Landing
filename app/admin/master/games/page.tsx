import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
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


async function requireGameEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user};
}

async function createGame(formData:FormData){
  "use server";
  const {supabase,user}=await requireGameEditor();
  const name=String(formData.get("name")||"").trim();
  const slug=String(formData.get("slug")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const ipName=String(formData.get("ip_name")||"").trim()||null;
  const stage=String(formData.get("lifecycle_stage")||"concept");
  const health=String(formData.get("health_status")||"green");
  const platforms=String(formData.get("platform_scope")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const summary=String(formData.get("summary")||"").trim()||null;
  const targetRelease=String(formData.get("target_release_date")||"").trim()||null;
  if(!name||!slug) throw new Error("name_and_slug_required");
  const allowedStages=new Set(["concept","pre_production","vertical_slice","production","alpha","beta","release_candidate","launch","liveops","sunset"]);
  const allowedHealth=new Set(["green","amber","red","paused"]);
  if(!allowedStages.has(stage)||!allowedHealth.has(health)) throw new Error("invalid_game_state");
  const{error}=await supabase.from("game_titles").insert({
    name,slug,ip_name:ipName,lifecycle_stage:stage,health_status:health,
    platform_scope:platforms,summary,target_release_date:targetRelease,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/games");
}

async function createMilestone(formData:FormData){
  "use server";
  const {supabase,user}=await requireGameEditor();
  const gameId=String(formData.get("game_id")||"").trim();
  const name=String(formData.get("name")||"").trim();
  const type=String(formData.get("milestone_type")||"production");
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const criteria=String(formData.get("exit_criteria")||"").trim()||null;
  if(!gameId||!name) throw new Error("game_and_name_required");
  const allowedTypes=new Set(["pre_production","vertical_slice","production","alpha","beta","release_candidate","launch","liveops","technical","publishing"]);
  if(!allowedTypes.has(type)) throw new Error("invalid_milestone_type");
  const{error}=await supabase.from("game_milestones").insert({
    game_id:gameId,name,milestone_type:type,target_date:targetDate,exit_criteria:criteria,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/games");
}


async function updateGame(formData:FormData){
  "use server";
  const {supabase}=await requireGameEditor();
  const id=String(formData.get("game_id")||"").trim();
  const stage=String(formData.get("lifecycle_stage")||"concept");
  const health=String(formData.get("health_status")||"green");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const targetRelease=String(formData.get("target_release_date")||"").trim()||null;
  const budgetRaw=String(formData.get("budget")||"").trim();
  const budgetCents=budgetRaw?Math.round(Number(budgetRaw)*100):null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const summary=String(formData.get("summary")||"").trim()||null;
  const allowedStages=new Set(["concept","pre_production","vertical_slice","production","alpha","beta","release_candidate","launch","liveops","sunset"]);
  const allowedHealth=new Set(["green","amber","red","paused"]);
  if(!id||!allowedStages.has(stage)||!allowedHealth.has(health)|| (budgetCents!==null&&(!Number.isFinite(budgetCents)||budgetCents<0))) throw new Error("invalid_game_update");
  const{error}=await supabase.from("game_titles").update({
    lifecycle_stage:stage,health_status:health,owner_user_id:ownerUserId,target_release_date:targetRelease,
    budget_cents:budgetCents,currency,summary,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/games");
}

async function updateMilestone(formData:FormData){
  "use server";
  const {supabase}=await requireGameEditor();
  const id=String(formData.get("milestone_id")||"").trim();
  const status=String(formData.get("status")||"planned");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const progress=Math.max(0,Math.min(100,Number(formData.get("progress_percent")||0)));
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const exitCriteria=String(formData.get("exit_criteria")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","in_progress","blocked","at_risk","completed","canceled"]);
  if(!id||!allowedStatus.has(status)||!Number.isFinite(progress)) throw new Error("invalid_milestone_update");
  const patch:any={
    status,owner_user_id:ownerUserId,progress_percent:Math.trunc(progress),target_date:targetDate,
    exit_criteria:exitCriteria,notes,updated_at:new Date().toISOString()
  };
  patch.completed_at=status==="completed"?new Date().toISOString():null;
  const{error}=await supabase.from("game_milestones").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/games");
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
    {count:media},
    {data:owners}
  ]=await Promise.all([
    supabase.from("game_titles").select("id,slug,name,ip_name,platform_scope,lifecycle_stage,health_status,owner_user_id,target_release_date,budget_cents,currency,summary,created_at").order("created_at",{ascending:true}),
    supabase.from("game_milestones").select("id,game_id,name,milestone_type,status,target_date,completed_at,owner_user_id,progress_percent,exit_criteria,notes,created_at").order("target_date",{ascending:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const gameRows=(games||[]) as any[];
  const milestoneRows=(milestones||[]) as any[];
  const activeMilestones=milestoneRows.filter(m=>!["completed","canceled"].includes(m.status));
  const blocked=milestoneRows.filter(m=>m.status==="blocked"||m.status==="at_risk");
  const redGames=gameRows.filter(g=>g.health_status==="red"||g.health_status==="paused");
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin owner";

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
        <p>{g.ip_name||"IP sin asignar"}<br/>Owner: {ownerName(g.owner_user_id)}<br/>{(g.platform_scope||[]).length?(g.platform_scope||[]).join(" · "):"Plataformas por definir"}<br/>{g.target_release_date?"Target: "+g.target_release_date:"Sin fecha objetivo"} · {g.budget_cents!=null?new Intl.NumberFormat("en-US",{style:"currency",currency:g.currency||"USD"}).format(Number(g.budget_cents)/100):"Presupuesto por definir"}</p>
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
        <p>{m.milestone_type} · {m.target_date||"Sin fecha"}<br/>Owner: {ownerName(m.owner_user_id)}<br/>{m.exit_criteria||"Exit criteria pendiente"}</p>
      </article>)}
      {!milestoneRows.length&&<article className={styles.card}><h3>Sin milestones cargados</h3><p>Cuando registremos cada juego, aquí controlaremos Vertical Slice, Alpha, Beta, RC, Launch y LiveOps.</p></article>}
    </section>


    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={createGame} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO TÍTULO</span><h2>Registrar videojuego</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Nombre del juego"/></label>
          <label>Slug<input name="slug" required placeholder="ej. fragmentun-game"/></label>
          <label>IP<input name="ip_name" placeholder="FRAGMENTUN"/></label>
          <label>Plataformas<input name="platform_scope" placeholder="PC, PlayStation, Xbox"/></label>
          <label>Etapa<select name="lifecycle_stage" defaultValue="concept">
            <option value="concept">Concept</option><option value="pre_production">Pre-Production</option>
            <option value="vertical_slice">Vertical Slice</option><option value="production">Production</option>
            <option value="alpha">Alpha</option><option value="beta">Beta</option>
            <option value="release_candidate">Release Candidate</option><option value="launch">Launch</option>
            <option value="liveops">LiveOps</option><option value="sunset">Sunset</option>
          </select></label>
          <label>Salud<select name="health_status" defaultValue="green">
            <option value="green">Green</option><option value="amber">Amber</option>
            <option value="red">Red</option><option value="paused">Paused</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_release_date"/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3} placeholder="Estado y objetivo del proyecto"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar juego</button>
      </form>

      <form action={createMilestone} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO MILESTONE</span><h2>Registrar milestone</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue="">
            <option value="" disabled>Seleccionar juego</option>
            {gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select></label>
          <label>Nombre<input name="name" required placeholder="Vertical Slice aprobado"/></label>
          <label>Tipo<select name="milestone_type" defaultValue="production">
            <option value="pre_production">Pre-Production</option><option value="vertical_slice">Vertical Slice</option>
            <option value="production">Production</option><option value="alpha">Alpha</option>
            <option value="beta">Beta</option><option value="release_candidate">Release Candidate</option>
            <option value="launch">Launch</option><option value="liveops">LiveOps</option>
            <option value="technical">Technical</option><option value="publishing">Publishing</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Exit criteria<textarea name="exit_criteria" rows={3} placeholder="Condiciones para considerar el milestone completado"/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!gameRows.length}>Registrar milestone</button>
      </form>
    </section>}


    {["admin","editor"].includes(profile.role)&&<section className={styles.adminForms}>
      <form action={updateGame} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR JUEGO</span><h2>Actualizar producción</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue=""><option value="" disabled>Seleccionar juego</option>{gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label>Etapa<select name="lifecycle_stage" defaultValue="production"><option value="concept">Concept</option><option value="pre_production">Pre-Production</option><option value="vertical_slice">Vertical Slice</option><option value="production">Production</option><option value="alpha">Alpha</option><option value="beta">Beta</option><option value="release_candidate">Release Candidate</option><option value="launch">Launch</option><option value="liveops">LiveOps</option><option value="sunset">Sunset</option></select></label>
          <label>Salud<select name="health_status" defaultValue="green"><option value="green">Green</option><option value="amber">Amber</option><option value="red">Red</option><option value="paused">Paused</option></select></label>
          <label>Owner<select name="owner_user_id" defaultValue=""><option value="">Sin owner</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Release target<input type="date" name="target_release_date"/></label>
          <label>Presupuesto<input type="number" min="0" step="0.01" name="budget"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!gameRows.length}>Actualizar juego</button>
      </form>

      <form action={updateMilestone} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR MILESTONE</span><h2>Actualizar milestone</h2></div>
        <div className={styles.formGrid}>
          <label>Milestone<select name="milestone_id" required defaultValue=""><option value="" disabled>Seleccionar milestone</option>{milestoneRows.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="in_progress"><option value="planned">Planned</option><option value="in_progress">In progress</option><option value="blocked">Blocked</option><option value="at_risk">At risk</option><option value="completed">Completed</option><option value="canceled">Canceled</option></select></label>
          <label>Owner<select name="owner_user_id" defaultValue=""><option value="">Sin owner</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Progreso %<input type="number" min="0" max="100" name="progress_percent" defaultValue="0"/></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Exit criteria<textarea name="exit_criteria" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} disabled={!milestoneRows.length}>Actualizar milestone</button>
      </form>
    </section>}

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
