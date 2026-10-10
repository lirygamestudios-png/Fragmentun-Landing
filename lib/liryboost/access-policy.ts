/**
 * Contrato de autorización previo a conectar Commander Center.
 * Puro y sin efectos: NO sustituye sesiones verificadas ni políticas RLS.
 */
export type LiryBoostActor={authenticated:boolean;role:"admin"|"verifier"|"participant"|"anonymous";userId:string|null};
export type LiryBoostAction="read_own_summary"|"verify_referral"|"revoke_referral"|"publish_ranking"|"read_private_referrals";
export function canPerformLiryBoostAction(actor:LiryBoostActor,action:LiryBoostAction,ownerUserId?:string):boolean{
 if(!actor.authenticated||!actor.userId?.trim())return false;
 if(actor.role==="admin")return true;
 if(actor.role==="verifier")return action==="verify_referral"||action==="revoke_referral";
 if(actor.role==="participant")return action==="read_own_summary"&&!!ownerUserId&&ownerUserId===actor.userId;
 return false;
}
