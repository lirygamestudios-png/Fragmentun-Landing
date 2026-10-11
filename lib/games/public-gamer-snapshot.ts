/** Contrato público gamer. Sin conexión ni habilitación de actividad. */
export type GamerActivityStatus="visitor"|"identified_no_activity"|"verified";
export type VerifiedGamerActivity={
  accountId:string;verifiedAt:string;gamesPlayed:number;achievedCount:number;
  playMinutes:number;visitedWorldIds:readonly string[];achievementIds:readonly string[];
  experiencePoints:number;
};
export type PublicGamerActivity=Omit<VerifiedGamerActivity,"accountId">;
export type PublicGamerSnapshot={
  status:GamerActivityStatus;displayName:string;verifiedActivity:PublicGamerActivity|null;
};
export const VISITOR_GAMER_SNAPSHOT:Readonly<PublicGamerSnapshot>=Object.freeze({
  status:"visitor",displayName:"Visitante",verifiedActivity:null
});
const validCount=(n:number)=>Number.isSafeInteger(n)&&n>=0;
const validIds=(items:readonly string[])=>Array.isArray(items)&&items.length<=1000&&
  items.every(id=>typeof id==="string"&&/^[a-zA-Z0-9_-]{1,80}$/.test(id))&&
  new Set(items).size===items.length;
/** Fail-closed: solo un adaptador autorizado del servidor puede confirmar el origen. */
export function makePublicGamerSnapshot(
  authenticated:boolean,activity:VerifiedGamerActivity|null,serverVerified=false
):PublicGamerSnapshot{
  if(!authenticated)return {...VISITOR_GAMER_SNAPSHOT};
  if(!serverVerified||!activity||
    typeof activity.accountId!=="string"||!activity.accountId.trim()||
    typeof activity.verifiedAt!=="string"||
    !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d+)?Z$/.test(activity.verifiedAt)||
    !Number.isFinite(Date.parse(activity.verifiedAt))||
    Date.parse(activity.verifiedAt)>Date.now()||
    ![activity.gamesPlayed,activity.achievedCount,activity.playMinutes,activity.experiencePoints].every(validCount)||
    !validIds(activity.visitedWorldIds)||!validIds(activity.achievementIds)||
    activity.achievedCount!==activity.achievementIds.length||activity.visitedWorldIds.length>9)
    return {status:"identified_no_activity",displayName:"Jugador",verifiedActivity:null};
  return {status:"verified",displayName:"Jugador",verifiedActivity:{
    verifiedAt:activity.verifiedAt,gamesPlayed:activity.gamesPlayed,
    achievedCount:activity.achievedCount,playMinutes:activity.playMinutes,
    visitedWorldIds:[...activity.visitedWorldIds],
    achievementIds:[...activity.achievementIds],experiencePoints:activity.experiencePoints
  }};
}
