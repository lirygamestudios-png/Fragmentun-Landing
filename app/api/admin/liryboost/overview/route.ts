import {NextResponse} from "next/server";
import {getVerifiedLiryBoostCommanderActor} from "../../../../../lib/liryboost/commander-session-server";
import {canPerformLiryBoostAction} from "../../../../../lib/liryboost/access-policy";
export const dynamic="force-dynamic";
/** Vista administrativa sin participantes reales ni operaciones de escritura. */
export async function GET(){
 const actor=await getVerifiedLiryBoostCommanderActor();
 if(!canPerformLiryBoostAction(actor,"read_private_referrals"))
  return NextResponse.json({ok:false,error:"unauthorized"},{status:403,headers:{"Cache-Control":"no-store"}});
 return NextResponse.json({ok:true,programActive:false,participants:[],message:"LiryBoost aún no dispone de registros autorizados."},{headers:{"Cache-Control":"no-store"}});
}
