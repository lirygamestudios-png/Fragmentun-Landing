import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../lib/supabase/server";
import styles from "./master-admin.module.css";

type Domain={
  title:string;
  subtitle:string;
  href:string;
  phase:string;
  status:"active"|"planned";
};

const domains:Domain[]=[
  {title:"Command Center",subtitle:"Vista ejecutiva, alertas, decisiones y excepciones",href:"/admin/master",phase:"60",status:"active"},
  {title:"Operaciones",subtitle:"Estado operativo, continuidad y señales del sistema",href:"/admin/master/operations",phase:"60",status:"active"},
  {title:"Juegos",subtitle:"Producción, LiveOps, releases y operación por título",href:"/admin",phase:"57",status:"planned"},
  {title:"Publishing",subtitle:"Plataformas, lanzamientos, catálogo y franquicias",href:"/admin",phase:"59",status:"planned"},
  {title:"Growth",subtitle:"Adquisición, embudos, CRM, conversión y retención",href:"/admin/master/growth",phase:"53",status:"active"},
  {title:"Monetización",subtitle:"Pricing, packaging, freemium, bundles y expansión",href:"/admin/master/monetization",phase:"54",status:"active"},
  {title:"Comercio",subtitle:"Pedidos, pagos, fulfillment, devoluciones y revenue assurance",href:"/admin/master/commerce",phase:"55",status:"active"},
  {title:"Finanzas",subtitle:"Accounting, treasury, tax, reporting y runway",href:"/admin/master/finance",phase:"39",status:"active"},
  {title:"Personas",subtitle:"Workforce, talento, desempeño y compensación",href:"/admin",phase:"48",status:"planned"},
  {title:"Tecnología",subtitle:"Infraestructura, CI/CD, QA automation y technical ops",href:"/admin/master/technology",phase:"58",status:"active"},
  {title:"Datos",subtitle:"Analytics governance, KPIs y decision intelligence",href:"/admin/master/data",phase:"43",status:"active"},
  {title:"Automatización & IA",subtitle:"Agentes, workflows, permisos, auditoría y kill switch",href:"/admin/integrations",phase:"44",status:"planned"},
  {title:"Riesgos & Controles",subtitle:"ERM, compliance, controles y audit readiness",href:"/admin/master/risk",phase:"46",status:"active"},
  {title:"Seguridad",subtitle:"Identidad, ciberseguridad, resiliencia y continuidad",href:"/admin/master/security",phase:"45",status:"active"},
  {title:"Legal & IP",subtitle:"Contratos, derechos, chain-of-title y registros",href:"/admin/master/legal",phase:"47",status:"active"},
  {title:"Partners & Licensing",subtitle:"Alianzas, distribución, licencias y expansión",href:"/admin/master/partners",phase:"51",status:"active"},
  {title:"Proveedores",subtitle:"Procurement, vendor management y optimización de costes",href:"/admin/master/suppliers",phase:"56",status:"active"},
  {title:"Marca & Comunicaciones",subtitle:"Brand, PR, reputación y narrativa corporativa",href:"/admin/master/brand",phase:"52",status:"active"},
  {title:"Estrategia",subtitle:"OKRs, prioridades, decisiones y asignación de recursos",href:"/admin/master/strategy",phase:"49",status:"active"},
  {title:"Capital & Investors",subtitle:"Fundraising, board, IR y strategic transactions",href:"/admin",phase:"50",status:"planned"},
  {title:"FRAGMENTUN",subtitle:"Administración operativa de la IP y landing pública",href:"/admin",phase:"Actual",status:"active"}
];

export default async function MasterAdminPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("display_name,role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile) redirect("/admin/login?unauthorized=1");

  const displayName=profile.display_name||"José Liranzo";

  const [
    {count:leadCount},
    {count:eventCount},
    {count:bookCount},
    {count:mediaCount}
  ]=await Promise.all([
    supabase.from("leads").select("*",{count:"exact",head:true}),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true})
  ]);

  return <main className={styles.shell}>
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.sigil}>✦</span>
        <div><strong>LIRYGAMES</strong><small>MASTER ADMIN</small></div>
      </div>
      <nav className={styles.nav}>
        <a className={styles.active} href="/admin/master">⌂ <span>Command Center</span></a>
        <a href="/admin">◈ <span>FRAGMENTUN Admin</span></a>
        <a href="/admin/analytics">▥ <span>Analítica</span></a>
        <a href="/admin/status">⚙ <span>Estado del Sistema</span></a>
        <a href="/admin/integrations">↗ <span>Integraciones</span></a>
      </nav>
      <div className={styles.identity}>
        <span>JL</span>
        <div><strong>{displayName}</strong><small>{profile.role||"admin"}</small></div>
      </div>
      <a className={styles.publicSite} href="/es" target="_blank" rel="noreferrer">Ver FRAGMENTUN ↗</a>
    </aside>

    <section className={styles.workspace}>
      <header className={styles.topbar}>
        <div>
          <span className={styles.eyebrow}>CORPORATE COMMAND CENTER</span>
          <h1>LIRYGAMES STUDIOS</h1>
          <p>Vista maestra del sistema empresarial · Fases 1–60</p>
        </div>
        <div className={styles.protection}>
          <b>FRAGMENTUN</b>
          <span>Producción protegida</span>
        </div>
      </header>

      <section className={styles.notice}>
        <div><strong>Baseline protegido</strong><span>La landing pública no se modifica desde este módulo.</span></div>
        <code>main · 8eb878e</code>
      </section>

      <section className={styles.kpis}>
        <article><small>Leads</small><strong>{(leadCount||0).toLocaleString()}</strong><span>Supabase real</span></article>
        <article><small>Eventos</small><strong>{(eventCount||0).toLocaleString()}</strong><span>Analytics real</span></article>
        <article><small>Libros</small><strong>{(bookCount||0).toLocaleString()}</strong><span>Catálogo conectado</span></article>
        <article><small>Media</small><strong>{(mediaCount||0).toLocaleString()}</strong><span>Biblioteca conectada</span></article>
      </section>

      <section className={styles.sectionHead}>
        <div><span>ARQUITECTURA OPERATIVA</span><h2>Dominios del Master Admin</h2></div>
        <p>Primera capa de integración. Los módulos se activarán progresivamente sin rehacer el FrontDesk.</p>
      </section>

      <section className={styles.grid}>
        {domains.map(domain=><a key={domain.title} href={domain.href} className={styles.card}>
          <div className={styles.cardTop}>
            <span className={domain.status==="active"?styles.badgeActive:styles.badgePlanned}>{domain.status==="active"?"ACTIVO":"MAPEADO"}</span>
            <em>Fase {domain.phase}</em>
          </div>
          <h3>{domain.title}</h3>
          <p>{domain.subtitle}</p>
          <span className={styles.cardLink}>{domain.status==="active"?"Abrir módulo":"Ver base actual"} →</span>
        </a>)}
      </section>
    </section>
  </main>;
}
