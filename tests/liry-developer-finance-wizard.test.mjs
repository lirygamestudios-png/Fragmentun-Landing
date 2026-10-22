import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const s=readFileSync(new URL("../components/LiryDeveloperFinancePreview.tsx",import.meta.url),"utf8");
test("finance has six same-panel views and step navigation",()=>{assert.match(s,/const \[stage,setStage\]=useState\(0\)/);assert.match(s,/stage===0&&/);assert.match(s,/stage>0&&/);assert.match(s,/index===stage-1/);assert.match(s,/PRÓXIMO →/);assert.match(s,/← ANTERIOR/);});
test("finance preview is explicit and cannot make transfers",()=>{assert.match(s,/sin conexiones financieras, KYC ni pagos reales activos/);assert.doesNotMatch(s,/fetch\(|checkout\(|transfer\(/);});
