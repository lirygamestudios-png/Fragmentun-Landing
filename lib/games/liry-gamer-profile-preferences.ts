/** Contrato de preferencias del jugador: vista previa local, sin persistencia. */
export const LIRY_AVATAR_OPTIONS=["orb","shield","star"] as const;
export const LIRY_INTERFACE_THEMES=["navy","cyan","violet"] as const;
export type LiryAvatarOption=typeof LIRY_AVATAR_OPTIONS[number];
export type LiryInterfaceTheme=typeof LIRY_INTERFACE_THEMES[number];
export function validateGamerPreviewPreferences(value:unknown):boolean{
 if(!value||typeof value!=="object"||Array.isArray(value))return false;
 const x=value as Record<string,unknown>;
 return LIRY_AVATAR_OPTIONS.includes(x.avatar as LiryAvatarOption)&&
 LIRY_INTERFACE_THEMES.includes(x.theme as LiryInterfaceTheme)&&
 typeof x.notifications==="boolean";
}
export function canSaveUnauthenticatedGamerPreferences():false{return false;}
