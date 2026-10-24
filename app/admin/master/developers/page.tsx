import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";

/** Design-only checklist; never reads applicant PII or processes biometric events. */
const stages=[
 {name:"Solicitud",owner:"Desarrollador",gate:"Identificación del solicitante y aceptación de condiciones",state:"DISEÑO"},
 {name:"Identidad KYC",owner:"Didit",gate:"Consentimiento, firma de callbacks y verificación de identidad",state:"DESACTIVADO"},
 {name:"Empresa KYB",owner:"Revisión empresarial",gate:"Identificación de entidad y representantes cuando corresponda",state:"POR DEFINIR"},
 {name:"Derechos e IP",owner:"Equipo LIRYGAMES",gate:"Titularidad del videojuego, licencias y políticas de publicación",state:"REVISIÓN HUMANA"},
 {name:"Contrato",owner:"Equipo LIRYGAMES",gate:"Acuerdo firmado, territorios, comisiones y responsabilidades",state:"PENDIENTE"},
 {name:"Pagos",owner:"Stripe Connect / PayPal",gate:"Validación del producto y del beneficiario, sin transferencias automáticas",state:"DESACTIVADO"},
 {name:"Revisión editorial",owner:"Equipo LIRYGAMES",gate:"Calidad, seguridad, metadatos, builds y aprobación final",state:"REVISIÓN HUMANA"}
] as const;

export default async function DeveloperReadiness(){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||profile.role!=="admin")redirect("/admin/master");
 if(!(await hasSatisfiedMfa(supabase)))redirect("/admin/lirygames/mfa");
 return <main className={`${styles.workspace} ${styles.modulePage}`}>
  <header className={styles.topbar}><div><span className={styles.eyebrow}>LIRYGAMES · LIRY DEVELOPERS</span><h1>Admisión supervisada</h1><p>Mapa de requisitos para desarrolladores independientes y estudios. Este panel no tramita solicitudes reales.</p></div><a className={styles.publicSite} href="/admin/master">← Commander Center</a></header>
  <section className={styles.moduleStrip} aria-label="Estado del sistema">
   <span className={styles.moduleGlyph} aria-hidden="true">LD</span>
   <div className={styles.moduleStripCopy}><small>PREPARACIÓN SIN COSTOS</small><strong>Proveedores con cuentas abiertas; integraciones todavía no verificadas</strong><p>Ninguna sesión Didit, cuenta conectada, cobro, pago o publicación se genera desde este panel.</p></div>
  </section>
  <section className={styles.sectionHead}><div><span>PUERTAS DE CONTROL</span><h2>Evaluación antes de publicar</h2></div><p>La identidad verificada no sustituye el contrato, la comprobación de derechos, la autorización de pagos ni la aprobación editorial.</p></section>
  <section className={styles.grid} aria-label="Etapas de admisión">
   {stages.map((stage,index)=><article className={styles.card} key={stage.name}>
    <div className={styles.cardTop}><span>ETAPA {index+1}</span><em>{stage.state}</em></div>
    <h3>{stage.name}</h3><p><strong>Responsable:</strong> {stage.owner}</p><p>{stage.gate}</p>
   </article>)}
  </section>
  <section className={styles.sectionHead}><div><span>SEGURIDAD</span><h2>Bloqueos obligatorios</h2></div><p>No usar fotografías, biometría ni documentos reales en pruebas. Falta validar separación de los datos y autorización de producción.</p></section>
  <section className={styles.grid}>
   <article className={styles.card}><h3>Estados independientes</h3><p>Identidad, KYB, derechos, contrato, pagos y publicación se evalúan por separado. Un resultado positivo no desbloquea automáticamente los demás.</p></article>
   <article className={styles.card}><h3>Eventos externos</h3><p>Antes de habilitar webhooks será obligatorio verificar firma, identidad de la solicitud, idempotencia, controles de acceso y registro de auditoría sin datos sensibles.</p></article>
   <a className={styles.card} href="/admin/master/integrations/providers"><h3>Proveedores previstos</h3><p>Consultar la preparación de Didit, Stripe Connect y PayPal.</p><span className={styles.cardLink}>Ver integraciones →</span></a>
  </section>
 </main>;
}
