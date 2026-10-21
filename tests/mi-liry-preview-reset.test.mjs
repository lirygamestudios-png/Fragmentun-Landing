import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const src=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
test("vista previa Mi Liry se reinicia al cerrar el dialogo",()=>{
 assert.match(src,/onClose=\{\(\)=>\{setOpenedAreaId\(null\);setPreviewSession\(value=>value\+1\)/);
 assert.match(src,/<MiLiryIdentityPreview key=\{previewSession\}/);
});
test("al cerrar se devuelve el foco al control inicial",()=>assert.match(src,/trigger\.current\?\.focus\(\{preventScroll:true\}\)/));
test("Mi Liry no persiste preferencias de visitante",()=>assert.doesNotMatch(src,/localStorage|sessionStorage|setItem\(/));
