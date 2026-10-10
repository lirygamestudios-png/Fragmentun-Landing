import { createHash } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";
import {CommunityManagementJump} from "../../../../components/CommunityManagementJump";
import {CommunityMemberEditFields} from "../../../../components/CommunityMemberEditFields";
import {CommunityPointsPreview} from "../../../../components/CommunityPointsPreview";

function tierLabel(value:string){
  const map:Record<string,string>={member:"MIEMBRO",engaged:"PARTICIPATIVO",advocate:"PROMOTOR",beta_priority:"PRIORIDAD BETA",moderator:"MODERADOR"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function memberEstadoLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",inactive:"INACTIVO",blocked:"BLOQUEADO",left:"SALIDA"};
  return map[value]||String(value||"").toUpperCase();
}

function actionLabel(value:string){
  const map:Record<string,string>={share:"COMPARTIDO",referral:"REFERIDO",comment:"COMENTARIO",event:"EVENTO",survey:"ENCUESTA",beta_signup:"REGISTRO BETA",beta_feedback:"OPINIÓN BETA",purchase:"COMPRA",community_join:"INGRESO A COMUNIDAD",other:"OTRO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireCommunityEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor","marketing"].includes(profile.role)) throw new Error("forbidden");

  // Las acciones de Comunidad requieren el MFA específico de LIRYGAMES,
  // además del nivel AAL2 general de Supabase.
  const contextToken=(await cookies()).get("liry_mfa_context")?.value;
  if(!contextToken)throw new Error("Verifica el autenticador de LIRYGAMES antes de guardar.");
  const tokenHash=createHash("sha256").update(contextToken).digest("hex");
  const {data:contextSession,error:contextError}=await supabase.from("admin_mfa_context_sessions")
    .select("factor_id").eq("user_id",user.id).eq("context","lirygames_commander")
    .eq("token_hash",tokenHash).gt("expires_at",new Date().toISOString()).maybeSingle();
  if(contextError||!contextSession)throw new Error("La verificación LIRYGAMES ha vencido.");
  const {data:factorsData,error:factorsError}=await supabase.auth.mfa.listFactors();
  const validFactor=!factorsError&&(factorsData?.totp||[]).some(f=>
    f.id===contextSession.factor_id&&f.status==="verified"&&
    String(f.friendly_name||"").trim().toLowerCase()==="lirygames commander");
  if(!validFactor)throw new Error("Se requiere el autenticador propio de LIRYGAMES.");
  return {supabase,user};
}

async function createMember(formData:FormData){
  "use server";
  const {supabase,user}=await requireCommunityEditor();
  const displayName=String(formData.get("display_name")||"").trim()||null;
  const email=String(formData.get("email")||"").trim()||null;
  const handle=String(formData.get("handle")||"").trim()||null;
  const source=String(formData.get("source")||"").trim()||null;
  const tier=String(formData.get("tier")||"member");
  const allowed=new Set(["member","engaged","advocate","beta_priority","moderator"]);
  if(!displayName&&!email) throw new Error("member_identity_required");
  if(!allowed.has(tier)) throw new Error("invalid_tier");
  if((displayName?.length||0)>120||(email?.length||0)>254||(handle?.length||0)>80||(source?.length||0)>200)throw new Error("Los datos del miembro superan la longitud permitida.");
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error("El correo del miembro no tiene un formato válido.");
  // Evitar altas repetidas con el mismo correo o usuario antes de registrar el miembro.
  // La unicidad concurrente requiere además restricciones en la base de datos.
  if(email){
    const {data:duplicateByEmail,error:emailError}=await supabase.from("community_members")
      .select("id").ilike("email",email).limit(1);
    if(emailError)throw new Error("No fue posible verificar si el correo ya está registrado.");
    if(duplicateByEmail?.length)throw new Error("Ya existe un miembro con ese correo.");
  }
  if(handle){
    const {data:duplicateByHandle,error:handleError}=await supabase.from("community_members")
      .select("id").ilike("handle",handle).limit(1);
    if(handleError)throw new Error("No fue posible verificar si el usuario ya está registrado.");
    if(duplicateByHandle?.length)throw new Error("Ya existe un miembro con ese usuario.");
  }
  const{error}=await supabase.from("community_members").insert({
    display_name:displayName,email,handle,source,tier,beta_priority:tier==="beta_priority",created_by:user.id
  });
  if(error){
    // Si existe una restricción única en Supabase, traducir el rechazo a un aviso claro.
    if(error.code==="23505")throw new Error("Ya existe un miembro con ese correo o usuario.");
    throw new Error(error.message);
  }
  revalidatePath("/admin/master/community");
}

