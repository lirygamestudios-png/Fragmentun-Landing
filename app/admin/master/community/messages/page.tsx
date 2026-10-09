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
}:{searchParams:Promise<{status?:string;q?:string;subject?:string;pending?:string;draft?:string;owner?:string;age?:string}>}){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect("/admin/lirygames/login");
 const {data:profile}=await supabase.from("admin_profiles")
   .select("role").eq("user_id",user.id).maybeSingle();
 if(!profile)redirect("/admin/lirygames/login?unauthorized=1");
 const params=await searchParams;
 const selected=["new","reviewing","resolved","archived"].includes(params.status||"")
  ?params.status||"":"";
 const search=(params.q||"").trim().slice(0,80).replace(/[%_,()]/g,"");
 const subject=["opinion","suggestion","problem","business","other"].includes(params.subject||"")?params.subject||"":"";
 const pending=params.pending==="1";
 const draftFilter=["ready","missing"].includes(params.draft||"")?params.draft||"":"";
 const ownerFilter=params.owner==="unassigned"?"unassigned":/^[0-9a-f-]{36}$/i.test(params.owner||"")?params.owner||"":"";
 const ageFilter=["3","7"].includes(params.age||"")?params.age||"":"";
 const queryString=(status:string)=>{const p=new URLSearchParams();if(status)p.set("status",status);if(search)p.set("q",search);if(subject)p.set("subject",subject);if(pending)p.set("pending","1");if(draftFilter)p.set("draft",draftFilter);if(ownerFilter)p.set("owner",ownerFilter);if(ageFilter)p.set("age",ageFilter);return "?"+p.toString();};
 const db=supabase;
 const {data:owners}=await db.from("admin_profiles").select("user_id,display_name").order("display_name");
 let query=db.from("lirygames_contact_messages")
  .select("id,name,email,subject,game_slug,message,status,created_at,internal_note,assigned_to,response_draft")
  .order("created_at",{ascending:false}).limit(100);
 if(selected)query=query.eq("status",selected);
 if(subject)query=query.eq("subject",subject);
 if(search)query=query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
 if(pending)query=query.in("status",["new","reviewing"]);
 if(ownerFilter==="unassigned")query=query.is("assigned_to",null);
 else if(ownerFilter)query=query.eq("assigned_to",ownerFilter);
 if(ageFilter){query=query.in("status",["new","reviewing"]).lte("created_at",new Date(Date.now()-Number(ageFilter)*86400000).toISOString());}
 if(draftFilter==="ready")query.not("response_draft","is",null).neq("response_draft","");
 if(draftFilter==="missing")query.or("response_draft.is.null,response_draft.eq.");
 const {data,error}=await query;
 const now=Date.now();
 const ageDays=(date:string)=>Math.max(0,Math.floor((now-new Date(date).getTime())/86400000));
 const isPending=(item:ContactMessage)=>item.status==="new"||item.status==="reviewing";
 const messages=((data||[]) as ContactMessage[]).sort((a,b)=>{
  if(pending){const aPriority=ageDays(a.created_at)+(a.status==="new"?2:0)+(a.assigned_to?0:4);const bPriority=ageDays(b.created_at)+(b.status==="new"?2:0)+(b.assigned_to?0:4);return bPriority-aPriority;}
  return new Date(b.created_at).getTime()-new Date(a.created_at).getTime();
 });
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
  <form method="GET" aria-label="Buscar y clasificar mensajes" style={{display:"flex",flexWrap:"wrap",alignItems:"end",gap:10,padding:"14px 16px",border:"1px solid #285571",borderRadius:10,background:"#091a2e",marginBottom:16}}>
   {selected&&<input type="hidden" name="status" value={selected}/>}
   {pending&&<input type="hidden" name="pending" value="1"/>}
   {draftFilter&&<input type="hidden" name="draft" value={draftFilter}/>}
   {ownerFilter&&<input type="hidden" name="owner" value={ownerFilter}/>}
   {ageFilter&&<input type="hidden" name="age" value={ageFilter}/>}
   <label style={{display:"grid",gap:6,flex:"2 1 230px",color:"#b9d8ed",fontSize:11}}>Buscar por nombre o correo
    <input name="q" defaultValue={search} maxLength={80} placeholder="Nombre o correo electrónico..." style={{width:"100%",padding:"11px 12px",background:"#061429",color:"#f2fbff",border:"1px solid #3179a1",borderRadius:7}}/>
   </label>
   <label style={{display:"grid",gap:6,flex:"1 1 190px",color:"#b9d8ed",fontSize:11}}>Tipo de consulta
    <select name="subject" defaultValue={subject} style={{width:"100%",padding:"11px 12px",background:"#061429",color:"#f2fbff",border:"1px solid #3179a1",borderRadius:7}}>
     <option value="">Todos los tipos</option>{Object.entries(category).map(([value,label])=><option key={value} value={value}>{label}</option>)}
    </select>
   </label>
   <button type="submit" style={{padding:"11px 17px",border:"1px solid #4ddaff",borderRadius:8,background:"#07517b",color:"#f4fcff",fontSize:11,fontWeight:800,cursor:"pointer"}}>BUSCAR →</button>
   <a href={selected?"?status="+selected:"?"} style={{padding:"11px 9px",color:"#9cdaf4",fontSize:11,textDecoration:"none"}}>Limpiar</a>
  </form>
  <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",marginBottom:14}}>
   <a href={pending?queryString(selected).replace(/([?&])pending=1(&|$)/,"$1").replace(/[?&]$/,"")||"?":queryString(selected)+(queryString(selected)==="?"?"":"&")+"pending=1"} style={{padding:"10px 15px",border:"1px solid "+(pending?"#ffbf79":"#39769b"),borderRadius:8,background:pending?"#49301c":"#0a263e",color:pending?"#ffd5a7":"#bce9ff",textDecoration:"none",fontSize:11,fontWeight:800}}>{pending?"✓ MOSTRANDO PENDIENTES · QUITAR FILTRO":"VER SOLO PENDIENTES →"}</a>
   <span style={{color:"#92b1ca",fontSize:11}}>Los pendientes se ordenan por antigüedad y necesidad de asignación.</span>
  </div>
  <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginBottom:14}}>
   <span style={{color:"#94b6cc",fontSize:11,marginRight:3}}>PREPARACIÓN DE RESPUESTAS</span>
   {([["","Todos"],["ready","Con borrador"],["missing","Sin borrador"]] as const).map(([value,label])=>{
    const p=new URLSearchParams();if(selected)p.set("status",selected);if(search)p.set("q",search);if(subject)p.set("subject",subject);if(pending)p.set("pending","1");if(ownerFilter)p.set("owner",ownerFilter);if(ageFilter)p.set("age",ageFilter);if(value)p.set("draft",value);
    return <a key={value} href={"?"+p.toString()} style={{padding:"8px 12px",border:"1px solid "+(value===draftFilter?"#5be0f8":"#315571"),borderRadius:7,background:value===draftFilter?"#123f54":"#0a2134",color:value===draftFilter?"#e4fbff":"#add1e6",fontSize:11,textDecoration:"none"}}>{label}</a>;
   })}
  </div>
  <form method="GET" aria-label="Seguimiento de mensajes por responsable y antigüedad" style={{display:"flex",alignItems:"end",flexWrap:"wrap",gap:10,padding:"13px 15px",marginBottom:15,border:"1px solid #285571",borderRadius:10,background:"#091b2f"}}>
   {selected&&<input type="hidden" name="status" value={selected}/>}
   {search&&<input type="hidden" name="q" value={search}/>}
   {subject&&<input type="hidden" name="subject" value={subject}/>}
   {pending&&<input type="hidden" name="pending" value="1"/>}
   {draftFilter&&<input type="hidden" name="draft" value={draftFilter}/>}
   <label style={{display:"grid",gap:5,flex:"1 1 200px",fontSize:11,color:"#b5d7ed"}}>Responsable
    <select name="owner" defaultValue={ownerFilter} style={{background:"#061429",color:"#e8faff",border:"1px solid #31789b",padding:"10px",borderRadius:7}}>
     <option value="">Todos</option><option value="unassigned">Sin asignar</option>
     {(owners||[]).map(o=><option key={o.user_id} value={o.user_id}>{o.display_name||"Administrador"}</option>)}
    </select>
   </label>
   <label style={{display:"grid",gap:5,flex:"1 1 180px",fontSize:11,color:"#b5d7ed"}}>Pendientes desde
    <select name="age" defaultValue={ageFilter} style={{background:"#061429",color:"#e8faff",border:"1px solid #31789b",padding:"10px",borderRadius:7}}>
     <option value="">Cualquier fecha</option><option value="3">Hace 3 días o más</option><option value="7">Hace 7 días o más</option>
    </select>
   </label>
   <button type="submit" style={{padding:"10px 15px",borderRadius:8,background:"#07517b",border:"1px solid #4ddaff",color:"#f4fcff",fontWeight:800,fontSize:11,cursor:"pointer"}}>APLICAR →</button>
  </form>
  <section aria-label="Accesos rápidos de seguimiento" style={{display:"flex",flexWrap:"wrap",gap:9,alignItems:"center",marginBottom:16}}>
   <span style={{color:"#91b4cf",fontSize:11,fontWeight:700}}>ACCESOS RÁPIDOS</span>
   {([["Mis pendientes",{owner:user.id,pending:"1",status:"",age:""}],["Sin asignar",{owner:"unassigned",pending:"1",status:"",age:""}],["Pendientes antiguos",{owner:"",pending:"1",status:"",age:"7"}]] as const).map(([label,filter])=>{
    const p=new URLSearchParams();if(search)p.set("q",search);if(subject)p.set("subject",subject);if(draftFilter)p.set("draft",draftFilter);
    if(filter.owner)p.set("owner",filter.owner);if(filter.pending)p.set("pending",filter.pending);if(filter.age)p.set("age",filter.age);
    return <a key={label} href={"?"+p.toString()} style={{display:"inline-flex",alignItems:"center",padding:"9px 13px",border:"1px solid rgba(88,194,250,.38)",borderRadius:8,background:"linear-gradient(120deg,#0b2b46,#0a1b34)",color:"#c0eeff",fontSize:11,fontWeight:700,textDecoration:"none"}}>{label} →</a>;
   })}
  </section>
  <nav aria-label="Filtrar mensajes" style={{display:"flex",flexWrap:"wrap",gap:9,marginBottom:20}}>
   {[["","TODOS"],["new","NUEVOS"],["reviewing","EN REVISIÓN"],["resolved","RESUELTOS"],["archived","ARCHIVADOS"]].map(([value,label])=>
    <a key={value} href={queryString(value)} style={{padding:"9px 13px",border:"1px solid "+(value===selected?"#4ddaff":"#295571"),background:value===selected?"#0e3e62":"#07182c",borderRadius:5,color:"#e4f6ff",fontSize:11,textDecoration:"none"}}>{label}</a>
   )}
  </nav>
  {error?<p role="alert">No se pudo recuperar la bandeja. Intenta nuevamente.</p>:
   messages.length===0?<p style={{padding:25,border:"1px solid #28536f",borderRadius:8,color:"#aec9dd"}}>No hay mensajes que coincidan con los filtros seleccionados.</p>:
   <div style={{display:"grid",gap:12}}>
    {messages.map(item=><article key={item.id} style={{background:"#081b30",border:"1px solid #24516f",borderRadius:7,padding:18}}>
      <div style={{display:"flex",justifyContent:"space-between",gap:12,flexWrap:"wrap",marginBottom:12}}>
       <div><strong>{item.name}</strong><div style={{fontSize:12,marginTop:4}}><a href={"mailto:"+item.email} style={{color:"#6bd9ff"}}>{item.email}</a></div></div>
       <div style={{fontSize:11,color:"#abc7df"}}>{new Date(item.created_at).toLocaleString("es",{dateStyle:"medium",timeStyle:"short"})}</div>
      </div>
      <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:12,fontSize:11}}>
       {isPending(item)&&<span style={{border:"1px solid "+(ageDays(item.created_at)>=3?"#ffb06d":"#3986a7"),borderRadius:5,padding:"3px 7px",color:ageDays(item.created_at)>=3?"#ffd0a8":"#b5ebff"}}>{ageDays(item.created_at)>=3?"ATENCIÓN PRIORITARIA · ":"PENDIENTE · "}{ageDays(item.created_at)===0?"Hoy":ageDays(item.created_at)===1?"1 día":ageDays(item.created_at)+" días"}</span>}
       {isPending(item)&&!item.assigned_to&&<span style={{color:"#ffd494"}}>SIN RESPONSABLE</span>}
       <span style={{color:"#79dffe"}}>{category[item.subject]||"Consulta"}</span>
       <span>{item.status==="new"?"NUEVO":item.status==="reviewing"?"EN REVISIÓN":item.status==="resolved"?"RESUELTO":"ARCHIVADO"}</span>
       {item.game_slug&&<span>Producto: {item.game_slug}</span>}
       {isPending(item)&&<span style={{padding:"3px 7px",borderRadius:5,border:"1px solid "+(item.response_draft?.trim()?"#3b9c91":"#926a37"),color:item.response_draft?.trim()?"#a1f4dc":"#ffdda8"}}>{item.response_draft?.trim()?"BORRADOR PREPARADO · NO ENVIADO":"RESPUESTA POR PREPARAR"}</span>}
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
