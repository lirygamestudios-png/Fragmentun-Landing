import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

const ML="https://connect.mailerlite.com/api/subscribers";
const ML_GROUPS="https://connect.mailerlite.com/api/groups";

function normalizeGroupName(value:string){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

async function resolveGroup(token:string,raw:string,locale:"es"|"en"){
  const desired=locale==="es"?"FRAGMENTUN CAP1 ES":"FRAGMENTUN CAP1 EN";
  const res=await fetch(`${ML_GROUPS}?limit=100`,{
    headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},
    cache:"no-store",
    signal:AbortSignal.timeout(8000)
  }).catch(()=>null);
  if(!res?.ok)return null;
  const data=await res.json().catch(()=>({}));
  const groups=Array.isArray(data?.data)?data.data:[];
  const configured=String(raw||"").trim();
  const byId=groups.find((g:any)=>String(g?.id||"")===configured);
  if(byId?.id)return String(byId.id);
  const desiredNormalized=normalizeGroupName(desired);
  const byName=groups.find((g:any)=>normalizeGroupName(String(g?.name||""))===desiredNormalized);
  return byName?.id?String(byName.id):null;
}

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
  const configuredGroup=lead.locale==="en"
    ?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN
    :process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;

  if(!token||!configuredGroup){
    const message="MailerLite credentials or group not configured";
    await x.supabase.from("leads").update({
      mailerlite_status:"unconfigured",
      last_error:message
    }).eq("id",id);
    await x.supabase.from("integration_logs").insert({
      integration:"mailerlite",
      event_type:"manual_retry",
      status:"info",
      entity_type:"lead",
      entity_id:id,
      message,
      metadata:{locale:lead.locale}
    });
    return NextResponse.json({ok:false,error:"mailerlite_unconfigured"},{status:503});
  }

  const group=await resolveGroup(token,configuredGroup,lead.locale==="en"?"en":"es");
  if(!group){
    const message="MailerLite group could not be resolved";
    await x.supabase.from("leads").update({mailerlite_status:"error",last_error:message}).eq("id",id);
    return NextResponse.json({ok:false,error:"mailerlite_group_unresolved"},{status:502});
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
    cache:"no-store",
    signal:AbortSignal.timeout(8000)
  }).catch(()=>null);

  if(!ml?.ok){
    const message=ml?`MailerLite HTTP ${ml.status}`:"MailerLite request failed";
    await x.supabase.from("leads").update({
      mailerlite_status:"error",
      last_error:message
    }).eq("id",id);
    await x.supabase.from("integration_logs").insert({
      integration:"mailerlite",
      event_type:"manual_retry",
      status:"error",
      entity_type:"lead",
      entity_id:id,
      message,
      metadata:{locale:lead.locale}
    });
    return NextResponse.json({ok:false,error:message},{status:502});
  }

  const data=await ml.json().catch(()=>({}));
  await x.supabase.from("leads").update({
    mailerlite_status:"synced",
    mailerlite_subscriber_id:data?.data?.id??null,
    last_error:null
  }).eq("id",id);

  await x.supabase.from("integration_logs").insert({
    integration:"mailerlite",
    event_type:"manual_retry",
    status:"success",
    entity_type:"lead",
    entity_id:id,
    message:null,
    metadata:{locale:lead.locale,subscriber_id:data?.data?.id??null}
  });

  return NextResponse.json({ok:true});
}
