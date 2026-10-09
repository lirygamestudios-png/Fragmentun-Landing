import {assessSettlement,type SettlementBatch} from "./bank-settlement";

export type SettlementIncidentCode=
  "invalid_amounts"|"missing_provider_report"|"missing_bank_deposit"|
  "missing_reference"|"short_deposit"|"excess_deposit"|"awaiting_settlement"|"none";
export interface SettlementIncident{
 code:SettlementIncidentCode;
 severity:"info"|"warning"|"critical";
 label:string;
 differenceCents:number|null;
 needsHumanReview:boolean;
}
/** Advisory classification only: never updates financial records or bank credentials. */
export function classifySettlementIncident(batch:SettlementBatch & {depositReported:boolean}):SettlementIncident{
 const result=assessSettlement(batch);
 if(result.blockers.some(b=>b.includes("inválidos")||b.includes("inconsistente")))
   return {code:"invalid_amounts",severity:"critical",label:"Importes inválidos; revisar la fuente",differenceCents:null,needsHumanReview:true};
 if(!batch.settlementReference)
   return {code:"missing_reference",severity:"critical",label:"Falta referencia de liquidación",differenceCents:null,needsHumanReview:true};
 if(!batch.verifiedProviderReport)
   return {code:"missing_provider_report",severity:"warning",label:"Pendiente informe verificado del procesador",differenceCents:null,needsHumanReview:true};
 if(!batch.depositReported)
   return {code:"awaiting_settlement",severity:"info",label:"Depósito aún no reportado; no contabilizar como recibido",differenceCents:null,needsHumanReview:false};
 if(!batch.bankReference||!batch.verifiedBankDeposit)
   return {code:"missing_bank_deposit",severity:"warning",label:"Depósito sin confirmación bancaria válida",differenceCents:null,needsHumanReview:true};
 if(result.differenceCents<0)
   return {code:"short_deposit",severity:"critical",label:"Depósito inferior al importe esperado",differenceCents:result.differenceCents,needsHumanReview:true};
 if(result.differenceCents>0)
   return {code:"excess_deposit",severity:"warning",label:"Depósito superior al importe esperado",differenceCents:result.differenceCents,needsHumanReview:true};
 return {code:"none",severity:"info",label:"Coincidencia de liquidación y depósito verificados",differenceCents:0,needsHumanReview:false};
}
