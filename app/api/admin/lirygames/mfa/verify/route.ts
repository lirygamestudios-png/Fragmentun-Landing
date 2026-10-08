import {createHash,randomBytes} from "crypto";
import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../../lib/supabase/server";

const CONTEXT="lirygames_commander";
const FACTOR_NAME="lirygames commander";

export async function POST(request:NextRequest){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({ok:false,error:"unauthenticated"},{status:401});

  const{data:profile}=await supabase.from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();
  if(!profile)return NextResponse.json({ok:false,error:"unauthorized"},{status:403});

  const body=await request.json().catch(()=>null);
  const factorId=String(body?.factorId||"").trim();
  const code=String(body?.code||"").trim().replace(/\s+/g,"");
  if(!factorId||!/^\d{6,8}$/.test(code)){
    return NextResponse.json({ok:false,error:"invalid_mfa_input"},{status:400});
  }

  const factors=await supabase.auth.mfa.listFactors();
  if(factors.error)return NextResponse.json({ok:false,error:"mfa_list_failed"},{status:400});

  const factor=(factors.data?.totp||[]).find((f:any)=>
    f.id===factorId&&String(f.friendly_name||"").trim().toLowerCase()===FACTOR_NAME
  );
  if(!factor)return NextResponse.json({ok:false,error:"wrong_factor"},{status:403});

  const challenge=await supabase.auth.mfa.challenge({factorId});
  if(challenge.error)return NextResponse.json({ok:false,error:"mfa_challenge_failed"},{status:400});

  const verify=await supabase.auth.mfa.verify({
    factorId,
    challengeId:challenge.data.id,
    code
  });
  if(verify.error)return NextResponse.json({ok:false,error:"mfa_verify_failed"},{status:400});

  const token=randomBytes(32).toString("hex");
  const tokenHash=createHash("sha256").update(token).digest("hex");
  const expiresAt=new Date(Date.now()+8*60*60*1000).toISOString();

  await supabase.from("admin_mfa_context_sessions")
    .delete()
    .eq("user_id",user.id)
    .eq("context",CONTEXT);

  const{error:insertError}=await supabase.from("admin_mfa_context_sessions").insert({
    user_id:user.id,
    context:CONTEXT,
    token_hash:tokenHash,
    factor_id:factorId,
    expires_at:expiresAt
  });

  if(insertError)return NextResponse.json({ok:false,error:"context_session_failed"},{status:500});

  const response=NextResponse.json({ok:true});
  response.cookies.set("liry_mfa_context",token,{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
    path:"/admin",
    maxAge:8*60*60
  });
  return response;
}
