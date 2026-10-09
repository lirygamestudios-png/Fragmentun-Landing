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

export function canLaunchPublicGame(game:Pick<PublicGameCard,"state"|"playUrl">):boolean{
  return game.state==="available"&&!!game.playUrl&&/^https:\/\//.test(game.playUrl);
}
