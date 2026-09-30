import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";

export default async function AdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase.from("admin_profiles").select("display_name,role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[{count:leadCount},{count:eventCount},{count:bookCount},{count:questionCount}]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("test_questions").select("*",{count:"exact",head:true})
  ]);

  return <main className="adminShell">
    <aside className="sidebar">
      <div className="logo">FRAGMENTUN</div><p className="note">Control Center</p>
      <p className="note">{profile.display_name||user.email}<br/>{profile.role}</p>
      <nav>{["Dashboard","Contenido Web","Medios","La Saga","Personajes","Mapa de Lumen","Test Emocional","Comunidad","Reseñas","Marketing","Analytics","Usuarios"].map(x=><a key={x} href="#">{x}</a>)}</nav>
    </aside>
    <section className="adminMain">
      <div className="kicker">Control Center</div><h2 style={{marginTop:8}}>Dashboard</h2>
      <p className="lead">Backend conectado a Supabase. Las métricas aparecen cuando exista actividad real.</p>
      <div className="kpis">
        <div className="kpi"><span>Leads</span><strong>{leadCount??"—"}</strong></div>
        <div className="kpi"><span>Eventos</span><strong>{eventCount??"—"}</strong></div>
        <div className="kpi"><span>Libros</span><strong>{bookCount??"—"}</strong></div>
        <div className="kpi"><span>Preguntas</span><strong>{questionCount??"—"}</strong></div>
      </div>
      <div className="grid3" style={{marginTop:24}}>
        <div className="card"><h3>Contenido bilingüe</h3><p>Hero, autor y secciones ES/EN con modelo editorial real.</p></div>
        <div className="card"><h3>Universo</h3><p>Saga, territorios, puntos del mapa y test viven en la base de datos.</p></div>
        <div className="card"><h3>Conversión</h3><p>Leads, campañas y analytics ya tienen estructura protegida.</p></div>
      </div>
    </section>
  </main>;
}
