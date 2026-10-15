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
};
export async function readAuthorizedExternalCatalog(
  port:ExternalCatalogReadPort|null,
  permission:ExternalCatalogReadPermission
):Promise<readonly PublicThirdPartyCard[]>{
  if(permission?.sourceApproved!==true||permission?.publicReadEnabled!==true||
     permission?.humanReleaseGateEnabled!==true||
     !port||typeof port.readApprovedRecords!=="function")return [];
  try{
    const records=await port.readApprovedRecords();
    return projectTraceablyReviewedExternalCatalog(records,{sourceApproved:true,humanReleaseGateEnabled:true});
  }catch{
    // Provider unavailable or incomplete: never leak errors/data to visitors.
    return [];
  }
}
