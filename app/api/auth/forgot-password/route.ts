import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request:NextRequest){
  const body=await request.json().catch(()=>null);
  const email=String(body?.email??"").trim().toLowerCase();

  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){
    return NextResponse.json({ok:true});
  }

  const supabase=await createSupabaseServerClient();
  const origin=new URL(request.url).origin;
  await supabase.auth.resetPasswordForEmail(email,{
    redirectTo:`${origin}/auth/callback?next=/admin/reset-password`
  });

  // Always return success so the endpoint does not reveal whether an account exists.
  return NextResponse.json({ok:true});
}
