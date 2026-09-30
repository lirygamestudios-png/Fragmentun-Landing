import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function requireEditor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase,user:null,role:null};
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {supabase,user,role:profile?.role??null};
}

export async function GET(){
  const{user,role,supabase}=await requireEditor();
  if(!user||!["admin","editor"].includes(role??"")) return NextResponse.json({error:"forbidden"},{status:403});
  const{data,error}=await supabase.from("localized_content").select("*").order("section").order("content_key");
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data});
}

export async function PUT(request:NextRequest){
  const{user,role,supabase}=await requireEditor();
  if(!user||!["admin","editor"].includes(role??"")) return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.content_key) return NextResponse.json({error:"invalid_request"},{status:400});

  const payload={
    es:body.es??{},
    en:body.en??{},
    status_es:["draft","review","published"].includes(body.status_es)?body.status_es:"draft",
    status_en:["draft","review","published"].includes(body.status_en)?body.status_en:"draft",
    updated_by:user.id,
    updated_at:new Date().toISOString()
  };
  const{data,error}=await supabase.from("localized_content").update(payload).eq("content_key",body.content_key).select().single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data});
}
