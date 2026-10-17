/** Flujo de Liry ID. Estructura sin tráfico de cuentas, correo ni operaciones monetarias. */
import {LIRY_PLAYER_AUTH_RELEASE,type LiryAccountOperation} from "./liry-player-account-security";
export type LiryAuthScreen="sign_in"|"register"|"recover"|"change_password"|"verify_email"|"sessions";
export type LiryAuthFlowStatus="not_configured"|"requires_verified_session"|"ready_for_test";
export type LiryAuthFlow=Readonly<{screen:LiryAuthScreen;status:LiryAuthFlowStatus;canSubmit:boolean;requiresAuthenticatedSession:boolean;}>;
const sessionScreens=new Set<LiryAuthScreen>(["change_password","sessions"]);
const operationByScreen:Readonly<Record<LiryAuthScreen,LiryAccountOperation>>={
 sign_in:"sign_in",register:"register",recover:"reset_password",change_password:"change_password",verify_email:"verify_email",sessions:"revoke_session"
};
export function getLiryAuthFlow(screen:LiryAuthScreen):LiryAuthFlow{
 return {screen,status:sessionScreens.has(screen)?"requires_verified_session":"not_configured",
  canSubmit:false,requiresAuthenticatedSession:sessionScreens.has(screen)};
}
export function isLiryAuthFlowEnabled(screen:LiryAuthScreen):boolean{
 const operation=operationByScreen[screen];
 return LIRY_PLAYER_AUTH_RELEASE.enabled&&getLiryAuthFlow(screen).canSubmit&&Boolean(operation);
}
