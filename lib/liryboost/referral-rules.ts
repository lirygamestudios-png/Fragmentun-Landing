/** LiryBoost: reglas puras para pruebas futuras. No crea registros ni otorga puntos. */
export type ReferralCandidate={
  referrerId:string;
  invitedId:string;
  verified:boolean;
  consented:boolean;
};
export type ReferralDecision=
  |{eligible:true}
  |{eligible:false;reason:"missing_identity"|"self_referral"|"unverified"|"consent_required"|"duplicate"};
export function validateReferralCandidate(
 candidate:ReferralCandidate,
 existingInvitedIds:ReadonlySet<string>
):ReferralDecision{
 const referrer=candidate.referrerId.trim();
 const invited=candidate.invitedId.trim();
 if(!referrer||!invited)return{eligible:false,reason:"missing_identity"};
 if(referrer===invited)return{eligible:false,reason:"self_referral"};
 if(!candidate.consented)return{eligible:false,reason:"consent_required"};
 if(!candidate.verified)return{eligible:false,reason:"unverified"};
 if(existingInvitedIds.has(invited))return{eligible:false,reason:"duplicate"};
 return{eligible:true};
}
export function rankVerifiedReferrals(
 verifiedReferrals:ReadonlyArray<{referrerId:string;invitedId:string;verifiedAt:string}>,
 limit=10
){
 const unique=new Set<string>();
 const counts=new Map<string,{count:number;firstVerifiedAt:string}>();
 for(const item of verifiedReferrals){
  const invited=item.invitedId.trim(),referrer=item.referrerId.trim();
  if(!invited||!referrer||referrer===invited||!Number.isFinite(Date.parse(item.verifiedAt))||unique.has(invited))continue;
  unique.add(invited);
  const entry=counts.get(referrer);
  if(entry){entry.count+=1;if(item.verifiedAt<entry.firstVerifiedAt)entry.firstVerifiedAt=item.verifiedAt;}
  else counts.set(referrer,{count:1,firstVerifiedAt:item.verifiedAt});
 }
 return [...counts.entries()]
 .sort((a,b)=>b[1].count-a[1].count||a[1].firstVerifiedAt.localeCompare(b[1].firstVerifiedAt)||a[0].localeCompare(b[0]))
 .slice(0,Math.max(0,Math.floor(limit)))
 .map(([referrerId,data],index)=>({rank:index+1,referrerId,verifiedCount:data.count}));
}
