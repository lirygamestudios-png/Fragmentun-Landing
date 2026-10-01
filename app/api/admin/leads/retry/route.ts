import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

const ML="https://connect.mailerlite.com/api/subscribers";

async function marketing(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","marketing"].includes(p.role),supabase};
}

export async function POST(request:NextRequest){
  const x=await marketing();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const body=await request.json().catch(()=>null);
  const id=String(body?.id??"");
  if(!id)return NextResponse.json({error:"invalid_request"},{status:400});

  const{data:lead,error:leadError}=await x.supabase
    .from("leads")
    .select("id,email,name,locale")
    .eq("id",id)
    .maybeSingle();

  if(leadError||!lead)return NextResponse.json({error:"lead_not_found"},{status:404});

  const token=process.env.MAILERLITE_API_TOKEN;
  const group=lead.locale==="en"
    ?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN
    :process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;

  if(!token||!group){
    await x.supabase.from("leads").update({
      mailerlite_status:"unconfigured",
      last_error:"MailerLite credentials or group not configured"
    }).eq("id",id);
    return NextResponse.json({ok:false,error:"mailerlite_unconfigured"},{status:503});
  }

  const ml=await fetch(ML,{
    method:"POST",
    headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify({
      email:lead.email,
      fields:lead.name?{name:lead.name}:undefined,
      groups:[group],
      status:"active"
    }),
    cache:"no-store"
  }).catch(()=>null);

  if(!ml?.ok){
    const message=ml?`MailerLite HTTP ${ml.status}`:"MailerLite request failed";
    await x.supabase.from("leads").update({
      mailerlite_status:"error",
      last_error:message
    }).eq("id",id);
    return NextResponse.json({ok:false,error:message},{status:502});
  }

  const data=await ml.json().catch(()=>({}));
  await x.supabase.from("leads").update({
    mailerlite_status:"synced",
    mailerlite_subscriber_id:data?.data?.id??null,
    last_error:null
  }).eq("id",id);

  return NextResponse.json({ok:true});
}
