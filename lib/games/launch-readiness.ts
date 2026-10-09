import {INITIAL_WORLDS_PER_GAME} from "./world-model";

export type LaunchReadiness = {ready:boolean; blockers:string[]};
export type InternalWorldReadiness = {
  gameId:string;
  worldNumber:number;
  accessType:string;
  status:string;
  playUrl:string|null;
};
export type GameLaunchEvidence = {
  gameId:string;
  lifecycleStage:string;
  environment:string;
  gateStatus:string;
  gateGameId:string|null;
  gateDeploymentId:string|null;
  deploymentId:string|null;
  humanApproved:boolean;
  betaAccessVerified:boolean;
  worlds:readonly InternalWorldReadiness[];
};

/** Advisory checklist only. Never use this result alone to grant public access.
 * Production release requires a trusted server-side authorization record and revalidation.
 */
export function inspectGameLaunchEvidence(e:GameLaunchEvidence):LaunchReadiness {
  const blockers:string[]=[];
  if(!e.gameId||e.gateGameId!==e.gameId)blockers.push("Aprobación no vinculada al videojuego");
  if(e.environment!=="production")blockers.push("Despliegue aún no destinado a producción");
  if(e.gateStatus!=="approved"||!e.humanApproved)blockers.push("Aprobación humana pendiente");
  if(!e.deploymentId||e.gateDeploymentId!==e.deploymentId)blockers.push("Despliegue aprobado no coincide");
  if(!["launch","liveops"].includes(e.lifecycleStage))blockers.push("Etapa de lanzamiento no completada");
  if(e.worlds.length!==INITIAL_WORLDS_PER_GAME)blockers.push("Deben existir tres mundos internos");
  for(let number=1;number<=INITIAL_WORLDS_PER_GAME;number++){
    const world=e.worlds.find(w=>w.worldNumber===number&&w.gameId===e.gameId);
    if(!world){blockers.push("Mundo "+number+" no configurado");continue;}
    if(world.accessType!=="free")blockers.push("Mundo "+number+" no es gratuito");
    if(world.status!=="available")blockers.push("Mundo "+number+" no autorizado como disponible");
    if(!world.playUrl?.startsWith("https://"))blockers.push("Mundo "+number+" sin enlace HTTPS");
  }
  return {ready:blockers.length===0,blockers};
}
