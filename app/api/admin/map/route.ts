import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";

async function editor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  if(!(await hasSatisfiedMfa(supabase)))return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","editor"].includes(p.role),supabase};
}
export async function GET(){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const[{data:regions},{data:points}]=await Promise.all([
    x.supabase.from("map_regions").select("*").order("sort_order"),
    x.supabase.from("map_points").select("*").order("name_es")
  ]);
  return NextResponse.json({regions:regions||[],points:points||[]});
}
export async function PUT(request:NextRequest){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);if(!body?.kind||!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});
  const table=body.kind==="region"?"map_regions":"map_points";
  const allowed=body.kind==="region"?{
    name_es:body.name_es,name_en:body.name_en,description_es:body.description_es,description_en:body.description_en,color:body.color,visible:!!body.visible,sort_order:Number(body.sort_order??0)
  }:{
    name_es:body.name_es,name_en:body.name_en,description_es:body.description_es,description_en:body.description_en,x:Number(body.x??50),y:Number(body.y??50),icon:body.icon,visible:!!body.visible
  };
  const{data,error}=await x.supabase.from(table).update(allowed).eq("id",body.id).select().single();
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
