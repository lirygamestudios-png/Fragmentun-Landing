import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterPartnersPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:products},
    {count:campaigns},
    {count:editions}
  ]=await Promise.all([
    supabase.from("shop_products").select("supplier,mode,payment_provider,active").limit(250),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("book_editions").select("*",{count:"exact",head:true})
  ]);

  const productRows=(products||[]) as any[];
  const suppliers=new Set(productRows.map(p=>p.supplier).filter(Boolean));
  const externalProducts=productRows.filter(p=>p.mode==="external").length;

  const items=[
    ["Partner Registry","READINESS","Registro maestro de partners aún no creado"],
    ["Suppliers detectados","ACTIVO",String(suppliers.size)+" proveedores referenciados en productos"],
    ["Distribución externa","ACTIVO",String(externalProducts)+" productos en modo external"],
    ["Ediciones","ACTIVO",String(editions||0)+" book editions"],
    ["Campañas","ACTIVO",String(campaigns||0)+" campañas configuradas"],
    ["Licensing pipeline","READINESS","Se añadirá pipeline comercial y rights matrix"],
    ["Deal Desk","READINESS","Aprobaciones y economics por acuerdo"],
    ["Renewals","READINESS","Calendario contractual y alertas pendientes"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PARTNERS</span><h1>Partners & Licensing</h1><p>Alianzas, distribución y licencias con separación entre datos existentes y readiness futura.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Suppliers</small><strong>{suppliers.size}</strong><span>Referenciados</span></article>
      <article><small>External products</small><strong>{externalProducts}</strong><span>Distribución externa</span></article>
      <article><small>Ediciones</small><strong>{(editions||0).toLocaleString()}</strong><span>Catálogo</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Activación comercial</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>ECOSYSTEM</span><h2>Readiness de alianzas</h2></div></section>
    <section className={styles.grid}>
      {items.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>PARTNERS</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
