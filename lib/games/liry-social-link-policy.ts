/** Política cerrada para enlaces oficiales. No autoriza cuentas ni hace consultas de red. */
export const SUPPORTED_LIRY_SOCIAL_NETWORKS=["instagram","tiktok","youtube","facebook"] as const;
export type LirySocialNetwork=(typeof SUPPORTED_LIRY_SOCIAL_NETWORKS)[number];
export type VerifiedSocialLinkCandidate={network:LirySocialNetwork;url:string;ownerApproved:boolean;identityVerified:boolean};
const hosts:Record<LirySocialNetwork,readonly string[]>={
 instagram:["instagram.com","www.instagram.com"],
 tiktok:["tiktok.com","www.tiktok.com"],
 youtube:["youtube.com","www.youtube.com","youtu.be"],
 facebook:["facebook.com","www.facebook.com"]
};
export function inspectUnpublishedOfficialSocialLink(value:unknown):"invalid"|"unverified"|"pending_activation"{
 if(!value||typeof value!=="object"||Array.isArray(value))return "invalid";
 const x=value as Record<string,unknown>;
 if(typeof x.network!=="string"||!SUPPORTED_LIRY_SOCIAL_NETWORKS.includes(x.network as LirySocialNetwork)||typeof x.url!=="string")return "invalid";
 let url:URL;
 try{url=new URL(x.url);}catch{return "invalid";}
 if(url.protocol!=="https:"||!hosts[x.network as LirySocialNetwork].includes(url.hostname.toLowerCase())||url.username||url.password||url.search||url.hash||url.pathname==="/")return "invalid";
 if(x.ownerApproved!==true||x.identityVerified!==true)return "unverified";
 return "pending_activation"; // No publicar sin configurar enlaces oficiales aprobados.
}
export function canPublishUnconfiguredOfficialSocialLink():false{return false;}
