import {createHash} from "crypto";
import {cookies} from "next/headers";
import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {getMasterLiveSnapshot} from "../../../../../lib/master-live";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";

function isolatedLiryData(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"";
  return process.env.LIRYGAMES_COMMUNITY_DATA_ISOLATED==="true"&&Boolean(url)&&!url.includes("pasoapugmsazziflaomp");
}

export const dynamic="force-dynamic";

export async function GET(){
  if(!isolatedLiryData())return NextResponse.json({error:"lirygames_data_isolation_pending"},{status:503,headers:{"Cache-Control":"no-store"}});
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return NextResponse.json({ok:false,error:"unauthorized"},{status:401});
  if(!(await hasSatisfiedMfa(supabase))) return NextResponse.json({ok:false,error:"mfa_required"},{status:403});

  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") return NextResponse.json({ok:false,error:"forbidden"},{status:403});

  // API access must match the context-bound Commander MFA enforced by the layout.
  const contextToken=(await cookies()).get("liry_mfa_context")?.value;
  if(!contextToken)return NextResponse.json({ok:false,error:"lirygames_mfa_required"},{status:403});
  const tokenHash=createHash("sha256").update(contextToken).digest("hex");
  const{data:session,error:sessionError}=await supabase.from("admin_mfa_context_sessions")
    .select("factor_id").eq("user_id",user.id).eq("context","lirygames_commander")
    .eq("token_hash",tokenHash).gt("expires_at",new Date().toISOString()).maybeSingle();
  if(sessionError||!session)return NextResponse.json({ok:false,error:"lirygames_mfa_required"},{status:403});
  const factors=await supabase.auth.mfa.listFactors();
  const validFactor=!factors.error&&(factors.data?.totp||[]).some(f=>
    f.id===session.factor_id&&f.status==="verified"&&
    String(f.friendly_name||"").trim().toLowerCase()==="lirygames commander");
  if(!validFactor)return NextResponse.json({ok:false,error:"lirygames_mfa_required"},{status:403});

  try{
    const snapshot=await getMasterLiveSnapshot(supabase);
    return NextResponse.json({ok:true,snapshot},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("master_live_snapshot_failed",error);
    return NextResponse.json({ok:false,error:"snapshot_failed"},{status:500});
  }
}
