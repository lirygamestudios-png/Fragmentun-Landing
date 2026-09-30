import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function marketing(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","marketing"].includes(p.role),supabase};
}

export async function GET(){
  const x=await marketing();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const since=new Date(Date.now()-30*86400000).toISOString();

  const[{data:events},{data:leads}]=await Promise.all([
    x.supabase.from("analytics_events").select("event_name,locale,source,medium,campaign,content,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(5000),
    x.supabase.from("leads").select("locale,source,medium,campaign,content,created_at").gte("created_at",since).order("created_at",{ascending:false}).limit(5000)
  ]);

  const totals:Record<string,number>={};
  for(const e of events||[])totals[e.event_name]=(totals[e.event_name]||0)+1;

  const bySource:Record<string,{visits:number;leads:number}>={};
  for(const e of events||[]){
    const key=e.source||"direct";
    bySource[key]??={visits:0,leads:0};
    if(e.event_name==="page_view")bySource[key].visits++;
  }
  for(const l of leads||[]){
    const key=l.source||"direct";
    bySource[key]??={visits:0,leads:0};
    bySource[key].leads++;
  }

  return NextResponse.json({
    range_days:30,
    totals,
    lead_count:(leads||[]).length,
    conversion_rate:totals.page_view?((leads||[]).length/totals.page_view)*100:0,
    by_source:Object.entries(bySource).map(([source,v])=>({source,...v,conversion:v.visits?v.leads/v.visits*100:0}))
  });
}
