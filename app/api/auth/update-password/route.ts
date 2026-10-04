import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { consumePublicRateLimit } from "../../../../lib/rate-limit";

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")||"0");
  if(length>10000)return NextResponse.json({ok:false,error:"payload_too_large"},{status:413});

  const body=await request.json().catch(()=>null);
  const password=String(body?.password??"");

  if(password.length<12||password.length>256){
    return NextResponse.json({ok:false,error:"weak_password"},{status:400});
  }

  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});

  const rate=await consumePublicRateLimit(request,"password_update",user.id,3600,5);
  if(!rate.allowed)return NextResponse.json({ok:false,error:"too_many_attempts"},{status:429});

  const{error}=await supabase.auth.updateUser({password});
  if(error) return NextResponse.json({ok:false,error:"update_failed"},{status:400});

  return NextResponse.json({ok:true});
}
