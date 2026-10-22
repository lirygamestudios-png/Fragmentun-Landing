import type {DeveloperReminderStatus} from "./liry-developer-reminder-tracking";
import type {DeveloperDocumentStatus} from "./liry-developer-document-lifecycle";
export type DeveloperProgressNotice={locale:"es"|"en";message:string;canUnlockIdentity:false;canUnlockBank:false;canApprove:false};
export function developerProgressNotice(document:DeveloperDocumentStatus,reminder:DeveloperReminderStatus,locale:"es"|"en"):DeveloperProgressNotice{
 const es=locale==="es";
 const messages:Record<DeveloperDocumentStatus,[string,string]>={
  not_submitted:["Documentación pendiente","Documentation pending"],
  received:["Documento recibido; pendiente de revisión","Document received; awaiting review"],
  under_review:["Documento en revisión","Document under review"],
  correction_required:["Corrección documental requerida","Document correction required"],
  verified:["Documento revisado; otras verificaciones pueden seguir pendientes","Document reviewed; other checks may remain pending"],
  rejected:["Documento rechazado; consulta los próximos pasos","Document rejected; check next steps"],
  expired:["Documento vencido; se requiere actualización","Document expired; update required"],
  deletion_scheduled:["Eliminación documental programada","Document deletion scheduled"],
  deleted:["Documento eliminado según el proceso previsto","Document deleted under applicable process"]
 };
 const prefix=messages[document][es?0:1];
 const acknowledged=reminder==="acknowledged"?(es?" · Aviso reconocido, pendiente de resolución":" · Notice acknowledged, not resolved"):"";
 return {locale,message:prefix+acknowledged,canUnlockIdentity:false,canUnlockBank:false,canApprove:false};
}
