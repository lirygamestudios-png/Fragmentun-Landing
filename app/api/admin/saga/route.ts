import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function editor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","editor"].includes(p.role),supabase};
}
export async function GET(){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const{data,error}=await x.supabase.from("books").select("*").order("sort_order");
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function PUT(request:NextRequest){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);if(!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});
  const allowed={title_es:body.title_es,title_en:body.title_en,subtitle_es:body.subtitle_es,subtitle_en:body.subtitle_en,description_es:body.description_es,description_en:body.description_en,status:body.status,amazon_url_es:body.amazon_url_es,amazon_url_en:body.amazon_url_en,sort_order:Number(body.sort_order??0)};
  const{data,error}=await x.supabase.from("books").update(allowed).eq("id",body.id).select().single();
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
