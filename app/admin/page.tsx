import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { LogoutButton } from "../../components/LogoutButton";

function formatDate(value?:string|null){
  if(!value) return "—";
  return new Intl.DateTimeFormat("es-US",{day:"2-digit",month:"short",year:"numeric"}).format(new Date(value));
}

export default async function AdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase.from("admin_profiles").select("display_name,role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const[
    {count:leadCount},
    {count:visitorCount},
    {count:amazonCount},
    {count:testCount},
    {count:questionCount},
    {count:campaignCount},
    {data:books},
    {data:reviews},
    {data:audit}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","test_complete"),
    supabase.from("test_questions").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("campaigns").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("books").select("slug,volume,title_es,subtitle_es,status,amazon_url_es").order("sort_order",{ascending:true}).limit(4),
    supabase.from("reviews").select("author_display,body_es,body_original,source,verified,published,created_at").eq("published",true).order("created_at",{ascending:false}).limit(1),
    supabase.from("admin_audit_log").select("action,table_name,created_at").order("created_at",{ascending:false}).limit(4)
  ]);

  const displayName=profile.display_name||"José Liranzo";
  const latestReview=reviews?.[0];
  const publishedBook=(books||[]).find((b:any)=>b.status==="published"||Boolean(b.amazon_url_es));

  const nav=[
    ["▦","Dashboard","Resumen y estadísticas","/admin"],
    ["✦","Contenido Web","Editar secciones y páginas","/admin/contenido"],
    ["◫","Medios","Imágenes, videos y archivos","/admin/medios"],
    ["▤","La Saga","Libros y contenido","/admin/saga"],
    ["◉","Personajes","Biografías y gestión","/admin/personajes"],
    ["⌖","Mapa de Lumen","Territorios y ubicaciones","/admin/mapa"],
    ["◇","Test Emocional","Preguntas y resultados","/admin/test"],
    ["★","Reseñas / Testimonios","Gestión de reseñas reales","/admin/resenas"],
    ["↗","Marketing","CTAs, enlaces y campañas","/admin/marketing"],
    ["⌁","Analytics","Estadísticas y conversiones","/admin/analytics"],
    ["✉","Leads","Suscriptores y MailerLite","/admin/leads"],
    ["♙","Usuarios","Roles y permisos","/admin/usuarios"],
    ["●","Estado","Preparación del sistema","/admin/status"],
    ["≡","Auditoría","Actividad administrativa","/admin/audit"],
    ["⛓","Integraciones","Servicios conectados","/admin/integrations"]
  ] as const;

  return <main className="controlCenter">
    <aside className="controlSidebar">
      <div className="controlBrand">
        <div className="controlBrandName">FRAGMENTUN</div>
        <div className="controlBrandSub">CONTROL CENTER</div>
      </div>

      <nav className="controlNav">
        {nav.map(([icon,label,description,href],i)=>
          <a key={href} href={href} className={i===0?"active":""}>
            <span className="controlNavIcon">{icon}</span>
            <span><strong>{label}</strong><small>{description}</small></span>
          </a>
        )}
      </nav>

      <div className="controlStudio">
        <div className="controlStudioOrb"/>
        <strong>LIRYGAMES STUDIOS</strong>
        <small>TODOS LOS DERECHOS RESERVADOS</small>
      </div>
    </aside>

    <section className="controlMain">
      <header className="controlTopbar">
        <div>
          <span className="controlEyebrow">Panel de Administración</span>
          <h1>Gestiona el universo FRAGMENTUN</h1>
        </div>
        <div className="controlTopActions">
          <a className="controlGhostButton" href="/es" target="_blank" rel="noreferrer">Ver Sitio Web ↗</a>
          <div className="controlUser">
            <span className="controlAvatar">JL</span>
            <span><strong>{displayName}</strong><small>{profile.role}</small></span>
          </div>
          <LogoutButton/>
        </div>
      </header>

      <section className="controlHero">
        <div className="controlHeroCopy">
          <span className="controlEyebrow">Centro de mando</span>
          <h2>Bienvenido, {displayName}</h2>
          <p>Aquí gestionas el universo FRAGMENTUN.</p>
          <blockquote>“Una historia que conecta emociones, puede transformar el mundo.”</blockquote>
        </div>
        <div className="controlHeroVisual" aria-hidden="true">
          <div className="controlPlanet"/>
          <div className="controlSkyline"><i/><i/><i/><i/><i/><i/></div>
        </div>
        <div className="controlSiteStatus">
          <span><i/> Estado del Sitio Web</span>
          <strong>En línea</strong>
          <small>Producción · www.fragmentun.com</small>
          <a className="controlPrimaryButton" href="/admin/status">Revisar estado →</a>
        </div>
      </section>

      <section className="controlKpis">
        <article><span className="controlMetricIcon">◉</span><div><strong>{visitorCount??0}</strong><small>Visitantes registrados</small></div></article>
        <article><span className="controlMetricIcon">✉</span><div><strong>{leadCount??0}</strong><small>Leads capturados</small></div></article>
        <article><span className="controlMetricIcon">↗</span><div><strong>{amazonCount??0}</strong><small>Clics a Amazon</small></div></article>
        <article><span className="controlMetricIcon">◇</span><div><strong>{testCount??0}</strong><small>Test completados</small></div></article>
      </section>

      <section className="controlSection">
        <div className="controlSectionHead">
          <div><span className="controlEyebrow">Gestión editorial</span><h2>Edición Rápida de Contenido</h2><p>Accede rápidamente a las secciones principales de la web.</p></div>
          <a href="/admin/contenido">Ver todas las páginas →</a>
        </div>
        <div className="controlQuickGrid">
          <a className="controlQuickCard controlQuickHero" href="/admin/contenido"><span>Página Principal</span><strong>Hero, textos y CTAs</strong><small>Editar →</small></a>
          <a className="controlQuickCard controlQuickBook" href="/admin/saga"><img src="/fragmentun-i-cover-es.jpg" alt="Portada FRAGMENTUN I"/><span>Portada del Libro</span><strong>Edición y enlaces</strong><small>Editar →</small></a>
          <a className="controlQuickCard controlQuickWorld" href="/admin/mapa"><span>Universo / Lumen</span><strong>Contenido y mapa</strong><small>Editar →</small></a>
          <a className="controlQuickCard controlQuickAuthor" href="/admin/contenido"><span>Autor</span><strong>Biografía y multimedia</strong><small>Editar →</small></a>
        </div>
      </section>

      <section className="controlDashboardGrid">
        <article className="controlPanel controlSagaPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Biblioteca</span><h3>La Saga FRAGMENTUN</h3></div><a href="/admin/saga">Gestionar →</a></div>
          <div className="controlBooks">
            {(books||[]).map((book:any)=><div className="controlBook" key={book.slug}>
              {book.volume===1?<img src="/fragmentun-i-cover-es.jpg" alt={book.title_es||"FRAGMENTUN I"}/>:<div className="controlBookPlaceholder">FRAGMENTUN<br/><b>{book.volume}</b></div>}
              <strong>{book.title_es||`FRAGMENTUN ${book.volume}`}</strong>
              <small>{book.subtitle_es||"Próximamente"}</small>
              <em className={(book.status==="published"||book.amazon_url_es)?"published":""}>{(book.status==="published"||book.amazon_url_es)?"Publicado":"Próximamente"}</em>
            </div>)}
          </div>
        </article>

        <article className="controlPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Experiencia</span><h3>Test Emocional</h3></div><a href="/admin/test">Editar →</a></div>
          <div className="controlFeatureList">
            <div><span>?</span><p><strong>Preguntas del test</strong><small>{questionCount??0} preguntas activas</small></p></div>
            <div><span>◫</span><p><strong>Perfiles / Resultados</strong><small>Arquetipos emocionales</small></p></div>
            <div><span>T</span><p><strong>Diseño y textos</strong><small>Mensajes ES / EN</small></p></div>
          </div>
        </article>

        <article className="controlPanel controlMapPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Worldbuilding</span><h3>Mapa Interactivo de Lumen</h3></div><a href="/admin/mapa">Editar →</a></div>
          <div className="controlMiniMap">
            <span className="vorax">VORAX</span><span className="nara">NARA</span><span className="ethelis">ETHELIS</span><span className="umbral">UMBRAL</span>
            <i/><i/><i/><i/>
          </div>
        </article>

        <article className="controlPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Prueba social</span><h3>Últimas Reseñas</h3></div><a href="/admin/resenas">Ver todas →</a></div>
          {latestReview?<div className="controlReview">
            <div className="controlStars">★★★★★</div>
            <p>“{latestReview.body_es||latestReview.body_original}”</p>
            <strong>{latestReview.author_display||"Lector verificado"}</strong>
            <small>{latestReview.source||"Fuente"} · {formatDate(latestReview.created_at)} {latestReview.verified?"· Verificada":""}</small>
          </div>:<div className="controlEmpty">Aún no hay reseñas publicadas. El panel mostrará únicamente reseñas reales.</div>}
        </article>

        <article className="controlPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Conversión</span><h3>Marketing y CTAs</h3></div><a href="/admin/marketing">Editar →</a></div>
          <div className="controlMarketing">
            <div><span>Amazon</span><strong>{publishedBook?.amazon_url_es?"Enlace activo":"Pendiente"}</strong></div>
            <div><span>Campañas UTM</span><strong>{campaignCount??0} activas</strong></div>
            <div><span>Leads</span><strong>{leadCount??0} capturados</strong></div>
          </div>
        </article>

        <article className="controlPanel">
          <div className="controlPanelHead"><div><span className="controlEyebrow">Trazabilidad</span><h3>Actividad Reciente</h3></div><a href="/admin/audit">Ver actividad →</a></div>
          <div className="controlActivity">
            {(audit||[]).length?(audit||[]).map((item:any,index:number)=><div key={index}>
              <span>{item.action==="UPDATE"?"✎":item.action==="INSERT"?"+":"−"}</span>
              <p><strong>{item.action} · {item.table_name}</strong><small>{formatDate(item.created_at)}</small></p>
            </div>):<div className="controlEmpty">La actividad administrativa aparecerá aquí.</div>}
          </div>
        </article>
      </section>
    </section>
  </main>;
}
