import Link from "next/link";
import styles from "../mi-liry/mi-liry.module.css";
import {LiryDeveloperAdmissionPreview} from "../../../components/LiryDeveloperAdmissionPreview";
import {LiryDeveloperGameListingPreview} from "../../../components/LiryDeveloperGameListingPreview";
export const metadata={title:"LIRY DEVELOPER | LIRYGAMES STUDIOS",description:"Vista preparatoria del portal de publicación supervisada.",robots:{index:false,follow:false}};
const stages=[
 {label:"SOLICITUD DE ADMISIÓN",detail:"Identidad comercial, propiedad intelectual y tipo de juego Premium o Freemium.",status:"Próximamente"},
 {label:"FICHA DEL VIDEOJUEGO",detail:"Descripción, materiales, clasificación por edad y precios propuestos.",status:"Próximamente"},
 {label:"CARGA PRIVADA Y REVISIÓN",detail:"Build y materiales examinados antes de solicitar aprobación de publicación.",status:"Próximamente"},
 {label:"VENTAS Y LIQUIDACIONES",detail:"Solo ingresos reales conciliados, comisión pactada y saldos autorizados.",status:"Próximamente"}
] as const;
export default function LiryDeveloperPage(){
 return <main className={styles.page}>
  <header className={styles.header}><Link href="/lirygames" className={styles.brand} aria-label="Volver al FrontDesk de LIRYGAMES"><span className={styles.sigil} aria-hidden="true"><i></i><b></b></span></Link><Link href="/lirygames#perfil-gamer" className={styles.back}>← VOLVER AL FRONTDESK</Link></header>
  <section className={styles.hero} aria-labelledby="developer-title"><span className={styles.eyebrow}>LIRYGAMES STUDIOS · PUBLICACIÓN PARA TERCEROS</span><h1 id="developer-title">LIRY <em>DEVELOPER</em></h1><p>Publica, vende y recibe tus liquidaciones. Tú gestionas tus materiales; LIRYGAMES aprueba la publicación.</p><span className={styles.state}>VISTA PREPARATORIA · SIN CUENTA DE DESARROLLADOR</span></section>
  <section className={styles.content} aria-label="Etapas del programa para desarrolladores"><div className={styles.grid}>{stages.map(stage=><article className={styles.card} key={stage.label}><h3>{stage.label}</h3><p>{stage.detail}</p><small>{stage.status}</small></article>)}</div>
  <LiryDeveloperAdmissionPreview />
  <LiryDeveloperGameListingPreview />
  <div className={styles.notice}><strong>PREPARACIÓN · SIN OPERACIONES REALES</strong><p>Esta pantalla no permite crear cuentas, presentar solicitudes, cargar archivos ni recibir pagos. El programa se habilitará tras verificar identidad, licencias, controles técnicos y financieros.</p><Link href="/lirygames">VOLVER A LIRYGAMES →</Link></div></section>
  <footer className={styles.footer}>© {new Date().getFullYear()} LIRYGAMES STUDIOS · Todos los derechos reservados.</footer>
 </main>;
}
