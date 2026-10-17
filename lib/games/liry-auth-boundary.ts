/** Frontera de identidad: FRAGMENTUN y LIRYGAMES no comparten sesión ni permisos.
 * Contrato preparatorio. No acepta tokens de clientes ni autentica por sí mismo.
 */
export const LIRY_AUTH_AUDIENCE="lirygames-player" as const;
export const LIRY_AUTH_APPLICATION="lirygames" as const;
export type LiryValidatedServerIdentity=Readonly<{
 application:string;
 audience:string;
 subject:string;
 emailVerified:boolean;
 sessionVerifiedByServer:boolean;
}>;

/** Únicamente se utilizará con identidades verificadas en el servidor por un proveedor configurado. */
export function isAuthorizedLiryPlayerIdentity(identity:LiryValidatedServerIdentity|null):boolean{
 return identity!==null&&identity.application===LIRY_AUTH_APPLICATION&&
 identity.audience===LIRY_AUTH_AUDIENCE&&identity.sessionVerifiedByServer===true&&
 typeof identity.subject==="string"&&/^[a-zA-Z0-9_-]{8,128}$/.test(identity.subject);
}
export function mayChangeLiryPlayerCredentials(identity:LiryValidatedServerIdentity|null):boolean{
 return isAuthorizedLiryPlayerIdentity(identity)&&identity?.emailVerified===true;
}
