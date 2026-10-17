/** LIRYGAMES: afinidad universal y verificable para juegos propios y terceros.
 * Motor puro, sin telemetría, nombres de IP, pagos ni publicaciones automáticas.
 */
import {TOTAL_CATALOG_CAPACITY,OWN_GAME_RESERVED_SLOTS,THIRD_PARTY_CATALOG_CAPACITY} from "./liry-developer-publication";

export const LIRY_AFFINITY_DIMENSIONS=["exploration","strategy","competition","social","action","creativity"] as const;
export type LiryAffinityDimension=(typeof LIRY_AFFINITY_DIMENSIONS)[number];
export type LiryAffinityVector=readonly [number,number,number,number,number,number];
export type LiryGameOrigin="first_party"|"third_party";

export type LiryUniversalGame=Readonly<{
 publicId:string;
 origin:LiryGameOrigin;
 published:boolean;
 releaseApproved:boolean;
 affinityApproved:boolean;
 affinity:LiryAffinityVector|null;
}>;

export type LiryAffinityRecommendation=Readonly<{
 publicId:string;
 origin:LiryGameOrigin;
 score:number;
}>;

export function validLiryAffinityVector(value:unknown):value is LiryAffinityVector{
 return Array.isArray(value)&&value.length===LIRY_AFFINITY_DIMENSIONS.length
  &&value.every(n=>typeof n==="number"&&Number.isInteger(n)&&n>=0&&n<=3);
}

/** Sin ficha editorial aprobada, el videojuego NO participa en la personalización. */
export function recommendUniversalLiryGames(
 games:readonly LiryUniversalGame[],
 player:LiryAffinityVector,
 limit=3
):readonly LiryAffinityRecommendation[]{
 if(!validLiryAffinityVector(player)||!Number.isSafeInteger(limit)||limit<1)return [];
 const seen=new Set<string>();
 let owned=0,external=0;
 const eligible:LiryAffinityRecommendation[]=[];
 for(const game of games){
  if(!game||typeof game.publicId!=="string"||!game.publicId.trim()||seen.has(game.publicId))continue;
  seen.add(game.publicId);
  if(!game.published||!game.releaseApproved||!game.affinityApproved||!validLiryAffinityVector(game.affinity))continue;
  if(game.origin==="first_party"){if(owned>=OWN_GAME_RESERVED_SLOTS)continue;owned++;}
  else if(game.origin==="third_party"){if(external>=THIRD_PARTY_CATALOG_CAPACITY)continue;external++;}
  else continue;
  const affinity=game.affinity;
  const score=affinity.reduce((sum,weight,index)=>sum+weight*player[index],0);
  eligible.push({publicId:game.publicId,origin:game.origin,score});
 }
 return eligible.sort((a,b)=>b.score-a.score||a.publicId.localeCompare(b.publicId)).slice(0,Math.min(limit,TOTAL_CATALOG_CAPACITY));
}

export type LiryVerifiedPlayerGame=Readonly<{publicId:string;origin:LiryGameOrigin;verified:boolean}>;
/** Progreso global por juego único y actividad verificada; no crea actividad ficticia. */
export function universalLiryJourneyProgress(
 catalog:readonly LiryUniversalGame[],
 activity:readonly LiryVerifiedPlayerGame[]
):Readonly<{eligible:number;visited:number}>{
 const eligible=new Set(catalog.filter(game=>game.published&&game.releaseApproved).map(game=>game.publicId));
 const visited=new Set(activity.filter(a=>a.verified&&eligible.has(a.publicId)).map(a=>a.publicId));
 return {eligible:eligible.size,visited:visited.size};
}
