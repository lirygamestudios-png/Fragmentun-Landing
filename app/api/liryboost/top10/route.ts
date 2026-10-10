import {NextResponse} from "next/server";
import {buildLiryBoostPublicSnapshot} from "../../../../lib/liryboost/public-snapshot";

/**
 * Endpoint público de solo lectura. Cerrado hasta que exista un origen
 * autenticado de invitaciones verificadas y consentimientos auditables.
 * No usa credenciales administrativas ni consulta Supabase.
 */
export const dynamic="force-dynamic";
export async function GET(){
 const top=buildLiryBoostPublicSnapshot(
  {programActive:false,rulesPublished:false,verificationEnabled:false},
  []
 );
 return NextResponse.json({
  programActive:false,
  leaderboard:top,
  message:"LiryBoost todavía no está activo."
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
