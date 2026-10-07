import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterOperationsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:leads},
    {count:media},
    {count:books},
    {count:characters},
    {data:latestLead},
    {data:latestEvent}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("leads").select("created_at,email").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    supabase.from("analytics_events").select("created_at,event_name").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);

  const checks=[
    {name:"Landing FRAGMENTUN",status:"Protegida",detail:"main · baseline 8eb878e"},
    {name:"Master Admin",status:"Preview",detail:"work/master-admin-implementation"},
    {name:"Supabase",status:"Conectado",detail:"Auth + datos operativos"},
    {name:"Analytics",status:latestEvent?"Activo":"Pendiente",detail:latestEvent?("Último: "+latestEvent.event_name):"Sin eventos"},
    {name:"Leads",status:latestLead?"Activo":"Pendiente",detail:latestLead?"Último registro disponible":"Sin leads"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · OPERACIONES</span><h1>Estado Operativo</h1><p>Control inicial de activos, datos y continuidad del ecosistema.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>
    <section className={styles.kpis}>
      <article><small>Leads</small><strong>{(leads||0).toLocaleString()}</strong><span>Base actual</span></article>
      <article><small>Media Assets</small><strong>{(media||0).toLocaleString()}</strong><span>Biblioteca</span></article>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Catálogo</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Universo IP</span></article>
    </section>
    <section className={styles.sectionHead}><div><span>CONTROL OPERATIVO</span><h2>Estado del sistema</h2></div><p>Primera capa de monitoreo del Master Admin.</p></section>
    <section className={styles.grid}>
      {checks.map(c=><article key={c.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{c.status.toUpperCase()}</span><em>OPERACIÓN</em></div>
        <h3>{c.name}</h3><p>{c.detail}</p>
      </article>)}
    </section>
  </main>;
}
