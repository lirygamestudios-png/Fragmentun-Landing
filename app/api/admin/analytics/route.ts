import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";

async function marketing(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  if(!(await hasSatisfiedMfa(supabase)))return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","marketing"].includes(p.role),supabase};
}

function csvCell(v:unknown){
  const s=typeof v==="object"?JSON.stringify(v??{}):String(v??"");
  return `"${s.replace(/"/g,'""')}"`;
}

export async function GET(request:Request){
  const x=await marketing();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const since=new Date(Date.now()-30*86400000).toISOString();
  const format=new URL(request.url).searchParams.get("format");

  const[{data:events},{data:leads}]=await Promise.all([
    x.supabase.from("analytics_events")
      .select("event_name,locale,source,medium,campaign,content,session_id,metadata,created_at")
      .gte("created_at",since)
      .order("created_at",{ascending:false})
      .limit(10000),
    x.supabase.from("leads")
      .select("locale,source,medium,campaign,content,session_id,mailerlite_status,created_at")
      .gte("created_at",since)
      .order("created_at",{ascending:false})
      .limit(10000)
  ]);

  const totals:Record<string,number>={};
  const byLocale:Record<string,{visits:number;leads:number;amazonClicks:number;patreonClicks:number}>={};
  const bySource:Record<string,{source:string;medium:string;visits:number;leads:number;amazonClicks:number;patreonClicks:number}>={};
  const byCampaign:Record<string,{campaign:string;source:string;medium:string;content:string;visits:number;leads:number;amazonClicks:number;patreonClicks:number}>={};
  const mailerlite:Record<string,number>={};
  const testProfiles:Record<string,number>={};
  const experiments:Record<string,{views:Record<string,number>;leads:Record<string,number>}>= {};
  const community:Record<string,number>={};

  for(const e of events||[]){
    totals[e.event_name]=(totals[e.event_name]||0)+1;
    const source=e.source||"direct";
    const medium=e.medium||"none";
    const sourceKey=`${source}::${medium}`;
    const campaign=e.campaign||"(sin campaña)";
    const content=e.content||"";
    const campaignKey=`${source}::${medium}::${campaign}::${content}`;
    const locale=e.locale||"unknown";
    bySource[sourceKey]??={source,medium,visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byCampaign[campaignKey]??={campaign,source,medium,content,visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byLocale[locale]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    if(e.event_name==="page_view"){bySource[sourceKey].visits++;byCampaign[campaignKey].visits++;byLocale[locale].visits++;}
    if(e.event_name==="amazon_click"){bySource[sourceKey].amazonClicks++;byCampaign[campaignKey].amazonClicks++;byLocale[locale].amazonClicks++;}
    if(e.event_name==="patreon_click"){bySource[sourceKey].patreonClicks++;byCampaign[campaignKey].patreonClicks++;byLocale[locale].patreonClicks++;}
    if(e.event_name==="community_click"){
      const network=String((e.metadata as any)?.network||"unknown");
      community[network]=(community[network]||0)+1;
    }
    if(e.event_name==="experiment_view"){
      const exp=String((e.metadata as any)?.experiment||"unknown");
      const variant=String((e.metadata as any)?.variant||"unknown");
      experiments[exp]??={views:{},leads:{}};
      experiments[exp].views[variant]=(experiments[exp].views[variant]||0)+1;
    }
    if(e.event_name==="lead_submit"){
      const exp=String((e.metadata as any)?.experiment||"");
      const variant=String((e.metadata as any)?.experiment_variant||"");
      if(exp&&variant){
        experiments[exp]??={views:{},leads:{}};
        experiments[exp].leads[variant]=(experiments[exp].leads[variant]||0)+1;
      }
    }
    if(e.event_name==="test_complete"){
      const profile=String((e.metadata as any)?.profile||"unknown");
      testProfiles[profile]=(testProfiles[profile]||0)+1;
    }
  }

  for(const l of leads||[]){
    const source=l.source||"direct";
    const medium=l.medium||"none";
    const sourceKey=`${source}::${medium}`;
    const campaign=l.campaign||"(sin campaña)";
    const content=l.content||"";
    const campaignKey=`${source}::${medium}::${campaign}::${content}`;
    const locale=l.locale||"unknown";
    bySource[sourceKey]??={source,medium,visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byCampaign[campaignKey]??={campaign,source,medium,content,visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    byLocale[locale]??={visits:0,leads:0,amazonClicks:0,patreonClicks:0};
    bySource[sourceKey].leads++;
    byCampaign[campaignKey].leads++;
    byLocale[locale].leads++;
    const status=l.mailerlite_status||"unknown";
    mailerlite[status]=(mailerlite[status]||0)+1;
  }

  if(format==="csv"){
    const head=["created_at","event_name","locale","source","medium","campaign","content","metadata"];
    const lines=(events||[]).map((e:any)=>[
      e.created_at,e.event_name,e.locale,e.source,e.medium,e.campaign,e.content,e.metadata
    ].map(csvCell).join(","));
    return new NextResponse([head.join(","),...lines].join("\n"),{
      headers:{
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":'attachment; filename="fragmentun-analytics-30d.csv"'
      }
    });
  }

  const pageViews=totals.page_view||0;
  const leadCount=(leads||[]).length;
  const amazonClicks=totals.amazon_click||0;
  const patreonClicks=totals.patreon_click||0;
  const communityClicks=totals.community_click||0;

  const pageViewSessions=new Set((events||[]).filter((e:any)=>e.event_name==="page_view"&&e.session_id).map((e:any)=>e.session_id)).size;
  const sessions=pageViewSessions;
  const sessionCountFor=(eventName:string)=>new Set(
    (events||[]).filter((e:any)=>e.event_name===eventName&&e.session_id).map((e:any)=>e.session_id)
  ).size;
  const leadSessions=new Set((leads||[]).map((l:any)=>l.session_id).filter(Boolean)).size;
  const funnel={
    sessions,
    chapter_click_sessions:sessionCountFor("chapter_click"),
    lead_sessions:leadSessions,
    chapter_read_sessions:sessionCountFor("chapter_read"),
    amazon_sessions:sessionCountFor("amazon_click"),
    patreon_sessions:sessionCountFor("patreon_click"),
    share_unlock_sessions:sessionCountFor("share_reward_unlock"),
    share_download_sessions:sessionCountFor("share_reward_download"),
    test_complete_sessions:sessionCountFor("test_complete")
  };

  return NextResponse.json({
    range_days:30,
    totals,
    sessions,
    funnel,
    session_tracking_coverage:pageViews?(pageViewSessions/pageViews)*100:0,
    historical:{
      page_views:pageViews,
      amazon_clicks:amazonClicks,
      patreon_clicks:patreonClicks,
      community_clicks:communityClicks,
      amazon_ctr_event:pageViews?(amazonClicks/pageViews)*100:0,
      patreon_ctr_event:pageViews?(patreonClicks/pageViews)*100:0
    },
    lead_count:leadCount,
    conversion_rate:sessions?(leadSessions/sessions)*100:0,
    amazon_ctr:sessions?(funnel.amazon_sessions/sessions)*100:0,
    patreon_ctr:sessions?(funnel.patreon_sessions/sessions)*100:0,
    community_ctr:sessions?(sessionCountFor("community_click")/sessions)*100:0,
    share_unlock_rate:sessions?(funnel.share_unlock_sessions/sessions)*100:0,
    share_download_rate:funnel.share_unlock_sessions?(funnel.share_download_sessions/funnel.share_unlock_sessions)*100:0,
    lead_to_chapter_read_ratio:leadSessions?(funnel.chapter_read_sessions/leadSessions)*100:0,
    chapter_read_to_amazon_ratio:funnel.chapter_read_sessions?(funnel.amazon_sessions/funnel.chapter_read_sessions)*100:0,
    lead_to_amazon_ratio:leadSessions?(funnel.amazon_sessions/leadSessions)*100:0,
    mailerlite,
    test_profiles:testProfiles,
    experiments,
    community,
    by_source:Object.values(bySource)
      .map((v)=>({
        ...v,
        conversion:v.visits?v.leads/v.visits*100:0,
        amazon_ctr:v.visits?v.amazonClicks/v.visits*100:0,
        patreon_ctr:v.visits?v.patreonClicks/v.visits*100:0
      }))
      .sort((a,b)=>b.visits-a.visits),
    by_campaign:Object.values(byCampaign)
      .map((v)=>({
        ...v,
        conversion:v.visits?v.leads/v.visits*100:0,
        amazon_ctr:v.visits?v.amazonClicks/v.visits*100:0,
        patreon_ctr:v.visits?v.patreonClicks/v.visits*100:0
      }))
      .sort((a,b)=>b.visits-a.visits),
    by_locale:Object.entries(byLocale)
      .map(([locale,v])=>({
        locale,...v,
        conversion:v.visits?v.leads/v.visits*100:0,
        amazon_ctr:v.visits?v.amazonClicks/v.visits*100:0,
        patreon_ctr:v.visits?v.patreonClicks/v.visits*100:0
      }))
  });
}
