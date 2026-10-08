import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { consumePublicRateLimit } from "../../../../lib/rate-limit";

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")||"0");
  if(length>8000)return NextResponse.json({ok:true});

  const body=await request.json().catch(()=>null);
  const email=String(body?.email??"").trim().toLowerCase();
  const context=String(body?.context??"");
  const resetPath=context==="lirygames"?"/admin/lirygames/reset-password":"/admin/reset-password";

  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return NextResponse.json({ok:true});
  }

  const rate=await consumePublicRateLimit(request,"password_reset",email,3600,5);
  if(!rate.allowed)return NextResponse.json({ok:true});

  const supabase=await createSupabaseServerClient();
  const origin=new URL(request.url).origin;
  await supabase.auth.resetPasswordForEmail(email,{
    redirectTo:`${origin}/auth/callback?next=${resetPath}`
  });

  // Always return success so the endpoint does not reveal whether an account exists.
  return NextResponse.json({ok:true});
}
