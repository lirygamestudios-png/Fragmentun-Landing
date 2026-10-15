import type {IndependentReleaseEvidence} from "./liry-independent-release-evidence";
import type {EditorialDecision} from "./liry-editorial-decision-ledger";

/** Synthetic authorization boundary only. This is NOT identity authentication.
 * A production caller must supply a separately verified server-side actor.
 */
export type VerifiedReviewerAssertion={
 reviewerId:string;
 verifiedByTrustedProvider:boolean;
 active:boolean;
 roles:readonly string[];
 allowedGameIds:readonly string[];
};
export function reviewerMayAuthorizeRelease(
 assertion:unknown,
 evidence:IndependentReleaseEvidence,
 history:readonly EditorialDecision[]
):boolean{
 if(!assertion||typeof assertion!=="object"||Array.isArray(assertion)||
   !evidence||!Array.isArray(history)||history.length===0)return false;
 const a=assertion as Partial<VerifiedReviewerAssertion>;
 const last=history[history.length-1];
 return a.verifiedByTrustedProvider===true&&a.active===true&&
   typeof a.reviewerId==="string"&&a.reviewerId.length>0&&
   Array.isArray(a.roles)&&a.roles.includes("external_release_reviewer")&&
   Array.isArray(a.allowedGameIds)&&a.allowedGameIds.includes(evidence.gameId)&&
   a.reviewerId===evidence.reviewerId&&last.reviewerId===a.reviewerId&&
   last.gameId===evidence.gameId&&last.versionId===evidence.versionId&&
   last.artifactHash===evidence.reviewedArtifactHash&&
   last.decidedAt===evidence.decidedAt&&
   (last.action==="approve"||last.action==="reactivate");
}
