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
  if(!profile) return NextResponse.json({ok:false,error:"forbidden"},{status:403});

  try{
    const snapshot=await getMasterLiveSnapshot(supabase);
    return NextResponse.json({ok:true,snapshot},{headers:{"Cache-Control":"no-store"}});
  }catch(error){
    console.error("master_live_snapshot_failed",error);
    return NextResponse.json({ok:false,error:"snapshot_failed"},{status:500});
  }
}
