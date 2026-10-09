import {NextRequest,NextResponse} from "next/server";
import {consumePublicRateLimit} from "../../../../lib/rate-limit";
import {createSupabaseServiceClient} from "../../../../lib/supabase/service";
export const runtime="nodejs";
const categories=["opinion","suggestion","problem","business","other"];
export async function POST(req:NextRequest){
 const limit=await consumePublicRateLimit(req,"lirygames_contact","submit",3600,5);
 if(!limit.allowed)return NextResponse.json({ok:false,message:"Demasiados envíos. Intenta más tarde."},{status:429});
 let body:Record<string,unknown>;
 try{body=await req.json()}catch{return NextResponse.json({ok:false,message:"Datos incorrectos."},{status:400})}
 if(!body||typeof body!=="object")return NextResponse.json({ok:false},{status:400});
 if(body.website)return NextResponse.json({ok:true});
 const name=typeof body.name==="string"?body.name.trim():"";
 const email=typeof body.email==="string"?body.email.trim().toLowerCase():"";
 const subject=typeof body.subject==="string"?body.subject:"";
 const message=typeof body.message==="string"?body.message.trim():"";
 const gameSlug=typeof body.gameSlug==="string"?body.gameSlug.trim():"";
 if(name.length<2||name.length>100||email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!categories.includes(subject)||message.length<10||message.length>3000||gameSlug.length>80||body.privacyAcknowledged!==true){
  return NextResponse.json({ok:false,message:"Revisa los campos y acepta el aviso de privacidad."},{status:400});
 }
 try{
  const db=createSupabaseServiceClient();
  const {error}=await db.from("lirygames_contact_messages").insert({
   name,email,subject,message,game_slug:gameSlug||null,privacy_acknowledged:true
  });
  if(error){console.error("LIRYGAMES contact storage failed",error.code);throw Error("storage_failed");}
  return NextResponse.json({ok:true,message:"Mensaje recibido. Gracias por ayudarnos a mejorar LIRYGAMES."});
 }catch{return NextResponse.json({ok:false,message:"No pudimos enviar el mensaje. Inténtalo de nuevo."},{status:503})}
}
