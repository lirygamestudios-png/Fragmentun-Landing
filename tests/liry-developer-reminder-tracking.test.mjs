import test from "node:test";
import assert from "node:assert/strict";
import {LIRY_REMINDER_TRACKING_ACTIVE,transitionDeveloperReminder,simulateDeveloperReminder} from "../lib/games/liry-developer-reminder-tracking.ts";
test("tracking operations remain disabled",()=>{
 assert.equal(LIRY_REMINDER_TRACKING_ACTIVE,false);
 assert.equal(transitionDeveloperReminder("pending","prepare","system",true),"pending");
});
test("reminder can only become sent through delivery provider, not by applicant",()=>{
 assert.equal(simulateDeveloperReminder("pending","prepare","system"),"prepared");
 assert.equal(simulateDeveloperReminder("prepared","mark_sent","applicant"),"prepared");
 assert.equal(simulateDeveloperReminder("prepared","mark_sent","delivery_provider"),"sent");
});
test("applicant acknowledgment does not imply resolution",()=>{
 assert.equal(simulateDeveloperReminder("sent","acknowledge","applicant"),"acknowledged");
 assert.equal(simulateDeveloperReminder("acknowledged","resolve","applicant"),"acknowledged");
 assert.equal(simulateDeveloperReminder("acknowledged","resolve","authorized_reviewer"),"resolved");
});
test("terminal resolved reminders cannot be reopened accidentally",()=>{
 assert.equal(simulateDeveloperReminder("resolved","prepare","system"),"resolved");
 assert.equal(simulateDeveloperReminder("expired","mark_sent","delivery_provider"),"expired");
});
