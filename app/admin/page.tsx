const items=["Contenido","Medios","Saga","Personajes","Mapa de Lumen","Test emocional","Comunidad","Reseñas","Marketing","Analytics","Usuarios"];
export default function AdminPage(){
  return <main className="adminShell">
    <aside className="sidebar"><div className="logo">FRAGMENTUN</div><p className="note">Control Center</p><nav>{items.map(item=><a key={item} href="#">{item}</a>)}</nav></aside>
    <section className="adminMain">
      <div className="kicker">Control Center</div><h2 style={{marginTop:8}}>Dashboard</h2>
      <p className="lead">Base visual del panel administrativo. La autenticación y el CMS se conectarán en la fase backend.</p>
      <div className="kpis">
        <div className="kpi"><span>Visitantes</span><strong>—</strong></div>
        <div className="kpi"><span>Leads</span><strong>—</strong></div>
        <div className="kpi"><span>Clics Amazon</span><strong>—</strong></div>
        <div className="kpi"><span>Tests completos</span><strong>—</strong></div>
      </div>
      <div className="grid3" style={{marginTop:24}}>
        <div className="card"><h3>Contenido</h3><p>Edición bilingüe ES/EN, borrador, revisión y publicación.</p></div>
        <div className="card"><h3>Biblioteca</h3><p>Portada oficial, autor, Elyon, Lumen y assets de campaña.</p></div>
        <div className="card"><h3>Marketing</h3><p>CTAs, UTMs, Amazon, lead magnets y conversiones.</p></div>
      </div>
    </section>
  </main>;
}