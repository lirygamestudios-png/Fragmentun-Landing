/** Pure pre-expiry advisory, not a scheduler or notice sender. */
export const LIRY_DEVELOPER_EXPIRY_ALERTS_ENABLED=false as const;
export type DeveloperExpiryAdvisory={status:"policy_missing"|"invalid_date"|"not_due"|"upcoming"|"expired"|"legal_hold";shouldNotify:false;daysRemaining:number|null};
export function assessDeveloperExpiry(input:{expiresAt:string|null;now:string;warningDays:number|null;legalHold:boolean}):DeveloperExpiryAdvisory{
 const result=(status:DeveloperExpiryAdvisory["status"],daysRemaining:number|null=null):DeveloperExpiryAdvisory=>({status,shouldNotify:false,daysRemaining});
 if(input.legalHold)return result("legal_hold");
 if(input.expiresAt===null||input.warningDays===null||!Number.isSafeInteger(input.warningDays)||input.warningDays<0)return result("policy_missing");
 const now=Date.parse(input.now),expiry=Date.parse(input.expiresAt);
 if(!Number.isFinite(now)||!Number.isFinite(expiry))return result("invalid_date");
 const remaining=Math.ceil((expiry-now)/86400000);
 if(remaining<=0)return result("expired",remaining);
 return result(remaining<=input.warningDays?"upcoming":"not_due",remaining);
}
