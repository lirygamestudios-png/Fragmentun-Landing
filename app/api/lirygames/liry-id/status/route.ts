import {NextResponse} from "next/server";
import {LIRY_ID_PUBLIC_ACCESS} from "../../../../lib/games/liry-id-public-access";

/** Estado público de LIRY ID; nunca revela credenciales ni sesión administrativa. */
export const dynamic="force-dynamic";
export async function GET(){
 return NextResponse.json({
  registrationEnabled:LIRY_ID_PUBLIC_ACCESS.registrationEnabled,
  signInEnabled:LIRY_ID_PUBLIC_ACCESS.signInEnabled,
  recoveryEnabled:LIRY_ID_PUBLIC_ACCESS.recoveryEnabled,
  message:LIRY_ID_PUBLIC_ACCESS.message
 },{headers:{"Cache-Control":"no-store, max-age=0","X-Content-Type-Options":"nosniff"}});
}
