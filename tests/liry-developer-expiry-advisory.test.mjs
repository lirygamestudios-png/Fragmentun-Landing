import test from "node:test";import assert from "node:assert/strict";
import {assessDeveloperExpiry,LIRY_DEVELOPER_EXPIRY_ALERTS_ENABLED} from "../lib/games/liry-developer-expiry-advisory.ts";
const base={expiresAt:"2026-11-01T00:00:00Z",now:"2026-10-25T00:00:00Z",warningDays:10,legalHold:false};
test("no actual alerts can be emitted",()=>{assert.equal(LIRY_DEVELOPER_EXPIRY_ALERTS_ENABLED,false);assert.equal(assessDeveloperExpiry(base).shouldNotify,false);});
test("only upcoming and expired are classified",()=>{assert.equal(assessDeveloperExpiry(base).status,"upcoming");assert.equal(assessDeveloperExpiry({...base,warningDays:2}).status,"not_due");assert.equal(assessDeveloperExpiry({...base,now:"2026-11-02T00:00:00Z"}).status,"expired");});
test("missing policy and legal holds fail closed",()=>{assert.equal(assessDeveloperExpiry({...base,warningDays:null}).status,"policy_missing");assert.equal(assessDeveloperExpiry({...base,legalHold:true}).status,"legal_hold");assert.equal(assessDeveloperExpiry({...base,expiresAt:"invalid"}).status,"invalid_date");});
