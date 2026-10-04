import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function fetchMailerLiteAutomations(){
  const token=process.env.MAILERLITE_API_TOKEN;
  if(!token)return {ok:false,automations:[],error:"not_configured"};

  const headers={Authorization:`Bearer ${token}`,Accept:"application/json"};
  const list=await fetch("https://connect.mailerlite.com/api/automations?limit=100",{
    headers,cache:"no-store",signal:AbortSignal.timeout(8000)
  }).catch(()=>null);

  if(!list?.ok)return {ok:false,automations:[],error:list?`HTTP ${list.status}`:"request_failed"};
  const payload=await list.json().catch(()=>({}));
  const rows=Array.isArray(payload?.data)?payload.data:[];

  const details=await Promise.all(rows.slice(0,50).map(async(a:any)=>{
    const detail=await fetch(`https://connect.mailerlite.com/api/automations/${a.id}`,{
      headers,cache:"no-store",signal:AbortSignal.timeout(8000)
    }).catch(()=>null);
    const full=detail?.ok?await detail.json().catch(()=>({})):null;
    const x=full?.data||a;
    const steps=Array.isArray(x?.steps)?x.steps:[];
    return {
      id:String(x?.id||a?.id||""),
      name:String(x?.name||a?.name||""),
      enabled:!!x?.enabled,
      trigger_data:x?.trigger_data||null,
      stats:x?.stats||a?.stats||null,
      steps:steps.map((s:any)=>({
        id:String(s?.id||""),
        type:String(s?.type||""),
        name:s?.name||null,
        subject:s?.subject||null,
        from:s?.from||s?.email?.from||null,
        from_name:s?.from_name||s?.email?.from_name||null,
        description:s?.description||null,
        unit:s?.unit||null,
        value:s?.value||null,
        complete:s?.complete??null,
        email_id:s?.email_id||s?.email?.id||null,
        preview_url:s?.email?.preview_url||null,
        screenshot_url:s?.email?.screenshot_url||null,
        is_designed:s?.email?.is_designed??null,
        stats:s?.email?.stats||null
      }))
    };
  }));

  return {ok:true,automations:details,error:null};
}


export async function GET(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||!["admin","marketing"].includes(profile.role)){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  const[{data,error},{data:leadRows},mailerLiteAutomationState]=await Promise.all([
    supabase
      .from("integration_logs")
      .select("id,integration,event_type,status,entity_type,entity_id,message,metadata,created_at")
      .order("created_at",{ascending:false})
      .limit(200),
    supabase
      .from("leads")
      .select("mailerlite_status,created_at")
      .order("created_at",{ascending:false})
      .limit(5000),
    fetchMailerLiteAutomations()
  ]);

  if(error)return NextResponse.json({error:"query_failed"},{status:500});

  const items=data||[];
  const leads=leadRows||[];
  const mailerliteLogs=items.filter((x:any)=>x.integration==="mailerlite");
  const lastSuccess=mailerliteLogs.find((x:any)=>x.status==="success")?.created_at||null;
  const lastError=mailerliteLogs.find((x:any)=>x.status==="error")?.created_at||null;

  const config={
    token:!!process.env.MAILERLITE_API_TOKEN,
    group_es:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES,
    group_en:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN
  };
  const counts={
    total:leads.length,
    synced:leads.filter((x:any)=>x.mailerlite_status==="synced").length,
    pending:leads.filter((x:any)=>x.mailerlite_status==="pending").length,
    unconfigured:leads.filter((x:any)=>x.mailerlite_status==="unconfigured").length,
    error:leads.filter((x:any)=>x.mailerlite_status==="error").length
  };
  const ready=config.token&&config.group_es;
  const recent=leads.slice(0,5);
  const recentSuccesses=recent.filter((x:any)=>x.mailerlite_status==="synced").length;
  const latestStatus=recent[0]?.mailerlite_status||null;
  const currentHealthy=ready&&latestStatus==="synced"&&recentSuccesses>=Math.min(2,recent.length);
  const currentDegraded=ready&&!currentHealthy&&(latestStatus==="error"||latestStatus==="unconfigured");

  return NextResponse.json({
    items,
    automations:mailerLiteAutomationState,
    health:{
      integration:"mailerlite",
      configured:config,
      ready,
      state:!ready?"NO_CONFIG":currentHealthy?"HEALTHY":currentDegraded?"DEGRADED":"CHECK",
      latest_status:latestStatus,
      recent_successes:recentSuccesses,
      leads:counts,
      last_success_at:lastSuccess,
      last_error_at:lastError
    }
  });
}


export async function POST(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||!["admin","marketing"].includes(profile.role)){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  const token=process.env.MAILERLITE_API_TOKEN;
  if(!token)return NextResponse.json({error:"mailerlite_not_configured"},{status:500});

  const headers={Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"};
  const desired=[
    "FRAGMENTUN · ES · Evergreen 12 correos",
    "FRAGMENTUN · EN · Evergreen 12 emails"
  ];

  const list=await fetch("https://connect.mailerlite.com/api/automations?limit=100",{
    headers,cache:"no-store",signal:AbortSignal.timeout(8000)
  }).catch(()=>null);

  if(!list?.ok){
    return NextResponse.json({error:"mailerlite_list_failed",status:list?.status||0},{status:502});
  }

  const payload=await list.json().catch(()=>({}));
  const existing=Array.isArray(payload?.data)?payload.data:[];
  const results:any[]=[];

  for(const name of desired){
    const found=existing.find((a:any)=>String(a?.name||"").trim()===name);
    if(found){
      results.push({name,id:String(found.id),created:false,enabled:!!found.enabled});
      continue;
    }

    const created=await fetch("https://connect.mailerlite.com/api/automations",{
      method:"POST",
      headers,
      body:JSON.stringify({name}),
      cache:"no-store",
      signal:AbortSignal.timeout(8000)
    }).catch(()=>null);

    const body=await created?.json().catch(()=>null);
    if(!created?.ok||!body?.data?.id){
      results.push({name,created:false,error:created?`HTTP ${created.status}`:"request_failed"});
      continue;
    }
    results.push({name,id:String(body.data.id),created:true,enabled:false});
  }

  return NextResponse.json({ok:results.every(x=>!x.error),results});
}
