/** Requisitos de trazabilidad de publicación. No concede permisos ni escribe datos. */
export type GameReleaseApprovalEvidence={
 gameId:string;
 releaseId:string;
 deploymentId:string;
 commitSha:string;
 validationRunId:string;
 reviewerUserId:string;
 reviewedAt:string;
};
export const GAME_RELEASE_APPROVAL_REQUIREMENTS=[
 "Identidad del videojuego y lanzamiento",
 "Versión y despliegue verificables",
 "Evidencia de validación funcional",
 "Aprobación humana registrada"
] as const;
export function reviewGameReleaseApprovalEvidence(
 expected:{gameId:string;releaseId:string},
 evidence:GameReleaseApprovalEvidence|null
):{complete:boolean;missing:readonly string[]}{
 if(!evidence)return {complete:false,missing:[...GAME_RELEASE_APPROVAL_REQUIREMENTS]};
 const missing:string[]=[];
 if(!expected.gameId||!expected.releaseId||evidence.gameId!==expected.gameId||evidence.releaseId!==expected.releaseId)missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[0]);
 if(!/^dpl_[A-Za-z0-9]+$/.test(evidence.deploymentId)||!/^[0-9a-f]{40}$/.test(evidence.commitSha))missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[1]);
 if(!/^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/.test(evidence.validationRunId))missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[2]);
 const reviewedAtIsUtc=/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\\.\d{1,3})?Z$/.test(evidence.reviewedAt);\n const reviewedAtMs=Date.parse(evidence.reviewedAt);\n if(!evidence.reviewerUserId.trim()||!reviewedAtIsUtc||!Number.isFinite(reviewedAtMs)||new Date(reviewedAtMs).toISOString()!==new Date(evidence.reviewedAt).toISOString()||reviewedAtMs>Date.now())missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[3]);
 return {complete:missing.length===0,missing};
}
