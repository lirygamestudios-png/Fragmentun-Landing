import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServiceClient } from "../../../lib/supabase/service";
const allowed=new Set(["page_view","amazon_click","chapter_click","test_start","test_complete","map_interaction","community_click"]);
export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>null);
  if(!body||!allowed.has(String(body.event_name))) return NextResponse.json({ok:false},{status:400});
  const supabase=createSupabaseServiceClient();
  const{error}=await supabase.from("analytics_events").insert({
    event_name:String(body.event_name),locale:body.locale==="en"?"en":"es",path:String(body.path??""),
    source:String(body.source??""),medium:String(body.medium??""),campaign:String(body.campaign??""),
    content:String(body.content??""),session_id:String(body.session_id??""),metadata:body.metadata??{}
  });
  return NextResponse.json({ok:!error},{status:error?500:200});
}
