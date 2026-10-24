import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";
import {INITIAL_DEVELOPER_GATE_STATE,applyTrustedDeveloperEvent} from "../../../../../lib/games/liry-developer-trusted-gates";
import {projectDeveloperVerificationView} from "../../../../../lib/games/liry-developer-identity-policy";
import styles from "../../master-admin.module.css";

/** Only evaluates pure fail-closed policy examples; no applicant records or API activity. */
const rejectedUntrusted=applyTrustedDeveloperEvent(INITIAL_DEVELOPER_GATE_STATE,
 {source:"verified_provider",kind:"identity_verified",reference:"policy-example"},
 {providerSignatureVerified:false,staffAuthorizationVerified:false,bankAuthorityVerified:false,identityFeatureEnabled:false});
const preview=projectDeveloperVerificationView(null);
const checkpoints=[
 ["IDV","Verificación de identidad","Se requiere resultado autenticado del proveedor y consentimiento.","Didit"],
 ["KYB","Empresa y representación","La identidad personal no sustituye la validación de empresa.","Revisión empresarial"],
 ["IP","Propiedad intelectual","La titularidad y licencias deben revisarse por personal autorizado.","Derechos"],
 ["LEGAL","Contrato y obligaciones","Acuerdo firmado y condiciones comerciales validadas.","Admisión"],
 ["PAYOUT","Cuenta de liquidación","El proveedor de pagos verifica beneficiario y capacidad de desembolso.","Finanzas"],
 ["EDITORIAL","Aprobación de publicación","Un revisor editorial autoriza cada título de forma separada.","Publicación"],
] as const;

export default async function DeveloperReviewPage(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||profile.role!=="admin")redirect("/admin/master");
 if(!(await hasSatisfiedMfa(supabase)))redirect("/admin/lirygames/mfa");
 return <main className={`${styles.workspace} ${styles.modulePage}`}>
  <header className={styles.topbar}><div><span className={styles.eyebrow}>LIRYGAMES · DESARROLLADORES</span><h1>Revisión administrativa</h1><p>Preparación de permisos y estados de aprobación. Sin solicitudes reales, sin acciones de aprobación y sin conexión a proveedores.</p></div><a className={styles.publicSite} href="/admin/master/developers">← Admisión</a></header>
  <nav aria-label="Navegación de Liry Developers"><a className={styles.publicSite} href="/admin/master/developers/dossier">Consultar expediente →</a></nav>
  <section className={styles.moduleStrip} aria-label="Control de seguridad">
   <span className={styles.moduleGlyph} aria-hidden="true">RV</span>
   <div className={styles.moduleStripCopy}><small>VERIFICACIÓN DE POLÍTICAS</small><strong>Autorizaciones cerradas por defecto</strong><p>Una señal de identidad no firmada o sin función habilitada no puede aprobar solicitudes.</p></div>
  </section>
  <section className={styles.grid} aria-label="Resultado de políticas">
   <article className={styles.card}><div className={styles.cardTop}><span>POLÍTICA DE IDENTIDAD</span><em>DESACTIVADA</em></div><h3>Verificación real</h3><p>{preview.explanation}</p><p>Solicitar KYC: {preview.canRequestVerification?"Habilitado":"No habilitado"} · Publicar: {preview.canPublish?"Habilitado":"Bloqueado"}</p></article>
   <article className={styles.card}><div className={styles.cardTop}><span>EVENTO NO FIABLE</span><em>DENEGADO</em></div><h3>Protección ante aprobación falsa</h3><p>Estado de identidad: {rejectedUntrusted.identity}. Admisión: {rejectedUntrusted.admission}. No se concede aprobación por eventos no autorizados.</p></article>
   <article className={styles.card}><div className={styles.cardTop}><span>EXPEDIENTES</span><em>SIN DATOS</em></div><h3>Solicitudes</h3><p>No hay un backend de expedientes habilitado para esta vista. No se infiere que existan cero solicitudes en otros sistemas.</p></article>
  </section>
  <section className={styles.sectionHead}><div><span>SEPARACIÓN DE RESPONSABILIDADES</span><h2>Puertas de revisión</h2></div><p>El equipo asignado debe comprobar cada requisito antes de cualquier futura acción de aprobación.</p></section>
  <section className={styles.grid}>{checkpoints.map(([code,name,description,owner])=><article className={styles.card} key={code}><div className={styles.cardTop}><span>{code}</span><em>SIN EVALUAR</em></div><h3>{name}</h3><p><strong>Responsable previsto:</strong> {owner}</p><p>{description}</p></article>)}</section>
  <section className={styles.sectionHead}><div><span>CONTROL FINAL</span><h2>Sin operaciones externas</h2></div><p>Para habilitar solicitudes reales faltan: aislamiento de datos con FRAGMENTUN, permisos por expediente, firma e idempotencia de webhooks, revisión legal, auditoría de cambios, pruebas sandbox y autorización expresa.</p></section>
 </main>;
}
