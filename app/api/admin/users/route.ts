import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function admin(){
 const supabase=await createSupabaseServerClient();const{data:{user}}=await supabase.auth.getUser();if(!user)return{ok:false,supabase};
 const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();return{ok:p?.role==="admin",supabase};
}
export async function GET(){
 const x=await admin();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const[{data:allowlist},{data:profiles}]=await Promise.all([x.supabase.from("admin_access_allowlist").select("*").order("created_at"),x.supabase.from("admin_profiles").select("*").order("created_at")]);
 return NextResponse.json({allowlist:allowlist||[],profiles:profiles||[]});
}
export async function POST(request:NextRequest){
 const x=await admin();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const b=await request.json().catch(()=>null);if(!b?.email)return NextResponse.json({error:"invalid_request"},{status:400});
 const payload={email:String(b.email).toLowerCase().trim(),role:["admin","editor","marketing"].includes(b.role)?b.role:"editor",display_name:b.display_name||null};
 const{data,error}=await x.supabase.from("admin_access_allowlist").upsert(payload).select().single();
 return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function DELETE(request:NextRequest){
 const x=await admin();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
 const email=new URL(request.url).searchParams.get("email");if(!email)return NextResponse.json({error:"invalid_request"},{status:400});
 const{error}=await x.supabase.from("admin_access_allowlist").delete().eq("email",email);
 return NextResponse.json({ok:!error},{status:error?500:200});
}
