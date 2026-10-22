import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
const dev=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
const areas=readFileSync(new URL("../components/MiLiryAreas.tsx",import.meta.url),"utf8");
const account=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
test("developer area submenus switch in same dialog and restore focus",()=>{assert.match(dev,/switchArea=\(direction:-1\|1\)/);assert.match(dev,/setSelected\(next.id as AreaId\)/);assert.match(dev,/areaHeading\.current\?\.focus\(\{preventScroll:true\}\)/);});
test("gamer area submenus switch in same dialog",()=>{assert.match(areas,/switchArea=\(direction:-1\|1\)/);assert.match(areas,/setSelected\(next\)/);assert.match(areas,/areaHeading\.current\?\.focus\(\{preventScroll:true\}\)/);});
test("account center replaces long tab grid with previous/next single panel",()=>{assert.match(account,/switchAccountSection/);assert.match(account,/ref=\{stepPanel\} tabIndex=\{-1\}/);assert.match(account,/PRÓXIMO →/);assert.doesNotMatch(account,/className=\{styles\.accountTabs\}/);});

test("changing modal submenu does not impersonate another card trigger",()=>{assert.match(areas,/setSelected\(next\);requestAnimationFrame/);assert.doesNotMatch(areas,/setSelected\(next\);setOpenedAreaId\(next.id\)/);assert.match(areas,/setOpenedAreaId\(area.id\)/);});
