import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterIntegrationsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)redirect("/admin/login?unauthorized=1");

  const[{data:logs},{count:leads}]=await Promise.all([
    supabase.from("integration_logs").select("id,integration,event_type,status,message,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("leads").select("*",{count:"exact",head:true})
  ]);

  const rows=(logs||[]) as any[];
  const ok=rows.filter(x=>x.status==="success").length;
  const errors=rows.filter(x=>x.status==="error").length;
  const latest=rows[0];
  const providers=Array.from(new Set(rows.map(x=>x.integration).filter(Boolean)));

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div>
        <span className={styles.eyebrow}>LIRYGAMES · INTEGRACIONES</span>
        <h1>Integraciones</h1>
        <p>Estado resumido de las conexiones externas utilizadas por el ecosistema.</p>
      </div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Servicios detectados</small><strong>{providers.length}</strong><span>Con actividad registrada</span></article>
      <article><small>Eventos correctos</small><strong>{ok}</strong><span>Últimos 100 registros</span></article>
      <article><small>Errores</small><strong>{errors}</strong><span>Últimos 100 registros</span></article>
      <article><small>Contactos</small><strong>{(leads||0).toLocaleString()}</strong><span>Base de captación</span></article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>ESTADO GENERAL</span><h2>Conexiones externas</h2></div>
      <p>Este resumen no muestra secretos ni credenciales. La configuración técnica detallada permanece en el panel especializado.</p>
    </section>

    <section className={styles.grid}>
      <a className={styles.card} href="/admin/integrations">
        <div className={styles.cardTop}><span className={styles.badgeActive}>CONFIGURABLE</span><em>CORREO Y PUBLICIDAD</em></div>
        <h3>Panel de Integraciones</h3>
        <p>MailerLite, Meta Ads, Google Ads y TikTok Ads, con historial y configuración existente.</p>
        <span className={styles.cardLink}>Abrir configuración →</span>
      </a>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={errors?styles.badgePlanned:styles.badgeActive}>{errors?"ATENCIÓN":"ESTABLE"}</span><em>HISTORIAL</em></div>
        <h3>Actividad reciente</h3>
        <p>{latest?String(latest.integration||"Servicio")+" · "+String(latest.event_type||"Evento")+" · "+String(latest.status||"—"):"Sin actividad registrada todavía."}</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>PROTEGIDO</span><em>SEGURIDAD</em></div>
        <h3>Credenciales</h3>
        <p>Las credenciales sensibles permanecen fuera del Master Admin y no se muestran en esta pantalla.</p>
      </article>
      <article className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>ACTIVO</span><em>CONSENTIMIENTO</em></div>
        <h3>Publicidad</h3>
        <p>Los seguimientos publicitarios solo deben activarse cuando exista configuración y consentimiento correspondiente.</p>
      </article>
    </section>

    <section className={styles.sectionHead}>
      <div><span>ÚLTIMOS EVENTOS</span><h2>Historial resumido</h2></div>
      <p>Se muestran los registros más recientes para detectar rápidamente errores o actividad pendiente.</p>
    </section>

    <section className={styles.grid}>
      {rows.slice(0,8).map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}>
          <span className={r.status==="success"?styles.badgeActive:styles.badgePlanned}>{r.status==="success"?"CORRECTO":"REVISAR"}</span>
          <em>{r.integration||"SERVICIO"}</em>
        </div>
        <h3>{r.event_type||"Evento"}</h3>
        <p>{r.message||"Sin mensaje adicional."}<br/>{new Date(r.created_at).toLocaleString("es-US")}</p>
      </article>)}
      {!rows.length&&<article className={styles.card}><h3>Sin eventos registrados</h3><p>El historial aparecerá aquí cuando las integraciones generen actividad.</p></article>}
    </section>
  </main>;
}
