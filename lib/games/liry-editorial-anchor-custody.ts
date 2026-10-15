import {timingSafeEqual} from "node:crypto";
import {verifyEditorialHashChain,type ChainedEditorialDecision} from "./liry-editorial-hash-chain";
import type {EditorialDecision} from "./liry-editorial-decision-ledger";

/** Preparatory independent custody boundary. No storage or network connections.
 * An authorized, separate server-side custodian must eventually implement this port.
 */
export type EditorialAnchor={gameId:string;sequence:number;finalHash:string;custodianId:string;};
export type EditorialAnchorPort={readTrustedAnchor:(gameId:string)=>Promise<unknown>};
export type EditorialCustodyPermission={custodianIndependent:boolean;readAuthorized:boolean};
const validId=(v:unknown)=>typeof v==="string"&&v.length>0&&v.length<=160&&v.trim()===v;
const validHash=(v:unknown)=>typeof v==="string"&&/^[a-f0-9]{64}$/.test(v);
export async function verifyCustodiedEditorialHistory(
 port:EditorialAnchorPort|null,
 permission:EditorialCustodyPermission,
 gameId:string,
 entries:unknown
):Promise<readonly EditorialDecision[]|null>{
 if(!port||typeof port.readTrustedAnchor!=="function"||
    permission?.custodianIndependent!==true||permission?.readAuthorized!==true||
    !validId(gameId)||!Array.isArray(entries)||entries.length===0)return null;
 try{
  const raw=await port.readTrustedAnchor(gameId);
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
  const a=raw as Partial<EditorialAnchor>;
  if(a.gameId!==gameId||!Number.isSafeInteger(a.sequence)||a.sequence!==entries.length||
     !validId(a.custodianId)||!validHash(a.finalHash))return null;
  const trusted=a.finalHash as string;
  const tail=(entries as ChainedEditorialDecision[])[entries.length-1];
  if(!tail||typeof tail.hash!=="string"||!validHash(tail.hash)||
     !timingSafeEqual(Buffer.from(trusted,"hex"),Buffer.from(tail.hash,"hex")))return null;
  const decisions=verifyEditorialHashChain(entries,trusted);
  if(!decisions||decisions.length!==a.sequence||
     decisions.some(d=>d.gameId!==gameId))return null;
  return decisions;
 }catch{return null;}
}
