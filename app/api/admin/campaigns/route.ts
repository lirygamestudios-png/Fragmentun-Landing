import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";

async function marketing(){
 const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{ok:false,supabase};
 if(!(await hasSatisfiedMfa(supabase)))return{ok:false,supabase};
 const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();return{ok:!!p&&["admin","marketing"].includes(p.role),supabase};
}
export async function GET(){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const{data,error}=await x.supabase.from("campaigns").select("*").order("created_at",{ascending:false});
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function POST(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.code)return NextResponse.json({error:"invalid_request"},{status:400});
 const payload={code:b.code,locale:b.locale==="en"?"en":"es",source:b.source||null,medium:b.medium||null,campaign:b.campaign||null,content:b.content||null,destination_url:b.destination_url||null,active:true};
 const{data,error}=await x.supabase.from("campaigns").insert(payload).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function PUT(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.id)return NextResponse.json({error:"invalid_request"},{status:400});
 const{data,error}=await x.supabase.from("campaigns").update({locale:b.locale==="en"?"en":"es",source:b.source||null,medium:b.medium||null,campaign:b.campaign||null,content:b.content||null,destination_url:b.destination_url||null,active:!!b.active}).eq("id",b.id).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}

export async function DELETE(request:NextRequest){
 const x=await marketing();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.id)return NextResponse.json({error:"invalid_request"},{status:400});
 const{error}=await x.supabase.from("campaigns").delete().eq("id",b.id);
 return NextResponse.json(error?{error:error.message}:{ok:true},{status:error?500:200});
}
