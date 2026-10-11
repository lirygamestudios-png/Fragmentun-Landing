import test from "node:test";
import assert from "node:assert/strict";
import {nextReportReviewState,canApplyModerationSanction} from "../lib/games/liry-community-review-contract.ts";
const moderator={moderatorAuthorized:true,evidenceReviewed:true};
test("solo moderadores autorizados pueden iniciar revisión",()=>{
 assert.equal(nextReportReviewState("received","start_review",{...moderator,moderatorAuthorized:false}),null);
 assert.equal(nextReportReviewState("received","start_review",moderator),"under_review");
});
test("cerrar una denuncia exige revisión de evidencias",()=>{
 assert.equal(nextReportReviewState("under_review","resolve",{...moderator,evidenceReviewed:false}),null);
 assert.equal(nextReportReviewState("under_review","dismiss",moderator),"dismissed");
 assert.equal(nextReportReviewState("under_review","resolve",moderator),"resolved");
});
test("una denuncia cerrada no cambia de estado y no existen sanciones activas",()=>{
 assert.equal(nextReportReviewState("resolved","start_review",moderator),null);
 assert.equal(canApplyModerationSanction(),false);
});
