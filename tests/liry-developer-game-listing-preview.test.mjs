import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const component=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");
const page=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");
test("developer listing is integrated",()=>assert.match(page,/<LiryDeveloperGameListingPreview \/>/));
test("listing supports premium and freemium",()=>{assert.match(component,/model==="premium"/);assert.match(component,/model==="freemium"/)});
test("premium validates positive proposed price",()=>assert.match(component,/Number\(price\)>0/));
test("listing requires age and platform declaration",()=>{assert.match(component,/developer-game-age/);assert.match(component,/developer-game-platform/)});
test("no upload or submission is available",()=>{assert.doesNotMatch(component,/type="file"|onSubmit|type="submit"|fetch\(|localStorage/);assert.match(component,/Sin guardado, carga de archivos, envío ni ventas/)});
