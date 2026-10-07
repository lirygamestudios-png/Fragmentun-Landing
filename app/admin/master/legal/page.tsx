import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterLegalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:books},
    {count:media},
    {count:characters},
    {count:reviews}
  ]=await Promise.all([
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("reviews").select("*",{count:"exact",head:true})
  ]);

  const controls=[
    ["IP Register","READINESS","Registro maestro de IP aún no implementado como tabla dedicada"],
    ["Chain of Title","READINESS","Preparar trazabilidad contractual por obra, activo y colaborador"],
    ["Contratos","READINESS","CLM corporativo será una capa separada"],
    ["Derechos & Licencias","READINESS","Rights matrix pendiente de persistencia estructurada"],
    ["Assets de IP","ACTIVO",String(media||0)+" assets registrados"],
    ["Libros","ACTIVO",String(books||0)+" títulos en catálogo"],
    ["Personajes","ACTIVO",String(characters||0)+" personajes registrados"],
    ["Reviews","ACTIVO",String(reviews||0)+" registros"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · LEGAL & IP</span><h1>Legal & IP</h1><p>Readiness legal e inventario operativo inicial de activos intelectuales.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Catálogo IP</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Universo registrado</span></article>
      <article><small>Reviews</small><strong>{(reviews||0).toLocaleString()}</strong><span>Evidencia editorial</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>LEGAL OPERATIONS</span><h2>Estado de preparación</h2></div><p>No se presume que contratos o derechos estén digitalizados hasta crear su registro maestro.</p></section>
    <section className={styles.grid}>
      {controls.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>LEGAL</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
