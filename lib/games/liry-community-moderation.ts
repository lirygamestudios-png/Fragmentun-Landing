/** Política inactiva para moderación comunitaria. No almacena ni publica contenido. */
export type CommunityModerationDecision="blocked_inactive"|"needs_review"|"reject";
export type CommunitySubmission={
 category:"posts"|"friends"|"achievements"|"events";
 authenticated:boolean;
 consent:boolean;
 body:string;
};
export function inspectInactiveCommunitySubmission(input:unknown):CommunityModerationDecision{
 if(!input||typeof input!=="object"||Array.isArray(input))return "reject";
 const x=input as Record<string,unknown>;
 if(!["posts","friends","achievements","events"].includes(String(x.category)))return "reject";
 if(typeof x.body!=="string"||x.body.length>1000||/[\u0000-\u0008\u000b\u000e-\u001f]/.test(x.body))return "reject";
 if(x.authenticated!==true||x.consent!==true)return "blocked_inactive";
 return "needs_review";
}
/** Aunque un envío parezca válido, NO hay ruta de publicación activa. */
export function canAutoPublishCommunityContent():false{return false;}
