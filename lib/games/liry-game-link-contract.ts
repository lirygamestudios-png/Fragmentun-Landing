/** Contrato para vincular juegos publicados a Liry ID, todavía inactivo. */
export type LiryGameLinkStatus="not_connected"|"pending_verification"|"verified";
export type LiryGameLink={
  publicGameCode:string;
  status:LiryGameLinkStatus;
  lastVerifiedAt:string|null;
  source:"game_server"|null;
};
const PUBLIC_GAME_CODES=[
"LIRY // ARENA-01","LIRY // BOT-02","LIRY // ECON-03",
"LIRY // EARTH-04","LIRY // LINK-05","LIRY // REALM-06",
"LIRY // EMOTION-07","LIRY // TITAN-08","LIRY // CODE-09"
] as const;
export type LiryPublicGameCode=(typeof PUBLIC_GAME_CODES)[number];
export const LIRY_GAME_LINKS_PENDING:ReadonlyArray<Readonly<LiryGameLink>>=Object.freeze(
 PUBLIC_GAME_CODES.map(publicGameCode=>Object.freeze({
  publicGameCode,status:"not_connected" as const,lastVerifiedAt:null,source:null
 }))
);
/** Solo un adaptador autenticado de servidor podrá aportar enlaces verificados. */
export function isValidGameLink(value:unknown):value is LiryGameLink{
 if(!value||typeof value!=="object")return false;
 const item=value as Partial<LiryGameLink>;
 if(!PUBLIC_GAME_CODES.some(code=>code===item.publicGameCode))return false;
 if(item.status==="not_connected")return item.lastVerifiedAt===null&&item.source===null;
 if(item.status==="pending_verification")return item.lastVerifiedAt===null&&item.source===null;
 return item.status==="verified"&&item.source==="game_server"&&typeof item.lastVerifiedAt==="string"&&!Number.isNaN(Date.parse(item.lastVerifiedAt));
}
/** Validar forma NO confiere confianza: nunca aceptar actividad desde el cliente. */
