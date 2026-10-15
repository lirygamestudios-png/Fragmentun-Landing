import test from "node:test";
import assert from "node:assert/strict";
import {safeServerReviewerAssertion} from "../lib/games/liry-server-reviewer-authority.ts";
const base={reviewerId:"rev",verifiedByTrustedProvider:true,active:true,revoked:false,expiresAt:"2099-01-01T00:00:00Z",allowedVersionIds:["v1"],roles:["external_release_reviewer"],allowedGameIds:["game"]};
test("server reviewer authority requires unexpired version-scoped grant",()=>assert.equal(safeServerReviewerAssertion(base,"rev","game","v1","2026-10-15T20:00:00Z")?.reviewerId,"rev"));
test("expired revoked and wrong version grants fail closed",()=>{for(const bad of [{...base,expiresAt:"2025-01-01T00:00:00Z"},{...base,revoked:true},{...base,allowedVersionIds:["v2"]},{...base,expiresAt:"invalid"}])assert.equal(safeServerReviewerAssertion(bad,"rev","game","v1","2026-10-15T20:00:00Z"),null)});
test("missing clock and mismatched identity cannot authorize",()=>{assert.equal(safeServerReviewerAssertion(base,"rev","game","v1"),null);assert.equal(safeServerReviewerAssertion(base,"different","game","v1","2026-10-15T20:00:00Z"),null)});
