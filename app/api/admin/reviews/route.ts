import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function marketing(){
 const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{ok:false,supabase};
 const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();return{ok:!!p&&["admin","marketing"].includes(p.role),supabase};
}
export async function GET(){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const{data,error}=await x.supabase.from("reviews").select("*").order("created_at",{ascending:false});
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function POST(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.source||!b?.body_original)return NextResponse.json({error:"invalid_request"},{status:400});
 if(!!b.published&&!b.verified)return NextResponse.json({error:"publication_requires_verification"},{status:409});
 const payload={source:String(b.source).trim(),author_display:b.author_display||null,body_original:String(b.body_original).trim(),body_es:b.body_es||null,body_en:b.body_en||null,source_url:b.source_url||null,verified:!!b.verified,published:!!b.published};
 const{data,error}=await x.supabase.from("reviews").insert(payload).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function PUT(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.id||!b?.body_original)return NextResponse.json({error:"invalid_request"},{status:400});
 if(!!b.published&&!b.verified)return NextResponse.json({error:"publication_requires_verification"},{status:409});
 const{data,error}=await x.supabase.from("reviews").update({source:String(b.source||"").trim()||"Otro",author_display:b.author_display||null,body_original:String(b.body_original).trim(),body_es:b.body_es||null,body_en:b.body_en||null,source_url:b.source_url||null,verified:!!b.verified,published:!!b.published}).eq("id",b.id).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}

export async function DELETE(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.id)return NextResponse.json({error:"invalid_request"},{status:400});
 const{error}=await x.supabase.from("reviews").delete().eq("id",b.id);
 return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?500:200});
}
