/** Condiciones de habilitación de Liry ID. Declaración técnica, NO comprobación real de infraestructura. */
export type LiryActivationRequirement={
  id:"isolated_auth"|"verified_email"|"private_profiles"|"privacy_consent"|"server_game_events"|"anti_replay"|"audit_logs";
  label:string;
  ready:boolean;
};
export const LIRY_ACTIVATION_REQUIREMENTS:ReadonlyArray<Readonly<LiryActivationRequirement>>=Object.freeze([
  {id:"isolated_auth",label:"Autenticación gamer separada de la administración",ready:false},
  {id:"verified_email",label:"Confirmación de correo y recuperación de acceso segura",ready:false},
  {id:"private_profiles",label:"Datos del perfil protegidos por autorización del propietario",ready:false},
  {id:"privacy_consent",label:"Registro verificable de consentimiento y preferencias",ready:false},
  {id:"server_game_events",label:"Eventos de partida emitidos por servidores autorizados",ready:false},
  {id:"anti_replay",label:"Prevención de duplicados, reenvíos y falsificación de XP",ready:false},
  {id:"audit_logs",label:"Auditoría de accesos y adjudicación de actividad",ready:false}
]);
/** El cliente jamás activa funciones por su cuenta. Se exige una comprobación del servidor independiente. */
export function isLiryActivationReady(serverAuthorized:boolean):boolean{
  return serverAuthorized===true&&LIRY_ACTIVATION_REQUIREMENTS.every(item=>item.ready===true);
}
