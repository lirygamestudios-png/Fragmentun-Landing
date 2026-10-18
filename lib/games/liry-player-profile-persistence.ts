/** Contrato de persistencia de perfiles LIRYGAMES, cerrado hasta habilitar infraestructura independiente. */
import {isAuthorizedLiryPlayerIdentity,type LiryValidatedServerIdentity} from "./liry-auth-boundary";
import {LIRY_AVATAR_STORAGE,liryPrivateAvatarObjectKey} from "./liry-avatar-storage-contract";
import {isValidLiryDisplayName} from "./liry-display-name-validation";
export const LIRY_PROFILE_PERSISTENCE=Object.freeze({enabled:false,application:"lirygames",requiresPrivateStorage:true});
export type LiryPlayerPreferences=Readonly<{notifications:boolean;reduceMotion:boolean;privateProfile:boolean;locale:"es"|"en"}>;
export type LiryPlayerProfileUpdate=Readonly<{
 ownerId:string;
 displayName:string;
 preferences:LiryPlayerPreferences;
 avatarObjectKey:string|null;
}>;
export function isValidLiryProfileUpdate(value:LiryPlayerProfileUpdate):boolean{
 if(!value||typeof value!=="object"||Array.isArray(value)||typeof value.ownerId!=="string"||typeof value.displayName!=="string")return false;
 if(!/^[a-zA-Z0-9_-]{8,128}$/.test(value.ownerId)||!isValidLiryDisplayName(value.displayName))return false;
 const p=value.preferences;
 if(!p||typeof p!=="object"||Array.isArray(p)||typeof p.notifications!=="boolean"||typeof p.reduceMotion!=="boolean"||typeof p.privateProfile!=="boolean"||!["es","en"].includes(p.locale))return false;
 if(value.avatarObjectKey===null)return true;
 if(typeof value.avatarObjectKey!=="string")return false;
 const [owner,photo,...rest]=value.avatarObjectKey.split("/");
 return rest.length===0&&owner===value.ownerId&&liryPrivateAvatarObjectKey(owner,photo)===value.avatarObjectKey;
}
/** Ningún dato se escribe sin autorización y disponibilidad de almacenamiento privado. */
export function mayPersistLiryPlayerProfile(identity:LiryValidatedServerIdentity|null,update:LiryPlayerProfileUpdate):boolean{
 return LIRY_PROFILE_PERSISTENCE.enabled&&(update?.avatarObjectKey===null||LIRY_AVATAR_STORAGE.enabled)&&
 isAuthorizedLiryPlayerIdentity(identity)&&identity?.subject===update.ownerId&&
 isValidLiryProfileUpdate(update);
}
