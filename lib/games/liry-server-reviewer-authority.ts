import type {VerifiedReviewerAssertion} from "./liry-reviewer-authority-contract";

/** Server-owned identity source. A public catalog row cannot supply its own authority.
 * Production implementation must authenticate this port separately; no provider is connected.
 */
export type ReviewerAuthorityReadPort={
 readReviewerAuthority:(reviewerId:string,gameId:string)=>Promise<unknown>;
};
export function safeServerReviewerAssertion(raw:unknown,reviewerId:string,gameId:string,versionId?:string,checkedAt?:string):VerifiedReviewerAssertion|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||!reviewerId||!gameId)return null;
 const a=raw as Record<string,unknown>;
 const now=typeof checkedAt==="string"?Date.parse(checkedAt):NaN;
 const expiry=typeof a.expiresAt==="string"?Date.parse(a.expiresAt):NaN;
 if(!versionId||!Number.isFinite(now)||!Number.isFinite(expiry)||
    !/^\\d{4}-\\d{2}-\\d{2}T/.test(checkedAt??"")||
    !/^\\d{4}-\\d{2}-\\d{2}T/.test(String(a.expiresAt??""))||
    expiry<=now||a.revoked===true||
    !Array.isArray(a.allowedVersionIds)||!a.allowedVersionIds.includes(versionId))return null;
 if(a.reviewerId!==reviewerId||a.verifiedByTrustedProvider!==true||a.active!==true||
    !Array.isArray(a.roles)||!a.roles.includes("external_release_reviewer")||
    !Array.isArray(a.allowedGameIds)||!a.allowedGameIds.includes(gameId))return null;
 return {reviewerId,verifiedByTrustedProvider:true,active:true,
   roles:["external_release_reviewer"],allowedGameIds:[gameId]};
}
