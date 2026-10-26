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
 if(!evidence.validationRunId.trim())missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[2]);
 if(!evidence.reviewerUserId.trim()||!Number.isFinite(Date.parse(evidence.reviewedAt)))missing.push(GAME_RELEASE_APPROVAL_REQUIREMENTS[3]);
 return {complete:missing.length===0,missing};
}
