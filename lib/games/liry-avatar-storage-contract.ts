/** Política para el futuro almacenamiento privado de avatares Liry ID.
 * Sin operaciones de red, usuarios simulados ni dependencias de FRAGMENTUN.
 */
import {isAuthorizedLiryPlayerIdentity,type LiryValidatedServerIdentity} from "./liry-auth-boundary";
export const LIRY_AVATAR_STORAGE=Object.freeze({
 enabled:false,
 project:"lirygames",
 bucket:"liry-player-avatars",
 publicBucket:false,
 maxBytes:2*1024*1024,
 allowedMimeTypes:["image/jpeg","image/png","image/webp"] as const,
} as const);
export type LiryAvatarUploadRequest=Readonly<{
 identity:LiryValidatedServerIdentity|null;
 ownerId:string;
 mimeType:string;
 bytes:number;
 independentlyConfigured:boolean;
 privateBucketVerified:boolean;
 serverFileValidationPassed:boolean;
}>;
/** Denegación predeterminada. La identidad y la firma del archivo se validan en servidor. */
export function canStoreLiryPlayerAvatar(request:LiryAvatarUploadRequest):boolean{
 return LIRY_AVATAR_STORAGE.enabled&&request.independentlyConfigured&&
 request.privateBucketVerified&&request.serverFileValidationPassed&&
 isAuthorizedLiryPlayerIdentity(request.identity)&&request.ownerId===request.identity?.subject&&
 Number.isSafeInteger(request.bytes)&&request.bytes>0&&request.bytes<=LIRY_AVATAR_STORAGE.maxBytes&&
 LIRY_AVATAR_STORAGE.allowedMimeTypes.some(type=>type===request.mimeType);
}
export function liryPrivateAvatarObjectKey(ownerId:string,photoId:string):string|null{
 if(!/^[a-zA-Z0-9_-]{8,128}$/.test(ownerId)||!/^[a-zA-Z0-9_-]{8,80}$/.test(photoId))return null;
 return `${ownerId}/${photoId}`;
}
