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
  custodian:EditorialAnchorPort|null=null
):Promise<readonly PublicThirdPartyCard[]>{
  if(permission?.sourceApproved!==true||permission?.publicReadEnabled!==true||
     permission?.humanReleaseGateEnabled!==true||
     permission?.independentCustodyEnabled!==true||
     !custodian||typeof custodian.readTrustedAnchor!=="function"||
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
      verified.push(item);
    }
    return projectTraceablyReviewedExternalCatalog(verified,{sourceApproved:true,humanReleaseGateEnabled:true});
  }catch{
    // Provider unavailable or incomplete: never leak errors/data to visitors.
    return [];
  }
}
