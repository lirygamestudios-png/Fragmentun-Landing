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
    x.supabase.from("analytics_events")
      .select("event_name,locale,source,medium,campaign,content,metadata,created_at")
      .gte("created_at",since)
      .order("created_at",{ascending:false})
      .limit(10000),
    x.supabase.from("leads")
      .select("locale,source,medium,campaign,content,mailerlite_status,created_at")
      .gte("created_at",since)
      .order("created_at",{ascending:false})
      .limit(10000)
  ]);

  const totals:Record<string,number>={};
  const byLocale:Record<string,{visits:number;leads:number;amazonClicks:number;patreonClicks:number}>={};
  const bySource:Record<string,{visits:number;leads:number;amazonClicks:number;patreonClicks:number}>={};
  const mailerlite:Record<string,number>={};

  for(const e of events||[]){
    totals[e.event_name]=(totals[e.event_name]||0)+1;
    const source=e.source||"direct";
    const locale=e.locale||"unknown";
    bySource[source]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byLocale[locale]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    if(e.event_name==="page_view"){bySource[source].visits++;byLocale[locale].visits++;}
    if(e.event_name==="amazon_click"){bySource[source].amazonClicks++;byLocale[locale].amazonClicks++;}
    if(e.event_name==="patreon_click"){bySource[source].patreonClicks++;byLocale[locale].patreonClicks++;}
  }

  for(const l of leads||[]){
    const source=l.source||"direct";
    const locale=l.locale||"unknown";
    bySource[source]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byLocale[locale]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    bySource[source].leads++;
    byLocale[locale].leads++;
    const status=l.mailerlite_status||"unknown";
    mailerlite[status]=(mailerlite[status]||0)+1;
  }

  const pageViews=totals.page_view||0;
  const leadCount=(leads||[]).length;
  const amazonClicks=totals.amazon_click||0;
  const patreonClicks=totals.patreon_click||0;

  return NextResponse.json({
    range_days:30,
    totals,
    lead_count:leadCount,
    conversion_rate:pageViews?(leadCount/pageViews)*100:0,
    amazon_ctr:pageViews?(amazonClicks/pageViews)*100:0,
    patreon_ctr:pageViews?(patreonClicks/pageViews)*100:0,
    lead_to_amazon_ratio:leadCount?(amazonClicks/leadCount)*100:0,
    mailerlite,
    by_source:Object.entries(bySource)
      .map(([source,v])=>({
        source,...v,
        conversion:v.visits?v.leads/v.visits*100:0,
        amazon_ctr:v.visits?v.amazonClicks/v.visits*100:0,
        patreon_ctr:v.visits?v.patreonClicks/v.visits*100:0,
        patreon_ctr:v.visits?v.patreonClicks/v.visits*100:0
      }))
      .sort((a,b)=>b.visits-a.visits),
    by_locale:Object.entries(byLocale)
      .map(([locale,v])=>({
        locale,...v,
        conversion:v.visits?v.leads/v.visits*100:0,
        amazon_ctr:v.visits?v.amazonClicks/v.visits*100:0
      }))
  });
}
