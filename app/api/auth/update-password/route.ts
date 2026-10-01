import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>null);
  const password=String(body?.password??"");

  if(password.length<12){
    return NextResponse.json({ok:false,error:"weak_password"},{status:400});
  }

  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});

  const{error}=await supabase.auth.updateUser({password});
  if(error) return NextResponse.json({ok:false,error:"update_failed"},{status:400});

  return NextResponse.json({ok:true});
}
