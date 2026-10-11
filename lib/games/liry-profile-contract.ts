/** Modelo de datos para perfil gamer persistente. NO conectado a Auth ni a una base de datos. */
export type GamerPrivacy="private"|"friends"|"public";
export type GamerAffinity="Explorador"|"Estratega"|"Competidor"|"Social"|"Acción"|"Creativo";
export type GamerProfilePreferences={
  language:"es"|"en";
  profileVisibility:GamerPrivacy;
  notifications:{service:boolean;marketing:boolean};
  affinity:GamerAffinity|null;
  affinityConsentAt:string|null;
};
export type GamerProfileRecord={
  ownerId:string;
  displayAlias:string;
  avatarStoragePath:string|null;
  preferences:GamerProfilePreferences;
  createdAt:string;
  updatedAt:string;
};
export const DEFAULT_GAMER_PREFERENCES:Readonly<GamerProfilePreferences>=Object.freeze({
  language:"es",profileVisibility:"private",
  notifications:{service:true,marketing:false},
  affinity:null,affinityConsentAt:null
});
/** Valida forma básica, NO confirma propietario ni autorización. Solo servidor con RLS puede hacerlo. */
export function validateGamerAlias(alias:string):boolean{
  const normalized=alias.trim();
  return normalized.length>=3&&normalized.length<=32&&/^[\p{L}\p{N} _.-]+$/u.test(normalized);
}
export function isSafeAvatarStoragePath(path:string):boolean{
  return /^[0-9a-f-]{36}\/[a-zA-Z0-9_-]{8,80}\.(png|jpg|webp)$/.test(path)&&!path.includes("..");
}
