"use client";

import {usePathname} from "next/navigation";
import styles from "../app/admin/master/master-admin.module.css";

const groups=[
  {label:"GENERAL",items:[
    ["/admin/master","⌂","Inicio"],
    ["/admin/master/reports","▦","Reportes"],
    ["/admin/master/operations","◆","Operaciones"],
    ["/admin/master/games","◈","Juegos"],
    ["/admin/master/publishing","↗","Publicación"]
  ]},
  {label:"NEGOCIO",items:[
    ["/admin/master/growth","↗","Crecimiento"],
    ["/admin/master/monetization","$","Monetización"],
    ["/admin/master/commerce","▣","Comercio"],
    ["/admin/master/community","◎","Clientes y Comunidad"],
    ["/admin/master/finance","▥","Finanzas"],
    ["/admin/master/capital","◇","Capital"],
    ["/admin/master/partners","∞","Alianzas"],
    ["/admin/master/suppliers","▤","Proveedores"],
    ["/admin/master/brand","✦","Marca"]
  ]},
  {label:"ESTUDIO",items:[
    ["/admin/master/people","♙","Personas"],
    ["/admin/master/strategy","⌁","Estrategia"],
    ["/admin/master/technology","⚙","Tecnología"],
    ["/admin/master/data","▦","Datos"],
    ["/admin/master/automation","⌘","Automatización e IA"]
  ]},
  {label:"CONTROL",items:[
    ["/admin/master/risk","△","Riesgos y Controles"],
    ["/admin/master/security","◇","Seguridad"],
    ["/admin/master/legal","§","Legal e IP"],
    ["/admin/master/integrations","↗","Integraciones"],
    ["/admin/master/backups","⤓","Copias"],
    ["/admin/master/maintenance","◆","Mantenimiento"],
    ["/admin/master/releases","✓","Revisión para publicar"],
    ["/admin/master/observability","◉","Estado y Pruebas"],
    ["/admin/master/checklist","☑","Revisión visual"],
    ["/admin/master/qa","✓","Pruebas finales"]
  ]}
] as const;

export function MasterSidebar({displayName,role}:{displayName:string;role:string}){
  const pathname=usePathname();
  const initials=displayName.split(/\s+/).filter(Boolean).slice(0,2).map(x=>x[0]?.toUpperCase()).join("")||"LG";

  return <aside className={styles.sidebar}>
    <div className={styles.brand}>
      <span className={styles.sigil}>✦</span>
      <div><strong>LIRYGAMES</strong><small>MASTER ADMIN</small></div>
    </div>

    <div className={styles.navScroll}>
      {groups.map(group=><div className={styles.navGroup} key={group.label}>
        <span className={styles.navLabel}>{group.label}</span>
        <nav className={styles.nav} aria-label={group.label}>
          {group.items.map(([href,icon,label])=>{
            const active=href==="/admin/master"?pathname===href:pathname===href||pathname.startsWith(href+"/");
            return <a key={href} className={active?styles.active:undefined} href={href} aria-current={active?"page":undefined}>
              <span className={styles.navIcon} aria-hidden="true">{icon}</span><span>{label}</span>
            </a>;
          })}
        </nav>
      </div>)}
    </div>

    <div className={styles.sidebarFooter}>
      <div className={styles.identity}>
        <span>{initials}</span>
        <div><strong>{displayName}</strong><small>{role||"admin"}</small></div>
      </div>
      <a className={styles.publicSite} href="/admin">FRAGMENTUN Admin ↗</a>
      <a className={styles.publicSiteSecondary} href="/es" target="_blank" rel="noreferrer">Ver web pública ↗</a>
    </div>
  </aside>;
}
