import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { consumePublicRateLimit } from "../../../../lib/rate-limit";
import { getMfaState } from "../../../../lib/supabase/mfa";

async function ensureAdminProfile(supabase:any,user:{id:string;email?:string|null}){
  let{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(profile)return profile;
  if(!user.email)return null;

  const{data:allowed}=await supabase
    .from("admin_access_allowlist")
    .select("role,display_name")
    .ilike("email",user.email)
    .maybeSingle();

  if(!allowed)return null;

  const{error}=await supabase.from("admin_profiles").upsert({
    user_id:user.id,
    display_name:allowed.display_name??null,
    role:allowed.role
  },{onConflict:"user_id"});

  if(error)return null;

  const refreshed=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  return refreshed.data||null;
}

export async function POST(request:NextRequest){
  const length=Number(request.headers.get("content-length")||"0");
  if(length>10000) return NextResponse.json({ok:false,error:"payload_too_large"},{status:413});

  const body=await request.json().catch(()=>null);
  const email=String(body?.email??"").trim().toLowerCase();
  const password=String(body?.password??"");

  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||!password){
    return NextResponse.json({ok:false,error:"invalid_credentials"},{status:400});
  }

  const rate=await consumePublicRateLimit(request,"admin_login",email,900,8);
  if(!rate.allowed){
    return NextResponse.json({ok:false,error:"too_many_attempts"},{status:429});
  }

  const supabase=await createSupabaseServerClient();
  const{data,error}=await supabase.auth.signInWithPassword({email,password});

  if(error||!data.user){
    return NextResponse.json({ok:false,error:"invalid_credentials"},{status:401});
  }

  const profile=await ensureAdminProfile(supabase,data.user);

  if(!profile){
    await supabase.auth.signOut();
    return NextResponse.json({ok:false,error:"unauthorized"},{status:403});
  }

  const mfa=await getMfaState(supabase);
  return NextResponse.json({ok:true,role:profile.role,mfa_state:mfa.state,redirect:mfa.state==="satisfied"?"/admin":"/admin/mfa"});
}
