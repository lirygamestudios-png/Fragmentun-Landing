import test from "node:test";import assert from "node:assert/strict";import {nextDeveloperState} from "../lib/games/liry-developer-workflow.ts";
test("developer may submit own draft but cannot approve",()=>{assert.equal(nextDeveloperState("draft","submit","developer"),"submitted");assert.equal(nextDeveloperState("publication_review","approve","developer"),null)});
test("approval is reviewer-only",()=>assert.equal(nextDeveloperState("publication_review","approve","reviewer"),"approved"));
test("developer cannot publish or suspend",()=>{assert.equal(nextDeveloperState("approved","publish","developer"),null);assert.equal(nextDeveloperState("published","suspend","developer"),null)});
test("approved release still needs separate publishing action",()=>assert.equal(nextDeveloperState("approved","publish","reviewer"),"published"));
test("invalid transitions are rejected",()=>assert.equal(nextDeveloperState("draft","publish","reviewer"),null));
