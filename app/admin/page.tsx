import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabase/server";
import { LogoutButton } from "../../components/LogoutButton";
import { AdminLiveAnalytics } from "../../components/AdminLiveAnalytics";

type EventRow={event_name:string;source:string|null;medium:string|null;session_id:string|null;created_at:string};
type LeadRow={name:string|null;email:string;locale:string|null;session_id:string|null;created_at:string};
type BookRow={slug:string;volume:number;title_es:string|null;subtitle_es:string|null;status:string|null;amazon_url_es:string|null};
type MediaRow={id:string;slug:string;kind:string;storage_path:string;public_visible:boolean};

function ago(value:string){
  const minutes=Math.max(1,Math.round((Date.now()-new Date(value).getTime())/60000));
  if(minutes<60)return `Hace ${minutes} min`;
  const hours=Math.round(minutes/60);
  if(hours<24)return `Hace ${hours} h`;
  return `Hace ${Math.round(hours/24)} d`;
}
function initials(name:string|null,email:string){
  const src=(name||email).trim().split(/\s+/).slice(0,2).map(x=>x[0]?.toUpperCase()).join("");
  return src||"F";
}
function chartPoints(values:number[],height=180,width=760){
  const max=Math.max(1,...values);
  const step=values.length>1?width/(values.length-1):width;
  return values.map((v,i)=>`${(i*step).toFixed(1)},${(height-(v/max)*(height-24)-12).toFixed(1)}`).join(" ");
}

