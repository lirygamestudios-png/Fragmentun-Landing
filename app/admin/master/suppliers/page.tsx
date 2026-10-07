import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterSuppliersPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {data:products},
    {data:fulfillments},
    {count:orders}
  ]=await Promise.all([
    supabase.from("shop_products").select("supplier,supplier_product_id,sku,name_es,mode,active").order("sort_order",{ascending:true}).limit(250),
    supabase.from("shop_fulfillments").select("supplier,shipment_status,label_cost_cents,created_at").order("created_at",{ascending:false}).limit(250),
    supabase.from("shop_orders").select("*",{count:"exact",head:true})
  ]);

  const productRows=(products||[]) as any[];
  const fulfillmentRows=(fulfillments||[]) as any[];
  const supplierNames=[...new Set([...productRows.map(p=>p.supplier),...fulfillmentRows.map(f=>f.supplier)].filter(Boolean))];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · PROVEEDORES</span><h1>Proveedores</h1><p>Base operativa para procurement, supplier management y fulfillment.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Proveedores detectados</small><strong>{supplierNames.length}</strong><span>Desde catálogo/fulfillment</span></article>
      <article><small>Productos</small><strong>{productRows.length}</strong><span>Con supplier metadata</span></article>
      <article><small>Fulfillments</small><strong>{fulfillmentRows.length}</strong><span>Historial disponible</span></article>
      <article><small>Órdenes</small><strong>{(orders||0).toLocaleString()}</strong><span>Demanda comercial</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>VENDOR BASE</span><h2>Proveedores referenciados</h2></div><p>El Vendor Master formal y scorecards se añadirán como capa dedicada.</p></section>
    <section className={styles.grid}>
      {supplierNames.map(name=><article key={String(name)} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>DETECTADO</span><em>SUPPLIER</em></div>
        <h3>{String(name)}</h3>
        <p>{productRows.filter(p=>p.supplier===name).length} productos · {fulfillmentRows.filter(f=>f.supplier===name).length} fulfillments</p>
      </article>)}
      {!supplierNames.length&&<article className={styles.card}><h3>Sin proveedores cargados</h3><p>La arquitectura está lista para que el Vendor Master se incorpore sin alterar comercio.</p></article>}
    </section>
  </main>;
}
