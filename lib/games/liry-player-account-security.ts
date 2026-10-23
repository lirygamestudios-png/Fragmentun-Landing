/** Preparación de seguridad de Liry ID: no crea usuarios, no cambia credenciales y no envía correos. */
export type LiryAccountOperation="register"|"sign_in"|"sign_out"|"reset_password"|"change_password"|"verify_email"|"revoke_session";
export type LiryAccountSecurityReadiness=Readonly<{
 authenticated:boolean;
 identityProviderConfigured:boolean;
 verifiedEmail:boolean;
 serverActionAuthorized:boolean;
 rateLimitConfigured:boolean;
 antiAutomationConfigured:boolean;
 sessionProtectionConfigured:boolean;
}>;
/** Política de denegación inicial: nunca se autorizan operaciones desde una pantalla de demostración. */
export const LIRY_PLAYER_AUTH_RELEASE=Object.freeze({
 enabled:false,
 registrationEnabled:false,
 recoveryEnabled:false,
 accountChangesEnabled:false
});
export function canExecuteLiryAccountOperation(operation:LiryAccountOperation,readiness:LiryAccountSecurityReadiness):boolean{
 if(!LIRY_PLAYER_AUTH_RELEASE.enabled||!readiness.identityProviderConfigured||
  !readiness.serverActionAuthorized||!readiness.rateLimitConfigured||
  !readiness.antiAutomationConfigured||!readiness.sessionProtectionConfigured)return false;
 if(operation==="register")return LIRY_PLAYER_AUTH_RELEASE.registrationEnabled;
 if(operation==="reset_password")return LIRY_PLAYER_AUTH_RELEASE.recoveryEnabled;
 if(operation==="sign_in")return true;
 if(!readiness.authenticated)return false;
 if(operation==="sign_out")return true;
 if(operation==="verify_email")return LIRY_PLAYER_AUTH_RELEASE.accountChangesEnabled;
 return LIRY_PLAYER_AUTH_RELEASE.accountChangesEnabled&&readiness.verifiedEmail;
}
export const LIRY_ACCOUNT_SECURITY_CHECKLIST=Object.freeze([
 "Configuración aislada de autenticación Liry ID",
 "Verificación de correo electrónico",
 "Protección del inicio de sesión y límites de intentos",
 "Recuperación de contraseña mediante código de seis dígitos, temporal y de un solo uso",
 "Caducidad de recuperación a los 10 minutos; códigos protegidos mediante hash, intentos y reenvíos limitados",
 "Respuesta neutral a solicitudes de recuperación, sin confirmar la existencia del correo",
 "Separación de identidades y permisos de Jugador y Desarrollador durante la recuperación",
 "Revocación de sesiones anteriores y aviso por correo al completar el cambio",
 "Cambio de contraseña solo en sesión verificada",
 "Revocación de sesiones mediante servidor",
 "Registro seguro de eventos y protección de datos personales"
] as const);
