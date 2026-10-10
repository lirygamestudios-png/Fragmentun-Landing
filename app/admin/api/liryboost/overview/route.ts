import {NextResponse} from "next/server";
import {getVerifiedLiryBoostCommanderActor} from "../../../../../lib/liryboost/commander-session-server";
import {canPerformLiryBoostAction} from "../../../../../lib/liryboost/access-policy";
/**
 * Ruta compatible con cookie liry_mfa_context (Path=/admin).
 * Resumen cerrado y de solo lectura: no hay datos reales conectados.
 */
export const dynamic="force-dynamic";
export async function GET(){
 const actor=await getVerifiedLiryBoostCommanderActor();
 const headers={"Cache-Control":"private, no-store, max-age=0"};
 if(!canPerformLiryBoostAction(actor,"read_private_referrals"))
  return NextResponse.json({ok:false,error:"unauthorized"},{status:403,headers});
 return NextResponse.json({ok:true,programActive:false,participants:[],message:"LiryBoost todavía no está activo."},{headers});
}
