import "server-only";
import {plannedLiryGames,type PublicGameCard} from "./public-catalog";
import type {PublicThirdPartyCard} from "./liry-developer-publication";
import {readAuthorizedExternalCatalog} from "./liry-external-catalog-read-port";

/**
 * Read-only, fail-closed FrontDesk catalog.
 * Until a human-reviewed public release projection exists, always render the
 * editorial nine-game preview. Do not query the private game_titles table:
 * its lifecycle_stage does not authorize publication, and the former query
 * never affected the returned result.
 */
export async function getLiryPublicCatalog():Promise<readonly PublicGameCard[]>{
  return plannedLiryGames;
}

/**
 * Third-party public channel is not authorized/configured yet.
 * Never publish fictional entries or read private developer records.
 */
export async function getLiryApprovedThirdPartyCatalog():Promise<readonly PublicThirdPartyCard[]>{
  return readAuthorizedExternalCatalog(null, {
    sourceApproved:false,
    publicReadEnabled:false,
    humanReleaseGateEnabled:false,
    independentCustodyEnabled:false
  });
}
