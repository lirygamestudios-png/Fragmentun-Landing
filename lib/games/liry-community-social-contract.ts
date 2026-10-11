/** Contratos públicos futuros; sin usuarios, amistades, logros ni eventos activos. */
export type CommunitySocialView={
 friends:readonly {alias:string}[];
 achievements:readonly {title:string;verifiedAt:string}[];
 events:readonly {title:string;startsAt:string}[];
};
export const EMPTY_COMMUNITY_SOCIAL_VIEW:Readonly<CommunitySocialView>=Object.freeze({
 friends:Object.freeze([]),achievements:Object.freeze([]),events:Object.freeze([])
});
/** No se confía en datos del cliente ni se emiten actividades hasta conectar proveedores reales. */
export function getInactiveCommunitySocialView():CommunitySocialView{
 return {friends:[],achievements:[],events:[]};
}
export function canPublishCommunitySocialRecord(
 category:"friends"|"achievements"|"events",
 context:{identityVerified:boolean;sourceVerified:boolean;consentGranted:boolean}
):boolean{
 void category;
 void context;
 return false; // Bloqueo intencional hasta implementar autorización, persistencia y moderación reales.
}
