import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterRiskPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:commerce},
    {count:products},
    {count:orders},
    {count:campaigns}
  ]=await Promise.all([
    supabase.from("commerce_settings").select("stripe_enabled,paypal_enabled,tax_registration_status,tax_mode").eq("id","default").maybeSingle(),
    supabase.from("shop_products").select("*",{count:"exact",head:true}),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true})
  ]);

  const risks=[
    {name:"Cambios directos a producción",level:"BAJO",control:"Baseline + rama de trabajo + Preview"},
    {name:"Supabase Preview env",level:"CONTROLADO",control:"Variables separadas por rama"},
    {name:"Pagos no activados",level:"BAJO",control:"Stripe/PayPal permanecen deshabilitados hasta aprobación"},
    {name:"Tax readiness",level:commerce?.tax_registration_status==="configured"?"BAJO":"ABIERTO",control:commerce?.tax_registration_status||"not_configured"},
    {name:"Catálogo comercial",level:(products||0)>0?"CONTROLADO":"ABIERTO",control:String(products||0)+" productos registrados"},
    {name:"Órdenes",level:(orders||0)>0?"OPERATIVO":"SIN EXPOSICIÓN",control:String(orders||0)+" órdenes"},
    {name:"Campañas",level:(campaigns||0)>0?"OPERATIVO":"BAJO",control:String(campaigns||0)+" campañas"},
    {name:"Vulnerabilidad npm alta",level:"ABIERTO",control:"Resolver antes de cualquier futura promoción"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · RIESGOS</span><h1>Riesgos & Controles</h1><p>Registro inicial de riesgos técnicos y operativos derivados de la implementación actual.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Riesgos mapeados</small><strong>{risks.length}</strong><span>Primera capa</span></article>
      <article><small>Abiertos</small><strong>{risks.filter(r=>r.level==="ABIERTO").length}</strong><span>Requieren acción</span></article>
      <article><small>Producción</small><strong>PROTEGIDA</strong><span>Sin cambios directos</span></article>
      <article><small>Pagos</small><strong>{(commerce?.stripe_enabled||commerce?.paypal_enabled)?"ACTIVOS":"OFF"}</strong><span>Control comercial</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>RISK REGISTER</span><h2>Excepciones actuales</h2></div><p>Este módulo evolucionará hacia el registro ERM completo de la Fase 46.</p></section>
    <section className={styles.grid}>
      {risks.map(r=><article key={r.name} className={styles.card}>
        <div className={styles.cardTop}><span className={r.level==="ABIERTO"?styles.badgePlanned:styles.badgeActive}>{r.level}</span><em>CONTROL</em></div>
        <h3>{r.name}</h3><p>{r.control}</p>
      </article>)}
    </section>
  </main>;
}
