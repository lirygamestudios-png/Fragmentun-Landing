import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";

async function requireAnalytics(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","marketing","editor"].includes(p.role),supabase};
}
function uniqueSessions(rows:any[]){return new Set(rows.map(r=>r.session_id).filter(Boolean)).size;}
function labelEvent(name:string){
  const labels:Record<string,string>={
    page_view:"Visita",
    presence_ping:"En línea",
    lead_submit:"Suscripción",
    amazon_click:"Clic Amazon",
    patreon_click:"Clic Patreon",
    chapter_click:"Capítulo",
    test_start:"Test iniciado",
    test_complete:"Test completado",
    community_click:"Comunidad",
    share_click:"Compartir",
    merch_click:"Tienda",
    official_video_open:"Video"
  };
  return labels[name]||name.replace(/_/g," ");
}

export const dynamic="force-dynamic";

export async function GET(){
  const x=await requireAnalytics();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const now=Date.now();
  const since30=new Date(now-30*60*1000).toISOString();
  const since5=new Date(now-5*60*1000).toISOString();
  const since2=new Date(now-2*60*1000).toISOString();

  const[
    {data:events,error:eventError},
    {data:leads,error:leadError}
  ]=await Promise.all([
    x.supabase.from("analytics_events")
      .select("event_name,locale,path,source,medium,campaign,session_id,metadata,created_at")
      .gte("created_at",since30)
      .order("created_at",{ascending:false})
      .limit(2000),
    x.supabase.from("leads")
      .select("name,email,locale,session_id,created_at")
      .gte("created_at",since30)
      .order("created_at",{ascending:false})
      .limit(20)
  ]);

  if(eventError)return NextResponse.json({error:eventError.message},{status:500});
  if(leadError)return NextResponse.json({error:leadError.message},{status:500});

  const rows=events||[];
  const rows5=rows.filter(r=>r.created_at>=since5);
  const liveRows=rows.filter(r=>r.event_name==="presence_ping"&&r.created_at>=since2);
  const sessionRows5=rows5.filter(r=>r.event_name==="page_view"||r.event_name==="presence_ping");
  const sessionRows30=rows.filter(r=>r.event_name==="page_view"||r.event_name==="presence_ping");

  const latestBySession=new Map<string,any>();
  for(const r of liveRows){
    if(r.session_id&&!latestBySession.has(r.session_id))latestBySession.set(r.session_id,r);
  }

  const pages=new Map<string,Set<string>>();
  for(const r of latestBySession.values()){
    if(!r.session_id)continue;
    const path=r.path||"/";
    if(!pages.has(path))pages.set(path,new Set());
    pages.get(path)!.add(r.session_id);
  }

  const sources=new Map<string,Set<string>>();
  for(const r of latestBySession.values()){
    if(!r.session_id)continue;
    const source=(r.source||"direct").trim()||"direct";
    if(!sources.has(source))sources.set(source,new Set());
    sources.get(source)!.add(r.session_id);
  }

  const count=(...names:string[])=>rows.filter(r=>names.includes(r.event_name)).length;
  const recentEvents=rows
    .filter(r=>r.event_name!=="presence_ping")
    .slice(0,18)
    .map(r=>({
      event_name:r.event_name,
      label:labelEvent(r.event_name),
      path:r.path||"/",
      source:r.source||"direct",
      locale:r.locale||"",
      created_at:r.created_at
    }));

  return NextResponse.json({
    generated_at:new Date(now).toISOString(),
    active_now:latestBySession.size,
    sessions_5m:uniqueSessions(sessionRows5),
    sessions_30m:uniqueSessions(sessionRows30),
    pages:[...pages.entries()].map(([path,s])=>({path,active:s.size})).sort((a,b)=>b.active-a.active).slice(0,8),
    sources:[...sources.entries()].map(([source,s])=>({source,active:s.size})).sort((a,b)=>b.active-a.active).slice(0,8),
    action_counts:{
      leads:(leads||[]).length,
      amazon:count("amazon_click"),
      patreon:count("patreon_click"),
      test:count("test_start","test_complete"),
      share:count("share_click"),
      merch:count("merch_click")
    },
    recent_leads:(leads||[]).slice(0,6).map(l=>({
      name:l.name||"",
      email:l.email,
      locale:l.locale||"",
      created_at:l.created_at
    })),
    recent_events:recentEvents
  });
}
