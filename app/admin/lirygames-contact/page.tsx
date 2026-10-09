import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {createSupabaseServiceClient} from "../../../lib/supabase/service";
import {LiryContactFollowup} from "../../../components/LiryContactFollowup";

type ContactMessage={
 id:string;name:string;email:string;subject:string;game_slug:string|null;
 message:string;status:string;created_at:string;internal_note:string|null;assigned_to:string|null;
};
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
 if(!user)redirect("/admin/login");
 const {data:profile}=await supabase.from("admin_profiles")
   .select("role").eq("user_id",user.id).maybeSingle();
 if(!profile)redirect("/admin/login?unauthorized=1");
 const params=await searchParams;
 const selected=["new","reviewing","resolved","archived"].includes(params.status||"")
  ?params.status||"":"";
 const db=createSupabaseServiceClient();
 const {data:owners}=await db.from("admin_profiles").select("user_id,display_name").order("display_name");
 let query=db.from("lirygames_contact_messages")
  .select("id,name,email,subject,game_slug,message,status,created_at,internal_note,assigned_to")
  .order("created_at",{ascending:false}).limit(100);
 if(selected)query=query.eq("status",selected);
 const {data,error}=await query;
 const messages=(data||[]) as ContactMessage[];
 const layout={minHeight:"100vh",padding:"38px clamp(20px,5vw,85px)",background:"#050b19",color:"#e9f6ff",fontFamily:"Arial,sans-serif"};
 return <main style={layout}>
  <a href="/admin" style={{color:"#76daff",fontSize:12,textDecoration:"none"}}>← VOLVER AL ADMIN</a>
  <header style={{borderBottom:"1px solid #235477",paddingBottom:18,marginBottom:20}}>
   <p style={{fontSize:11,letterSpacing:".2em",color:"#5fddff"}}>LIRYGAMES STUDIOS · CONTACTO</p>
   <h1 style={{fontSize:27,margin:"8px 0"}}>Bandeja de mensajes</h1>
   <p style={{color:"#a3c1d9",fontSize:12}}>Mensajes reales de visitantes. Solo accesible a usuarios administrativos autorizados.</p>
  </header>
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
      {["admin","editor"].includes(profile.role)&&<LiryContactFollowup id={item.id} status={item.status} note={item.internal_note} assignedTo={item.assigned_to} owners={owners||[]} />}
    </article>)}
   </div>}
  <p style={{fontSize:11,color:"#7393aa",marginTop:24}}>Últimos 100 mensajes por filtro. Las notas son internas; las respuestas por correo se gestionarán en una fase posterior.</p>
 </main>;
}
