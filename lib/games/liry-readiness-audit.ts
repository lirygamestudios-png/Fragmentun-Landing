import {LIRY_ACTIVATION_REQUIREMENTS,isLiryActivationReady} from "./liry-activation-readiness";
import {getInactiveLiryGamerView,LIRY_INTEGRATION_PORTS} from "./liry-integration-gateway";

/** Auditoría determinista de configuración declarada; NO sustituye pruebas de infraestructura. */
export type LiryReadinessAudit={
  status:"blocked";
  passed:number;
  required:number;
  blockedRequirementIds:readonly string[];
  identity:"visitor";
  configuredPorts:0;
  publicGameLinks:9;
  verifiedLinks:0;
  serverGameActivity:false;
};
export function auditInactiveLiryReadiness():LiryReadinessAudit{
  const view=getInactiveLiryGamerView();
  const blocked=LIRY_ACTIVATION_REQUIREMENTS.filter(item=>!item.ready);
  if(isLiryActivationReady(false)||view.available!==false||
     view.identity.kind!=="visitor"||view.activity.status!=="visitor"||
     view.activity.verifiedActivity!==null||
     view.gameLinks.length!==9||
     view.gameLinks.some(link=>link.status!=="not_connected"||link.source!==null||link.lastVerifiedAt!==null)||
     Object.values(LIRY_INTEGRATION_PORTS).some(port=>port!=="not_configured")){
    throw new Error("LIRY_ID_READINESS_INVARIANT_FAILED");
  }
  return {
    status:"blocked",
    passed:LIRY_ACTIVATION_REQUIREMENTS.length-blocked.length,
    required:LIRY_ACTIVATION_REQUIREMENTS.length,
    blockedRequirementIds:blocked.map(item=>item.id),
    identity:"visitor",
    configuredPorts:0,
    publicGameLinks:view.gameLinks.length,
    verifiedLinks:0,
    serverGameActivity:false
  };
}