async function addAction(formData:FormData){
  "use server";
  const {supabase}=await requireCommunityEditor();
  const memberId=String(formData.get("member_id")||"").trim();
  const type=String(formData.get("action_type")||"other");
  const source=String(formData.get("source")||"").trim()||null;
  const description=String(formData.get("description")||"").trim()||null;
  const delta=Number(formData.get("points_delta")||0);
  const allowed=new Set(["share","referral","comment","event","survey","beta_signup","beta_feedback","purchase","community_join","other"]);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(memberId)||!allowed.has(type)||!Number.isFinite(delta)||!Number.isInteger(delta)||Math.abs(delta)>100000||(source?.length||0)>200||(description?.length||0)>3000) throw new Error("La actividad contiene valores no permitidos.");

  if(delta<0&&(!description||description.length<10))throw new Error("community_adjustment_reason_required");

  // Una transacción de Supabase registra actividad y actualiza saldo conjuntamente.
  const contextToken=(await cookies()).get("liry_mfa_context")?.value;
  if(!contextToken)throw new Error("mfa_required");
  const {error}=await supabase.rpc("liry_record_community_action",{
    p_member_id:memberId,p_action_type:type,p_source:source,
    p_description:description,p_points_delta:delta,p_context_token:contextToken
  });
  if(error)throw new Error(error.message);
  revalidatePath("/admin/master/community");
}



async function compensateAction(formData:FormData){
  "use server";
  const {supabase}=await requireCommunityEditor();
  const actionId=String(formData.get("original_action_id")||"").trim();
  const reason=String(formData.get("correction_reason")||"").trim();
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(actionId))throw new Error("community_original_not_found");
  if(reason.length<10||reason.length>3000)throw new Error("community_adjustment_reason_required");
  const token=(await cookies()).get("liry_mfa_context")?.value;
  if(!token)throw new Error("mfa_required");
  const {error}=await supabase.rpc("liry_compensate_community_action",{p_original_action_id:actionId,p_reason:reason,p_context_token:token});
  if(error)throw new Error(error.message);
  revalidatePath("/admin/master/community");
}


