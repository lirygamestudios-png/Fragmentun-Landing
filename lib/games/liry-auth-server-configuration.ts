/** Preparación exclusiva del servidor: no crea clientes ni realiza llamadas externas.
 * LIRY ID permanece cerrado hasta aprovisionar un Supabase gamer separado.
 */
import {reviewLiryAuthProjectIsolation} from "./liry-auth-project-isolation";
export function readLiryGamerAuthConfiguration(env:Record<string,string|undefined>){
 const review=reviewLiryAuthProjectIsolation({
  gamerUrl:env.LIRY_GAMER_SUPABASE_URL,
  gamerPublishableKey:env.LIRY_GAMER_SUPABASE_PUBLISHABLE_KEY,
  fragmentunUrl:env.NEXT_PUBLIC_SUPABASE_URL,
  fragmentunPublishableKey:env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 });
 return {
  configured:review.ready,
  isolated:review.ready,
  // La configuración aislada por sí sola jamás habilita cuentas.
  registrationsEnabled:false,
  signInEnabled:false,
  recoveryEnabled:false
 } as const;
}
