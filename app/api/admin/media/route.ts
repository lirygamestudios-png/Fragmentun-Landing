import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function editor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return{ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return{ok:!!p&&["admin","editor"].includes(p.role),supabase};
}
export async function GET(){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const{data,error}=await x.supabase.from("media_assets").select("*").order("created_at",{ascending:false});
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function POST(request:NextRequest){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const b=await request.json().catch(()=>null);
  if(!b?.slug||!b?.storage_path||!b?.kind)return NextResponse.json({error:"invalid_request"},{status:400});
  const payload={slug:b.slug,kind:b.kind,storage_path:b.storage_path,alt_es:b.alt_es||null,alt_en:b.alt_en||null,protected:!!b.protected,public_visible:!!b.public_visible,metadata:b.metadata||{}};
  const{data,error}=await x.supabase.from("media_assets").upsert(payload,{onConflict:"slug"}).select().single();
  return NextResponse.json(error?{error:error.message}:{data},{status:error?500:200});
}
export async function DELETE(request:NextRequest){
  const x=await editor();if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const id=new URL(request.url).searchParams.get("id");if(!id)return NextResponse.json({error:"invalid_request"},{status:400});
  const{error}=await x.supabase.from("media_assets").delete().eq("id",id);
  return NextResponse.json({ok:!error},{status:error?500:200});
}
