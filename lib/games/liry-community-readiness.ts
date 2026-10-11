/** Estado explícito de los servicios comunitarios. No se generan usuarios ni publicaciones ficticias. */
export const LIRY_COMMUNITY_SERVICES=Object.freeze({
 posts:"not_configured",
 friends:"not_configured",
 achievements:"not_configured",
 events:"not_configured"
} as const);
export type CommunityCategory=keyof typeof LIRY_COMMUNITY_SERVICES;
export function isCommunityCategory(value:unknown):value is CommunityCategory{
 return typeof value==="string"&&Object.prototype.hasOwnProperty.call(LIRY_COMMUNITY_SERVICES,value);
}
export function canShowCommunityActivity(category:CommunityCategory,authenticated:boolean,sourceVerified:boolean):boolean{
 return LIRY_COMMUNITY_SERVICES[category]!=="not_configured"&&authenticated&&sourceVerified;
}
