import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

export default async function MasterStrategyPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");

  const since30=new Date(Date.now()-30*86400000).toISOString();
  const[
    {count:views},
    {count:amazonClicks},
    {count:leads},
    {count:testCompletes},
    {count:campaigns},
    {count:paidOrders}
  ]=await Promise.all([
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","page_view").gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","amazon_click").gte("created_at",since30),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",since30),
    supabase.from("analytics_events").select("*",{count:"exact",head:true}).eq("event_name","test_complete").gte("created_at",since30),
    supabase.from("campaigns").select("*",{count:"exact",head:true}).eq("active",true),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid")
  ]);

  const leadConversion=(views||0)>0?((leads||0)/(views||1))*100:0;
  const amazonCtr=(views||0)>0?((amazonClicks||0)/(views||1))*100:0;
  const testRate=(views||0)>0?((testCompletes||0)/(views||1))*100:0;

  const kpis=[
    {name:"Tráfico 30D",value:(views||0).toLocaleString(),status:(views||0)>0?"Activa":"Sin señal",note:"Top-of-funnel"},
    {name:"Conversión a lead",value:leadConversion.toFixed(1)+"%",status:leadConversion>0?"Medida":"Base",note:"Captación"},
    {name:"Paso a Amazon",value:amazonCtr.toFixed(1)+"%",status:amazonCtr>0?"Medida":"Base",note:"Intento comercial"},
    {name:"Test completado",value:testRate.toFixed(1)+"%",status:testRate>0?"Medida":"Base",note:"Engagement"},
    {name:"Campañas activas",value:String(campaigns||0),status:(campaigns||0)>0?"Activas":"Pendiente",note:"Growth"},
    {name:"Órdenes pagadas",value:String(paidOrders||0),status:(paidOrders||0)>0?"Revenue":"Pre-revenue",note:"Monetización"}
  ];

  const priorities=[
    {name:"Proteger producción FRAGMENTUN",owner:"Tecnología",state:"EN CURSO",metric:"0 cambios directos a main"},
    {name:"Master Admin MVP",owner:"Operaciones",state:"EN CURSO",metric:"Command Center + módulos"},
    {name:"Instrumentación de conversión",owner:"Growth",state:"ACTIVA",metric:"Analytics + leads"},
    {name:"Commerce readiness",owner:"Comercio",state:"PREPARADA",metric:"Orders/fulfillment modelados"},
    {name:"Game production operating system",owner:"Studio",state:"SIGUIENTE",metric:"Fases 57–59 → ejecución"}
  ];

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · ESTRATEGIA</span><h1>Estrategia & KPIs Ejecutivos</h1><p>Primera jerarquía ejecutiva basada en señales reales y prioridades de implementación.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      {kpis.slice(0,4).map(k=><article key={k.name}><small>{k.name}</small><strong>{k.value}</strong><span>{k.note} · {k.status}</span></article>)}
    </section>

    <section className={styles.sectionHead}>
      <div><span>EXECUTIVE SCORECARD</span><h2>Indicadores corporativos iniciales</h2></div>
      <p>No se establecen metas ficticias: primero medimos la línea base real; después fijaremos targets y tolerancias por KPI.</p>
    </section>
    <section className={styles.grid}>
      {kpis.map(k=><article key={k.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgeActive}>{k.status.toUpperCase()}</span><em>{k.note}</em></div>
        <h3>{k.name}</h3><p><strong>{k.value}</strong></p>
      </article>)}
    </section>

    <section className={styles.sectionHead}>
      <div><span>PRIORIDADES</span><h2>Execution Board</h2></div>
      <p>Conecta estrategia con implementación sin mezclar aún la operación pública de FRAGMENTUN.</p>
    </section>
    <section className={styles.grid}>
      {priorities.map(p=><article key={p.name} className={styles.card}>
        <div className={styles.cardTop}><span className={styles.badgePlanned}>{p.state}</span><em>{p.owner}</em></div>
        <h3>{p.name}</h3><p>{p.metric}</p>
      </article>)}
    </section>
  </main>;
}
