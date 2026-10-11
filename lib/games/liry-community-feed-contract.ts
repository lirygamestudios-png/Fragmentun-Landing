/** Proyección pública comunitaria: datos no verificados nunca se muestran. */
export type CommunityPostCandidate={
 id:string;authorAlias:string;body:string;verifiedAt:string;authorConsent:boolean;
};
const safeId=/^[a-zA-Z0-9_-]{8,80}$/;
export function projectVerifiedCommunityPosts(
 candidates:unknown,serviceAuthenticated:boolean,sourceVerified:boolean
):readonly CommunityPostCandidate[]{
 if(!serviceAuthenticated||!sourceVerified||!Array.isArray(candidates))return [];
 if(candidates.length>50)return [];
 const seen=new Set<string>();
 const result:CommunityPostCandidate[]=[];
 for(const candidate of candidates){
  if(!candidate||typeof candidate!=="object"||Array.isArray(candidate))return [];
  const x=candidate as Record<string,unknown>;
  if(typeof x.id!=="string"||!safeId.test(x.id)||seen.has(x.id)||
   typeof x.authorAlias!=="string"||x.authorAlias.length<3||x.authorAlias.length>32||
   /[<>\r\n]/.test(x.authorAlias)||
   typeof x.body!=="string"||x.body.length<1||x.body.length>1000||
   typeof x.verifiedAt!=="string"||!Number.isFinite(Date.parse(x.verifiedAt))||
   Date.parse(x.verifiedAt)>Date.now()||x.authorConsent!==true)return [];
  seen.add(x.id);
  result.push({id:x.id,authorAlias:x.authorAlias,body:x.body,verifiedAt:x.verifiedAt,authorConsent:true});
 }
 return result;
}
