import { NextRequest,NextResponse } from "next/server";

const allowed=new Set(["page_view","amazon_click","chapter_click","test_start","test_complete","map_interaction","community_click","lead_submit","patreon_click","experiment_view","share_reward_unlock","share_reward_error","share_reward_download"]);

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")||"0");
  if(length>12000) return NextResponse.json({ok:false,error:"payload_too_large"},{status:413});

  const body=await request.json().catch(()=>null);
  if(!body||!allowed.has(String(body.event_name))) return NextResponse.json({ok:false},{status:400});
  if(typeof body.path!=="string"||body.path.length>500) return NextResponse.json({ok:false,error:"invalid_path"},{status:400});

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return NextResponse.json({ok:false,error:"supabase_not_configured"},{status:503});

  const r=await fetch(`${url}/functions/v1/collect-analytics`,{
    method:"POST",
    headers:{"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`},
    body:JSON.stringify(body),
    cache:"no-store"
  });

  return NextResponse.json({ok:r.ok},{status:r.ok?200:500});
}
