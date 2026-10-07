import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getMfaState } from "../../../../lib/supabase/mfa";

export async function POST(request:NextRequest){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.redirect(new URL("/admin/login",request.url),303);

  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile)return NextResponse.redirect(new URL("/admin/login?unauthorized=1",request.url),303);

  const form=await request.formData();
  const factorId=String(form.get("factorId")||"").trim();
  const code=String(form.get("code")||"").trim().replace(/\s+/g,"");
  if(!factorId||!/^\d{6,8}$/.test(code)){
    return NextResponse.redirect(new URL("/admin/mfa?error=invalid_code",request.url),303);
  }

  const challenge=await supabase.auth.mfa.challenge({factorId});
  if(challenge.error){
    return NextResponse.redirect(new URL("/admin/mfa?error=challenge_failed",request.url),303);
  }

  const verify=await supabase.auth.mfa.verify({factorId,challengeId:challenge.data.id,code});
  if(verify.error){
    return NextResponse.redirect(new URL("/admin/mfa?error=verify_failed",request.url),303);
  }

  const state=await getMfaState(supabase);
  if(state.state!=="satisfied"){
    return NextResponse.redirect(new URL("/admin/mfa?error=aal2_not_set",request.url),303);
  }

  return NextResponse.redirect(new URL("/admin",request.url),303);
}
