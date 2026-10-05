import {redirect} from "next/navigation";
import Link from "next/link";
import {createSupabaseServerClient} from "../../../lib/supabase/server";

const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";
const rows=[
  {
    locale:"ES",
    title:"FRAGMENTUN I — El Despertar Emocional | José Liranzo",
    description:"En Lumen, las emociones están reguladas. Descubre FRAGMENTUN I: El Despertar Emocional, la saga de ciencia ficción de José Liranzo.",
    canonical:`${site}/es`,
    image:"/fragmentun-i-cover-es.jpg"
  },
  {
    locale:"EN",
    title:"FRAGMENTUN I — The Emotional Awakening | José Liranzo",
    description:"In Lumen, emotions are regulated. Discover FRAGMENTUN I: The Emotional Awakening, José Liranzo's science-fiction saga.",
    canonical:`${site}/en`,
    image:"/fragmentun-i-cover-es.jpg"
  }
];

export default async function SeoPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!p||!["admin","editor","marketing"].includes(p.role))redirect("/admin");

  return <main className="adminMain">
    <div className="adminTopbar">
      <div><div className="kicker">Panel de administración</div><h1>SEO y Tarjeta Social</h1></div>
      <Link className="btn btnGhost" href="/admin">← Inicio</Link>
    </div>

    <section className="card adminSeoIntro">
      <div className="adminPanelHeader"><div><div className="kicker">VISIBILIDAD</div><h2>Configuración publicada</h2><p className="note">Vista operativa de los metadatos que utiliza FRAGMENTUN para buscadores y redes sociales.</p></div><span className="adminPanelBadge">INDEXABLE</span></div>
      <div className="adminSeoStatus">
        <div><span>Robots</span><strong>INDEX · FOLLOW</strong></div>
        <div><span>Vista previa</span><strong>IMAGEN GRANDE</strong></div>
        <div><span>Autor</span><strong>JOSÉ LIRANZO</strong></div>
        <div><span>Sitio</span><strong>FRAGMENTUN</strong></div>
      </div>
    </section>

    <div className="adminSeoGrid">
      {rows.map(row=><article className="card adminSeoCard" key={row.locale}>
        <div className="adminSeoCardHead"><span>{row.locale}</span><strong>{row.locale==="ES"?"Español":"English"}</strong><a href={row.canonical} target="_blank" rel="noreferrer">Ver página ↗</a></div>
        <div className="adminSeoPreview">
          <img src={row.image} alt="" />
          <div><small>FRAGMENTUN.COM</small><h3>{row.title}</h3><p>{row.description}</p></div>
        </div>
        <dl className="adminSeoFields">
          <div><dt>Título</dt><dd>{row.title}</dd></div>
          <div><dt>Descripción</dt><dd>{row.description}</dd></div>
          <div><dt>Canonical</dt><dd>{row.canonical}</dd></div>
          <div><dt>Open Graph</dt><dd>{row.image}</dd></div>
        </dl>
      </article>)}
    </div>

    <section className="card adminSeoActions">
      <div><div className="kicker">CONTENIDO RELACIONADO</div><h2>Editar lo que alimenta la presentación pública</h2><p className="note">El título visual, la portada y el contenido principal se administran desde los módulos correspondientes.</p></div>
      <div>
        <Link className="btn btnPrimary" href="/admin/contenido?section=home.hero">Editar portada / Hero</Link>
        <Link className="btn btnGhost" href="/admin/medios">Biblioteca de Medios</Link>
      </div>
    </section>
  </main>;
}