async function updateMember(formData:FormData){
  "use server";
  const {supabase}=await requireCommunityEditor();
  if(formData.get("member_update_confirmed")!=="yes")throw new Error("Confirma la revisión del miembro antes de guardar.");
  const id=String(formData.get("member_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const tier=String(formData.get("tier")||"member");
  const source=String(formData.get("source")||"").trim()||null;
  const betaPriority=String(formData.get("beta_priority")||"false")==="true";
  const tags=String(formData.get("tags")||"").split(",").map(x=>x.trim()).filter(Boolean);
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["active","inactive","blocked","left"]);
  const allowedNivel=new Set(["member","engaged","advocate","beta_priority","moderator"]);
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||!allowedEstado.has(status)||!allowedNivel.has(tier)||tags.length>30||tags.some(tag=>tag.length>50)||String(formData.get("notes")||"").length>3000||String(formData.get("source")||"").length>200) throw new Error("invalid_member_update");
  const {data:existing,error:lookupError}=await supabase.from("community_members").select("id").eq("id",id).maybeSingle();
  if(lookupError||!existing)throw new Error("member_not_found");
  const{error}=await supabase.from("community_members").update({
    status,tier,beta_priority:status==="active"&&(betaPriority||tier==="beta_priority"),source,tags,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/community");
}

export default async function CommunityPage({searchParams}:{searchParams:Promise<{memberStatus?:string;memberTier?:string;memberSearch?:string;memberPage?:string;activityType?:string;activitySearch?:string;activityPage?:string;correctionId?:string}>}){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/lirygames/login?unauthorized=1");
  const filters=await searchParams;
  const correctionId=String(filters.correctionId||"").trim().slice(0,36);
  const validCorrectionId=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(correctionId);
  const {data:locatedAction,error:locatedActionError}=validCorrectionId?await supabase.from("community_actions").select("id,member_id,action_type,source,points_delta,description,occurred_at,correction_of").eq("id",correctionId).maybeSingle():{data:null,error:null};
  const {data:correctionMatches,error:correctionLookupError}=locatedAction?await supabase.from("community_actions").select("id").eq("correction_of",locatedAction.id).limit(1):{data:[],error:null};
  const canCorrectLocated=Boolean(locatedAction&&!locatedAction.correction_of&&Number(locatedAction.points_delta)!==0&&!correctionMatches?.length&&!locatedActionError&&!correctionLookupError);
  const activityPage=/^[1-9]\d{0,3}$/.test(filters.activityPage||"")?Number(filters.activityPage):1;
  const activityPageSize=30;
  const activityType=["share","referral","comment","event","survey","beta_signup","beta_feedback","purchase","community_join","other"].includes(filters.activityType||"")?filters.activityType||"":"";
  const activitySearch=(filters.activitySearch||"").trim().slice(0,80).toLocaleLowerCase("es");
  let activityQuery=supabase.from("community_actions").select("id,member_id,action_type,source,points_delta,description,occurred_at,correction_of",{count:"exact"}).order("occurred_at",{ascending:false});
  if(activityType)activityQuery=activityQuery.eq("action_type",activityType);
  if(activitySearch)activityQuery=activityQuery.or(`description.ilike.%${activitySearch.replace(/[%_,()]/g,"")}%,source.ilike.%${activitySearch.replace(/[%_,()]/g,"")}%`);
  activityQuery=activityQuery.range((activityPage-1)*activityPageSize,activityPage*activityPageSize-1);

  const[{data:members},{data:actions,count:actionCount,error:activityError},{count:crmContacts},{count:shareClicks},{data:gameMetrics},{data:gamePurchases},{count:pendingContactCount,error:pendingContactError},{count:overdueContactCount,error:overdueContactError},{count:unassignedContactCount,error:unassignedContactError}]=await Promise.all([
    supabase.from("community_members").select("id,display_name,handle,email,status,tier,points,beta_priority,source,joined_at,last_activity_at,tags,notes").order("points",{ascending:false}),
    activityQuery,
    supabase.from("crm_contacts").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","share_click"),
    supabase.from("game_engagement_daily").select("metric_date,game_id,platform,active_players,new_players,sessions").order("metric_date",{ascending:false}).limit(1000),
    supabase.from("game_purchase_events").select("player_ref,game_id,platform,status,purchased_at").order("purchased_at",{ascending:false}).limit(5000),
    supabase.from("lirygames_contact_messages").select("*",{count:"exact",head:true}).in("status",["new","reviewing"]),
    supabase.from("lirygames_contact_messages").select("*",{count:"exact",head:true}).in("status",["new","reviewing"]).lte("created_at",new Date(Date.now()-7*86400000).toISOString()),
    supabase.from("lirygames_contact_messages").select("*",{count:"exact",head:true}).in("status",["new","reviewing"]).is("assigned_to",null)
  ]);

  const {data:pointDifferences,error:pointReconciliationError}=await supabase.rpc("liry_community_points_reconciliation");
  const pointDifferenceRows=(pointDifferences||[]) as {member_id:string;member_name:string;stored_points:number;history_points:number;difference:number}[];
  const contactOverviewAvailable=!pendingContactError&&!overdueContactError&&!unassignedContactError;
  const memberStatus=["active","inactive","blocked","left"].includes(filters.memberStatus||"")?filters.memberStatus||"":"";
  const memberTier=["member","engaged","advocate","beta_priority","moderator"].includes(filters.memberTier||"")?filters.memberTier||"":"";
  const memberSearch=(filters.memberSearch||"").trim().slice(0,80).toLocaleLowerCase("es");
  const memberRows=(members||[]) as any[];
  const filteredMemberRows=memberRows.filter(m=>
    (!memberStatus||m.status===memberStatus)&&
    (!memberTier||m.tier===memberTier)&&
    (!memberSearch||[m.display_name,m.handle,m.email].some(v=>String(v||"").toLocaleLowerCase("es").includes(memberSearch)))
  );
  const memberPageRequested=/^[1-9]\d{0,3}$/.test(filters.memberPage||"")?Number(filters.memberPage):1;
  const memberPageSize=30;
  const memberPages=Math.max(1,Math.ceil(filteredMemberRows.length/memberPageSize));
  const memberPage=Math.min(memberPageRequested,memberPages);
  const memberFiltersActive=Boolean(memberStatus||memberTier||memberSearch);
  const visibleMembers=filteredMemberRows.slice((memberPage-1)*memberPageSize,memberPage*memberPageSize);
  const memberLink=(page:number)=>{const p=new URLSearchParams();if(memberStatus)p.set("memberStatus",memberStatus);if(memberTier)p.set("memberTier",memberTier);if(memberSearch)p.set("memberSearch",memberSearch);if(activityType)p.set("activityType",activityType);if(activitySearch)p.set("activitySearch",activitySearch);if(activityPage>1)p.set("activityPage",String(activityPage));p.set("memberPage",String(page));return "?"+p.toString()+"#comunidad-miembros";};
  const actionRows=(actions||[]) as any[];
  const actionPages=Math.max(1,Math.ceil((actionCount||0)/activityPageSize));
  const activityLink=(page:number)=>{const p=new URLSearchParams();if(activityType)p.set("activityType",activityType);if(activitySearch)p.set("activitySearch",activitySearch);if(memberStatus)p.set("memberStatus",memberStatus);if(memberTier)p.set("memberTier",memberTier);if(memberSearch)p.set("memberSearch",memberSearch);if(memberPage>1)p.set("memberPage",String(memberPage));p.set("activityPage",String(page));return "?"+p.toString()+"#comunidad-participacion";};
  if(!activityError&&actionCount!==null&&activityPage>actionPages)redirect("/admin/master/community"+activityLink(actionPages));
  const clearMembersLink=()=>{const p=new URLSearchParams();if(activityType)p.set("activityType",activityType);if(activitySearch)p.set("activitySearch",activitySearch);if(activityPage>1)p.set("activityPage",String(activityPage));return "/admin/master/community"+(p.size?"?"+p.toString():"")+"#comunidad-miembros";};
  const clearActivitiesLink=()=>{const p=new URLSearchParams();if(memberStatus)p.set("memberStatus",memberStatus);if(memberTier)p.set("memberTier",memberTier);if(memberSearch)p.set("memberSearch",memberSearch);if(memberPage>1)p.set("memberPage",String(memberPage));return "/admin/master/community"+(p.size?"?"+p.toString():"")+"#comunidad-participacion";};
  const active=memberRows.filter(m=>m.status==="active");
  const beta=memberRows.filter(m=>m.beta_priority||m.tier==="beta_priority");
  const advocates=memberRows.filter(m=>m.tier==="advocate");
  const totalPoints=memberRows.reduce((a,m)=>a+Number(m.points||0),0);
  const gameMetricRows=(gameMetrics||[]) as any[];
  const gamePurchaseRows=(gamePurchases||[]) as any[];
  const latestGameDate=gameMetricRows[0]?.metric_date||null;
  const latestGameMetrics=latestGameDate?gameMetricRows.filter(m=>m.metric_date===latestGameDate):[];
  const activePlayersToday=latestGameMetrics.reduce((a,m)=>a+Number(m.active_players||0),0);
  const newPlayersToday=latestGameMetrics.reduce((a,m)=>a+Number(m.new_players||0),0);
  const payingPlayers=new Set(gamePurchaseRows.filter(p=>p.status==="paid").map(p=>p.player_ref).filter(Boolean)).size;

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleCommunity}`}>
    <CommunityManagementJump/>
    <div className={styles.communityContactActions}><a className={styles.communityMessagesButton} href="/admin/master/community/messages">✉ MENSAJES DE CONTACTO →</a>{!pendingContactError&&<a className={styles.communityPendingShortcut} href="/admin/master/community/messages?pending=1">{pendingContactCount??0} PENDIENTES DE ATENCIÓN →</a>}{!overdueContactError&&<a className={styles.communityOverdueShortcut} href="/admin/master/community/messages?pending=1&age=7">{overdueContactCount??0} CON 7+ DÍAS →</a>}{!unassignedContactError&&<a className={styles.communityUnassignedShortcut} href="/admin/master/community/messages?pending=1&owner=unassigned">{unassignedContactCount??0} SIN RESPONSABLE →</a>}</div>
    {contactOverviewAvailable&&<p className={styles.communityContactLegend}>SEGUIMIENTO DE CONTACTO · <strong>{pendingContactCount??0}</strong> requieren atención · <strong>{unassignedContactCount??0}</strong> aún sin asignar · <strong>{overdueContactCount??0}</strong> con 7 días o más. Los indicadores se consultan en Supabase y no implican envío de correos.</p>}
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CLIENTES Y COMUNIDAD</span><h1>Clientes y Comunidad</h1><p>Miembros, participación y acceso beta sin duplicar la información comercial.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <nav className={styles.communitySectionNav} aria-label="Accesos a secciones de Comunidad">
      <a href="#comunidad-miembros">MIEMBROS</a>
      <a href="#comunidad-participacion">PARTICIPACIÓN</a>
      {["admin","editor","marketing"].includes(profile.role)&&<a href="#comunidad-gestion" data-open-community-management="true">GESTIÓN Y REGISTROS</a>}
    </nav>
    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">CC</span>
      <div className={styles.moduleStripCopy}><small>CLIENTES Y COMUNIDAD</small><strong>Participación, fidelización y acceso beta</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Comunidad conectada a datos reales</span>
        <span>Gestión protegida · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Miembros activos</small><strong>{active.length}</strong><span>{memberRows.length} registrados</span></article>
      <article><small>Prioridad beta</small><strong>{beta.length}</strong><span>Acceso prioritario</span></article>
      <article><small>Promotores</small><strong>{advocates.length}</strong><span>Miembros que impulsan la comunidad</span></article>
      <article><small>Puntos</small><strong>{totalPoints.toLocaleString()}</strong><span>Participación acumulada</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>FREEMIUM · COMUNIDAD</span><h2>Señales de jugadores</h2></div>
      <p>Lectura agregada de actividad y pago. No se vincula automáticamente un jugador con un miembro de comunidad sin cuenta unificada y consentimiento.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Jugadores activos hoy</small><strong>{activePlayersToday.toLocaleString()}</strong><span>{latestGameDate||"Sin telemetría diaria"}</span></article>
      <article><small>Nuevos jugadores hoy</small><strong>{newPlayersToday.toLocaleString()}</strong><span>Actividad de videojuegos</span></article>
      <article><small>Jugadores pagadores</small><strong>{payingPlayers.toLocaleString()}</strong><span>Identidades de juego agregadas</span></article>
      <article><small>Identidad unificada</small><strong className={styles.kpiCompactValue}>PENDIENTE</strong><span>Sin cruce automático web/juego</span></article>
    </section>

    <section className={styles.moduleStrip} aria-label="Conciliación de puntos de Comunidad">
      <span className={styles.moduleGlyph} aria-hidden="true">✓</span>
      <div className={styles.moduleStripCopy}>
        <small>CONTROL DE INTEGRIDAD · SOLO LECTURA</small>
        <strong>{pointReconciliationError?"CONCILIACIÓN NO DISPONIBLE":pointDifferenceRows.length?"REVISIÓN NECESARIA":memberRows.length?"SIN DIFERENCIAS DETECTADAS":"SIN MIEMBROS PARA CONCILIAR"}</strong>
        <p>{pointReconciliationError?"No fue posible consultar la conciliación.":memberRows.length?`Se revisaron ${memberRows.length} miembro(s) contra su historial. Consulta de solo lectura.`:"Todavía no existen miembros registrados. La conciliación comenzará a mostrar resultados cuando haya datos reales."}</p>
        {!pointReconciliationError&&pointDifferenceRows.length>0&&<div role="alert">
          <p>{pointDifferenceRows.length} miembro(s) presentan diferencias. Ningún saldo se corregirá automáticamente.</p>
          <details>
            <summary>CONSULTAR DIFERENCIAS DE PUNTOS</summary>
            <div className={styles.communityReconciliationScroll}><table aria-label="Detalle de diferencias de puntos"><thead><tr><th scope="col">Miembro</th><th scope="col">Saldo</th><th scope="col">Historial</th><th scope="col">Diferencia</th></tr></thead><tbody>
              {pointDifferenceRows.slice(0,20).map(row=><tr key={row.member_id}><th scope="row">{row.member_name}</th><td>{Number(row.stored_points).toLocaleString("es-US")}</td><td>{Number(row.history_points).toLocaleString("es-US")}</td><td>{Number(row.difference)>0?"+":""}{Number(row.difference).toLocaleString("es-US")}</td></tr>)}
            </tbody></table></div>
            {pointDifferenceRows.length>20&&<p>Se muestran las primeras 20 diferencias de {pointDifferenceRows.length}; revisar el resto en la base de datos.</p>}
          </details>
        </div>}
      </div>
    </section>
    <section id="comunidad-miembros" className={styles.sectionHead}><div><span>MIEMBROS</span><h2>Miembros</h2></div><p>La información comercial se mantiene separada; aquí se gestiona la relación con la comunidad y su participación.</p></section>
    {memberFiltersActive&&<p className={styles.communityFilterNotice}>FILTROS DE MIEMBROS ACTIVOS · {filteredMemberRows.length} coincidencias. <a href={clearMembersLink()}>Ver todos los miembros →</a></p>}
    <form method="GET" className={styles.communityMemberFilters} aria-label="Filtrar miembros de comunidad">
      {activityType&&<input type="hidden" name="activityType" value={activityType}/>}
      {activitySearch&&<input type="hidden" name="activitySearch" value={activitySearch}/>}
      {activityPage>1&&<input type="hidden" name="activityPage" value={activityPage}/> }
      <label>Buscar miembro<input name="memberSearch" defaultValue={memberSearch} maxLength={80} placeholder="Nombre, usuario o correo"/></label>
      <label>Estado<select name="memberStatus" defaultValue={memberStatus}><option value="">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option><option value="blocked">Bloqueados</option><option value="left">Salida</option></select></label>
      <label>Nivel<select name="memberTier" defaultValue={memberTier}><option value="">Todos</option><option value="member">Miembro</option><option value="engaged">Participativo</option><option value="advocate">Promotor</option><option value="beta_priority">Prioridad beta</option><option value="moderator">Moderador</option></select></label>
      <button type="submit">FILTRAR →</button>
      <a href={clearMembersLink()}>LIMPIAR</a>
      <span className={styles.communityMemberFilterCount}>{filteredMemberRows.length} de {memberRows.length} miembros</span>
    </form>
    <section className={styles.grid}>
      {visibleMembers.map((m:any)=><article key={m.id} className={`${styles.card} ${m.status==="blocked"?styles.cardAttention:["inactive","left"].includes(m.status)?styles.cardMuted:m.beta_priority||m.tier==="beta_priority"?styles.cardPriority:""}`}>
        <div className={styles.cardTop}><span className={m.status==="active"?styles.badgeActive:styles.badgePlanned}>{tierLabel(m.tier)}</span><em>{m.points} puntos</em></div>
        <h3>{m.display_name||m.handle||m.email||"Miembro"}</h3>
        <p>{m.handle||m.email||"Sin usuario o correo"}<br/>{m.source||"Fuente no registrada"}<br/>{m.beta_priority?"Beta prioritario":"Acceso beta estándar"}</p>
      </article>)}
      {!filteredMemberRows.length&&<article className={styles.card}><h3>{memberRows.length?"Sin coincidencias":"Registro de comunidad preparado"}</h3><p>{memberRows.length?"No hay miembros con los filtros seleccionados.":"No se han creado miembros ficticios. El registro empieza vacío."}</p></article>}
    </section>

    {memberPages>1&&<nav className={styles.communityActivityPages} aria-label="Páginas de miembros">
      {memberPage>1?<a href={memberLink(1)}>« PRIMERA</a>:<span>« PRIMERA</span>}
      {memberPage>1?<a href={memberLink(memberPage-1)}>← ANTERIOR</a>:<span>← ANTERIOR</span>}
      <strong>Página {memberPage} de {memberPages} · {filteredMemberRows.length} miembros</strong>
      {memberPage<memberPages?<a href={memberLink(memberPage+1)}>SIGUIENTE →</a>:<span>SIGUIENTE →</span>}
      {memberPage<memberPages?<a href={memberLink(memberPages)}>ÚLTIMA »</a>:<span>ÚLTIMA »</span>}
    </nav>}

    <section id="comunidad-participacion" className={styles.sectionHead}><div><span>PARTICIPACIÓN</span><h2>Participación reciente</h2></div></section>
    {(activityType||activitySearch)&&<p className={styles.communityFilterNotice}>FILTROS DE PARTICIPACIÓN ACTIVOS · {actionCount??0} coincidencias. <a href={clearActivitiesLink()}>Ver todas las actividades →</a></p>}
    <form method="GET" className={styles.communityMemberFilters} aria-label="Filtrar actividades de participación">
      {memberPage>1&&<input type="hidden" name="memberPage" value={memberPage}/> }
      {memberStatus&&<input type="hidden" name="memberStatus" value={memberStatus}/>}
      {memberTier&&<input type="hidden" name="memberTier" value={memberTier}/>}
      {memberSearch&&<input type="hidden" name="memberSearch" value={memberSearch}/>}
      <label>Buscar actividad<input name="activitySearch" maxLength={80} defaultValue={activitySearch} placeholder="Descripción o fuente"/></label>
      <label>Tipo de actividad<select name="activityType" defaultValue={activityType}>
        <option value="">Todos los tipos</option>
        {["share","referral","comment","event","survey","beta_signup","beta_feedback","purchase","community_join","other"].map(v=><option key={v} value={v}>{actionLabel(v)}</option>)}
      </select></label>
      <button type="submit">FILTRAR →</button>
      <a href={clearActivitiesLink()}>LIMPIAR</a>
      <span className={styles.communityMemberFilterCount}>{actionCount??0} actividades coincidentes</span>
    </form>
    <section className={styles.grid}>
      {actionRows.map((a:any)=>{const correctedHere=actionRows.some((c:any)=>c.correction_of===a.id);const isCorrection=Boolean(a.correction_of);return <article key={a.id} className={`${styles.card} ${a.points_delta<0?styles.cardWarning:""}`}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{isCorrection?"CORRECCIÓN":correctedHere?"ORIGINAL CORREGIDO":actionLabel(a.action_type)}</span><em>{a.points_delta>=0?"+":""}{a.points_delta}</em></div>
        <h3>{memberRows.find(m=>m.id===a.member_id)?.display_name||memberRows.find(m=>m.id===a.member_id)?.handle||"Miembro"}</h3>
        <p>{a.description||a.source||"Actividad registrada"}<br/>{new Date(a.occurred_at).toLocaleString("es-US")}</p>
        {isCorrection&&<p>Vinculada a actividad original: <code>{String(a.correction_of).slice(0,8)}…</code></p>}
        {correctedHere&&<p>Existe una corrección vinculada a esta actividad.</p>}
        {!isCorrection&&Number(a.points_delta)!==0&&<p><a href={`?correctionId=${encodeURIComponent(a.id)}#comunidad-corregir-actividad`}>REVISAR PARA CORRECCIÓN →</a></p>}
      </article>})}
      {!actionRows.length&&<article className={styles.card}><h3>{activityError?"Error de consulta":activityType||activitySearch?"Sin coincidencias":"Sin actividad registrada todavía"}</h3><p>{activityError?"No fue posible consultar las actividades.":activityType||activitySearch?"No existen actividades que coincidan con estos filtros.":"Compartidos, referidos, opiniones beta y otras acciones podrán registrarse aquí."}</p></article>}
    </section>

    {actionPages>1&&<nav className={styles.communityActivityPages} aria-label="Páginas de actividades">
      {activityPage>1?<a href={activityLink(activityPage-1)}>← ANTERIOR</a>:<span>← ANTERIOR</span>}
      <strong>Página {activityPage} de {actionPages}</strong>
      {activityPage<actionPages?<a href={activityLink(activityPage+1)}>SIGUIENTE →</a>:<span>SIGUIENTE →</span>}
    </nav>}
    {["admin","editor","marketing"].includes(profile.role)&&<details id="comunidad-gestion" className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar miembros y participación manualmente.</p>
      <nav className={styles.communityManagementNav} aria-label="Accesos a formularios de gestión">
        <a href="#comunidad-registrar-miembro">REGISTRAR MIEMBRO</a>
        <a href="#comunidad-registrar-actividad">REGISTRAR ACTIVIDAD</a>
        <a href="#comunidad-corregir-actividad">CORREGIR PUNTOS</a>
        <a href="#comunidad-actualizar-miembro">ACTUALIZAR MIEMBRO</a>
      </nav>
      <section className={styles.adminForms}>
      <MasterActionForm action={createMember} className={styles.adminForm} successText="Miembro registrado correctamente.">
        <div id="comunidad-registrar-miembro" className={styles.formTitle}><span>NUEVO MIEMBRO</span><h2>Registrar comunidad</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="display_name" maxLength={120}/></label>
          <label>Correo<input type="email" name="email" maxLength={254}/></label>
          <label>Usuario<input name="handle" maxLength={80}/></label>
          <label>Fuente<input name="source" maxLength={200} placeholder="LiryBoost / Discord / web"/></label>
          <label>Nivel<select name="tier" defaultValue="member"><option value="member">Miembro</option><option value="engaged">Participativo</option><option value="advocate">Promotor</option><option value="beta_priority">Prioridad beta</option><option value="moderator">Moderador</option></select></label>
        </div>
        <MasterSubmitButton className={styles.formButton} pendingText="Registrando miembro…">Registrar miembro</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={addAction} className={styles.adminForm} successText="Participación registrada correctamente.">
        <div id="comunidad-registrar-actividad" className={styles.formTitle}><span>NUEVA ACTIVIDAD</span><h2>Registrar participación</h2></div>
        <div className={styles.formGrid}>
          <CommunityPointsPreview members={memberRows.map(m=>({id:m.id,name:m.display_name||m.handle||m.email||"Miembro",points:Number(m.points||0),status:m.status}))}/>
          <label>Tipo<select name="action_type" defaultValue="share"><option value="share">Compartido</option><option value="referral">Referido</option><option value="comment">Comentario</option><option value="event">Evento</option><option value="survey">Encuesta</option><option value="beta_signup">Registro beta</option><option value="beta_feedback">Opinión beta</option><option value="purchase">Compra</option><option value="community_join">Ingreso a comunidad</option><option value="other">Otro</option></select></label>
          
          <label>Fuente<input name="source" maxLength={200}/></label>
          <label className={styles.span2}>Descripción y motivo del ajuste<textarea name="description" rows={3} maxLength={3000} placeholder="Para descontar puntos, explica el motivo con al menos 10 caracteres."/></label>
          <p className={styles.advancedHint}>Los descuentos manuales nunca dejan el saldo negativo: si solicitas descontar más puntos de los disponibles, se aplicará únicamente el saldo existente. Para anular una actividad anterior utiliza CORREGIR PUNTOS; allí la reversión debe ser exacta o se rechaza.</p>
        </div>
        <MasterSubmitButton className={styles.formButton} pendingText="Registrando actividad…" confirmText="¿Confirmas que deseas registrar esta actividad y modificar los puntos del miembro?" disabled={!memberRows.length} disabledReason="Primero registra un miembro para poder añadir participación.">Registrar actividad</MasterSubmitButton>
      </MasterActionForm>
      </section>
      <section className={`${styles.adminForms} ${styles.adminFormsSingle}`}>
        <form method="GET" action="/admin/master/community#comunidad-corregir-actividad" className={styles.communityMemberFilters}>
                <label>Buscar actividad antigua por identificador
                  <input name="correctionId" defaultValue={correctionId} maxLength={36} placeholder="Identificador UUID completo"/>
                </label>
                <button type="submit">BUSCAR ACTIVIDAD →</button>
              </form>
        <MasterActionForm action={compensateAction} className={styles.adminForm} successText="Corrección registrada en el historial.">
          <div id="comunidad-corregir-actividad" className={styles.formTitle}><span>CORRECCIÓN AUDITABLE</span><h2>Corregir puntos de una actividad</h2></div>
          <p className={styles.advancedHint}>La actividad original se conserva. Se añade un movimiento contrario por el mismo importe; cada actividad puede corregirse una sola vez. Para corregir actividades antiguas, encuéntralas en Participación.</p>
          <p className={styles.advancedHint}>La lista de actividades muestra esta página de resultados. Si la actividad ya fue corregida en otra página, el servidor rechazará cualquier duplicado. No se modifica el registro original.</p>
          <div className={styles.formGrid}>
              {correctionId&&!validCorrectionId&&<p role="alert">Introduce un identificador UUID válido.</p>}
              {validCorrectionId&&locatedActionError&&<p role="alert">No fue posible consultar la actividad.</p>}
              {validCorrectionId&&!locatedAction&&!locatedActionError&&<p>No se encontró ninguna actividad con ese identificador.</p>}
              {locatedAction&&<p>Encontrada: {actionLabel(locatedAction.action_type)} · {locatedAction.points_delta} puntos · {new Date(locatedAction.occurred_at).toLocaleString("es-US")}. {canCorrectLocated?"Disponible para corrección.":"No disponible para corrección o ya corregida."}</p>}
            <label className={styles.span2}>Actividad original
              <select name="original_action_id" defaultValue={canCorrectLocated?locatedAction!.id:""} required>
                <option value="" disabled>Seleccionar actividad</option>
                {canCorrectLocated&&locatedAction&&<option value={locatedAction.id}>{new Date(locatedAction.occurred_at).toLocaleDateString("es-US")} · Actividad encontrada · {locatedAction.points_delta} puntos</option>}
                {actionRows.filter(a=>!a.correction_of&&Number(a.points_delta)!==0&&a.id!==locatedAction?.id&&!actionRows.some(c=>c.correction_of===a.id)).map((a:any)=><option key={a.id} value={a.id}>{new Date(a.occurred_at).toLocaleDateString("es-US")} · {memberRows.find(m=>m.id===a.member_id)?.display_name||"Miembro"} · {actionLabel(a.action_type)} · {Number(a.points_delta)>0?"+":""}{a.points_delta} puntos</option>)}
              </select>
            </label>
            <label className={styles.span2}>Motivo de la corrección
              <textarea name="correction_reason" minLength={10} maxLength={3000} required rows={3} placeholder="Explica el error y el motivo de esta corrección (mínimo 10 caracteres)."/>
            </label>
          </div>
          <MasterSubmitButton className={styles.formButton} pendingText="Aplicando corrección…" confirmText="¿Confirmas que deseas crear una corrección compensatoria permanente vinculada a esta actividad?" disabled={!canCorrectLocated&&!actionRows.some(a=>!a.correction_of&&Number(a.points_delta)!==0)} disabledReason="No hay actividades disponibles en esta página para corregir.">Registrar corrección</MasterSubmitButton>
        </MasterActionForm>
      </section>

      <section className={`${styles.adminForms} ${styles.adminFormsSingle}`}>
      <MasterActionForm action={updateMember} className={styles.adminForm} successText="Miembro actualizado correctamente.">
        <div id="comunidad-actualizar-miembro" className={styles.formTitle}><span>GESTIONAR MIEMBRO</span><h2>Actualizar comunidad</h2></div>
        <CommunityMemberEditFields members={memberRows.map(m=>({id:m.id,display_name:m.display_name,handle:m.handle,email:m.email,status:m.status,tier:m.tier,beta_priority:Boolean(m.beta_priority),points:Number(m.points||0),source:m.source,tags:m.tags,notes:m.notes}))}/>
        <MasterSubmitButton className={styles.formButton} pendingText="Guardando cambios…" confirmText="¿Confirmas que deseas actualizar los datos del miembro seleccionado?" disabled={!memberRows.length} disabledReason="No hay miembros registrados para actualizar.">Actualizar miembro</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>}

    <section className={styles.kpis}>
      <article><small>Contactos comerciales</small><strong>{(crmContacts||0).toLocaleString()}</strong><span>Seguimiento comercial separado</span></article>
      <article><small>Compartidos</small><strong>{(shareClicks||0).toLocaleString()}</strong><span>Analítica existente</span></article>
      <article><small>Acceso a datos</small><strong className={styles.kpiCompactValue}>PROTEGIDO</strong><span>Administración y marketing</span></article>
      <article><small>LiryBoost</small><strong className={styles.kpiCompactValue}>BASE LISTA</strong><span>Ranking preparado para conexión</span></article>
    </section>
  </main>;
}