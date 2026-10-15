import type {VerifiedReviewerAssertion} from "./liry-reviewer-authority-contract";

/** Server-owned identity source. A public catalog row cannot supply its own authority.
 * Production implementation must authenticate this port separately; no provider is connected.
 */
export type ReviewerAuthorityReadPort={
 readReviewerAuthority:(reviewerId:string,gameId:string)=>Promise<unknown>;
};
export function safeServerReviewerAssertion(raw:unknown,reviewerId:string,gameId:string):VerifiedReviewerAssertion|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw)||!reviewerId||!gameId)return null;
 const a=raw as Record<string,unknown>;
 if(a.reviewerId!==reviewerId||a.verifiedByTrustedProvider!==true||a.active!==true||
    !Array.isArray(a.roles)||!a.roles.includes("external_release_reviewer")||
    !Array.isArray(a.allowedGameIds)||!a.allowedGameIds.includes(gameId))return null;
 return {reviewerId,verifiedByTrustedProvider:true,active:true,
   roles:["external_release_reviewer"],allowedGameIds:[gameId]};
}
