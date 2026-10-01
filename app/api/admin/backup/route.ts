import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

const TABLES=[
  "localized_content",
  "media_assets",
  "books",
  "book_editions",
  "characters",
  "map_regions",
  "map_points",
  "test_questions",
  "test_options",
  "test_profiles",
  "reviews",
  "campaigns"
] as const;

export async function GET(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||profile.role!=="admin"){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  const backup:Record<string,unknown[]|{error:string}>={};

  for(const table of TABLES){
    const{data,error}=await supabase.from(table).select("*");
    backup[table]=error?{error:error.message}:data||[];
  }

  const payload={
    schema_version:"1.0",
    generated_at:new Date().toISOString(),
    project:"FRAGMENTUN",
    includes:[...TABLES],
    excludes:[
      "leads",
      "analytics_events",
      "admin_profiles",
      "admin_access_allowlist",
      "admin_audit_log",
      "integration_logs",
      "auth.users",
      "secrets"
    ],
    data:backup
  };

  const stamp=new Date().toISOString().replace(/[:.]/g,"-");
  return new NextResponse(JSON.stringify(payload,null,2),{
    headers:{
      "Content-Type":"application/json; charset=utf-8",
      "Content-Disposition":`attachment; filename="fragmentun-backup-${stamp}.json"`,
      "Cache-Control":"no-store"
    }
  });
}
