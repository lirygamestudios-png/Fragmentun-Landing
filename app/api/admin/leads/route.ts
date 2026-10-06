import { NextRequest,NextResponse } from "next/server";
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
  const s=String(v??"").replace(/"/g,'""');
  return `"${s}"`;
}

export async function GET(request:NextRequest){
  const x=await marketing();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const q=new URL(request.url).searchParams;
  const locale=q.get("locale");
  const status=q.get("status");
  const search=(q.get("q")||"").trim().slice(0,200);
  const format=q.get("format");
  const profile=q.get("profile");

  let query=x.supabase.from("leads")
    .select("id,email,name,locale,source,medium,campaign,content,consent_marketing,consent_version,consented_at,mailerlite_status,mailerlite_subscriber_id,last_error,emotional_profile,emotional_scores,created_at")
    .order("created_at",{ascending:false})
    .limit(format==="csv"?5000:500);

  if(locale==="es"||locale==="en")query=query.eq("locale",locale);
  if(status&&["pending","synced","error","unconfigured"].includes(status))query=query.eq("mailerlite_status",status);
  if(search)query=query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  if(profile&&["vorax","umbral","ethelis","nara","balance"].includes(profile))query=query.eq("emotional_profile",profile);

  const{data,error}=await query;
  if(error)return NextResponse.json({error:error.message},{status:500});

  if(format==="csv"){
    const head=["email","name","locale","source","medium","campaign","content","consent","consent_version","consented_at","mailerlite_status","emotional_profile","created_at"];
    const lines=(data||[]).map((r:any)=>[
      r.email,r.name,r.locale,r.source,r.medium,r.campaign,r.content,
      r.consent_marketing?"yes":"no",r.consent_version,r.consented_at,r.mailerlite_status,r.emotional_profile,r.created_at
    ].map(csvCell).join(","));
    return new NextResponse([head.join(","),...lines].join("\n"),{
      headers:{
        "Content-Type":"text/csv; charset=utf-8",
        "Content-Disposition":'attachment; filename="fragmentun-leads.csv"'
      }
    });
  }

  const summary={
    total:(data||[]).length,
    synced:(data||[]).filter((r:any)=>r.mailerlite_status==="synced").length,
    pending:(data||[]).filter((r:any)=>["pending","unconfigured"].includes(r.mailerlite_status)).length,
    errors:(data||[]).filter((r:any)=>r.mailerlite_status==="error").length
  };

  return NextResponse.json({data:data||[],summary});
}
