import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";
import styles from "../../master-admin.module.css";

/**
 * Read-only readiness screen. These statuses reflect the owner's stated
 * onboarding progress, NOT verified API connectivity or production capability.
 * Never place API keys, biometrics or financial details in this module.
 */
const providers = [
  {
    name:"Stripe Connect",
    category:"Cobros y liquidaciones",
    status:"CUENTA PREPARADA · CONEXIÓN NO VERIFICADA",
    detail:"Cuenta comunicada como lista por el propietario. No hay confirmación de webhooks, permisos, onboarding de cuentas conectadas, saldos ni desembolsos.",
    checklist:["Confirmar titularidad y modalidad de Connect","Aislar claves y webhooks por entorno","Diseñar conciliación y comisiones","Autorizar pruebas sandbox antes de ejecutarlas"],
  },
  {
    name:"PayPal",
    category:"Método de pago alternativo",
    status:"CUENTA PREPARADA · CONEXIÓN NO VERIFICADA",
    detail:"Cuenta comunicada como lista por el propietario. No equivale a integración API ni a habilitación de pagos reales.",
    checklist:["Validar producto PayPal compatible con el flujo","Separar credenciales sandbox/producción","Definir reembolsos y disputas","Revisar conciliación y liquidaciones"],
  },
  {
    name:"Didit",
    category:"Verificación de identidad",
    status:"APERTURA PENDIENTE",
    detail:"Proveedor seleccionado para evaluación. No se ha abierto sesión de verificación ni se han enviado documentos o biometría.",
    checklist:["Abrir cuenta y revisar plan vigente","Verificar disponibilidad por país y políticas","Definir consentimiento y conservación de datos","Diseñar callback firmado e idempotencia","Mantener revisión humana y aprobación final"],
  },
] as const;

export default async function ProvidersReadinessPage(){
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)redirect("/admin/lirygames/login");
  const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin")redirect("/admin/master");
  if(!(await hasSatisfiedMfa(supabase)))redirect("/admin/lirygames/mfa");
  return <main className={`${styles.workspace} ${styles.modulePage}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CONTROL DE PROVEEDORES</span><h1>Identidad y pagos</h1><p>Preparación de Stripe Connect, PayPal y Didit. Estado declarado, no conectado a servicios externos.</p></div>
      <a className={styles.publicSite} href="/admin/master/integrations">← Integraciones</a>
    </header>
    <section className={styles.moduleStrip} aria-label="Control de activación">
      <span className={styles.moduleGlyph} aria-hidden="true">LG</span>
      <div className={styles.moduleStripCopy}><small>SOLO PLANIFICACIÓN</small><strong>Ninguna operación real autorizada</strong><p>Sin claves, sesiones biométricas, cargos, transferencias o verificaciones en esta página.</p></div>
    </section>
    <section className={styles.grid} aria-label="Proveedores previstos">
      {providers.map(provider=><article className={styles.card} key={provider.name}>
        <div className={styles.cardTop}><span>{provider.category}</span><em>PENDIENTE</em></div>
        <h3>{provider.name}</h3>
        <p><strong>{provider.status}</strong></p>
        <p>{provider.detail}</p>
        <ul>{provider.checklist.map(task=><li key={task}>{task}</li>)}</ul>
      </article>)}
    </section>
    <section className={styles.sectionHead}><div><span>FLUJO PROPUESTO</span><h2>Desarrolladores de terceros</h2></div>
      <p>Solicitud → consentimiento → identidad (Didit) → revisión de negocio y KYB cuando corresponda → aprobación editorial → contrato → configuración de pagos → publicación supervisada.</p>
    </section>
    <section className={styles.grid}>
      <article className={styles.card}><h3>Protección de información</h3><p>El proveedor debe custodiar imágenes de identidad y biometría. LIRYGAMES solo almacenará referencias y resultados mínimos tras definir base legal, acceso y retención.</p></article>
      <article className={styles.card}><h3>Activación futura</h3><p>Cada servicio exige aislamiento de FRAGMENTUN, revisión legal, credenciales exclusivas en servidor, pruebas aprobadas y autorización explícita del propietario.</p></article>
      <article className={styles.card}><h3>Alcance de esta pantalla</h3><p>Documento visual de preparación. No consulta los proveedores ni indica que una conexión está en producción. No permite habilitar servicios.</p></article>
    </section>
  </main>;
}
