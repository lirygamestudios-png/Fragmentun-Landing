/** Preparación del registro Liry ID: cálculo puro, sin guardar fechas ni habilitar cuentas. */
export type LiryAgeBracket="child"|"teen"|"adult"|"invalid";
export function getLiryAgeBracket(birthDate:string,today:string):LiryAgeBracket{
 const parse=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return null;const [year,month,day]=value.split("-").map(Number);const date=new Date(Date.UTC(year,month-1,day));return date.getUTCFullYear()===year&&date.getUTCMonth()===month-1&&date.getUTCDate()===day?{year,month,day}:null;};
 const born=parse(birthDate),now=parse(today);
 if(!born||!now)return "invalid";
 const bornUTC=Date.UTC(born.year,born.month-1,born.day),nowUTC=Date.UTC(now.year,now.month-1,now.day);
 if(bornUTC>nowUTC)return "invalid";
 let age=now.year-born.year;
 if(now.month<born.month||(now.month===born.month&&now.day<born.day))age--;
 if(age>125)return "invalid";
 if(age<13)return "child";
 if(age<18)return "teen";
 return "adult";
}
/** Informational only: no registration, session or consent is granted by this function. */
export const LIRY_AGE_POLICY_PREVIEW=Object.freeze({
 child:"No ordinary account registration; parental-consent and service-audience review required",
 teen:"Age-appropriate restrictions and safeguards required before account activation",
 adult:"Standard age bracket; identity verification may still be required for regulated features"
} as const);

/** Default safeguards for future accounts. Policy descriptions, not active permissions. */
export const LIRY_AGE_SAFEGUARDS_PREVIEW=Object.freeze({
 child:Object.freeze({registrationAllowed:false,publicProfile:false,directMessages:false,personalizedAds:false,purchases:false,requiresPolicyReview:true}),
 teen:Object.freeze({registrationAllowed:false,publicProfile:false,directMessages:false,personalizedAds:false,purchases:false,requiresPolicyReview:true}),
 adult:Object.freeze({registrationAllowed:false,publicProfile:false,directMessages:false,personalizedAds:false,purchases:false,requiresPolicyReview:true}),
 invalid:Object.freeze({registrationAllowed:false,publicProfile:false,directMessages:false,personalizedAds:false,purchases:false,requiresPolicyReview:true})
} as const);
/** No account can be opened from a preview; defaults remain deny-by-default until approved. */
export function getLiryAgeSafeguardsPreview(bracket:LiryAgeBracket){
 return LIRY_AGE_SAFEGUARDS_PREVIEW[bracket];
}