export default async function AdminPage({searchParams}:{searchParams:Promise<{range?:string}>}){
  const params=await searchParams;
  const requestedRange=Number(params?.range||30);
  const rangeDays=[7,30,90].includes(requestedRange)?requestedRange:30;
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase.from("admin_profiles").select("display_name,role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since=new Date(Date.now()-(rangeDays-1)*86400000).toISOString();
  const[
    {count:leadCount},
    {count:visitorCount},
    {count:amazonCount},
    {count:testCount},
    {data:books},
    {data:events},
    {data:latestLeads},
    {data:recentLeadRows},
    {data:recentMedia}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click"),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","test_complete"),
    supabase.from("books").select("slug,volume,title_es,subtitle_es,status,amazon_url_es").order("sort_order",{ascending:true}).limit(4),
    supabase.from("analytics_events").select("event_name,source,medium,session_id,created_at").gte("created_at",since).order("created_at",{ascending:true}).limit(5000),
    supabase.from("leads").select("name,email,locale,session_id,created_at").order("created_at",{ascending:false}).limit(5),
    supabase.from("leads").select("session_id,created_at").gte("created_at",since).limit(5000),
    supabase.from("media_assets").select("id,slug,kind,storage_path,public_visible").eq("public_visible",true).order("created_at",{ascending:false}).limit(4)
  ]);

  const displayName=profile.display_name||"José Liranzo";
  const mediaRows=(recentMedia||[]) as MediaRow[];
  const mediaUrl=(row:MediaRow)=>{
    if(row.storage_path.startsWith("/")||/^https?:\/\//i.test(row.storage_path))return row.storage_path;
    const base=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
    return base?`${base}/storage/v1/object/public/${row.storage_path}`:"";
  };
  const eventRows=(events||[]) as EventRow[];
  const leadRows=(latestLeads||[]) as LeadRow[];
  const days=Array.from({length:rangeDays},(_,i)=>{
    const d=new Date(Date.now()-((rangeDays-1)-i)*86400000);
    return d.toISOString().slice(0,10);
  });
  const viewsByDay=days.map(day=>eventRows.filter(e=>e.event_name==="page_view"&&e.created_at.slice(0,10)===day).length);
  const amazonByDay=days.map(day=>eventRows.filter(e=>e.event_name==="amazon_click"&&e.created_at.slice(0,10)===day).length);
  const recentViews=viewsByDay.reduce((a,b)=>a+b,0);
  const recentAmazon=amazonByDay.reduce((a,b)=>a+b,0);
  const sessionIds=new Set(eventRows.filter(e=>e.event_name==="page_view"&&e.session_id).map(e=>e.session_id as string));
  const recentSessions=sessionIds.size;
  const amazonSessions=new Set(eventRows.filter(e=>e.event_name==="amazon_click"&&e.session_id).map(e=>e.session_id as string)).size;
  const recentLeadSessions=new Set(((recentLeadRows||[]) as any[]).filter(l=>l.session_id).map(l=>String(l.session_id))).size;
  const amazonCtr=recentSessions?((amazonSessions/recentSessions)*100):0;
  const leadConversion=recentSessions?((recentLeadSessions/recentSessions)*100):0;

  const sources={social:0,organic:0,paid:0,direct:0,other:0};
  eventRows.filter(e=>e.event_name==="page_view").forEach(e=>{
    const s=(e.source||"").toLowerCase(),m=(e.medium||"").toLowerCase();
    if(/instagram|facebook|youtube|tiktok|social/.test(s+" "+m))sources.social++;
    else if(/organic|google|bing|search/.test(s+" "+m))sources.organic++;
    else if(/paid|cpc|ads|ppc/.test(s+" "+m))sources.paid++;
    else if(!s&&!m||/direct/.test(s+" "+m))sources.direct++;
    else sources.other++;
  });
  const sourceTotal=Math.max(1,Object.values(sources).reduce((a,b)=>a+b,0));
  const pct=(n:number)=>Math.round((n/sourceTotal)*100);
  const pSocial=pct(sources.social),pOrganic=pct(sources.organic),pPaid=pct(sources.paid),pDirect=pct(sources.direct);
  const pOther=Math.max(0,100-pSocial-pOrganic-pPaid-pDirect);
  const d1=pSocial,d2=d1+pOrganic,d3=d2+pPaid,d4=d3+pDirect;

  const fallbackBooks:BookRow[]=[
    {slug:"fragmentun-i",volume:1,title_es:"FRAGMENTUN I",subtitle_es:"El Despertar Emocional",status:"published",amazon_url_es:"https://www.amazon.com/dp/B0HBLTHT8S"},
    {slug:"fragmentun-ii",volume:2,title_es:"FRAGMENTUN II",subtitle_es:"La Guerra de la Fractura",status:"coming_soon",amazon_url_es:null},
    {slug:"fragmentun-iii",volume:3,title_es:"FRAGMENTUN III",subtitle_es:"Protocolo de Ascensión",status:"coming_soon",amazon_url_es:null},
    {slug:"fragmentun-iv",volume:4,title_es:"FRAGMENTUN IV",subtitle_es:"Génesis del Halo",status:"development",amazon_url_es:null}
  ];
  const sourceBooks=((books||[]) as BookRow[]);
  const displayBooks=fallbackBooks.map(f=>sourceBooks.find(b=>b.volume===f.volume)||f);

  const nav=[
    ["⌂","Inicio","/admin"],
    ["▤","Libros de la Saga","/admin/saga"],
    ["▧","Contenido del Sitio","/admin/contenido"],
    ["▦","Secciones","/admin/contenido"],
    ["♙","Personajes","/admin/personajes"],
    ["a","Amazon (Enlaces)","/admin/marketing"],
    ["▦","Tienda FRAGMENTUN","/admin/tienda"],
    ["♟","Suscriptores","/admin/leads"],
    ["↗","Integraciones","/admin/integrations"],
    ["▥","Analítica","/admin/analytics"],
    ["▤","Reportes","/admin/reportes"],
    ["◉","Test Emocional","/admin/test"],
    ["⌘","Mapa de Lumen","/admin/mapa"],
    ["▣","Multimedia","/admin/medios"],
    ["◎","Traducciones","/admin/contenido"],
    ["⌕","SEO y Social","/admin/seo"],
    ["⚙","Estado del Sistema","/admin/status"]
  ] as const;

  return <main className="approvedAdmin">
    <aside className="approvedAdminSidebar">
      <div className="approvedAdminBrand">
        <div className="approvedAdminSigil">✦</div>
        <strong>FRAGMENTUN</strong>
        <span>PANEL DE ADMINISTRACIÓN</span>
      </div>
      <nav className="approvedAdminNav">
        {nav.map(([icon,label,href],i)=><a key={label} href={href} className={i===0?"active":""}>
          <b>{icon}</b><span>{label}</span>{label==="Contenido del Sitio"&&<em>›</em>}
        </a>)}
      </nav>
      <div className="approvedAdminIdentity">
        <div className="approvedAdminAvatar">JL</div>
        <div><strong>{displayName}</strong><small>{profile.role==="admin"?"Administrador":profile.role}</small></div>
      </div>
      <div className="approvedAdminStudio">LIRYGAMES STUDIOS</div>
      <a className="approvedAdminSiteBtn" href="/es" target="_blank" rel="noreferrer">↗ <span>Ver Sitio Web</span></a>
      <LogoutButton/>
    </aside>

    <section className="approvedAdminWorkspace">
      <header className="approvedAdminHero">
        <div className="approvedAdminHeroShade"/>
        <div className="approvedAdminHeroTitle">
          <strong>FRAGMENTUN</strong>
          <span>UNA SAGA DE CIENCIA FICCIÓN EMOCIONAL</span>
        </div>
        <div className="approvedAdminHeroActions"><a href="/es" target="_blank" rel="noreferrer">ES</a><i>|</i><a href="/en" target="_blank" rel="noreferrer">EN</a><a href="/es" target="_blank" rel="noreferrer">Ver Sitio ↗</a></div>
      </header>

      <div className="approvedAdminBody">
        <section className="approvedAdminKpis">
          <a className="approvedAdminKpiLink" href="/admin/leads"><article><span className="kpiIcon">♟</span><div><strong>{(leadCount??0).toLocaleString()}</strong><small>Suscriptores</small></div><em>REAL</em></article></a>
          <a className="approvedAdminKpiLink" href={`/admin/analytics?range=${rangeDays}`}><article><span className="kpiIcon">↖</span><div><strong>{recentSessions.toLocaleString()}</strong><small>Sesiones · {rangeDays} días</small></div><em>{rangeDays}D</em></article></a>
          <a className="approvedAdminKpiLink" href={`/admin/analytics?range=${rangeDays}`}><article><span className="kpiIcon amazon">a</span><div><strong>{amazonCtr.toFixed(1)}%</strong><small>CTR Amazon</small></div><em>{rangeDays}D</em></article></a>
          <a className="approvedAdminKpiLink" href={`/admin/analytics?range=${rangeDays}`}><article><span className="kpiIcon">▥</span><div><strong>{leadConversion.toFixed(1)}%</strong><small>Conversión a Lead</small></div><em>{rangeDays}D</em></article></a>
          <details className="approvedAdminRange">
            <summary>▣ <span>Últimos {rangeDays} días</span>⌄</summary>
            <div className="approvedAdminRangeMenu">
              {[7,30,90].map(days=><a key={days} className={days===rangeDays?"active":""} href={`/admin?range=${days}`}>Últimos {days} días</a>)}
            </div>
          </details>
        </section>

        <AdminLiveAnalytics/>

        <section className="approvedAdminUpperGrid">
          <article className="approvedAdminPanel approvedAdminSaga">
            <div className="approvedAdminPanelTitle"><h2>Libros de la Saga</h2><a href="/admin/saga">Gestionar libros</a></div>
            <div className="approvedAdminBookGrid">
              {displayBooks.map(book=><div className="approvedAdminBook" key={book.slug}>
                <h3>{book.volume}. {book.subtitle_es}</h3>
                <div className={`approvedBookCover approvedBookCover${book.volume}`}>
                  {book.volume===1?<img src="/fragmentun-i-cover-es.jpg" alt="FRAGMENTUN I"/>:<><span>FRAGMENTUN</span><b>{book.subtitle_es}</b><i>✦</i></>}
                  <em className={book.status==="published"||book.amazon_url_es?"published":book.volume===4?"development":"soon"}>
                    {book.status==="published"||book.amazon_url_es?"Publicado":book.volume===4?"En desarrollo":"Próximamente"}
                  </em>
                </div>
                <div className="approvedBookLang"><span>🇪🇸 ES</span><span>🇺🇸 EN</span></div>
                {book.amazon_url_es?<a className="approvedBookAmazon" href={book.amazon_url_es} target="_blank" rel="noreferrer">a&nbsp;&nbsp; Ver en Amazon</a>:<span className="approvedBookAmazon disabled">a&nbsp;&nbsp; Ver en Amazon</span>}
                <a className="approvedBookEdit" href="/admin/saga">Editar</a>
              </div>)}
            </div>
          </article>

          <div className="approvedAdminAnalyticsColumn">
            <article className="approvedAdminPanel approvedAdminPerformance">
              <div className="approvedAdminPanelTitle"><h2>Rendimiento del Sitio</h2><a className="approvedPanelAction" href="/admin/analytics">Abrir analítica →</a><div className="approvedLegend"><span className="goldDot"/>Visitas <span className="blueDot"/>Clics Amazon</div></div>
              <div className="approvedChart">
                <svg viewBox="0 0 760 200" preserveAspectRatio="none" aria-label="Rendimiento últimos 30 días">
                  {[25,70,115,160].map(y=><line key={y} x1="0" y1={y} x2="760" y2={y} className="gridLine"/>)}
                  <polyline points={chartPoints(viewsByDay)} className="chartGold"/>
                  <polyline points={chartPoints(amazonByDay)} className="chartBlue"/>
                </svg>
                <div className="approvedChartAxis"><span>Sep 1</span><span>Sep 8</span><span>Sep 15</span><span>Sep 22</span><span>Sep 30</span></div>
              </div>
            </article>

            <article className="approvedAdminPanel approvedAdminTraffic">
              <div className="approvedAdminPanelTitle"><h2>Orígenes de Tráfico</h2><a className="approvedPanelAction" href="/admin/analytics">Ver detalle →</a></div>
              <div className="approvedTrafficInner">
                <div className="approvedDonut" style={{background:`conic-gradient(#13a9ee 0 ${d1}%,#40d39b ${d1}% ${d2}%,#a452e8 ${d2}% ${d3}%,#ff6953 ${d3}% ${d4}%,#f3bd37 ${d4}% 100%)`}}>
                  <div><strong>{recentViews.toLocaleString()}</strong><span>Visitas</span></div>
                </div>
                <div className="approvedTrafficLegend">
                  <p><i className="s1"/>Redes Sociales <b>{pSocial}%</b></p>
                  <p><i className="s2"/>Búsqueda Orgánica <b>{pOrganic}%</b></p>
                  <p><i className="s3"/>Búsqueda de Pago <b>{pPaid}%</b></p>
                  <p><i className="s4"/>Enlaces Directos <b>{pDirect}%</b></p>
                  <p><i className="s5"/>Otros <b>{pOther}%</b></p>
                </div>
              </div>
            </article>
          </div>
        </section>

        <section className="approvedAdminLowerGrid">
          <article className="approvedAdminPanel approvedSubscribers">
            <div className="approvedAdminPanelTitle"><h2>Últimos Suscriptores</h2><a href="/admin/leads">Ver todos</a></div>
            <div className="approvedSubscriberList">
              {leadRows.length?leadRows.map(lead=><div key={lead.email}>
                <span className="subscriberAvatar">{initials(lead.name,lead.email)}</span>
                <p><strong>{lead.name||"Suscriptor FRAGMENTUN"}</strong><small>{lead.email}</small></p>
                <em>{lead.locale==="en"?"🇺🇸":"🇪🇸"}</em><time>{ago(lead.created_at)}</time>
              </div>):<div className="approvedEmpty">Los primeros suscriptores aparecerán aquí cuando lleguen registros reales.</div>}
            </div>
          </article>

          <article className="approvedAdminPanel approvedQuick">
            <h2>Contenido Rápido</h2>
            <a href="/admin/contenido?section=home.hero"><b>⌂</b><span>Editar Página de Inicio</span></a>
            <a href="/admin/contenido?section=home.lumen"><b>▣</b><span>Editar Sección de Lumen</span></a>
            <a href="/admin/test"><b>◉</b><span>Actualizar Test Emocional</span></a>
            <a href="/admin/mapa"><b>⌘</b><span>Gestionar Mapa Interactivo</span></a>
          </article>

          <div className="approvedAdminRightLower">
            <article className="approvedAdminPanel approvedMedia">
              <div className="approvedAdminPanelTitle"><h2>Multimedia Reciente</h2><a href="/admin/medios">Ver todos</a></div>
              <div className="approvedMediaGrid">
                {mediaRows.length?mediaRows.map(row=>{
                  const src=mediaUrl(row);
                  const isVideo=row.kind==="video";
                  return <a href="/admin/medios" key={row.id} className={isVideo?"approvedTrailer approvedMediaLink":"approvedMediaLink"}>
                    {src&&row.kind==="image"?<img src={src} alt={row.slug}/>:<div className="approvedMediaPlaceholder">{isVideo?"VIDEO":"MEDIA"}</div>}
                    {isVideo&&<b>▶</b>}
                    <span>{row.slug}</span>
                  </a>;
                }):<div className="approvedEmpty">La biblioteca multimedia aparecerá aquí cuando tenga recursos públicos.</div>}
              </div>
            </article>
            <article className="approvedAdminPanel approvedConfig">
              <h2>Configuración del Sitio</h2>
              <div><a href="/admin/contenido">◎ Idiomas</a><a href="/admin/seo">⌕ SEO y Social</a><a href="/admin/integrations">↗ Integraciones</a><a href="/admin/status">⚙ Estado y Ajustes</a></div>
            </article>
          </div>
        </section>
      </div>
    </section>
  </main>;
}
