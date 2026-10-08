import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";

export const dynamic="force-dynamic";

export async function POST(request:NextRequest){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
  if(!(await hasSatisfiedMfa(supabase)))return NextResponse.json({error:"mfa_required"},{status:403});

  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin")return NextResponse.json({error:"admin_required"},{status:403});

  const body=await request.json().catch(()=>null);
  const results=Array.isArray(body?.results)?body.results:[];
  if(!results.length||results.length>20)return NextResponse.json({error:"invalid_results"},{status:400});

  const clean=results.map((r:any)=>{
    const expectedStatus=Number.isInteger(r?.expected)?r.expected:null;
    const actualStatus=Number.isInteger(r?.actual)?r.actual:null;
    const passed=expectedStatus!==null&&actualStatus===expectedStatus;
    return {
      check_name:String(r?.name||"").slice(0,160),
      request_path:String(r?.path||"").slice(0,500),
      method:"GET",
      expected_status:expectedStatus,
      actual_status:actualStatus,
      redirect_location:r?.redirect?String(r.redirect).slice(0,1000):null,
      status:passed?"passed":"failed",
      latency_ms:Number.isInteger(r?.latency)?Math.max(0,Math.min(120000,r.latency)):null,
      detail:passed?"Respuesta correcta.":(r?.detail?String(r.detail).slice(0,1200):"La respuesta fue distinta a la esperada.")
    };
  });

  if(clean.some((r:any)=>!r.check_name||!r.request_path)){
    return NextResponse.json({error:"invalid_result_shape"},{status:400});
  }

  const host=request.headers.get("host");
  const proto=request.headers.get("x-forwarded-proto")||"https";
  const baseUrl=host?`${proto}://${host}`:null;
  const runCode="QA-PREVIEW-"+new Date().toISOString().replace(/[-:T.Z]/g,"").slice(0,14);
  const failed=clean.filter((r:any)=>r.status==="failed").length;

  const{data:run,error:runError}=await supabase.from("runtime_validation_runs").insert({
    run_code:runCode,
    environment:"preview",
    deployment_id:process.env.VERCEL_DEPLOYMENT_ID||null,
    commit_sha:process.env.VERCEL_GIT_COMMIT_SHA||null,
    base_url:baseUrl,
    status:failed===0?"passed":"failed",
    executed_by:user.id,
    notes:failed===0
      ?`Validación autenticada desde navegador: ${clean.length}/${clean.length} correctas.`
      :`Validación autenticada desde navegador: ${clean.length-failed}/${clean.length} correctas.`
  }).select("id").single();

  if(runError||!run)return NextResponse.json({error:runError?.message||"run_create_failed"},{status:500});

  const payload=clean.map((r:any)=>({...r,run_id:run.id}));
  const{error:resultsError}=await supabase.from("runtime_validation_results").insert(payload);
  if(resultsError){
    await supabase.from("runtime_validation_runs").update({
      status:"failed",
      notes:"No fue posible guardar los resultados de la validación.",
      updated_at:new Date().toISOString()
    }).eq("id",run.id);
    return NextResponse.json({error:"validation_results_save_failed"},{status:500});
  }

  return NextResponse.json({ok:true,run_id:run.id,status:failed===0?"passed":"failed"});
}
