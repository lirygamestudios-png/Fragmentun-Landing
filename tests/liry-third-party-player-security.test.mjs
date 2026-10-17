import test from "node:test";import assert from "node:assert/strict";
import {LIRY_PLAYER_AUTH_RELEASE,LIRY_ACCOUNT_SECURITY_CHECKLIST,canExecuteLiryAccountOperation} from "../lib/games/liry-player-account-security.ts";
const ready={authenticated:true,identityProviderConfigured:true,verifiedEmail:true,serverActionAuthorized:true,rateLimitConfigured:true,antiAutomationConfigured:true,sessionProtectionConfigured:true};
test("Las operaciones sensibles de cuenta permanecen bloqueadas",()=>{assert.equal(LIRY_PLAYER_AUTH_RELEASE.enabled,false);for(const operation of ["register","sign_in","sign_out","reset_password","change_password","verify_email","revoke_session"])assert.equal(canExecuteLiryAccountOperation(operation,ready),false);});
test("La política contempla recuperación, sesión y protección de credenciales",()=>{assert.ok(LIRY_ACCOUNT_SECURITY_CHECKLIST.length>=7);});
