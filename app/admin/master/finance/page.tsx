import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";

function money(cents:number|null|undefined,currency="USD"){
  return new Intl.NumberFormat("en-US",{style:"currency",currency}).format((cents||0)/100);
}

function financeStatusLabel(value:string){
  const map:Record<string,string>={draft:"BORRADOR",pending:"PENDIENTE",posted:"REGISTRADA",reconciled:"RECONCILIADA",void:"ANULADA"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function transactionTypeLabel(value:string){
  const map:Record<string,string>={income:"INGRESO",expense:"GASTO",transfer:"TRANSFERENCIA",refund:"REEMBOLSO",fee:"COMISIÓN",adjustment:"AJUSTE",tax:"IMPUESTO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireFinanceEditor(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||!["admin","editor"].includes(profile.role)) throw new Error("forbidden");
  return {supabase,user,profile};
}

async function createFinanceAccount(formData:FormData){
  "use server";
  const {supabase,user,profile}=await requireFinanceEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const type=String(formData.get("account_type")||"other");
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const allowed=new Set(["asset","liability","equity","revenue","expense","cash","bank","processor","other"]);
  if(!code||!name||!allowed.has(type)) throw new Error("invalid_account");
  const{error}=await supabase.from("finance_accounts").insert({code,name,account_type:type,currency,created_by:user.id});
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/finance");
}

async function createFinanceTransaction(formData:FormData){
  "use server";
  const {supabase,user}=await requireFinanceEditor();
  const type=String(formData.get("transaction_type")||"expense");
  const status=String(formData.get("status")||"posted");
  const accountRaw=String(formData.get("account_id")||"").trim();
  const accountId=accountRaw||null;
  const description=String(formData.get("description")||"").trim();
  const category=String(formData.get("category")||"").trim()||null;
  const counterparty=String(formData.get("counterparty")||"").trim()||null;
  const amount=Number(formData.get("amount")||0);
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const date=String(formData.get("transaction_date")||"").trim()||new Date().toISOString().slice(0,10);
  const sourceType=String(formData.get("source_type")||"").trim()||null;
  const sourceId=String(formData.get("source_id")||"").trim()||null;
  const allowedType=new Set(["income","expense","transfer","refund","fee","adjustment","tax"]);
  const allowedStatus=new Set(["draft","pending","posted","reconciled","void"]);
  if(!description||!allowedType.has(type)||!allowedStatus.has(status)||!Number.isFinite(amount)) throw new Error("invalid_transaction");
  const amountCents=Math.round(amount*100);
  const signedAmount=["expense","refund","fee","tax"].includes(type)?-Math.abs(amountCents):Math.abs(amountCents);
  const{error}=await supabase.from("finance_transactions").insert({
    transaction_date:date,transaction_type:type,status,account_id:accountId,counterparty,category,description,
    amount_cents:signedAmount,currency,source_type:sourceType,source_id:sourceId,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/finance");
}


async function updateFinanceAccount(formData:FormData){
  "use server";
  const {supabase,profile}=await requireFinanceEditor();
  if(profile.role!=="admin") throw new Error("admin_required");
  const id=String(formData.get("account_id")||"").trim();
  const active=String(formData.get("active")||"true")==="true";
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  if(!id) throw new Error("account_required");
  const{error}=await supabase.from("finance_accounts").update({
    active,currency,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/finance");
}

async function updateFinanceTransaction(formData:FormData){
  "use server";
  const {supabase}=await requireFinanceEditor();
  const id=String(formData.get("transaction_id")||"").trim();
  const status=String(formData.get("status")||"pending");
  const accountRaw=String(formData.get("account_id")||"").trim();
  const accountId=accountRaw||null;
  const category=String(formData.get("category")||"").trim()||null;
  const counterparty=String(formData.get("counterparty")||"").trim()||null;
  const description=String(formData.get("description")||"").trim()||null;
  const externalReference=String(formData.get("external_reference")||"").trim()||null;
  const allowedStatus=new Set(["draft","pending","posted","reconciled","void"]);
  if(!id||!allowedStatus.has(status)) throw new Error("invalid_transaction_update");
  const patch:any={
    status,account_id:accountId,category,counterparty,external_reference:externalReference,updated_at:new Date().toISOString()
  };
  if(description) patch.description=description;
  patch.reconciled_at=status==="reconciled"?new Date().toISOString():null;
  const{error}=await supabase.from("finance_transactions").update(patch).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/finance");
}

export default async function MasterFinancePage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:orders},
    {data:commerce},
    {count:products},
    {count:fulfilled},
    {data:accounts},
    {data:transactions}
  ]=await Promise.all([
    supabase.from("shop_orders").select("total_cents,payment_fee_cents,supplier_cost_cents,shipping_cost_cents,margin_cents,currency,payment_status,fulfillment_status,created_at").order("created_at",{ascending:false}).limit(500),
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,default_payment_provider,tax_mode,tax_registration_status").eq("id","default").maybeSingle(),
    supabase.from("shop_products").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("fulfillment_status","fulfilled"),
    supabase.from("finance_accounts").select("id,code,name,account_type,currency,active").order("name",{ascending:true}),
    supabase.from("finance_transactions").select("id,transaction_date,transaction_type,status,account_id,counterparty,category,description,amount_cents,currency,source_type,source_id,external_reference,reconciled_at,created_at").order("transaction_date",{ascending:false}).limit(250)
  ]);

  const rows=(orders||[]) as any[];
  const paid=rows.filter(o=>o.payment_status==="paid");
  const revenue=paid.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const fees=paid.reduce((a,o)=>a+Number(o.payment_fee_cents||0),0);
  const supplier=paid.reduce((a,o)=>a+Number(o.supplier_cost_cents||0),0);
  const shipping=paid.reduce((a,o)=>a+Number(o.shipping_cost_cents||0),0);
  const margin=paid.reduce((a,o)=>a+Number(o.margin_cents||0),0);
  const currency=paid[0]?.currency||"USD";
  const accountRows=(accounts||[]) as any[];
  const txRows=(transactions||[]) as any[];
  const posted=txRows.filter(t=>t.status==="posted"||t.status==="reconciled");
  const ledgerNet=posted.reduce((a,t)=>a+Number(t.amount_cents||0),0);
  const reconciled=txRows.filter(t=>t.status==="reconciled").length;

  const readiness=[
    {name:"Pedidos",value:rows.length>0?"Operativo":"Sin ventas aún",detail:"Ventas registradas"},
    {name:"Productos activos",value:String(products||0),detail:"Catálogo activo"},
    {name:"Pagos",value:commerce?.default_payment_provider||"auto",detail:(commerce?.stripe_enabled||commerce?.paypal_enabled)?"Proveedor habilitable":"Aún no habilitado"},
    {name:"Impuestos",value:commerce?.tax_registration_status||"not_configured",detail:commerce?.tax_mode||"manual"},
    {name:"Registro contable",value:"Operativo",detail:"Cuentas y movimientos"},
    {name:"Reconciliación",value:"Preparada",detail:"Pedidos + costes + comisiones + margen"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · FINANZAS</span><h1>Finanzas</h1><p>Control de ingresos, gastos, cuentas y movimientos conectado a la operación comercial.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Ingresos pagados</small><strong>{money(revenue,currency)}</strong><span>{paid.length} órdenes pagadas</span></article>
      <article><small>Margen registrado</small><strong>{money(margin,currency)}</strong><span>Después de costes modelados</span></article>
      <article><small>Comisiones de pago</small><strong>{money(fees,currency)}</strong><span>Coste de procesamiento</span></article>
      <article><small>Órdenes completadas</small><strong>{(fulfilled||0).toLocaleString()}</strong><span>Órdenes completadas</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>ESTADO FINANCIERO</span><h2>Estado financiero-operativo</h2></div>
      <p>El sistema puede registrar ingresos, comisiones, costes de proveedor, envíos y margen, además de cuentas y movimientos financieros.</p>
    </section>

    <section className={styles.grid}>
      {readiness.map(item=><article key={item.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONTROL</span><em>FINANZAS</em></div>
        <h3>{item.name}</h3>
        <p><strong>{item.value}</strong><br/>{item.detail}</p>
      </article>)}
    </section>


    <section className={styles.sectionHead}>
      <div><span>REGISTRO FINANCIERO</span><h2>Cuentas y movimientos</h2></div>
      <p>El registro financiero es independiente de las órdenes comerciales. Los valores permanecen en cero hasta que existan movimientos reales.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Cuentas</small><strong>{accountRows.length}</strong><span>Cuentas registradas</span></article>
      <article><small>Transacciones</small><strong>{txRows.length}</strong><span>Movimientos registrados</span></article>
      <article><small>Balance registrado</small><strong>{money(ledgerNet,txRows[0]?.currency||"USD")}</strong><span>Registradas + reconciliadas</span></article>
      <article><small>Reconciliadas</small><strong>{reconciled}</strong><span>Control de cierre</span></article>
    </section>

    <section className={styles.grid}>
      {txRows.slice(0,12).map((t:any)=><article key={t.id} className={styles.card}>
        <div className={styles.cardTop}><span className={t.status==="reconciled"?styles.badgeActive:styles.badgePlanned}>{financeStatusLabel(t.status)}</span><em>{transactionTypeLabel(t.transaction_type)}</em></div>
        <h3>{t.description}</h3>
        <p>{money(t.amount_cents,t.currency||"USD")} · {t.transaction_date}<br/>{[t.category,t.counterparty].filter(Boolean).join(" · ")||"Sin categoría/contraparte"}</p>
      </article>)}
      {!txRows.length&&<article className={styles.card}><h3>Registro vacío</h3><p>No se han registrado movimientos financieros todavía.</p></article>}
    </section>

    {["admin","editor"].includes(profile.role)&&<details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      {profile.role==="admin"&&<form action={createFinanceAccount} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA CUENTA</span><h2>Registrar cuenta financiera</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="bank-main"/></label>
          <label>Nombre<input name="name" required placeholder="Cuenta bancaria principal"/></label>
          <label>Tipo<select name="account_type" defaultValue="bank">
            <option value="asset">Activo</option><option value="liability">Pasivo</option><option value="equity">Patrimonio</option>
            <option value="revenue">Ingresos</option><option value="expense">Gasto</option><option value="cash">Efectivo</option>
            <option value="bank">Banco</option><option value="processor">Procesador de pagos</option><option value="other">Otro</option>
          </select></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar cuenta</MasterSubmitButton>
      </form>}

      <form action={createFinanceTransaction} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA TRANSACCIÓN</span><h2>Registrar movimiento</h2></div>
        <div className={styles.formGrid}>
          <label>Fecha<input type="date" name="transaction_date"/></label>
          <label>Tipo<select name="transaction_type" defaultValue="expense">
            <option value="income">Ingreso</option><option value="expense">Gasto</option><option value="transfer">Transferencia</option>
            <option value="refund">Reembolso</option><option value="fee">Comisión</option><option value="adjustment">Ajuste</option><option value="tax">Impuesto</option>
          </select></label>
          <label>Estado<select name="status" defaultValue="posted">
            <option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="posted">Registrada</option>
            <option value="reconciled">Reconciliada</option><option value="void">Anulada</option>
          </select></label>
          <label>Cuenta<select name="account_id" defaultValue="">
            <option value="">Sin cuenta</option>{accountRows.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
          <label>Monto<input type="number" name="amount" step="0.01" required placeholder="0.00"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label>Categoría<input name="category" placeholder="Software / Marketing / Ingresos"/></label>
          <label>Contraparte<input name="counterparty" placeholder="Proveedor o cliente"/></label>
          <label className={styles.span2}>Descripción<input name="description" required placeholder="Descripción del movimiento"/></label>
          <label>Fuente<input name="source_type" placeholder="Pedido / factura / manual"/></label>
          <label>ID fuente<input name="source_id" placeholder="Referencia interna"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar movimiento</MasterSubmitButton>
      </form>
    </section>

    <section className={styles.adminForms}>
      {profile.role==="admin"&&<form action={updateFinanceAccount} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR CUENTA</span><h2>Actualizar cuenta financiera</h2></div>
        <div className={styles.formGrid}>
          <label>Cuenta<select name="account_id" required defaultValue=""><option value="" disabled>Seleccionar cuenta</option>{accountRows.map((a:any)=><option key={a.id} value={a.id}>{a.code} · {a.name}</option>)}</select></label>
          <label>Activa<select name="active" defaultValue="true"><option value="true">Sí</option><option value="false">No</option></select></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!accountRows.length} disabledReason="No hay cuentas financieras registradas para actualizar.">Actualizar cuenta</MasterSubmitButton>
      </form>}

      <form action={updateFinanceTransaction} className={styles.adminForm}>
        <div className={styles.formTitle}><span>GESTIONAR MOVIMIENTO</span><h2>Actualizar transacción</h2></div>
        <div className={styles.formGrid}>
          <label>Transacción<select name="transaction_id" required defaultValue=""><option value="" disabled>Seleccionar movimiento</option>{txRows.map((t:any)=><option key={t.id} value={t.id}>{t.transaction_date} · {t.description}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="pending"><option value="draft">Borrador</option><option value="pending">Pendiente</option><option value="posted">Registrada</option><option value="reconciled">Reconciliada</option><option value="void">Anulada</option></select></label>
          <label>Cuenta<select name="account_id" defaultValue=""><option value="">Sin cuenta</option>{accountRows.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label>Categoría<input name="category"/></label>
          <label>Persona o empresa relacionada<input name="counterparty"/></label>
          <label>Referencia externa opcional<input name="external_reference"/></label>
          <label className={styles.span2}>Descripción<input name="description"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!txRows.length} disabledReason="No hay movimientos financieros registrados para actualizar.">Actualizar movimiento</MasterSubmitButton>
      </form>
    </section></details>}

    <section className={styles.sectionHead}>
      <div><span>ECONOMÍA COMERCIAL</span><h2>Costes modelados</h2></div>
      <p>Estas cifras permanecen en cero hasta que existan ventas reales; no se simulan resultados.</p>
    </section>

    <section className={styles.kpis}>
      <article><small>Proveedor</small><strong>{money(supplier,currency)}</strong><span>Costes de proveedor</span></article>
      <article><small>Envíos</small><strong>{money(shipping,currency)}</strong><span>Costes de envío</span></article>
      <article><small>Comisiones</small><strong>{money(fees,currency)}</strong><span>Costes de procesamiento de pago</span></article>
      <article><small>Margen</small><strong>{money(margin,currency)}</strong><span>Margen registrado</span></article>
    </section>
  </main>;
}
