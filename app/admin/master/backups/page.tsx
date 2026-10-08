import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {MasterBackupDownload} from "../../../../components/MasterBackupDownload";
import styles from "../master-admin.module.css";

function auditActionLabel(value:string|undefined){
  const map:Record<string,string>={
    create:"Creación",
    update:"Actualización",
    delete:"Eliminación",
    login:"Inicio de sesión",
    logout:"Cierre de sesión",
    backup_download:"Descarga de copia",
    export:"Exportación",
    publish:"Publicación",
    approve:"Aprobación",
    reject:"Rechazo"
  };
  if(!value)return "";
  return map[value]||String(value).replaceAll("_"," ").replace(/\b\w/g,m=>m.toUpperCase());
}

export default async function MasterBackupPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/login?unauthorized=1");

  const[
    {count:media},
    {count:books},
    {count:characters},
    {count:campaigns},
    {data:lastLog}
  ]=await Promise.all([
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("campaigns").select("*",{count:"exact",head:true}),
    supabase.from("admin_audit_log").select("created_at,action,resource_type").order("created_at",{ascending:false}).limit(1).maybeSingle()
  ]);

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleBackups}`}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · COPIAS</span>
        <h1>Copias y Recuperación</h1>
        <p>Descarga copias protegidas del contenido restaurable y conserva una referencia externa fuera del sistema.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">BK</span>
      <div className={styles.moduleStripCopy}><small>COPIAS Y RECUPERACIÓN</small><strong>Respaldo, integridad y restauración</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Contenido restaurable conectado</span>
        <span>Descarga protegida · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Recursos multimedia</small><strong>{(media||0).toLocaleString()}</strong><span>Incluidos por referencia</span></article>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Incluidos en copia</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Incluidos en copia</span></article>
      <article><small>Campañas</small><strong>{(campaigns||0).toLocaleString()}</strong><span>Incluidas en copia</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>COPIA EXTERNA</span><h2>Descarga manual protegida</h2></div>
      <p>La descarga requiere sesión administrativa y verificación en dos pasos. La copia contiene contenido y datos de recuperación, no credenciales ni información sensible.</p>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>Copia FRAGMENTUN</strong>
        <span>Genera una copia estructurada con verificación de integridad y orden de recuperación. Los archivos almacenados no se duplican; se conservan sus rutas.</span>
      </div>
      {profile.role==="admin"?<MasterBackupDownload/>:<code>Solo Admin</code>}
    </section>

    <section className={styles.sectionHead}>
      <div><span>ALCANCE</span><h2>Qué incluye y qué excluye</h2></div>
      <p>La copia está diseñada para recuperación de contenido, no como exportación de datos personales ni de autenticación.</p>
    </section>

    <section className={styles.grid}>
      <article className={`${styles.card} ${styles.cardPriority}`}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>INCLUIDO</span><em>CONTENIDO</em></div>
        <h3>Contenido editorial</h3>
        <p>Libros, ediciones, personajes, mapas, pruebas, reseñas, campañas y contenido localizado.</p>
      </article>
      <article className={`${styles.card} ${styles.cardPriority}`}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>INCLUIDO</span><em>ARCHIVOS</em></div>
        <h3>Registro de archivos</h3>
        <p>Conserva rutas y metadatos de recursos multimedia para validar y reconstruir referencias.</p>
      </article>
      <article className={`${styles.card} ${styles.cardMuted}`}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>EXCLUIDO</span><em>PRIVACIDAD</em></div>
        <h3>Datos personales</h3>
        <p>No incluye contactos captados, usuarios de autenticación, perfiles administrativos ni registros sensibles.</p>
      </article>
      <article className={`${styles.card} ${styles.cardMuted}`}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>EXCLUIDO</span><em>SEGURIDAD</em></div>
        <h3>Credenciales</h3>
        <p>No incluye credenciales, claves privadas ni archivos binarios almacenados.</p>
      </article>
    </section>

    <section className={styles.notice}>
      <div>
        <strong>Última actividad administrativa</strong>
        <span>{lastLog?.created_at?new Date(lastLog.created_at).toLocaleString("es-US"):"Sin actividad registrada"}{lastLog?.action?" · "+auditActionLabel(lastLog.action):""}</span>
      </div>
      <code>Recuperación controlada</code>
    </section>
  </main>;
}
