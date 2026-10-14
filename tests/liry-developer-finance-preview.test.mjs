import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const view=readFileSync(new URL("../components/LiryDeveloperFinancePreview.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
const styles=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
test("financial view integrated in panel",()=>assert.match(page,/<LiryDeveloperFinancePreview \/>/));
test("financial view contains no fabricated sales or balances",()=>{assert.match(view,/Sin datos conectados/);assert.match(view,/Sin saldo verificado/);assert.doesNotMatch(view,/\$\d|fetch\(|transfer\(|payout\(/)});
test("contract controls commission",()=>assert.match(view,/Pendiente de contrato/));
test("approved visual treatment and mobile cards",()=>{assert.match(styles,/\.developerFinanceCard:hover/);assert.match(styles,/\.developerFinanceGrid\{grid-template-columns:1fr/);});
