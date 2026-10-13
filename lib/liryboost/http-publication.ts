/** HTTP publication boundary for LiryBoost.
 * Fail closed: an inactive program must never disclose a leaderboard.
 * This function neither reads users nor activates the program.
 */
import type {PublicLiryBoostRow} from "./public-leaderboard.ts";
export const LIRYBOOST_PUBLIC_NO_CACHE_HEADERS={
 "Cache-Control":"no-store, max-age=0",
 "X-Content-Type-Options":"nosniff",
 "X-Robots-Tag":"noindex, nofollow, noarchive"
} as const;
export function buildLiryBoostHttpPayload(snapshot:{programActive:unknown;leaderboard:unknown}):
 {programActive:boolean;leaderboard:ReadonlyArray<PublicLiryBoostRow>;message:string}{
 const active=snapshot?.programActive===true;
 const rows=snapshot?.leaderboard;
 if(!active||!Array.isArray(rows))return {programActive:false,leaderboard:[],message:"LiryBoost todavía no está activo."};
 const safe=rows.filter((row):row is PublicLiryBoostRow=>
  !!row&&typeof row.publicName==="string"&&row.publicName.trim().length>0&&
  row.publicName.length<=60&&!row.publicName.includes("@")&&!/[<>\r\n]/.test(row.publicName)&&
  Number.isSafeInteger(row.verifiedInvitations)&&row.verifiedInvitations>0
 ).slice(0,10).map(row=>({publicName:row.publicName,verifiedInvitations:row.verifiedInvitations}));
 return {programActive:true,leaderboard:safe,message:""};
}
