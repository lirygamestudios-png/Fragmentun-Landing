import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {LiryContactFollowup} from "../../../../../components/LiryContactFollowup";

type ContactMessage={
 id:string;name:string;email:string;subject:string;game_slug:string|null;
 message:string;status:string;created_at:string;internal_note:string|null;assigned_to:string|null;response_draft:string|null;
};
type HistoryItem={id:string;contact_id:string;actor_user_id:string;action:string;details:Record<string,unknown>|null;created_at:string};
const category:Record<string,string>={
 opinion:"Opinión",suggestion:"Sugerencia",problem:"Problema",
 business:"Propuesta comercial",other:"Consulta"
};
export const dynamic="force-dynamic";
export default async function LiryContactAdmin({
 searchParams
}:{searchParams:Promise<{status?:string}>}){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles")
   .select("role").eq("user_id",user.id).maybeSingle();
 if(!profile)redirect("/admin/lirygames/login?unauthorized=1");
 const params=await searchParams;
 const selected=["new","reviewing","resolved","archived"].includes(params.status||"")
  ?params.status||"":"";
 const db=supabase;
 const {data:owners}=await db.from("admin_profiles").select("user_id,display_name").order("display_name");
 let query=db.from("lirygames_contact_messages")
  .select("id,name,email,subject,game_slug,message,status,created_at,internal_note,assigned_to,response_draft")
  .order("created_at",{ascending:false}).limit(100);
 if(selected)query=query.eq("status",selected);
 const {data,error}=await query;
 const messages=(data||[]) as ContactMessage[];
 const ids=messages.map(item=>item.id);
 const {data:history,error:historyError}=ids.length
  ?await db.from("lirygames_contact_history").select("id,contact_id,actor_user_id,action,details,created_at").in("contact_id",ids).order("created_at",{ascending:false}).limit(500)
  :{data:[] as HistoryItem[],error:null};
 const historyRows=(history||[]) as HistoryItem[];
 const ownerNames=new Map((owners||[]).map(o=>[o.user_id,o.display_name||"Administrador"]));
 const {data:allStates,error:countError}=await db.from("lirygames_contact_messages").select("status,assigned_to").limit(1000);
 const totals={all:0,new:0,reviewing:0,resolved:0,archived:0,unassigned:0};
 if(!countError){for(const row of allStates||[]){totals.all++;if(row.status in totals)totals[row.status as "new"|"reviewing"|"resolved"|"archived"]++;if(!row.assigned_to&&["new","reviewing"].includes(row.status))totals.unassigned++;}}
 const layout={minHeight:"100vh",padding:"38px clamp(20px,5vw,85px)",background:"#050b19",color:"#e9f6ff",fontFamily:"Arial,sans-serif"};
 return <main style={layout}>
  <a href="/admin/master/community" style={{color:"#76daff",fontSize:12,textDecoration:"none"}}>← VOLVER A CLIENTES Y COMUNIDAD</a>
  <header style={{borderBottom:"1px solid #235477",paddingBottom:18,marginBottom:20}}>
   <p style={{fontSize:11,letterSpacing:".2em",color:"#5fddff"}}>LIRYGAMES STUDIOS · CONTACTO</p>
   <h1 style={{fontSize:27,margin:"8px 0"}}>Bandeja de mensajes</h1>
   <p style={{color:"#a3c1d9",fontSize:12}}>Mensajes reales de visitantes. Solo accesible a usuarios administrativos autorizados.</p>
  </header>
  {!countError&&<section aria-label="Resumen de atención" style={{margin:"0 0 24px"}}>
   <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:11}}>
    <h2 style={{fontSize:12,letterSpacing:".14em",color:"#7ddfff",fontWeight:800,margin:0}}>PANORAMA DE CONTACTO</h2>
    <span style={{fontSize:11,color:"#8faec8"}}>Información real · Últimos 1,000 registros</span>
   </div>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(175px,1fr))",gap:12}}>
    {([["Recibidos",totals.all,"Total registrado"],["Nuevos",totals.new,"Por revisar"],["En revisión",totals.reviewing,"En seguimiento"],["Resueltos",totals.resolved,"Atendidos"],["Sin responsable",totals.unassigned,"Requieren asignación"]] as const).map(([label,total,description],index)=>
    <div key={label} style={{minWidth:0,minHeight:116,display:"flex",flexDirection:"column",justifyContent:"space-between",padding:"16px 17px",border:"1px solid "+(index===4?"rgba(235,177,93,.45)":"rgba(87,192,251,.28)"),borderRadius:12,background:"linear-gradient(145deg,#0d2038,#09172b)",boxShadow:"inset 0 1px rgba(149,224,255,.06)"}}>
     <span style={{fontSize:11,color:"#c1d7eb",letterSpacing:".035em",fontWeight:650}}>{label}</span>
     <strong style={{fontVariantNumeric:"tabular-nums",fontSize:30,lineHeight:1.15,color:index===4?"#ffd08e":"#8be7ff",fontWeight:800}}>{total}</strong>
     <span style={{fontSize:10,color:"#85a1bc"}}>{description}</span>
    </div>)}
   </div>
  </section>}
  <nav aria-label="Filtrar mensajes" style={{display:"flex",flexWrap:"wrap",gap:9,marginBottom:20}}>
   {[["","TODOS"],["new","NUEVOS"],["reviewing","EN REVISIÓN"],["resolved","RESUELTOS"],["archived","ARCHIVADOS"]].map(([value,label])=>
    <a key={value} href={value?"?status="+value:"?"} style={{padding:"9px 13px",border:"1px solid "+(value===selected?"#4ddaff":"#295571"),background:value===selected?"#0e3e62":"#07182c",borderRadius:5,color:"#e4f6ff",fontSize:11,textDecoration:"none"}}>{label}</a>
   )}
  </nav>
  {error?<p role="alert">No se pudo recuperar la bandeja. Intenta nuevamente.</p>:
   messages.length===0?<p style={{padding:25,border:"1px solid #28536f",borderRadius:8,color:"#aec9dd"}}>No hay mensajes para este filtro.</p>:
   <div style={{display:"grid",gap:12}}>
    {messages.map(item=><article key={item.id} style={{background:"#081b30",border:"1px solid #24516f",borderRadius:7,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:12}}>
       <div><strong>{item.name}</strong><div style={{fontSize:12,marginTop:4}}><a href={"mailto:"+item.email} style={{color:"#6bd9ff"}}>{item.email}</a></div></div>
       <div style={{fontSize:11,color:"#abc7df"}}>{new Date(item.created_at).toLocaleString("es",{dateStyle:"medium",timeStyle:"short"})}</div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12,fontSize:11}}>
       <span style={{color:"#79dffe"}}>{category[item.subject]||"Consulta"}</span>
       <span>{item.status==="new"?"NUEVO":item.status==="reviewing"?"EN REVISIÓN":item.status==="resolved"?"RESUELTO":"ARCHIVADO"}</span>
       {item.game_slug&&<span>Producto: {item.game_slug}</span>}
      </div>
      <p style={{fontSize:13,lineHeight:1.55,whiteSpace:"pre-wrap",overflowWrap:"anywhere",margin:0}}>{item.message}</p>
      {["admin","editor"].includes(profile.role)&&<LiryContactFollowup id={item.id} status={item.status} note={item.internal_note} assignedTo={item.assigned_to} responseDraft={item.response_draft} owners={owners||[]} />}
      <details style={{marginTop:13,borderTop:"1px solid #27415e",paddingTop:12}}>
       <summary style={{cursor:"pointer",color:"#7cdbff",fontSize:12,fontWeight:700}}>HISTORIAL DE ATENCIÓN ({historyRows.filter(h=>h.contact_id===item.id).length})</summary>
       {historyError?<p style={{fontSize:11,color:"#ffacac"}}>No se pudo cargar el historial.</p>:
       historyRows.filter(h=>h.contact_id===item.id).length===0?<p style={{fontSize:11,color:"#9ab4c9"}}>Aún no existen movimientos registrados para este mensaje.</p>:
       <ol style={{paddingLeft:20,display:"grid",gap:10,fontSize:11,color:"#b6d2e9"}}>
        {historyRows.filter(h=>h.contact_id===item.id).map(h=><li key={h.id}>
         <strong>{h.action==="response_drafted"?"Borrador actualizado":h.action==="response_recorded"?"Respuesta registrada":"Seguimiento actualizado"}</strong>
         {" · "}{ownerNames.get(h.actor_user_id)||"Usuario autorizado"}
         {" · "}{new Date(h.created_at).toLocaleString("es",{dateStyle:"medium",timeStyle:"short"})}
         {h.details&&typeof h.details.status==="string"&&<span> · Estado: {h.details.status==="new"?"Nuevo":h.details.status==="reviewing"?"En revisión":h.details.status==="resolved"?"Resuelto":h.details.status==="archived"?"Archivado":h.details.status}</span>}
        </li>)}
       </ol>}
      </details>
    </article>)}
   </div>}
  <p style={{fontSize:11,color:"#7393aa",marginTop:24}}>Últimos 100 mensajes por filtro. El historial registra cambios administrativos. Las notas y borradores son internos; todavía no se envían correos desde esta bandeja.</p>
 </main>;
}
