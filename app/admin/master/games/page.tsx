import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function validPercent(value:number){
  return Number.isInteger(value)&&value>=0&&value<=100;
}
function validCurrency(value:string){
  return /^[A-Z]{3}$/.test(value);
}

function stageLabel(stage:string){
  const map:Record<string,string>={
    concept:"Concepto",
    pre_production:"Preproducción",
    vertical_slice:"Demostración jugable",
    production:"Producción",
    alpha:"Versión alfa",
    beta:"Versión beta",
    release_candidate:"Candidato a lanzamiento",
    launch:"Lanzamiento",
    liveops:"Operación en vivo",
    sunset:"Cierre"
  };
  return map[stage]||stage;
}

function healthLabel(value:string){
  const map:Record<string,string>={green:"ESTABLE",amber:"ATENCIÓN",red:"CRÍTICO",paused:"PAUSADO"};
  return map[value]||String(value||"").toUpperCase();
}

function milestoneStatusLabel(value:string){
  const map:Record<string,string>={planned:"PLANIFICADO",in_progress:"EN CURSO",blocked:"BLOQUEADO",at_risk:"EN RIESGO",completed:"COMPLETADO",canceled:"CANCELADO"};
  return map[value]||String(value||"").toUpperCase();
}

function milestoneTypeLabel(value:string){
  const map:Record<string,string>={pre_production:"Preproducción",vertical_slice:"Demostración jugable",production:"Producción",alpha:"Versión alfa",beta:"Versión beta",release_candidate:"Candidato a lanzamiento",launch:"Lanzamiento",liveops:"Operación en vivo",technical:"Técnico",publishing:"Publicación"};
  return map[value]||value;
}


