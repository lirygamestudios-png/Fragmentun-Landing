/** Contrato seguro del área pública Liry ID. No representa una sesión real. */
export type LiryIdentityKind="visitor"|"registered"|"active";
export type LiryVisitorIdentity={kind:"visitor";userId:null;displayName:"Visitante";verifiedAt:null};
export type LiryRegisteredIdentity={kind:"registered";userId:string;displayName:string;verifiedAt:string};
export type LiryActiveIdentity=Omit<LiryRegisteredIdentity,"kind">&{kind:"active";activityVerifiedAt:string};
export type LiryPublicIdentity=LiryVisitorIdentity|LiryRegisteredIdentity|LiryActiveIdentity;
export const LIRY_VISITOR_IDENTITY:Readonly<LiryVisitorIdentity>=Object.freeze({kind:"visitor",userId:null,displayName:"Visitante",verifiedAt:null});
/** No usar este contrato para decidir permisos: toda autorización pertenece al servidor. */
export function isLiryPublicIdentity(value:unknown):value is LiryPublicIdentity{
 if(!value||typeof value!=="object")return false;
 const v=value as Partial<LiryPublicIdentity>;
 if(v.kind==="visitor")return v.userId===null&&v.displayName==="Visitante"&&v.verifiedAt===null;
 if(v.kind!=="registered"&&v.kind!=="active")return false;
 const validId=typeof v.userId==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.userId);
 const validName=typeof v.displayName==="string"&&v.displayName.length>0&&v.displayName.length<=80;
 const validTime=typeof v.verifiedAt==="string"&&!Number.isNaN(Date.parse(v.verifiedAt));
 if(!validId||!validName||!validTime)return false;
 return v.kind==="registered"||(typeof (v as LiryActiveIdentity).activityVerifiedAt==="string"&&!Number.isNaN(Date.parse((v as LiryActiveIdentity).activityVerifiedAt)));
}
