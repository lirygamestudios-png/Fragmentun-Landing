import Link from "next/link";

export default function NotFound(){
  return <main className="authShell">
    <section className="authCard">
      <div className="kicker">FRAGMENTUN</div>
      <h1>404</h1>
      <p className="lead">Esta ruta no existe en Lumen.</p>
      <div className="heroActions">
        <Link className="btn btnPrimary" href="/es">Volver a FRAGMENTUN</Link>
        <Link className="btn btnGhost" href="/en">English</Link>
      </div>
    </section>
  </main>;
}
