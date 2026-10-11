import {NextRequest,NextResponse} from "next/server";
import {consumePublicRateLimit} from "../../../../lib/rate-limit";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {validateLiryContactPayload} from "../../../../lib/games/liry-contact-validation";
export const runtime="nodejs";
const categories=["opinion","suggestion","problem","business","other"];
export async function POST(req:NextRequest){
 const limit=await consumePublicRateLimit(req,"lirygames_contact","submit",3600,5);
 if(!limit.allowed)return NextResponse.json({ok:false,message:"Demasiados envíos. Intenta más tarde."},{status:429});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({ok:false,message:"Datos incorrectos."},{status:400})}
 if(!body||typeof body!=="object")return NextResponse.json({ok:false},{status:400});
 if(body.website)return NextResponse.json({ok:true});
 const validation=validateLiryContactPayload(body);
 if(!validation.ok)return NextResponse.json({ok:false,message:validation.message},{status:400});
 const {name,email,subject,message,gameSlug}=validation.fields;
 try{
  const db=await createSupabaseServerClient();
  const {data:accepted,error}=await db.rpc("lirygames_submit_contact",{
    p_name:name,p_email:email,p_subject:subject,p_message:message,p_game_slug:gameSlug||null
  });
  if(error||accepted!==true){
    if(error)console.error("LIRYGAMES contact rpc failed",error.code);
    return NextResponse.json({ok:false,message:"No se pudo registrar el mensaje. Revisa los datos o inténtalo más tarde."},{status:503});
  }
  return NextResponse.json({ok:true,message:"Mensaje recibido. Gracias por ayudarnos a mejorar LIRYGAMES."});
 }catch{return NextResponse.json({ok:false,message:"No pudimos enviar el mensaje. Inténtalo de nuevo."},{status:503})}
}
