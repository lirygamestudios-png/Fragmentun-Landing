import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

async function requireCapitalAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createInvestor(formData:FormData){
  "use server";
  const {supabase,user}=await requireCapitalAdmin();
  const name=String(formData.get("name")||"").trim();
  const organization=String(formData.get("organization")||"").trim()||null;
  const email=String(formData.get("email")||"").trim()||null;
  const investorType=String(formData.get("investor_type")||"other");
  const priority=String(formData.get("priority")||"medium");
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedType=new Set(["angel","family_office","vc","strategic","publisher","grant","lender","other"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!name||!allowedType.has(investorType)||!allowedPriority.has(priority)) throw new Error("invalid_investor");
  const{error}=await supabase.from("investor_contacts").insert({
    name,organization,email,investor_type:investorType,priority,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/capital");
}

async function createOpportunity(formData:FormData){
  "use server";
  const {supabase,user}=await requireCapitalAdmin();
  const investorRaw=String(formData.get("investor_id")||"").trim();
  const investorId=investorRaw||null;
  const name=String(formData.get("name")||"").trim();
  const type=String(formData.get("opportunity_type")||"equity");
  const target=Number(formData.get("target_amount")||0);
  const committed=Number(formData.get("committed_amount")||0);
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const probability=Math.max(0,Math.min(100,Number(formData.get("probability")||0)));
  const expectedClose=String(formData.get("expected_close_date")||"").trim()||null;
  const nextAction=String(formData.get("next_action")||"").trim()||null;
  const allowedType=new Set(["equity","strategic","publishing","grant","debt","licensing","other"]);
  if(!name||!allowedType.has(type)||!Number.isFinite(target)||!Number.isFinite(committed)||!Number.isFinite(probability)) throw new Error("invalid_opportunity");
  const{error}=await supabase.from("fundraising_opportunities").insert({
    investor_id:investorId,name,opportunity_type:type,target_amount_cents:Math.max(0,Math.round(target*100)),
    committed_amount_cents:Math.max(0,Math.round(committed*100)),currency,probability,
    expected_close_date:expectedClose,next_action:nextAction,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/capital");
}


async function updateInvestor(formData:FormData){
  "use server";
  const {supabase}=await requireCapitalAdmin();
  const id=String(formData.get("investor_id")||"").trim();
  const status=String(formData.get("status")||"prospect");
  const stage=String(formData.get("stage")||"research");
  const priority=String(formData.get("priority")||"medium");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const nextActionAt=String(formData.get("next_action_at")||"").trim()||null;
  const lastContactAt=String(formData.get("last_contact_at")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStatus=new Set(["prospect","contacted","engaged","diligence","committed","passed","inactive"]);
  const allowedStage=new Set(["research","intro","meeting","follow_up","materials_sent","diligence","term_discussion","closed"]);
  const allowedPriority=new Set(["low","medium","high","critical"]);
  if(!id||!allowedStatus.has(status)||!allowedStage.has(stage)||!allowedPriority.has(priority)) throw new Error("invalid_investor_update");
  const{error}=await supabase.from("investor_contacts").update({
    status,stage,priority,owner_user_id:ownerUserId,next_action_at:nextActionAt,last_contact_at:lastContactAt,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/capital");
}

async function updateOpportunity(formData:FormData){
  "use server";
  const {supabase}=await requireCapitalAdmin();
  const id=String(formData.get("opportunity_id")||"").trim();
  const stage=String(formData.get("stage")||"prospect");
  const status=String(formData.get("status")||"open");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const probability=Math.max(0,Math.min(100,Number(formData.get("probability")||0)));
  const targetRaw=String(formData.get("target_amount")||"").trim();
  const committedRaw=String(formData.get("committed_amount")||"").trim();
  const target=targetRaw?Math.round(Number(targetRaw)*100):null;
  const committed=committedRaw?Math.round(Number(committedRaw)*100):null;
  const expectedClose=String(formData.get("expected_close_date")||"").trim()||null;
  const nextAction=String(formData.get("next_action")||"").trim()||null;
  const nextActionAt=String(formData.get("next_action_at")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedStage=new Set(["prospect","qualified","meeting","materials","diligence","term_sheet","negotiation","committed","closed_won","closed_lost"]);
  const allowedStatus=new Set(["open","on_hold","won","lost","canceled"]);
  if(!id||!allowedStage.has(stage)||!allowedStatus.has(status)||!Number.isFinite(probability)) throw new Error("invalid_opportunity_update");
  if([target,committed].some(v=>v!==null&&(!Number.isFinite(v)||v<0))) throw new Error("invalid_amount");
  const patch:any={
    stage,status,owner_user_id:ownerUserId,probability,expected_close_date:expectedClose,
    next_action:nextAction,next_action_at:nextActionAt,notes,updated_at:new Date().toISOString()
  };
  if(target!==null) patch.target_amount_cents=target;
  if(committed!==null) patch.committed_amount_cents=committed;
  const{error}=await supabase.from("fundraising_opportunities").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/capital");
}

export default async function MasterCapitalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[
    {data:investors},
    {data:opportunities},
    {count:paidOrders},
    {data:orders},
    {data:owners}
  ]=await Promise.all([
    supabase.from("investor_contacts").select("id,name,organization,email,investor_type,status,stage,priority,owner_user_id,next_action_at,last_contact_at,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("fundraising_opportunities").select("id,investor_id,name,opportunity_type,stage,status,target_amount_cents,committed_amount_cents,currency,probability,expected_close_date,owner_user_id,next_action,next_action_at,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid"),
    supabase.from("shop_orders").select("total_cents,currency,payment_status").eq("payment_status","paid").limit(500),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const investorRows=(investors||[]) as any[];
  const opportunityRows=(opportunities||[]) as any[];
  const paidRows=(orders||[]) as any[];
  const commercialRevenue=paidRows.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const revenueCurrency=paidRows[0]?.currency||"USD";
  const open=opportunityRows.filter(o=>o.status==="open"||o.status==="on_hold");
  const pipelineValue=open.reduce((a,o)=>a+Number(o.target_amount_cents||0),0);
  const committedValue=opportunityRows.reduce((a,o)=>a+Number(o.committed_amount_cents||0),0);
  const weighted=open.reduce((a,o)=>a+Math.round(Number(o.target_amount_cents||0)*(Number(o.probability||0)/100)),0);
  const pipelineCurrency=open[0]?.currency||opportunityRows[0]?.currency||"USD";
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · CAPITAL</span><h1>Capital e Inversionistas</h1><p>Seguimiento de inversionistas y oportunidades de capital. La estructura societaria permanece separada de este registro.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Inversionistas</small><strong>{investorRows.length}</strong><span>Contactos registrados</span></article>
      <article><small>Oportunidades abiertas</small><strong>{money(pipelineValue,pipelineCurrency)}</strong><span>{open.length} oportunidades abiertas</span></article>
      <article><small>Valor estimado</small><strong>{money(weighted,pipelineCurrency)}</strong><span>Probabilidad aplicada</span></article>
      <article><small>Capital comprometido</small><strong>{money(committedValue,pipelineCurrency)}</strong><span>Solo compromisos registrados</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>INVERSIONISTAS</span><h2>Inversionistas</h2></div><p>Registro privado visible solo para administradores.</p></section>
    <section className={styles.grid}>
      {investorRows.map((i:any)=><article key={i.id} className={styles.card}>
        <div className={styles.cardTop}><span className={["engaged","diligence","committed"].includes(i.status)?styles.badgeActive:styles.badgePlanned}>{String(i.status).toUpperCase()}</span><em>{i.priority}</em></div>
        <h3>{i.name}</h3>
        <p>{i.organization||"Sin organización"} · {i.investor_type}<br/>Responsable: {ownerName(i.owner_user_id)}<br/>{i.email||"Email no registrado"}<br/>Etapa: {i.stage}</p>
      </article>)}
      {!investorRows.length&&<article className={styles.card}><h3>Registro de inversionistas preparado</h3><p>No se han cargado inversionistas todavía. No se importan contactos personales automáticamente.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CAPITAL</span><h2>Oportunidades</h2></div><p>Seguimiento por monto, probabilidad, etapa, fecha y próxima acción.</p></section>
    <section className={styles.grid}>
      {opportunityRows.map((o:any)=><article key={o.id} className={styles.card}>
        <div className={styles.cardTop}><span className={o.status==="won"?styles.badgeActive:styles.badgePlanned}>{String(o.stage).toUpperCase()}</span><em>{o.probability}%</em></div>
        <h3>{o.name}</h3>
        <p>{money(o.target_amount_cents,o.currency)} objetivo · {money(o.committed_amount_cents,o.currency)} comprometido<br/>Responsable: {ownerName(o.owner_user_id)}<br/>{o.expected_close_date||"Sin fecha"} · {o.next_action||"Próxima acción pendiente"}</p>
      </article>)}
      {!opportunityRows.length&&<article className={styles.card}><h3>Sin oportunidades registradas</h3><p>Las oportunidades reales de inversión, publicación, deuda, subvenciones o licencias se registrarán aquí.</p></article>}
    </section>

    <details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      <form action={createInvestor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO INVERSOR</span><h2>Registrar contacto</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Nombre"/></label>
          <label>Organización<input name="organization" placeholder="Firma / empresa"/></label>
          <label>Email<input type="email" name="email" placeholder="correo"/></label>
          <label>Tipo<select name="investor_type" defaultValue="other">
            <option value="angel">Inversionista ángel</option><option value="family_office">Oficina familiar</option><option value="vc">Capital de riesgo</option>
            <option value="strategic">Estratégico</option><option value="publisher">Editorial / publisher</option><option value="grant">Subvención</option>
            <option value="lender">Prestamista</option><option value="other">Otro</option>
          </select></label>
          <label>Prioridad<select name="priority" defaultValue="medium">
            <option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option>
          </select></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3} placeholder="Contexto interno"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar inversor</MasterSubmitButton>
      </form>

      <form action={createOpportunity} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA OPORTUNIDAD</span><h2>Registrar oportunidad de capital</h2></div>
        <div className={styles.formGrid}>
          <label>Inversor<select name="investor_id" defaultValue="">
            <option value="">Sin inversor asignado</option>
            {investorRows.map((i:any)=><option key={i.id} value={i.id}>{i.name}</option>)}
          </select></label>
          <label>Nombre<input name="name" required placeholder="Ronda inicial / acuerdo estratégico / publicación"/></label>
          <label>Tipo<select name="opportunity_type" defaultValue="equity">
            <option value="equity">Participación</option><option value="strategic">Estratégico</option><option value="publishing">Publicación</option>
            <option value="grant">Subvención</option><option value="debt">Deuda</option><option value="licensing">Licencias</option><option value="other">Otro</option>
          </select></label>
          <label>Monto objetivo<input type="number" min="0" step="0.01" name="target_amount" defaultValue="0"/></label>
          <label>Monto comprometido<input type="number" min="0" step="0.01" name="committed_amount" defaultValue="0"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Probabilidad %<input type="number" min="0" max="100" name="probability" defaultValue="0"/></label>
          <label>Fecha esperada<input type="date" name="expected_close_date"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action" placeholder="Enviar presentación / reunión / NDA / revisión"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar oportunidad</MasterSubmitButton>
      </form>
    </section>

    <section className={styles.adminForms}>
      <form action={updateInvestor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR INVERSOR</span><h2>Actualizar relación</h2></div>
        <div className={styles.formGrid}>
          <label>Inversor<select name="investor_id" required defaultValue=""><option value="" disabled>Seleccionar inversor</option>{investorRows.map((i:any)=><option key={i.id} value={i.id}>{i.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="engaged"><option value="prospect">Prospecto</option><option value="contacted">Contactado</option><option value="engaged">En conversación</option><option value="diligence">Revisión</option><option value="committed">Monto comprometido</option><option value="passed">Descartado</option><option value="inactive">Inactivo</option></select></label>
          <label>Etapa<select name="stage" defaultValue="meeting"><option value="research">Investigación</option><option value="intro">Presentación inicial</option><option value="meeting">Reunión</option><option value="follow_up">Seguimiento</option><option value="materials_sent">Material enviado</option><option value="diligence">Revisión</option><option value="term_discussion">Discusión de términos</option><option value="closed">Cerrado</option></select></label>
          <label>Prioridad<select name="priority" defaultValue="medium"><option value="low">Baja</option><option value="medium">Media</option><option value="high">Alta</option><option value="critical">Crítica</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha próxima acción<input type="datetime-local" name="next_action_at"/></label>
          <label>Último contacto<input type="datetime-local" name="last_contact_at"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!investorRows.length}>Actualizar inversor</MasterSubmitButton>
      </form>

      <form action={updateOpportunity} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR OPORTUNIDAD</span><h2>Actualizar oportunidad</h2></div>
        <div className={styles.formGrid}>
          <label>Oportunidad<select name="opportunity_id" required defaultValue=""><option value="" disabled>Seleccionar oportunidad</option>{opportunityRows.map((o:any)=><option key={o.id} value={o.id}>{o.name}</option>)}</select></label>
          <label>Etapa<select name="stage" defaultValue="qualified"><option value="prospect">Prospecto</option><option value="qualified">Calificada</option><option value="meeting">Reunión</option><option value="materials">Materiales</option><option value="diligence">Revisión</option><option value="term_sheet">Hoja de términos</option><option value="negotiation">Negociación</option><option value="committed">Monto comprometido</option><option value="closed_won">Cerrada ganada</option><option value="closed_lost">Cerrada perdida</option></select></label>
          <label>Estado<select name="status" defaultValue="open"><option value="open">Abierta</option><option value="on_hold">En pausa</option><option value="won">Ganada</option><option value="lost">Perdida</option><option value="canceled">Cancelada</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Probabilidad %<input type="number" min="0" max="100" name="probability"/></label>
          <label>Monto objetivo<input type="number" min="0" step="0.01" name="target_amount"/></label>
          <label>Monto comprometido<input type="number" min="0" step="0.01" name="committed_amount"/></label>
          <label>Fecha estimada de cierre<input type="date" name="expected_close_date"/></label>
          <label>Fecha próxima acción<input type="datetime-local" name="next_action_at"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!opportunityRows.length}>Actualizar oportunidad</MasterSubmitButton>
      </form>
    </section></details>

    <section className={styles.sectionHead}><div><span>EVIDENCIA COMERCIAL</span><h2>Ingresos observados</h2></div><p>Se muestra como evidencia comercial existente y permanece separado de la captación de capital.</p></section>
    <section className={styles.kpis}>
      <article><small>Ingresos pagados</small><strong>{money(commercialRevenue,revenueCurrency)}</strong><span>Ventas registradas</span></article>
      <article><small>Órdenes pagadas</small><strong>{(paidOrders||0).toLocaleString()}</strong><span>Comercio</span></article>
      <article><small>Estructura accionaria</small><strong>SEPARADA</strong><span>Separada del registro de inversionistas</span></article>
      <article><small>Acceso</small><strong>ADMINISTRADOR</strong><span>Acceso restringido</span></article>
    </section>
  </main>;
}
