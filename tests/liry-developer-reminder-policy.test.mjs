import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_DEVELOPER_REMINDERS_ENABLED,evaluateReminder,simulateReminderPolicy} from "../lib/games/liry-developer-reminder-policy.ts";
const day=86400000;
test("real reminders are disabled regardless of due date",()=>{
 assert.equal(LIRY_DEVELOPER_REMINDERS_ENABLED,false);
 assert.equal(evaluateReminder({now:10*day,dueAt:day,lastSentAt:null,sentCount:0,enabled:true}).reason,"disabled");
});
test("reminders do not run before due date",()=>assert.equal(simulateReminderPolicy({now:day,dueAt:2*day,lastSentAt:null,sentCount:0}).reason,"not_due"));
test("reminders are limited to three and spaced at least 72 hours",()=>{
 assert.equal(simulateReminderPolicy({now:10*day,dueAt:day,lastSentAt:9*day,sentCount:1}).reason,"cooldown");
 assert.equal(simulateReminderPolicy({now:10*day,dueAt:day,lastSentAt:2*day,sentCount:3}).reason,"limit_reached");
 assert.equal(simulateReminderPolicy({now:10*day,dueAt:day,lastSentAt:2*day,sentCount:2}).reason,"eligible");
});
