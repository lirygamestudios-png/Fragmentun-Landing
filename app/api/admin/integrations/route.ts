import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

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

  const[{data,error},{data:leadRows}]=await Promise.all([
    supabase
      .from("integration_logs")
      .select("id,integration,event_type,status,entity_type,entity_id,message,metadata,created_at")
      .order("created_at",{ascending:false})
      .limit(200),
    supabase
      .from("leads")
      .select("mailerlite_status,created_at")
      .order("created_at",{ascending:false})
      .limit(5000)
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
  const degraded=counts.error>0||counts.unconfigured>0;

  return NextResponse.json({
    items,
    health:{
      integration:"mailerlite",
      configured:config,
      ready,
      state:!ready?"NO_CONFIG":degraded?"DEGRADED":"HEALTHY",
      leads:counts,
      last_success_at:lastSuccess,
      last_error_at:lastError
    }
  });
}
