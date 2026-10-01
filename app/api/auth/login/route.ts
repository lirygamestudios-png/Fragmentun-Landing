import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")||"0");
  if(length>10000) return NextResponse.json({ok:false,error:"payload_too_large"},{status:413});

  const body=await request.json().catch(()=>null);
  const email=String(body?.email??"").trim().toLowerCase();
  const password=String(body?.password??"");

  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password){
    return NextResponse.json({ok:false,error:"invalid_credentials"},{status:400});
  }

  const supabase=await createSupabaseServerClient();
  const{data,error}=await supabase.auth.signInWithPassword({email,password});

  if(error||!data.user){
    return NextResponse.json({ok:false,error:"invalid_credentials"},{status:401});
  }

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",data.user.id)
    .maybeSingle();

  if(!profile){
    await supabase.auth.signOut();
    return NextResponse.json({ok:false,error:"unauthorized"},{status:403});
  }

  return NextResponse.json({ok:true,role:profile.role});
}
