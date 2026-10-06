import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(){
  const supabase=await createSupabaseServerClient();
  const{data,error}=await supabase
    .from("ad_integrations")
    .select("provider,enabled,public_id,secondary_id")
    .eq("enabled",true)
    .not("public_id","is",null)
    .order("provider");

  if(error)return NextResponse.json({items:[]},{status:200});
  return NextResponse.json({items:data||[]},{
    headers:{"Cache-Control":"public, max-age=60, stale-while-revalidate=300"}
  });
}
