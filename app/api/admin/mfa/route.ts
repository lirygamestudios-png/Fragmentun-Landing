import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { getMfaState } from "../../../../lib/supabase/mfa";

async function requireAdminSession(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false as const,status:401,supabase,user:null,profile:null};
  const{data:profile}=await supabase.from("admin_profiles").select("role,display_name").eq("user_id",user.id).maybeSingle();
  if(!profile)return {ok:false as const,status:403,supabase,user,profile:null};
  return {ok:true as const,status:200,supabase,user,profile};
}

export async function GET(){
  const x=await requireAdminSession();
  if(!x.ok)return NextResponse.json({ok:false,error:x.status===401?"unauthenticated":"unauthorized"},{status:x.status});
  const state=await getMfaState(x.supabase);
  const factors=await x.supabase.auth.mfa.listFactors();
  if(factors.error)return NextResponse.json({ok:false,error:"mfa_list_failed"},{status:500});
  return NextResponse.json({
    ok:true,
    state:state.state,
    currentLevel:state.currentLevel,
    nextLevel:state.nextLevel,
    factors:{
      totp:(factors.data?.totp||[]).map((f:any)=>({id:f.id,friendly_name:f.friendly_name,status:f.status,factor_type:f.factor_type}))
    }
  });
}

export async function POST(request:NextRequest){
  const x=await requireAdminSession();
  if(!x.ok)return NextResponse.json({ok:false,error:x.status===401?"unauthenticated":"unauthorized"},{status:x.status});
  const body=await request.json().catch(()=>null);
  const action=String(body?.action||"");

  if(action==="enroll"){
    const name=String(body?.friendlyName||"LIRYGAMES Admin").trim().slice(0,64)||"LIRYGAMES Admin";
    const result=await x.supabase.auth.mfa.enroll({factorType:"totp",friendlyName:name});
    if(result.error)return NextResponse.json({ok:false,error:"mfa_enroll_failed",detail:result.error.message},{status:400});
    return NextResponse.json({
      ok:true,
      factorId:result.data.id,
      qrCode:result.data.totp.qr_code,
      secret:result.data.totp.secret,
      uri:result.data.totp.uri
    });
  }

  if(action==="verify"){
    const factorId=String(body?.factorId||"").trim();
    const code=String(body?.code||"").trim().replace(/\s+/g,"");
    if(!factorId||!/^\d{6,8}$/.test(code))return NextResponse.json({ok:false,error:"invalid_mfa_input"},{status:400});
    const challenge=await x.supabase.auth.mfa.challenge({factorId});
    if(challenge.error)return NextResponse.json({ok:false,error:"mfa_challenge_failed",detail:challenge.error.message},{status:400});
    const verify=await x.supabase.auth.mfa.verify({factorId,challengeId:challenge.data.id,code});
    if(verify.error)return NextResponse.json({ok:false,error:"mfa_verify_failed",detail:verify.error.message},{status:400});
    const state=await getMfaState(x.supabase);
    return NextResponse.json({ok:state.state==="satisfied",state:state.state});
  }

  return NextResponse.json({ok:false,error:"invalid_action"},{status:400});
}
