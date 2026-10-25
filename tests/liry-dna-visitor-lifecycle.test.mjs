import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");

test("Liry DNA retains six-question local survey and delayed progression",()=>{
 assert.match(src,/dnaAnswers\.every\(answer=>answer!==null\)/);
 assert.match(src,/dnaStep===6/);
 assert.match(src,/setTimeout\(\(\)=>\{dnaStepFocusPending\.current=true;setDnaStep/);
 assert.match(src,/420\)/);
});
test("Liry DNA restart clears answers and returns to first question",()=>{
 assert.match(src,/clearAdvanceTimer\(\)/);
 assert.match(src,/setDnaAnswers\(Array\(6\)\.fill\(null\)\)/);
 assert.match(src,/setDnaStep\(0\)/);
});
test("Liry DNA retains public percentages and explicit explorer close",()=>{
 assert.match(src,/aria-valuenow=/);
 assert.match(src,/onClick=\{closeDnaExplorer\}/);
 assert.match(src,/publicCodenames\[i\]/);
});

test("Liry DNA cancels pending automatic advance before resetting or changing answers",()=>{assert.match(src,/const resetDnaEvaluation=\(preserveStyle=false\)=>\{\s*clearAdvanceTimer\(\)/);assert.match(src,/onChange=\{\(\)=>\{clearAdvanceTimer\(\);setDnaAnswers/);assert.match(src,/useEffect\(\(\)=>\(\)=>clearAdvanceTimer\(\),\[\]\)/);});

test("DNA-to-player style handoff is temporary and resettable",()=>{const identity=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");assert.match(src,/CustomEvent\("liry:dna-closed",\{detail:\{style:chosen,durationMs:10000\}\}\)/);assert.match(src,/CustomEvent\("liry:dna-style",\{detail:\{style:null\}\}\)/);assert.match(identity,/addEventListener\("liry:dna-closed",onDnaClosed\)/);assert.match(identity,/addEventListener\("liry:dna-style",handler\)/);assert.match(identity,/Math\.min\(10000,Math\.max\(5000,detail\.durationMs\)\)/);assert.match(identity,/setTimeout\(\(\)=>\{setStyle\(null\);setHighlight\(false\)/);});

test("DNA survey advances keyboard focus to each new question and the final result",()=>{assert.match(src,/dnaStepFocusPending\.current=true;setDnaStep/);assert.match(src,/querySelector<HTMLInputElement>\(`input\[name="liry-dna-q-\$\{dnaStep\}"\]`\)\?\.focus/);assert.match(src,/ref=\{dnaResultHeadingRef\} tabIndex=\{-1\}/);assert.match(src,/dnaStepFocusPending\.current=false/);});

test("DNA survey Previous restores keyboard focus to the earlier question",()=>{assert.match(src,/clearAdvanceTimer\(\);dnaStepFocusPending\.current=true;setDnaStep\(step=>Math\.max\(0,step-1\)\)/);});
