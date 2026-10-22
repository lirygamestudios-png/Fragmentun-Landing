import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";const src=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");
test("compact wizard explicitly describes dossier as preview only",()=>{assert.match(src,/Vista previa: documentación pendiente/);assert.match(src,/sin solicitud registrada/);});
test("identity and bank milestones are locked",()=>{assert.match(src,/Identity verification",done:false/);assert.match(src,/Bank payout verification",done:false,enabled:false/);});
