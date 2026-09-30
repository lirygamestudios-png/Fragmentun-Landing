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

  const nav=[
    ["Dashboard","/admin"],
    ["Contenido Web","/admin/contenido"],
    ["Medios","/admin/medios"],
    ["La Saga","/admin/saga"],
    ["Mapa de Lumen","/admin/mapa"],
    ["Test Emocional","/admin/test"],
    ["Reseñas","/admin/resenas"],
    ["Marketing","/admin/marketing"],
    ["Analytics","/admin/analytics"],
    ["Usuarios","/admin/usuarios"]
  ] as const;

  return <main className="adminShell">
    <aside className="sidebar">
      <div className="logo">FRAGMENTUN</div>
      <p className="note">Control Center</p>
      <p className="note">{profile.display_name||user.email}<br/>{profile.role}</p>

      <nav>
        {nav.map(([label,href])=><a key={href} href={href}>{label}</a>)}
      </nav>

      <div style={{marginTop:22}}>
        <a className="btn btnGhost" href="/es" target="_blank" rel="noreferrer">Ver sitio</a>
      </div>
    </aside>

    <section className="adminMain">
      <div className="kicker">Control Center</div>
      <h2 style={{marginTop:8}}>Dashboard</h2>
      <p className="lead">Backend conectado a Supabase. Las métricas aparecen cuando exista actividad real.</p>

      <div className="kpis">
        <div className="kpi"><span>Leads</span><strong>{leadCount??"—"}</strong></div>
        <div className="kpi"><span>Eventos</span><strong>{eventCount??"—"}</strong></div>
        <div className="kpi"><span>Libros</span><strong>{bookCount??"—"}</strong></div>
        <div className="kpi"><span>Preguntas</span><strong>{questionCount??"—"}</strong></div>
      </div>

      <div className="grid3" style={{marginTop:24}}>
        <a className="card adminCardLink" href="/admin/contenido">
          <h3>Contenido bilingüe</h3>
          <p>Hero, autor y secciones ES/EN con flujo editorial.</p>
        </a>
        <a className="card adminCardLink" href="/admin/saga">
          <h3>Saga y Amazon</h3>
          <p>Gestiona libros, idiomas, ASIN y URLs específicas por edición.</p>
        </a>
        <a className="card adminCardLink" href="/admin/analytics">
          <h3>Conversión</h3>
          <p>Leads, campañas y clics hacia Amazon medidos con datos reales.</p>
        </a>
      </div>

      <div className="grid3" style={{marginTop:18}}>
        <a className="card adminCardLink" href="/admin/mapa">
          <h3>Mapa de Lumen</h3>
          <p>Edita territorios y puntos de interés.</p>
        </a>
        <a className="card adminCardLink" href="/admin/test">
          <h3>Test Emocional</h3>
          <p>Preguntas, respuestas y perfiles narrativos.</p>
        </a>
        <a className="card adminCardLink" href="/admin/medios">
          <h3>Multimedia</h3>
          <p>Portadas oficiales, recursos editoriales y press kit.</p>
        </a>
      </div>
    </section>
  </main>;
}
