/** Private editorial control snapshot. Never supplied by a public client.
 * This does not persist decisions or activate a real publishing workflow.
 */
export type ExternalEditorialControl={
 gameId:string;
 currentVersionId:string;
 state:"active"|"suspended"|"revoked"|"replacement_pending";
 approvalVersionId:string;
 approvalArtifactHash:string;
};
export function permitsCurrentExternalRelease(control:unknown,gameId:string,versionId:string,artifactHash:string):boolean{
 if(!control||typeof control!=="object"||Array.isArray(control))return false;
 const c=control as Record<string,unknown>;
 return c.state==="active"&&c.gameId===gameId&&
  c.currentVersionId===versionId&&c.approvalVersionId===versionId&&
  c.approvalArtifactHash===artifactHash&&
  typeof artifactHash==="string"&&/^[a-f0-9]{64}$/i.test(artifactHash);
}
