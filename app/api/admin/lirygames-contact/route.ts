import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {consumePublicRateLimit} from "../../../../lib/rate-limit";
export const runtime="nodejs";
export async function PATCH(req:NextRequest){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({ok:false,message:"Inicia sesión."},{status:401});
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||!["admin","editor"].includes(profile.role))return NextResponse.json({ok:false,message:"Acceso no autorizado."},{status:403});
 const rate=await consumePublicRateLimit(req,"lirygames_admin_contact","update",60,35);
 if(!rate.allowed)return NextResponse.json({ok:false,message:"Demasiados intentos."},{status:429});
 let data:Record<string,unknown>;
 try{data=await req.json()}catch{return NextResponse.json({ok:false,message:"Solicitud incorrecta."},{status:400})}
 if(!data||typeof data!=="object")return NextResponse.json({ok:false,message:"Solicitud incorrecta."},{status:400});
 const id=typeof data.id==="string"?data.id:"";
 const status=typeof data.status==="string"?data.status:"";
 const internalNote=typeof data.internalNote==="string"?data.internalNote.trim():"";
 const assignedTo=typeof data.assignedTo==="string"?data.assignedTo:null;
 const responseDraft=typeof data.responseDraft==="string"?data.responseDraft.trim():"";
 if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)||
 !["new","reviewing","resolved","archived"].includes(status)||internalNote.length>3000||responseDraft.length>5000||
 (assignedTo!==null&&!/^[0-9a-f-]{36}$/i.test(assignedTo)))
 return NextResponse.json({ok:false,message:"Datos inválidos."},{status:400});
 const db=supabase;
 if(assignedTo){
  const {data:owner}=await db.from("admin_profiles").select("user_id").eq("user_id",assignedTo).maybeSingle();
  if(!owner)return NextResponse.json({ok:false,message:"Responsable no autorizado."},{status:400});
 }
 const {data:previous,error:readError}=await db.from("lirygames_contact_messages").select("status,internal_note,assigned_to,response_draft").eq("id",id).maybeSingle();
 if(readError||!previous)return NextResponse.json({ok:false,message:"Mensaje no encontrado."},{status:404});
 const {data:updated,error}=await db.from("lirygames_contact_messages").update({
  status,internal_note:internalNote||null,assigned_to:assignedTo,response_draft:responseDraft||null,updated_at:new Date().toISOString()
 }).eq("id",id).select("id").maybeSingle();
 if(error||!updated)return NextResponse.json({ok:false,message:"No fue posible guardar el seguimiento."},{status:500});
 const {error:historyError}=await db.from("lirygames_contact_history").insert({
  contact_id:id,actor_user_id:user.id,action:previous.response_draft!==responseDraft?"response_drafted":"updated",
  details:{previous_status:previous.status,status,assigned_to:assignedTo,note_updated:previous.internal_note!==(internalNote||null),draft_updated:previous.response_draft!==(responseDraft||null)}
 });
 if(historyError){console.error("LIRYGAMES contact audit failed",historyError.code);return NextResponse.json({ok:false,message:"Cambios guardados, pero falló el historial. Contacta al administrador."},{status:500});}
 return NextResponse.json({ok:true});
}
