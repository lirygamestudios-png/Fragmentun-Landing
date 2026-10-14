import type {DeveloperSubmissionState} from "./liry-developer-publication";
export type DeveloperRole="developer"|"reviewer"|"finance";
export type DeveloperAction="submit"|"request_changes"|"admit"|"reject"|"upload_private"|"begin_checks"|"request_publication_review"|"approve"|"publish"|"suspend";
const transitions:readonly {from:DeveloperSubmissionState;action:DeveloperAction;to:DeveloperSubmissionState;role:DeveloperRole}[]=[
 {from:"draft",action:"submit",to:"submitted",role:"developer"},
 {from:"needs_changes",action:"submit",to:"submitted",role:"developer"},
 {from:"submitted",action:"request_changes",to:"needs_changes",role:"reviewer"},
 {from:"submitted",action:"admit",to:"admitted",role:"reviewer"},
 {from:"submitted",action:"reject",to:"rejected",role:"reviewer"},
 {from:"admitted",action:"upload_private",to:"uploaded_private",role:"developer"},
 {from:"uploaded_private",action:"begin_checks",to:"automated_checks",role:"reviewer"},
 {from:"automated_checks",action:"request_publication_review",to:"publication_review",role:"reviewer"},
 {from:"publication_review",action:"approve",to:"approved",role:"reviewer"},
 {from:"approved",action:"publish",to:"published",role:"reviewer"},
 {from:"published",action:"suspend",to:"suspended",role:"reviewer"},
 {from:"publication_review",action:"request_changes",to:"needs_changes",role:"reviewer"}
];
export function nextDeveloperState(state:DeveloperSubmissionState,action:DeveloperAction,role:DeveloperRole):DeveloperSubmissionState|null{
 return transitions.find(x=>x.from===state&&x.action===action&&x.role===role)?.to??null;
}
/** Defense in depth: a state transition is only a policy decision.
 * Real APIs must also authorize developer ownership, session/tenant and build hash.
 */
