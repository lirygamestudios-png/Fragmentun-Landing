import {INITIAL_WORLDS_PER_GAME,PORTFOLIO_GAME_LIMIT} from "./world-model";

export type PublicGameState = "coming_soon" | "beta" | "available";
export interface PublicGameCard {
  slug:string;
  title:string;
  state:PublicGameState;
  tagline:string;
  playUrl:string|null;
  internalWorldCount:number;
}
/** Catalogo editorial aprobado, NO prueba de que el juego este online.
 * La disponibilidad final debe venir del Admin + Release Gate y datos publicados.
 * Por seguridad, nunca sustituir 'coming_soon' por 'available' en esta constante.
 */
const plannedTitles = [
  ["skill-arena","SKILL ARENA","Competencia y habilidad"],
  ["inflabots-arena","INFLABOTS ARENA","Desafíos y estrategia"],
  ["la-batalla-del-dinero","LA BATALLA DEL DINERO","Aprende jugando"],
  ["gaias-last-stand","GAIAS LAST STAND","Defiende tu mundo"],
  ["nexo-social","NEXO SOCIAL","Conecta y descubre"],
  ["eternun","ETERNUN","Explora lo desconocido"],
  ["fragmentun","FRAGMENTUN","Emociones y decisiones"],
  ["cripto-titans","CRIPTO TITANS","Estrategia y descubrimiento"],
  ["codeverse","CODEVERSE","Crea y experimenta"],
] as const;

if(plannedTitles.length!==PORTFOLIO_GAME_LIMIT) throw new Error("invalid_catalog_capacity");

export const plannedLiryGames:readonly PublicGameCard[] = plannedTitles.map(([slug,title,tagline])=>({
  slug,title,tagline,state:"coming_soon",playUrl:null,internalWorldCount:INITIAL_WORLDS_PER_GAME
}));

/**
 * Contract for future release publication. No current game is authorized.
 * Approval must be linked to THIS game, environment, deployment and all 3 free worlds.
 */
export interface PerGameReleaseAuthorization {
  gameSlug:string;
  environment:"preview"|"staging"|"production";
  gameState:"beta"|"available";
  gateStatus:"approved";
  gateGameSlug:string;
  gateDeploymentId:string;
  deploymentId:string;
  humanApproved:boolean;
  worlds:{number:number;access:"free";playUrl:string|null;ready:boolean}[];
  betaAccessVerified:boolean;
}
export function isAuthorizedGameRelease(a:PerGameReleaseAuthorization):boolean{
  if(!plannedLiryGames.some(g=>g.slug===a.gameSlug))return false;
  if(a.gateStatus!=="approved"||!a.humanApproved||a.gateGameSlug!==a.gameSlug)return false;
  if(!a.deploymentId||a.gateDeploymentId!==a.deploymentId)return false;
  if(a.environment!=="production")return false;
  if(a.worlds.length!==INITIAL_WORLDS_PER_GAME)return false;
  if(a.worlds.some((w,i)=>w.number!==i+1||w.access!=="free"||!w.ready))return false;
  if(a.gameState==="beta")return a.betaAccessVerified;
  return a.gameState==="available"&&a.worlds.every(w=>w.playUrl?.startsWith("https://"));
}
export function publishAuthorizedGames(authorizations:readonly PerGameReleaseAuthorization[]):readonly PublicGameCard[]{
  return plannedLiryGames.map(game=>{
    const a=authorizations.find(item=>item.gameSlug===game.slug&&isAuthorizedGameRelease(item));
    if(!a)return game;
    return {...game,state:a.gameState,playUrl:a.gameState==="available"?a.worlds[0]?.playUrl||null:null};
  });
}