async function requireGameEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
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
  const{count:existingGames,error:countError}=await supabase.from("game_titles").select("*",{count:"exact",head:true});
  if(countError) throw new Error(countError.message);
  if((existingGames||0)>=9) throw new Error("portfolio_capacity_reached");
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
  if(!id||!allowedStages.has(stage)||!allowedHealth.has(health)||!validCurrency(currency)||(budgetCents!==null&&(!Number.isFinite(budgetCents)||budgetCents<0))) throw new Error("invalid_game_update");
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
  const progress=Number(formData.get("progress_percent")||0);
  const targetDate=String(formData.get("target_date")||"").trim()||null;
  const exitCriteria=String(formData.get("exit_criteria")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["planned","in_progress","blocked","at_risk","completed","canceled"]);
  if(!id||!allowedStatus.has(status)||!validPercent(progress)||(status==="completed"&&(progress!==100||!exitCriteria))) throw new Error("invalid_milestone_update");
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
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");

  const[
    {data:games},
    {data:milestones},
    {count:books},
    {count:characters},
    {count:media},
    {data:owners},
    {data:virtualItems},
    {data:gamePurchases},
    {data:entitlements},
    {data:engagement}
  ]=await Promise.all([
    supabase.from("game_titles").select("id,slug,name,ip_name,platform_scope,lifecycle_stage,health_status,owner_user_id,target_release_date,budget_cents,currency,summary,created_at").order("created_at",{ascending:true}),
    supabase.from("game_milestones").select("id,game_id,name,milestone_type,status,target_date,completed_at,owner_user_id,progress_percent,exit_criteria,notes,created_at").order("target_date",{ascending:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true}),
    supabase.from("game_virtual_items").select("id,game_id,active"),
    supabase.from("game_purchase_events").select("id,game_id,status,purchased_at").order("purchased_at",{ascending:false}).limit(5000),
    supabase.from("game_entitlements").select("id,game_id,status"),
    supabase.from("game_engagement_daily").select("metric_date,game_id,active_players").order("metric_date",{ascending:false}).limit(500)
  ]);

  const gameRows=(games||[]) as any[];
  const milestoneRows=(milestones||[]) as any[];
  const activeMilestones=milestoneRows.filter(m=>!["completed","canceled"].includes(m.status));
  const blocked=milestoneRows.filter(m=>m.status==="blocked"||m.status==="at_risk");
  const redGames=gameRows.filter(g=>g.health_status==="red"||g.health_status==="paused");
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";
  const primaryGame=gameRows[0]||null;
  const portfolioCapacity=9;
  const availableSlots=Math.max(0,portfolioCapacity-gameRows.length);
  const portfolioUsage=Math.min(100,Math.round((gameRows.length/portfolioCapacity)*100));
  const virtualItemRows=(virtualItems||[]) as any[];
  const purchaseRows=(gamePurchases||[]) as any[];
  const entitlementRows=(entitlements||[]) as any[];
  const engagementRows=(engagement||[]) as any[];
  const latestMetricDate=engagementRows[0]?.metric_date||null;
  const activePlayersToday=latestMetricDate?engagementRows.filter(e=>e.metric_date===latestMetricDate).reduce((a,e)=>a+Number(e.active_players||0),0):0;
  const paidPurchases=purchaseRows.filter(p=>p.status==="paid");
  const gamesWithEconomy=new Set(virtualItemRows.filter(i=>i.active).map(i=>i.game_id));
  const entitlementAlerts=entitlementRows.filter(e=>["pending","failed"].includes(e.status));
  const gameVirtualItems=(id:string)=>virtualItemRows.filter(i=>i.game_id===id&&i.active).length;
  const gamePaidPurchases=(id:string)=>paidPurchases.filter(p=>p.game_id===id).length;
  const gamePlayers=(id:string)=>latestMetricDate?engagementRows.filter(e=>e.game_id===id&&e.metric_date===latestMetricDate).reduce((a,e)=>a+Number(e.active_players||0),0):0;
  const gameEntitlementAlerts=(id:string)=>entitlementAlerts.filter(e=>e.game_id===id).length;

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleGames}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · JUEGOS</span><h1>Juegos</h1><p>Seguimiento de títulos, avances y estado de producción.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">JG</span>
      <div className={styles.moduleStripCopy}><small>PRODUCCIÓN INTERACTIVA</small><strong>Portfolio y avance de juegos</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Pipeline de producción conectado</span>
        <span>Cambios protegidos · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Portafolio</small><strong>{gameRows.length}/{portfolioCapacity}</strong><span>{availableSlots} espacios disponibles</span></article>
      <article><small>Etapas abiertas</small><strong>{activeMilestones.length}</strong><span>Producción activa</span></article>
      <article className={blocked.length?styles.kpiAttention:undefined}><small>En riesgo o bloqueados</small><strong>{blocked.length}</strong><span>{blocked.length?"Requieren atención":"Sin excepciones activas"}</span></article>
      <article className={redGames.length?styles.kpiAttention:undefined}><small>Salud crítica</small><strong>{redGames.length}</strong><span>{redGames.length?"Críticos o pausados":"Sin títulos críticos"}</span></article>
    </section>

    <section className={`${styles.kpis} ${styles.kpisPair}`}>
      <article><small>Responsable</small><strong>{primaryGame?ownerName(primaryGame.owner_user_id):"Sin asignar"}</strong><span>{primaryGame?primaryGame.name:"Primer juego pendiente"}</span></article>
      <article><small>Fecha objetivo</small><strong>{primaryGame?.target_release_date||"Sin definir"}</strong><span>{primaryGame?"Lanzamiento previsto":"Primer juego pendiente"}</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · CONEXIÓN</span><h2>Economía y telemetría por juego</h2></div>
      <p>Estado real de catálogo virtual, compras pagadas, jugadores activos y entregas digitales por título.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Juegos con economía</small><strong>{gamesWithEconomy.size}/{gameRows.length||0}</strong><span>Con artículos virtuales activos</span></article>
      <article><small>Jugadores activos hoy</small><strong>{activePlayersToday.toLocaleString()}</strong><span>{latestMetricDate||"Sin telemetría diaria"}</span></article>
      <article><small>Compras in-game pagadas</small><strong>{paidPurchases.length}</strong><span>Eventos reales recibidos</span></article>
      <article className={entitlementAlerts.length?styles.kpiAttention:undefined}><small>Entregas por revisar</small><strong>{entitlementAlerts.length}</strong><span>{entitlementAlerts.length?"Pendientes o fallidas":"Sin incidencias"}</span></article>
    </section>

    <section className={styles.portfolioCapacity}>
      <div className={styles.capacityHeader}>
        <div><span>CAPACIDAD DEL PORTAFOLIO</span><h2>9 videojuegos · incorporación progresiva</h2><p>Estado público: todos los títulos permanecen PRÓXIMAMENTE hasta que exista una aprobación individual vinculada al videojuego y a su despliegue. La etapa de producción no habilita la ficha pública.</p><p><a href="/admin/master/releases">Revisar autorizaciones y despliegues →</a></p><p><a href="/admin/master/games/readiness">Comprobar preparación individual de cada videojuego →</a></p><p><a href="/admin/master/games/worlds">Ver los 3 mundos internos gratuitos por videojuego →</a></p><p>Modelo A aprobado: cada videojuego se planifica con 3 mundos internos jugables gratis. Las compras de artículos son opcionales. Los mundos internos no ocupan nuevas plazas del portafolio.</p></div>
        <div className={styles.capacityProgress} aria-label={`${portfolioUsage}% del portafolio ocupado`}>
          <b>{gameRows.length}/9</b>
          <span><i style={{width:`${portfolioUsage}%`}}></i></span>
        </div>
      </div>
      <div className={styles.capacityGrid}>
        {Array.from({length:portfolioCapacity},(_,index)=>{
          const game=gameRows[index];
          return <article key={game?.id||`slot-${index}`} className={`${styles.capacitySlot} ${game?styles.capacitySlotFilled:styles.capacitySlotEmpty}`}>
            <span className={styles.capacityIndex}>{String(index+1).padStart(2,"0")}</span>
            <strong className={styles.capacityName}>{game?.name||"Disponible"}</strong>
            <small className={styles.capacityMeta}>{game?stageLabel(game.lifecycle_stage):"Preparado para futuro título"}</small>
            {game&&<small className={styles.capacityMeta}>Modelo previsto: 3 mundos internos gratis · compras opcionales</small>}
          </article>;
        })}
      </div>
    </section>

    {["admin","editor"].includes(profile.role)&&<details id="game-advanced" className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar juegos y etapas manualmente.</p>
      <section className={styles.adminForms}>
      <MasterActionForm action={createGame} className={styles.adminForm} successText="Juego registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO TÍTULO</span><h2>Registrar videojuego</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Nombre del juego"/></label>
          <label>Slug<input name="slug" required placeholder="ej. fragmentun-game"/></label>
          <label>IP<input name="ip_name" placeholder="FRAGMENTUN"/></label>
          <label>Plataformas<input name="platform_scope" placeholder="PC, PlayStation, Xbox"/></label>
          <label>Etapa<select name="lifecycle_stage" defaultValue="concept">
            <option value="concept">Concepto</option><option value="pre_production">Preproducción</option>
            <option value="vertical_slice">Vertical Slice</option><option value="production">Producción</option>
            <option value="alpha">Alpha</option><option value="beta">Beta</option>
            <option value="release_candidate">Candidato a lanzamiento</option><option value="launch">Lanzamiento</option>
            <option value="liveops">Operación en vivo</option><option value="sunset">Cierre</option>
          </select></label>
          <label>Salud<select name="health_status" defaultValue="green">
            <option value="green">Estable</option><option value="amber">Atención</option>
            <option value="red">Crítico</option><option value="paused">Pausado</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_release_date"/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3} placeholder="Estado y objetivo del proyecto"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={gameRows.length>=portfolioCapacity} disabledReason="El portafolio ya alcanzó su capacidad máxima de 9 videojuegos.">Registrar juego</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createMilestone} className={styles.adminForm} successText="Hito registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVA ETAPA</span><h2>Registrar etapa</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue="">
            <option value="" disabled>Seleccionar juego</option>
            {gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}
          </select></label>
          <label>Nombre<input name="name" required placeholder="Vertical Slice aprobado"/></label>
          <label>Tipo<select name="milestone_type" defaultValue="production">
            <option value="pre_production">Preproducción</option><option value="vertical_slice">Vertical Slice</option>
            <option value="production">Producción</option><option value="alpha">Alpha</option>
            <option value="beta">Beta</option><option value="release_candidate">Candidato a lanzamiento</option>
            <option value="launch">Lanzamiento</option><option value="liveops">Operación en vivo</option>
            <option value="technical">Técnico</option><option value="publishing">Publicación</option>
          </select></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Condiciones para completar<textarea name="exit_criteria" rows={3} placeholder="Condiciones para considerar la etapa completada"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!gameRows.length} disabledReason="Primero registra un juego para poder añadir una etapa.">Registrar etapa</MasterSubmitButton>
      </MasterActionForm>
      </section>

      <section className={styles.adminForms}>
      <MasterActionForm action={updateGame} className={styles.adminForm} successText="Juego actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR JUEGO</span><h2>Actualizar producción</h2></div>
        <div className={styles.formGrid}>
          <label>Juego<select name="game_id" required defaultValue=""><option value="" disabled>Seleccionar juego</option>{gameRows.map((g:any)=><option key={g.id} value={g.id}>{g.name}</option>)}</select></label>
          <label>Etapa<select name="lifecycle_stage" defaultValue="production"><option value="concept">Concepto</option><option value="pre_production">Preproducción</option><option value="vertical_slice">Vertical Slice</option><option value="production">Producción</option><option value="alpha">Alpha</option><option value="beta">Beta</option><option value="release_candidate">Candidato a lanzamiento</option><option value="launch">Lanzamiento</option><option value="liveops">Operación en vivo</option><option value="sunset">Cierre</option></select></label>
          <label>Salud<select name="health_status" defaultValue="green"><option value="green">Estable</option><option value="amber">Atención</option><option value="red">Crítico</option><option value="paused">Pausado</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha objetivo<input type="date" name="target_release_date"/></label>
          <label>Presupuesto<input type="number" min="0" step="0.01" name="budget"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Resumen<textarea name="summary" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!gameRows.length} disabledReason="No hay juegos registrados para actualizar.">Actualizar juego</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateMilestone} className={styles.adminForm} successText="Hito actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR ETAPA</span><h2>Actualizar etapa</h2></div>
        <div className={styles.formGrid}>
          <label>Etapa<select name="milestone_id" required defaultValue=""><option value="" disabled>Seleccionar etapa</option>{milestoneRows.map((m:any)=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="in_progress"><option value="planned">Planificado</option><option value="in_progress">En curso</option><option value="blocked">Bloqueado</option><option value="at_risk">En riesgo</option><option value="completed">Completado</option><option value="canceled">Cancelado</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Progreso %<input type="number" min="0" max="100" name="progress_percent" defaultValue="0"/></label>
          <label>Fecha objetivo<input type="date" name="target_date"/></label>
          <label className={styles.span2}>Condiciones para completar<textarea name="exit_criteria" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!milestoneRows.length} disabledReason="No hay etapas registradas para actualizar.">Actualizar etapa</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>}


    <section className={styles.sectionHead}>
      <div><span>PORTAFOLIO DE JUEGOS</span><h2>Registro de títulos</h2></div>
      <p>Esta vista ya consume las nuevas tablas persistentes del estudio. No se crean títulos ficticios: el registro comienza vacío hasta cargar cada proyecto real.</p>
    </section>

    <section className={styles.grid}>
      {gameRows.map((g:any)=><article key={g.id} className={`${styles.card} ${["red","paused"].includes(g.health_status)?styles.cardAttention:g.health_status==="amber"?styles.cardWarning:""}`}>
        <div className={styles.cardTop}>
          <span className={g.health_status==="green"?styles.badgeActive:styles.badgePlanned}>{healthLabel(g.health_status)}</span>
          <em>{stageLabel(g.lifecycle_stage)}</em>
        </div>
        <h3>{g.name}</h3>
        <p>{g.ip_name||"IP sin asignar"}<br/>Responsable: {ownerName(g.owner_user_id)}<br/>{(g.platform_scope||[]).length?(g.platform_scope||[]).join(" · "):"Plataformas por definir"}<br/>{g.target_release_date?"Lanzamiento objetivo: "+g.target_release_date:"Sin fecha objetivo"} · {g.budget_cents!=null?new Intl.NumberFormat("en-US",{style:"currency",currency:g.currency||"USD"}).format(Number(g.budget_cents)/100):"Presupuesto por definir"}<br/>FREEMIUM: {gameVirtualItems(g.id)} artículos · {gamePaidPurchases(g.id)} compras · {gamePlayers(g.id)} jugadores activos{gameEntitlementAlerts(g.id)?` · ${gameEntitlementAlerts(g.id)} entregas por revisar`:""}</p>
      </article>)}
      {!gameRows.length&&<article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>LISTO</span><em>GAME REGISTRY</em></div>
        <h3>Registro preparado</h3>
        <p>Responsable: Sin asignar<br/>Fecha objetivo: Sin definir<br/>El sistema está listo para registrar los videojuegos reales de LIRYGAMES STUDIOS.</p>
      </article>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>ETAPAS</span><h2>Avance de producción</h2></div>
      <p>Milestones conectados por título con progreso, owner, fecha objetivo, exit criteria y estado.</p>
    </section>

    <section className={styles.grid}>
      {milestoneRows.map((m:any)=><article key={m.id} className={`${styles.card} ${["blocked","at_risk"].includes(m.status)?styles.cardAttention:""}`}>
        <div className={styles.cardTop}>
          <span className={m.status==="completed"?styles.badgeActive:styles.badgePlanned}>{milestoneStatusLabel(m.status)}</span>
          <em>{m.progress_percent}%</em>
        </div>
        <h3>{m.name}</h3>
        <p>{milestoneTypeLabel(m.milestone_type)} · {m.target_date||"Sin fecha"}<br/>Responsable: {ownerName(m.owner_user_id)}<br/>{m.exit_criteria||"Condiciones de cierre pendientes"}</p>
      </article>)}
      {!milestoneRows.length&&<article className={styles.card}><h3>Sin etapas cargadas</h3><p>Cuando registremos cada juego, aquí controlaremos Vertical Slice, Alpha, Beta, RC, Launch y LiveOps.</p></article>}
    </section>


        <section className={styles.sectionHead}>
      <div><span>ACTIVOS DE LA IP</span><h2>Activos ya disponibles</h2></div>
      <p>El sistema conecta el futuro portfolio de juegos con el contenido editorial y multimedia existente.</p>
    </section>
    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Base creativa</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Universo narrativo</span></article>
      <article><small>Recursos</small><strong>{(media||0).toLocaleString()}</strong><span>Archivos registrados</span></article>
      <article><small>Acceso a datos</small><strong className={styles.kpiCompactValue}>PROTEGIDO</strong><span>Acceso administrativo</span></article>
    </section>
  </main>;
}
