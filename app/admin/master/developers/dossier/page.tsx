import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";
import styles from "../../master-admin.module.css";

const dossier=[
 {name:"Identidad del solicitante",source:"Didit (futuro)",access:"Oficial de admisión",requirement:"Guardar únicamente referencia y resultado de proveedor verificado. Nunca fotografías faciales o documentos."},
 {name:"Empresa y representación",source:"KYB (cuando corresponda)",access:"Revisor empresarial",requirement:"Confirmar entidad legal, país de constitución y autorización del representante."},
 {name:"Titularidad y derechos",source:"Evidencias privadas",access:"Revisor de derechos",requirement:"Verificar derechos de distribución, licencias y ausencia de infracciones conocidas."},
 {name:"Acuerdo comercial",source:"Contrato formal",access:"Oficial de admisión",requirement:"Conservar constancia de firma y versión contractual, comisiones y territorios."},
 {name:"Pagos y liquidaciones",source:"Stripe Connect / PayPal (futuro)",access:"Responsable financiero",requirement:"Guardar referencias de cuentas conectadas, nunca credenciales o información bancaria completa."},
 {name:"Revisión del videojuego",source:"Evaluación editorial",access:"Equipo editorial",requirement:"Resultado de control de calidad, clasificación, documentación y aprobación final."}
] as const;

const audit=[
 "Solicitud recibida (solo cuando haya backend autorizado)",
 "Consentimiento y verificación documental aprobados",
 "Revisión humana de propiedad intelectual",
 "Aprobación contractual independiente",
 "Preparación de método de liquidación",
 "Autorización editorial final"
];

export default async function DeveloperDossierReadiness(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||profile.role!=="admin")redirect("/admin/master");
 if(!(await hasSatisfiedMfa(supabase)))redirect("/admin/lirygames/mfa");
 return <main className={`${styles.workspace} ${styles.modulePage}`}>
  <header className={styles.topbar}><div><span className={styles.eyebrow}>LIRYGAMES · LIRY DEVELOPERS</span><h1>Expediente de desarrollador</h1><p>Estructura de expediente y controles de acceso. No hay expedientes reales cargados ni consultas de datos personales.</p></div><a className={styles.publicSite} href="/admin/master/developers">← Admisión</a></header>
  <nav className={styles.developerSubnav} aria-label="Navegación de Liry Developers"><a className={styles.publicSite} href="/admin/master/developers/review">Continuar a revisión →</a></nav>
  <section className={styles.moduleStrip} aria-label="Estado de expediente">
   <span className={styles.moduleGlyph} aria-hidden="true">ED</span>
   <div className={styles.moduleStripCopy}><small>MODELO DE EXPEDIENTE</small><strong>Sin solicitudes reales · Sin almacenamiento documental</strong><p>La visualización describe los controles futuros, no confirma que exista un desarrollador aprobado.</p></div>
  </section>
  <section className={styles.sectionHead}><div><span>CONTROLES POR ÁREA</span><h2>Secciones del expediente</h2></div><p>Acceso mínimo por función y separación entre revisión de identidad, derechos y pagos.</p></section>
  <section className={styles.grid} aria-label="Esquema de expediente">
   {dossier.map((item,index)=><article className={styles.card} key={item.name}>
    <div className={styles.cardTop}><span>{String(index+1).padStart(2,"0")} · CONTROL</span><em>NO ACTIVADO</em></div>
    <h3>{item.name}</h3><p><strong>Fuente prevista:</strong> {item.source}</p><p><strong>Acceso futuro:</strong> {item.access}</p><p>{item.requirement}</p>
   </article>)}
  </section>
  <section className={styles.sectionHead}><div><span>AUDITORÍA</span><h2>Historial de decisiones previsto</h2></div><p>Registro limitado a identificadores opacos, marca de tiempo, actor autorizado y decisión; sin imágenes, información bancaria ni datos biométricos.</p></section>
  <section className={styles.grid}>
   {audit.map((item,index)=><article className={styles.card} key={item}>
    <div className={styles.cardTop}><span>PASO {index+1}</span><em>NO EJECUTADO</em></div><h3>{item}</h3>
   </article>)}
  </section>
  <section className={styles.sectionHead}><div><span>CONDICIONES</span><h2>Puertas antes de habilitar el expediente</h2></div><p>Autorización expresa, entorno LIRYGAMES aislado, MFA, políticas de privacidad y retención, RLS por desarrollador, auditoría y revisión legal. Ningún estado mostrado constituye evidencia de aprobación.</p></section>
 </main>;
}
