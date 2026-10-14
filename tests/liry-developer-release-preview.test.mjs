import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
const release=readFileSync(new URL("../components/LiryDeveloperReleasePreview.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
test("preview is part of the developer panel",()=>assert.match(page,/<LiryDeveloperReleasePreview \/>/));
test("release preview does not upload or publish",()=>{assert.doesNotMatch(release,/type="file"|fetch\(|onSubmit|type="submit"/);assert.match(release,/PROGRAMA INACTIVO/)});
test("preview explicitly reserves approval to LIRYGAMES",()=>assert.match(release,/no aprobar su publicación/));
test("forms reuse approved illuminated styles and mobile behavior",()=>{assert.match(css,/\.developerForm button:hover/);assert.match(css,/@media\(max-width:560px\)\{\.developerForm/);assert.match(release,/styles\.developerForm/)});
