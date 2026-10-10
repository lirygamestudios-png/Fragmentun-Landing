import {createHash,timingSafeEqual} from "node:crypto";
/**
 * Verificación pura del token MFA de contexto LIRYGAMES.
 * Los registros deben proceder del servidor, nunca del navegador.
 * No toca Supabase ni sustituye la sesión Auth real.
 */
export type CommanderMfaRecord={
 user_id:string;context:string;token_hash:string;expires_at:string;factor_id:string;
};
export function matchesLiryCommanderContext(
 record:CommanderMfaRecord|null,
 userId:string,
 cookieToken:string|null,
 now:number=Date.now()
):boolean{
 if(!record||!userId||!cookieToken||!record.factor_id||record.user_id!==userId||record.context!=="lirygames_commander")return false;
 if(!/^[a-f0-9]{64}$/i.test(record.token_hash)||!/^[a-f0-9]{64}$/i.test(cookieToken))return false;
 const expires=Date.parse(record.expires_at);
 if(!Number.isFinite(expires)||expires<=now)return false;
 const computed=createHash("sha256").update(cookieToken).digest();
 const expected=Buffer.from(record.token_hash,"hex");
 return computed.length===expected.length&&timingSafeEqual(computed,expected);
}
