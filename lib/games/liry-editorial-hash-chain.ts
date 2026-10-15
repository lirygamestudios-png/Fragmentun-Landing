import {createHash,timingSafeEqual} from "node:crypto";
import type {EditorialDecision} from "./liry-editorial-decision-ledger";

/** Server-side, pure SHA-256 linkage only. An externally anchored final hash
 * and authenticated reviewer identities are required for tamper-evidence in production.
 * Never send this private ledger to the browser.
 */
export type ChainedEditorialDecision={decision:EditorialDecision;previousHash:string;hash:string};
const ZERO="0".repeat(64);
const HASH=/^[a-f0-9]{64}$/;
const canonical=(d:EditorialDecision)=>JSON.stringify([
 d.gameId,d.versionId,d.artifactHash,d.sequence,d.action,
 d.reviewerId,d.decidedAt,d.approvalId
]);
export function hashEditorialDecision(decision:EditorialDecision,previousHash:string):string{
 return createHash("sha256").update("liry-editorial-v1\n"+previousHash+"\n"+canonical(decision),"utf8").digest("hex");
}
export function chainEditorialDecisions(decisions:readonly EditorialDecision[]):readonly ChainedEditorialDecision[]{
 let previousHash=ZERO;
 return decisions.map(decision=>{
  const hash=hashEditorialDecision(decision,previousHash);
  const entry={decision,previousHash,hash};
  previousHash=hash;
  return entry;
 });
}
export function verifyEditorialHashChain(entries:unknown,expectedFinalHash:string):EditorialDecision[]|null{
 if(!Array.isArray(entries)||entries.length===0||!HASH.test(expectedFinalHash))return null;
 const decisions:EditorialDecision[]=[];
 let previous=ZERO;
 for(const item of entries){
  if(!item||typeof item!=="object"||Array.isArray(item))return null;
  const e=item as Partial<ChainedEditorialDecision>;
  if(!e.decision||typeof e.decision!=="object"||Array.isArray(e.decision)||
     typeof e.previousHash!=="string"||!HASH.test(e.previousHash)||
     typeof e.hash!=="string"||!HASH.test(e.hash))return null;
  const expected=hashEditorialDecision(e.decision,previous);
  if(!timingSafeEqual(Buffer.from(e.previousHash,"hex"),Buffer.from(previous,"hex"))||
     !timingSafeEqual(Buffer.from(e.hash,"hex"),Buffer.from(expected,"hex")))return null;
  decisions.push(e.decision);
  previous=e.hash;
 }
 return timingSafeEqual(Buffer.from(previous,"hex"),Buffer.from(expectedFinalHash,"hex"))?decisions:null;
}
