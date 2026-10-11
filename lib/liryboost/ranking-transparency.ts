/** Reglas editoriales para futuro Top 10. No publica datos ni activa competencia. */
export type RankingPublicationCheck="inactive"|"pending_review";
export type RankingTransparencyContext={
 rulesPublished:boolean;programActive:boolean;sourceVerified:boolean;
 consentAudited:boolean;appealsProcessReady:boolean;manualReviewCompleted:boolean;
};
export function inspectInactiveRankingPublication(context:RankingTransparencyContext):RankingPublicationCheck{
 if(!context.rulesPublished||!context.programActive)return "inactive";
 return "pending_review";
}
export const LIRYBOOST_TIE_BREAK_RULE="Puntuación descendente; si hay empate, alias público en orden alfabético.";
export function canPublishInactiveRanking():false{return false;}
