import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function editor(){
 const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{ok:false,supabase};
 const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();return{ok:!!p&&["admin","editor"].includes(p.role),supabase};
}
export async function GET(){
 const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const[{data:questions},{data:profiles}]=await Promise.all([
  x.supabase.from("test_questions").select("*,test_options(*)").order("sort_order"),
  x.supabase.from("test_profiles").select("*").order("profile_key")
 ]);
 return NextResponse.json({questions:questions||[],profiles:profiles||[]});
}
export async function PUT(request:NextRequest){
 const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const body=await request.json().catch(()=>null);if(!body?.kind||!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});
 let table="",payload:any={};
 if(body.kind==="question"){table="test_questions";payload={prompt_es:body.prompt_es,prompt_en:body.prompt_en,active:!!body.active,sort_order:Number(body.sort_order??0)}}
 else if(body.kind==="option"){table="test_options";payload={label_es:body.label_es,label_en:body.label_en,score_key:body.score_key,score_value:Number(body.score_value??1),sort_order:Number(body.sort_order??0)}}
 else {table="test_profiles";payload={name_es:body.name_es,name_en:body.name_en,description_es:body.description_es,description_en:body.description_en,superpower_es:body.superpower_es,superpower_en:body.superpower_en,color:body.color}}
 const{data,error}=await x.supabase.from(table).update(payload).eq("id",body.id).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
