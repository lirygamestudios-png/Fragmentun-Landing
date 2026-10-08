"use client";

import {usePathname} from "next/navigation";
import styles from "../app/admin/master/master-admin.module.css";

const items=[
  ["/admin/master","⌂","Inicio"],
  ["/admin","◈","FRAGMENTUN Admin"],
  ["/admin/analytics","▥","Analítica"],
  ["/admin/status","⚙","Estado del Sistema"],
  ["/admin/master/reports","▦","Reportes"],
  ["/admin/master/audit","▤","Auditoría"],
  ["/admin/master/integrations","↗","Integraciones"],
  ["/admin/master/backups","⤓","Copias"],
  ["/admin/master/maintenance","◆","Mantenimiento"],
  ["/admin/master/checklist","☑","Revisión visual"],
  ["/admin/master/qa","✓","Pruebas finales"]
] as const;

export function MasterSidebar({displayName,role}:{displayName:string;role:string}){
  const pathname=usePathname();
  return <aside className={styles.sidebar}>
    <div className={styles.brand}>
      <span className={styles.sigil}>✦</span>
      <div><strong>LIRYGAMES</strong><small>MASTER ADMIN</small></div>
    </div>
    <nav className={styles.nav} aria-label="Navegación principal del Master Admin">
      {items.map(([href,icon,label])=>{
        const active=href==="/admin/master"?pathname===href:pathname===href||pathname.startsWith(href+"/");
        return <a key={href} className={active?styles.active:undefined} href={href} aria-current={active?"page":undefined}>
          <span aria-hidden="true">{icon}</span><span>{label}</span>
        </a>;
      })}
    </nav>
    <div className={styles.identity}>
      <span>{displayName.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"LG"}</span>
      <div><strong>{displayName}</strong><small>{role||"admin"}</small></div>
    </div>
    <a className={styles.publicSite} href="/es" target="_blank" rel="noreferrer">Ver FRAGMENTUN ↗</a>
  </aside>;
}
