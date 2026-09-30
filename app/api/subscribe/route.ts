import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServiceClient } from "../../../lib/supabase/service";
const ML="https://connect.mailerlite.com/api/subscribers";
export async function POST(request:NextRequest){
  const form=await request.formData();
  const email=String(form.get("email")??"").trim();
  const name=String(form.get("name")??"").trim();
  const locale=String(form.get("locale")??"es")==="en"?"en":"es";
  const source=String(form.get("utm_source")??"");
  const medium=String(form.get("utm_medium")??"");
  const campaign=String(form.get("utm_campaign")??"");
  const content=String(form.get("utm_content")??"");
  if(!email||!email.includes("@")) return NextResponse.redirect(new URL(`/${locale}?signup=invalid#capitulo`,request.url),303);
  const token=process.env.MAILERLITE_API_TOKEN;
  const group=locale==="en"?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN:process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;
  if(!token||!group) return NextResponse.redirect(new URL(`/${locale}?signup=unconfigured#capitulo`,request.url),303);
  const ml=await fetch(ML,{method:"POST",headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},body:JSON.stringify({email,fields:name?{name}:undefined,groups:[group],status:"active"}),cache:"no-store"});
  if(!ml.ok) return NextResponse.redirect(new URL(`/${locale}?signup=error#capitulo`,request.url),303);
  const data=await ml.json().catch(()=>({}));
  const supabase=createSupabaseServiceClient();
  await supabase.from("leads").insert({email,name:name||null,locale,source:source||null,medium:medium||null,campaign:campaign||null,content:content||null,mailerlite_subscriber_id:data?.data?.id??null});
  await supabase.from("analytics_events").insert({event_name:"lead_submit",locale,path:`/${locale}`,source:source||null,medium:medium||null,campaign:campaign||null,content:content||null});
  return NextResponse.redirect(new URL(`/${locale}/gracias`,request.url),303);
}
