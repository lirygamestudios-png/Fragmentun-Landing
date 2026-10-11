/**
 * Contrato exclusivamente público del estado gamer.
 * No consulta Supabase ni supone que las cuentas o partidas estén habilitadas.
 * Adaptadores futuros deberán validar identidad, autorización y fuente de eventos
 * en el servidor antes de proporcionar un estado "verified".
 */
export type GamerActivityStatus="visitor"|"identified_no_activity"|"verified";
export type VerifiedGamerActivity={
  accountId:string;
  verifiedAt:string;
  gamesPlayed:number;
  achievedCount:number;
  playMinutes:number;
  visitedWorldIds:readonly string[];
  achievementIds:readonly string[];
  experiencePoints:number;
};
export type PublicGamerSnapshot={
  status:GamerActivityStatus;
  displayName:string;
  verifiedActivity:VerifiedGamerActivity|null;
};
export const VISITOR_GAMER_SNAPSHOT:Readonly<PublicGamerSnapshot>=Object.freeze({
  status:"visitor",displayName:"Visitante",verifiedActivity:null
});
export function makePublicGamerSnapshot(
  authenticated:boolean,
  activity:VerifiedGamerActivity|null
):PublicGamerSnapshot{
  if(!authenticated)return {...VISITOR_GAMER_SNAPSHOT};
  if(!activity || !activity.accountId || !activity.verifiedAt ||
    ![activity.gamesPlayed,activity.achievedCount,activity.playMinutes,activity.experiencePoints].every(n=>Number.isSafeInteger(n)&&n>=0) ||
    !Array.isArray(activity.visitedWorldIds)||!Array.isArray(activity.achievementIds))
    return {status:"identified_no_activity",displayName:"Jugador",verifiedActivity:null};
  return {status:"verified",displayName:"Jugador",verifiedActivity:activity};
}
