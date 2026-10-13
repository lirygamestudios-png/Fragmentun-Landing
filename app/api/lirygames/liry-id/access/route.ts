import {NextResponse} from "next/server";
import {LIRY_ID_PUBLIC_ACCESS} from "../../../../../lib/games/liry-id-public-access";

/** Control de acceso público antes de aprovisionar la identidad gamer aislada.
 * No procesa contraseñas, no crea sesiones ni llama a la administración.
 */
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"};
export async function POST(){
 return NextResponse.json({
  ok:false,
  error:"liry_id_unavailable",
  message:LIRY_ID_PUBLIC_ACCESS.message
 },{status:503,headers});
}
