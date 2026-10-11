/** Preparación para cotizaciones: nunca genera pedidos o cobros. */
export type OrderLineCandidate={publicCode:string;unitPriceMinor:number;quantity:number};
export type OrderQuoteCandidate={currency:"USD"|"DOP";lines:readonly OrderLineCandidate[];quotedTotalMinor:number};
export function validateInactiveOrderQuote(value:unknown):"invalid"|"price_mismatch"|"inactive"{
 if(!value||typeof value!=="object"||Array.isArray(value))return "invalid";
 const q=value as Record<string,unknown>;
 if(q.currency!=="USD"&&q.currency!=="DOP")return "invalid";
 if(!Array.isArray(q.lines)||q.lines.length===0||q.lines.length>50)return "invalid";
 if(typeof q.quotedTotalMinor!=="number"||!Number.isSafeInteger(q.quotedTotalMinor)||q.quotedTotalMinor<0)return "invalid";
 let total=0;
 const codes=new Set<string>();
 for(const raw of q.lines){
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return "invalid";
  const l=raw as Record<string,unknown>;
  if(typeof l.publicCode!=="string"||!/^[A-Z0-9][A-Z0-9_-]{5,63}$/.test(l.publicCode)||
   typeof l.unitPriceMinor!=="number"||!Number.isSafeInteger(l.unitPriceMinor)||l.unitPriceMinor<0||
   typeof l.quantity!=="number"||!Number.isSafeInteger(l.quantity)||l.quantity<1||l.quantity>100||
   codes.has(l.publicCode))return "invalid";
  codes.add(l.publicCode);
  total+=(l.unitPriceMinor as number)*(l.quantity as number);
  if(!Number.isSafeInteger(total))return "invalid";
 }
 if(total!==q.quotedTotalMinor)return "price_mismatch";
 return "inactive"; // Solo comprobación matemática; servidor y pasarela todavía inactivos.
}
export function canChargeInactiveOrder():false{return false;}
