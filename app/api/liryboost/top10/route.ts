import {NextResponse} from "next/server";
import {readLiryBoostTop10} from "../../../../lib/liryboost/read-provider";

/**
 * Endpoint público de solo lectura. Cerrado hasta que exista un origen
 * autenticado de invitaciones verificadas y consentimientos auditables.
 * No usa credenciales administrativas ni consulta Supabase.
 */
export const dynamic="force-dynamic";
export async function GET(){
 // Proveedor aún no conectado: el programa permanece cerrado.
 const snapshot=await readLiryBoostTop10(null);
 return NextResponse.json({
  programActive:snapshot.programActive,
  leaderboard:snapshot.leaderboard,
  message:"LiryBoost todavía no está activo."
 },{headers:{"Cache-Control":"no-store, max-age=0"}});
}
