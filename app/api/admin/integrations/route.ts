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

  const{data,error}=await supabase
    .from("integration_logs")
    .select("id,integration,event_type,status,entity_type,entity_id,message,metadata,created_at")
    .order("created_at",{ascending:false})
    .limit(200);

  if(error)return NextResponse.json({error:"query_failed"},{status:500});
  return NextResponse.json({items:data||[]});
}
