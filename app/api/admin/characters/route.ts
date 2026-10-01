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
  const x=await editor();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const{data,error}=await x.supabase.from("characters").select("*").order("sort_order");
  return NextResponse.json(error?{error:error.message}:{data:data||[]},{status:error?500:200});
}
export async function POST(request:NextRequest){
  const x=await editor();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.name||!body?.slug)return NextResponse.json({error:"invalid_request"},{status:400});
  const payload={slug:String(body.slug).trim().toLowerCase(),name:String(body.name).trim(),role_es:body.role_es||null,role_en:body.role_en||null,bio_es:body.bio_es||null,bio_en:body.bio_en||null,territory:body.territory||null,status:body.status||"draft",sort_order:Number(body.sort_order??0)};
  const{data,error}=await x.supabase.from("characters").insert(payload).select().single();
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:201});
}
export async function PUT(request:NextRequest){
  const x=await editor();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});
  const payload={slug:String(body.slug||"").trim().toLowerCase(),name:String(body.name||"").trim(),role_es:body.role_es||null,role_en:body.role_en||null,bio_es:body.bio_es||null,bio_en:body.bio_en||null,territory:body.territory||null,status:body.status||"draft",sort_order:Number(body.sort_order??0)};
  const{data,error}=await x.supabase.from("characters").update(payload).eq("id",body.id).select().single();
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
