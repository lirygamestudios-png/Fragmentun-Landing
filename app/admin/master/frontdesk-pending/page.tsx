import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

const pending=[
 ["FD-01","Diseño visual","Escritorio, móvil, proporciones y bordes azules"],
 ["FD-02","Navegación","Header, modales, teclado, foco y cierre"],
 ["FD-03","Liry ADN","Seis preguntas, reinicio, recomendaciones y estilo temporal"],
 ["FD-04","Catálogo","Búsqueda, filtros, paginación y tarjetas"],
 ["FD-05","Tienda","Filtros combinados, 12 productos/página y enlaces WhatsApp"],
 ["FD-06","MI LIRY","Avatar, secciones, seguridad y vistas temporales"],
 ["FD-07","Comunidad y Liryboost","Subpantallas, tablero, formularios preliminares"],
 ["FD-08","ES/EN y accesibilidad","Traducciones, contraste y reducción de movimiento"],
 ["FD-09","Tarjeta compartida","OpenGraph y WhatsApp verificados externamente"],
 ["FD-10","Aceptación final","Seguridad, datos reales, permisos y aprobación"]
] as const;

export default async function FrontdeskPendingPage(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile)redirect("/admin/lirygames/login?unauthorized=1");
 return <main className={`${styles.workspace} ${styles.modulePage}`}>
  <header className={styles.topbar}><div><span className={styles.eyebrow}>LIRYGAMES · FRONTDESK</span><h1>Pruebas pendientes</h1><p>10 comprobaciones conservadas y temporalmente suspendidas. Se retomarán junto con la aceptación funcional integral de la plataforma después de actualizar el Commander Center. Ninguna se declara aprobada por una compilación exitosa.</p></div><a className={styles.publicSite} href="/admin/master">← Commander Center</a></header>
  <section className={styles.moduleStrip} aria-label="Estado de pruebas pendientes"><span className={styles.moduleGlyph} aria-hidden="true">FD</span><div className={styles.moduleStripCopy}><small>VALIDACIÓN EN PAUSA</small><strong>FrontDesk: pruebas suspendidas hasta el cierre del Commander Center</strong></div><div className={styles.moduleStripMeta}><span>10 pruebas conservadas · en pausa</span></div></section>
  <section className={styles.grid} aria-label="Tareas pendientes del FrontDesk">{pending.map(([id,name,detail])=><article key={id} className={styles.card}><div className={styles.cardTop}><span>{id}</span><em>EN PAUSA</em></div><h3>{name}</h3><p>{detail}</p></article>)}</section>
  <section className={styles.sectionHead}><div><span>CONTROL DE CAMBIO</span><h2>Desarrollo activo: Commander Center</h2></div><p>Prioridad actual: actualizar el Commander Center por módulos y compilaciones agrupadas. Al finalizar, ejecutar las pruebas funcionales integrales de FrontDesk y Commander Center antes de la aprobación final. No activar pagos, cuentas ni servicios con costos sin autorización.</p></section>
 </main>;
}
