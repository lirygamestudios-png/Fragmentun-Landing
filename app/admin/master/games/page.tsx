import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterGamesPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:books},
    {count:characters},
    {count:media}
  ]=await Promise.all([
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true})
  ]);

  const readiness=[
    ["Game Portfolio","READINESS","Registro maestro de videojuegos aún no persistido"],
    ["Production Milestones","READINESS","Preproduction → Vertical Slice → Alpha → Beta → Launch"],
    ["Builds","READINESS","Build registry y CI signals pendientes"],
    ["QA","READINESS","Bug/quality telemetry pendiente"],
    ["LiveOps","READINESS","Seasons, events y content calendar pendientes"],
    ["IP source material","ACTIVO",String(books||0)+" libros · "+String(characters||0)+" personajes"],
    ["Media assets","ACTIVO",String(media||0)+" assets reutilizables"]
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · JUEGOS</span><h1>Juegos & Operaciones</h1><p>Producción, QA, releases y LiveOps preparados para convertirse en registros operativos por título.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Game registry</small><strong>READINESS</strong><span>Próxima capa</span></article>
      <article><small>Source books</small><strong>{(books||0).toLocaleString()}</strong><span>IP base</span></article>
      <article><small>Characters</small><strong>{(characters||0).toLocaleString()}</strong><span>Worldbuilding</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets disponibles</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>GAME OPS</span><h2>Readiness de producción</h2></div><p>La Fase 57 se convertirá gradualmente en tablas de títulos, milestones, builds, bugs y LiveOps.</p></section>
    <section className={styles.grid}>
      {readiness.map(([name,state,detail])=><article key={name} className={styles.card}>
        <div className={styles.cardTop}><span className={state==="ACTIVO"?styles.badgeActive:styles.badgePlanned}>{state}</span><em>GAME OPS</em></div>
        <h3>{name}</h3><p>{detail}</p>
      </article>)}
    </section>
  </main>;
}
