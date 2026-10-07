import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterCapitalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:paidOrders},
    {data:orders}
  ]=await Promise.all([
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid"),
    supabase.from("shop_orders").select("total_cents,currency,payment_status").eq("payment_status","paid").limit(500)
  ]);
  const rows=(orders||[]) as any[];
  const revenue=rows.reduce((a,o)=>a+Number(o.total_cents||0),0);
  const currency=rows[0]?.currency||"USD";
  const money=new Intl.NumberFormat("en-US",{style:"currency",currency}).format(revenue/100);

  const items=[
    ["Investor CRM","READINESS","Registro de inversionistas aún no implementado"],
    ["Cap Table","READINESS","No se replica estructura societaria sin fuente maestra"],
    ["Fundraising pipeline","READINESS","Stages, diligence y data room pendientes"],
    ["Board governance","READINESS","Calendario y board packs pendientes"],
    ["Use of funds","READINESS","Presupuesto de capital pendiente de ledger financiero"],
    ["Revenue evidence","ACTIVO",money+" en órdenes pagadas registradas"],
    ["Paid orders","ACTIVO",String(paidOrders||0)+" órdenes"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · CAPITAL</span><h1>Capital & Investors</h1><p>Fundraising readiness, investor relations y gobierno de capital.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Revenue evidence</small><strong>{money}</strong><span>Órdenes pagadas</span></article>
      <article><small>Paid orders</small><strong>{(paidOrders||0).toLocaleString()}</strong><span>Historial comercial</span></article>
      <article><small>Investor CRM</small><strong>READINESS</strong><span>Próxima capa</span></article>
      <article><small>Data Room</small><strong>READINESS</strong><span>Gobierno pendiente</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>CAPITAL READINESS</span><h2>Estado de preparación</h2></div><p>El módulo no inventa cap table, valuaciones ni compromisos financieros.</p></section>
    <section className={styles.grid}>
      {items.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>CAPITAL</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
