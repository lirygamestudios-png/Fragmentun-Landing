"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items=[
  ["Inicio","/admin"],
  ["Saga","/admin/saga"],
  ["Contenido","/admin/contenido"],
  ["Personajes","/admin/personajes"],
  ["Medios","/admin/medios"],
  ["Analítica","/admin/analytics"],
  ["Suscriptores","/admin/leads"],
  ["Integraciones","/admin/integrations"],
  ["Mapa","/admin/mapa"],
  ["Estado","/admin/status"]
] as const;

const hiddenPrefixes=[
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password"
];

export function AdminInteriorChrome({children}:{children:React.ReactNode}){
  const pathname=usePathname();
  const hidden=pathname==="/admin"||hiddenPrefixes.some(x=>pathname.startsWith(x));
  if(hidden)return <>{children}</>;

  return <div className="adminInteriorShell">
    <div className="adminInteriorBrandbar">
      <Link href="/admin" className="adminInteriorBrand">
        <span className="adminInteriorSigil">✦</span>
        <div><strong>FRAGMENTUN</strong><small>PANEL DE ADMINISTRACIÓN</small></div>
      </Link>
      <nav className="adminInteriorNav" aria-label="Navegación del panel">
        {items.map(([label,href])=><Link key={href} href={href} className={pathname===href?"active":""}>{label}</Link>)}
      </nav>
      <Link href="/es" target="_blank" className="adminInteriorSite">Ver sitio ↗</Link>
    </div>
    {children}
  </div>;
}
