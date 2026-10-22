/** Future optimistic concurrency contract for Liry Developers drafts.
 * No database write, persistence or user authentication is active.
 */
export const LIRY_DEVELOPER_DRAFT_SAVES_ENABLED=false as const;
export type DeveloperDraftRevision={applicationId:string;ownerUserId:string;revision:number;updatedAt:string};
export type DeveloperDraftWriteRequest={applicationId:string;ownerUserId:string;expectedRevision:number;authenticatedUserId:string;sessionVerified:boolean;serverOwnershipVerified:boolean};
export type DeveloperDraftWriteDecision={allowed:boolean;reason:"disabled"|"unauthorized"|"conflict"|"invalid_revision"|"ready";nextRevision:number|null};
export function assessDeveloperDraftWrite(current:DeveloperDraftRevision,request:DeveloperDraftWriteRequest):DeveloperDraftWriteDecision{
 if(!LIRY_DEVELOPER_DRAFT_SAVES_ENABLED)return{allowed:false,reason:"disabled",nextRevision:null};
 return simulateDeveloperDraftWrite(current,request);
}
/** Pure simulation only; real backend must use atomic conditional update. */
export function simulateDeveloperDraftWrite(current:DeveloperDraftRevision,request:DeveloperDraftWriteRequest):DeveloperDraftWriteDecision{
 if(!request.sessionVerified||!request.serverOwnershipVerified||!request.authenticatedUserId||
    request.authenticatedUserId!==current.ownerUserId||request.ownerUserId!==current.ownerUserId||
    request.applicationId!==current.applicationId)return{allowed:false,reason:"unauthorized",nextRevision:null};
 if(!Number.isSafeInteger(current.revision)||current.revision<0||
    !Number.isSafeInteger(request.expectedRevision)||request.expectedRevision<0)return{allowed:false,reason:"invalid_revision",nextRevision:null};
 if(request.expectedRevision!==current.revision)return{allowed:false,reason:"conflict",nextRevision:null};
 return{allowed:true,reason:"ready",nextRevision:current.revision+1};
}
