import {safeServerReviewerAssertion,type ReviewerAuthorityReadPort} from "./liry-server-reviewer-authority";
import {verifyCustodiedEditorialHistory,type EditorialAnchorPort} from "./liry-editorial-anchor-custody";
import {projectTraceablyReviewedExternalCatalog} from "./liry-reviewed-publication-gate";
import type {PublicThirdPartyCard} from "./liry-developer-publication";

/** Future read adapter: no database dependency, no network activity by default.
 * The server must explicitly supply an approved read-only provider.
 * Records are still independently checked by the publication projection.
 */
export type ExternalCatalogReadPort={
  readApprovedRecords:()=>Promise<unknown>;
};
export type ExternalCatalogReadPermission={
  sourceApproved:boolean;
  publicReadEnabled:boolean;
  humanReleaseGateEnabled:boolean;
  independentCustodyEnabled:boolean;
};
export async function readAuthorizedExternalCatalog(
  port:ExternalCatalogReadPort|null,
  permission:ExternalCatalogReadPermission,
  custodian:EditorialAnchorPort|null=null,
  authority:ReviewerAuthorityReadPort|null=null
):Promise<readonly PublicThirdPartyCard[]>{
  if(permission?.sourceApproved!==true||permission?.publicReadEnabled!==true||
     permission?.humanReleaseGateEnabled!==true||
     permission?.independentCustodyEnabled!==true||
     !custodian||typeof custodian.readTrustedAnchor!=="function"||
     !authority||typeof authority.readReviewerAuthority!=="function"||
     !port||typeof port.readApprovedRecords!=="function")return [];
  try{
    const records=await port.readApprovedRecords();
    if(!Array.isArray(records))return [];
    const verified:unknown[]=[];
    for(const item of records){
      if(!item||typeof item!=="object"||Array.isArray(item))continue;
      const candidate=item as Record<string,unknown>;
      const record=candidate.record;
      if(!record||typeof record!=="object"||Array.isArray(record))continue;
      const gameId=(record as Record<string,unknown>).gameId;
      if(typeof gameId!=="string")continue;
      const history=await verifyCustodiedEditorialHistory(custodian,
        {custodianIndependent:true,readAuthorized:true},gameId,candidate.chainedHistory);
      if(!history||JSON.stringify(history)!==JSON.stringify(candidate.editorialHistory))continue;
      const chain=candidate.chainedHistory;
      if(!Array.isArray(chain))continue;
      const tail=chain[chain.length-1] as Record<string,unknown>|undefined;
      if(!tail||tail.hash!==candidate.expectedFinalHash)continue;
      const evidence=candidate.evidence;
      if(!evidence||typeof evidence!=="object"||Array.isArray(evidence))continue;
      const reviewerId=(evidence as Record<string,unknown>).reviewerId;
      if(typeof reviewerId!=="string")continue;
      const resolved=await authority.readReviewerAuthority(reviewerId,gameId);
      const versionId=(evidence as Record<string,unknown>).versionId;
      if(typeof versionId!=="string")continue;
      const serverAssertion=safeServerReviewerAssertion(resolved,reviewerId,gameId,versionId,new Date().toISOString());
      if(!serverAssertion)continue;
      verified.push({...candidate,reviewerAssertion:serverAssertion});
    }
    // Re-read server-owned authority immediately before the final projection.
    // If any grant changed or vanished mid-read, discard the whole batch.
    for(const item of verified){
      const entry=item as Record<string,unknown>;
      const ev=entry.evidence as Record<string,unknown>;
      const gameId=(entry.record as Record<string,unknown>).gameId;
      if(typeof ev.reviewerId!=="string"||typeof ev.versionId!=="string"||
         typeof gameId!=="string")return [];
      const fresh=await authority.readReviewerAuthority(ev.reviewerId,gameId);
      const verifiedGrant=safeServerReviewerAssertion(fresh,ev.reviewerId,gameId,ev.versionId,new Date().toISOString());
      if(!verifiedGrant)return [];
    }
    return projectTraceablyReviewedExternalCatalog(verified,{sourceApproved:true,humanReleaseGateEnabled:true});
  }catch{
    // Provider unavailable or incomplete: never leak errors/data to visitors.
    return [];
  }
}
