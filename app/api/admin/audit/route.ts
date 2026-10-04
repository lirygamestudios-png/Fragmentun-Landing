import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const ADMIN_ONLY_TABLES=new Set(["admin_access_allowlist","admin_profiles"]);

export async function GET(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||!["admin","editor"].includes(profile.role)){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  const[{data,error},{data:profiles}]=await Promise.all([
    supabase
      .from("admin_audit_log")
      .select("id,user_id,action,table_name,record_id,old_data,new_data,created_at")
      .order("created_at",{ascending:false})
      .limit(300),
    supabase.from("admin_profiles").select("user_id,display_name,role")
  ]);

  if(error)return NextResponse.json({error:"query_failed"},{status:500});

  const actorMap=new Map((profiles||[]).map((p:any)=>[p.user_id,p]));
  const visible=(data||[])
    .filter((row:any)=>profile.role==="admin"||!ADMIN_ONLY_TABLES.has(row.table_name))
    .slice(0,200)
    .map((row:any)=>{
      const actor:any=row.user_id?actorMap.get(row.user_id):null;
      return {
        ...row,
        actor_name:actor?.display_name||null,
        actor_role:actor?.role||null,
        old_data:profile.role==="admin"?row.old_data:null,
        new_data:profile.role==="admin"?row.new_data:null
      };
    });

  return NextResponse.json({items:visible,viewer_role:profile.role});
}
