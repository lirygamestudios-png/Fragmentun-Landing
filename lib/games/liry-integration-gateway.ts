import {LIRY_VISITOR_IDENTITY,type LiryPublicIdentity} from "./liry-id-contract";
import {DEFAULT_GAMER_PREFERENCES,type GamerProfilePreferences} from "./liry-profile-contract";
import {LIRY_GAME_LINKS_PENDING,type LiryGameLink} from "./liry-game-link-contract";
import {VISITOR_GAMER_SNAPSHOT,type PublicGamerSnapshot} from "./public-gamer-snapshot";

/** Proyección exclusivamente pública. No transporta credenciales, correos ni registros privados. */
export type LiryGamerPublicView={
  identity:LiryPublicIdentity;
  preferences:Readonly<GamerProfilePreferences>;
  gameLinks:ReadonlyArray<Readonly<LiryGameLink>>;
  activity:Readonly<PublicGamerSnapshot>;
  available:false;
};

/** Estado cerrado mientras no existan adaptadores autorizados y auditados. */
export function getInactiveLiryGamerView():LiryGamerPublicView{
  return {
    identity:LIRY_VISITOR_IDENTITY,
    preferences:DEFAULT_GAMER_PREFERENCES,
    gameLinks:LIRY_GAME_LINKS_PENDING,
    activity:VISITOR_GAMER_SNAPSHOT,
    available:false
  };
}

/**
 * Reservado para futuros adaptadores del servidor: nunca conectar un origen cliente
 * directamente a este gateway ni cambiar available hasta aprobar todos los requisitos.
 */
export type LiryServerIntegrationPorts={
  authenticatedIdentity:"not_configured";
  privateProfileStore:"not_configured";
  verifiedGameEvents:"not_configured";
  auditTrail:"not_configured";
};
export const LIRY_INTEGRATION_PORTS:Readonly<LiryServerIntegrationPorts>=Object.freeze({
  authenticatedIdentity:"not_configured",
  privateProfileStore:"not_configured",
  verifiedGameEvents:"not_configured",
  auditTrail:"not_configured"
});
