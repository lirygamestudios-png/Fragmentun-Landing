import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

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
    {data:orders}
  ]=await Promise.all([
    supabase.from("investor_contacts").select("id,name,organization,email,investor_type,status,stage,priority,next_action_at,last_contact_at,created_at").order("created_at",{ascending:false}),
    supabase.from("fundraising_opportunities").select("id,investor_id,name,opportunity_type,stage,status,target_amount_cents,committed_amount_cents,currency,probability,expected_close_date,next_action,next_action_at,created_at").order("created_at",{ascending:false}),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid"),
    supabase.from("shop_orders").select("total_cents,currency,payment_status").eq("payment_status","paid").limit(500)
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

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · CAPITAL</span><h1>Capital & Investors</h1><p>Pipeline persistente de inversionistas y fundraising. Cap table y gobierno societario permanecen fuera de este CRM.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Investors</small><strong>{investorRows.length}</strong><span>Contactos registrados</span></article>
      <article><small>Pipeline</small><strong>{money(pipelineValue,pipelineCurrency)}</strong><span>{open.length} oportunidades abiertas</span></article>
      <article><small>Weighted pipeline</small><strong>{money(weighted,pipelineCurrency)}</strong><span>Probabilidad aplicada</span></article>
      <article><small>Committed</small><strong>{money(committedValue,pipelineCurrency)}</strong><span>Solo compromisos registrados</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>INVESTOR CRM</span><h2>Inversionistas</h2></div><p>Registro privado visible solo para administradores.</p></section>
    <section className={styles.grid}>
      {investorRows.map((i:any)=><article key={i.id} className={styles.card}>
        <div className={styles.cardTop}><span className={["engaged","diligence","committed"].includes(i.status)?styles.badgeActive:styles.badgePlanned}>{String(i.status).toUpperCase()}</span><em>{i.priority}</em></div>
        <h3>{i.name}</h3>
        <p>{i.organization||"Sin organización"} · {i.investor_type}<br/>{i.email||"Email no registrado"}<br/>Stage: {i.stage}</p>
      </article>)}
      {!investorRows.length&&<article className={styles.card}><h3>Investor CRM preparado</h3><p>No se han cargado inversionistas todavía. No se importan contactos personales automáticamente.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>FUNDRAISING</span><h2>Oportunidades</h2></div><p>Seguimiento por monto, probabilidad, stage, fecha y próxima acción.</p></section>
    <section className={styles.grid}>
      {opportunityRows.map((o:any)=><article key={o.id} className={styles.card}>
        <div className={styles.cardTop}><span className={o.status==="won"?styles.badgeActive:styles.badgePlanned}>{String(o.stage).toUpperCase()}</span><em>{o.probability}%</em></div>
        <h3>{o.name}</h3>
        <p>{money(o.target_amount_cents,o.currency)} target · {money(o.committed_amount_cents,o.currency)} committed<br/>{o.expected_close_date||"Sin fecha"} · {o.next_action||"Próxima acción pendiente"}</p>
      </article>)}
      {!opportunityRows.length&&<article className={styles.card}><h3>Pipeline vacío</h3><p>Las oportunidades reales de inversión, publishing, deuda, grants o licensing se registrarán aquí.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createInvestor} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO INVERSOR</span><h2>Registrar contacto</h2></div>
        <div className={styles.formGrid}>
          <label>Nombre<input name="name" required placeholder="Nombre"/></label>
          <label>Organización<input name="organization" placeholder="Firma / empresa"/></label>
          <label>Email<input type="email" name="email" placeholder="correo"/></label>
          <label>Tipo<select name="investor_type" defaultValue="other">
            <option value="angel">Angel</option><option value="family_office">Family Office</option><option value="vc">VC</option>
            <option value="strategic">Strategic</option><option value="publisher">Publisher</option><option value="grant">Grant</option>
            <option value="lender">Lender</option><option value="other">Other</option>
          </select></label>
          <label>Prioridad<select name="priority" defaultValue="medium">
            <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
          </select></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3} placeholder="Contexto interno"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar inversor</button>
      </form>

      <form action={createOpportunity} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA OPORTUNIDAD</span><h2>Registrar fundraising</h2></div>
        <div className={styles.formGrid}>
          <label>Inversor<select name="investor_id" defaultValue="">
            <option value="">Sin inversor asignado</option>
            {investorRows.map((i:any)=><option key={i.id} value={i.id}>{i.name}</option>)}
          </select></label>
          <label>Nombre<input name="name" required placeholder="Seed / Strategic / Publishing deal"/></label>
          <label>Tipo<select name="opportunity_type" defaultValue="equity">
            <option value="equity">Equity</option><option value="strategic">Strategic</option><option value="publishing">Publishing</option>
            <option value="grant">Grant</option><option value="debt">Debt</option><option value="licensing">Licensing</option><option value="other">Other</option>
          </select></label>
          <label>Target<input type="number" min="0" step="0.01" name="target_amount" defaultValue="0"/></label>
          <label>Committed<input type="number" min="0" step="0.01" name="committed_amount" defaultValue="0"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Probabilidad %<input type="number" min="0" max="100" name="probability" defaultValue="0"/></label>
          <label>Fecha esperada<input type="date" name="expected_close_date"/></label>
          <label className={styles.span2}>Próxima acción<input name="next_action" placeholder="Enviar deck / reunión / NDA / diligence"/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar oportunidad</button>
      </form>
    </section>

    <section className={styles.sectionHead}><div><span>EVIDENCIA COMERCIAL</span><h2>Revenue observado</h2></div><p>No se mezcla con fundraising; se muestra solo como evidencia comercial existente.</p></section>
    <section className={styles.kpis}>
      <article><small>Revenue pagado</small><strong>{money(commercialRevenue,revenueCurrency)}</strong><span>shop_orders</span></article>
      <article><small>Órdenes pagadas</small><strong>{(paidOrders||0).toLocaleString()}</strong><span>Comercio</span></article>
      <article><small>Cap table</small><strong>SEPARADA</strong><span>No almacenada en Investor CRM</span></article>
      <article><small>Acceso</small><strong>ADMIN</strong><span>RLS restringido</span></article>
    </section>
  </main>;
}
