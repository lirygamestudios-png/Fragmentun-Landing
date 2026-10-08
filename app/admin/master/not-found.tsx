import styles from "./master-admin.module.css";

export default function MasterAdminNotFound(){
  return <main className={styles.statePage}>
    <section className={styles.stateCard}>
      <span className={styles.stateSigil} aria-hidden="true"><i></i></span>
      <div className={styles.stateKicker}>LIRYGAMES · RUTA NO ENCONTRADA</div>
      <h1>Esta pantalla no existe</h1>
      <p>La dirección solicitada no corresponde a una sección disponible del Commander Center.</p>
      <div className={styles.stateActions}>
        <a href="/admin/master" className={styles.statePrimary}>Volver al Commander Center</a>
        <a href="/admin/master/reports" className={styles.stateSecondary}>Abrir Reportes</a>
      </div>
    </section>
  </main>;
}
