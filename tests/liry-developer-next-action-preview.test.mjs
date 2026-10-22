import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";const src=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");
test("next action requires model or completed declarations",()=>{assert.match(src,/nextAllowed=activeStep===0\?model!==null:activeStep===1\?ready:false/);assert.match(src,/disabled=\{!nextAllowed\}/);});
test("identity preview does not permit further progress",()=>{assert.match(src,/navigateStep\(Math\.min\(2,activeStep\+1\)\)/);assert.match(src,/sin solicitud registrada/);});
