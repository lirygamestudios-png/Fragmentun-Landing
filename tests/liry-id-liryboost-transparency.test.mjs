import test from "node:test";
import assert from "node:assert/strict";
import {inspectInactiveRankingPublication,LIRYBOOST_TIE_BREAK_RULE,canPublishInactiveRanking} from "../lib/liryboost/ranking-transparency.ts";
const complete={rulesPublished:true,programActive:true,sourceVerified:true,consentAudited:true,appealsProcessReady:true,manualReviewCompleted:true};
test("Top 10 no se publica antes de las bases oficiales",()=>{assert.equal(inspectInactiveRankingPublication({...complete,rulesPublished:false}),"inactive")});
test("Top 10 no se publica mientras el programa esté cerrado",()=>{assert.equal(inspectInactiveRankingPublication({...complete,programActive:false}),"inactive")});
test("incluso con preparativos completos, la publicación real permanece desactivada",()=>{
 assert.equal(inspectInactiveRankingPublication(complete),"pending_review");
 assert.equal(canPublishInactiveRanking(),false);
});
test("regla editorial de desempate disponible para revisión de bases",()=>{assert.ok(LIRYBOOST_TIE_BREAK_RULE.includes("alfabético"))});
