import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

const screens=[
  ["Inicio","/admin/master","Resumen general y navegación"],
  ["Operaciones","/admin/master/operations","Trabajo y decisiones"],
  ["Juegos","/admin/master/games","Producción por título"],
  ["Publicación","/admin/master/publishing","Lanzamientos y catálogo"],
  ["Crecimiento","/admin/master/growth","Captación y conversión"],
  ["Monetización","/admin/master/monetization","Precios y planes"],
  ["Comercio","/admin/master/commerce","Pedidos y pagos"],
  ["Clientes y Comunidad","/admin/master/community","Comunidad y betas"],
  ["Finanzas","/admin/master/finance","Ingresos, gastos y movimientos"],
  ["Personas","/admin/master/people","Equipo y asignaciones"],
  ["Tecnología","/admin/master/technology","Infraestructura y cambios"],
  ["Datos","/admin/master/data","Métricas y apoyo a decisiones"],
  ["Automatización e IA","/admin/master/automation","Automatizaciones y aprobaciones"],
  ["Riesgos y Controles","/admin/master/risk","Riesgos y seguimiento"],
  ["Seguridad","/admin/master/security","Accesos e incidentes"],
  ["Legal e IP","/admin/master/legal","Contratos y derechos"],
  ["Alianzas y Licencias","/admin/master/partners","Alianzas y expansión"],
  ["Proveedores","/admin/master/suppliers","Compras y suplidores"],
  ["Marca y Comunicaciones","/admin/master/brand","Marca y reputación"],
  ["Estrategia","/admin/master/strategy","Objetivos y prioridades"],
  ["Capital e Inversionistas","/admin/master/capital","Oportunidades de capital"],
  ["Configuración","/admin/master/settings","Parámetros del sistema"],
  ["Reportes","/admin/master/reports","Pantalla, PDF y exportación"],
  ["Integraciones","/admin/master/integrations","Conexiones externas"],
  ["Copias y Recuperación","/admin/master/backups","Copias y recuperación"],
  ["Mantenimiento","/admin/master/maintenance","Rutinas operativas"],
  ["Estado y Pruebas","/admin/master/observability","Validación de la versión de prueba"],
  ["Revisión antes de publicar","/admin/master/releases","Evidencia y aprobación"],
  ["Pruebas finales","/admin/master/qa","Preparación final antes de publicación"],
  ["Auditoría","/admin/master/audit","Trazabilidad administrativa"]
] as const;

export default async function MasterChecklistPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/lirygames/login?unauthorized=1");

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleChecklist}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · REVISIÓN VISUAL</span>
        <h1>Revisión pantalla por pantalla</h1>
        <p>Recorrido visual del Master Admin antes de iniciar las pruebas funcionales finales.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">RV</span>
      <div className={styles.moduleStripCopy}><small>REVISIÓN VISUAL</small><strong>Pantallas, adaptación y coherencia</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Recorrido visual preparado</span>
        <span>Revisión manual</span>
      </div>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>Objetivo de esta etapa</strong>
        <span>Confirmar presencia de campos, claridad visual, adaptación a distintos tamaños de pantalla y coherencia. La funcionalidad profunda se valida en las pruebas finales.</span>
      </div>
      <code>{screens.length} pantallas</code>
    </section>

    <section className={styles.sectionHead}>
      <div><span>REVISIÓN</span><h2>Pantallas del Master Admin</h2></div>
      <p>Cada tarjeta abre directamente la pantalla correspondiente para revisión visual manual.</p>
    </section>

    <section className={styles.grid}>
      {screens.map(([name,href,detail],index)=><a key={href} href={href} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={styles.badgePlanned}>PENDIENTE VISUAL</span>
          <em>{String(index+1).padStart(2,"0")}/{screens.length}</em>
        </div>
        <h3>{name}</h3>
        <p>{detail}<br/>Revisar escritorio y móvil.</p>
        <span className={styles.cardLink}>Abrir pantalla →</span>
      </a>)}
    </section>

    <section className={styles.sectionHead}>
      <div><span>CRITERIOS</span><h2>Qué revisar en cada pantalla</h2></div>
    </section>

    <section className={styles.kpis}>
      <article><small>1 · Estructura</small><strong>✓</strong><span>Títulos, campos, tarjetas y secciones visibles</span></article>
      <article><small>2 · Lenguaje</small><strong>✓</strong><span>Términos simples y empresariales</span></article>
      <article><small>3 · Adaptación</small><strong>✓</strong><span>Escritorio, tablet y móvil</span></article>
      <article><small>4 · Accesibilidad</small><strong>✓</strong><span>Foco, contraste, controles y lectura</span></article>
    </section>
  </main>;
}
