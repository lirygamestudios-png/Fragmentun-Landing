import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const form=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
test("panel includes guided admission preview",()=>assert.match(page,/<LiryDeveloperAdmissionPreview \/>/));
test("only premium or freemium are selectable",()=>{assert.match(form,/model==="premium"/);assert.match(form,/model==="freemium"/)});
test("commercial rights and human approval are explicit",()=>{assert.match(form,/derechos comerciales/);assert.match(form,/aprobar la publicación/)});
test("preview cannot submit data or upload files",()=>{assert.doesNotMatch(form,/onSubmit|type="submit"|type="file"|fetch\(|localStorage/);assert.match(form,/PROGRAMA INACTIVO/)});
