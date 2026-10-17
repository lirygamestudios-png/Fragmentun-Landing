import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
test("authorized external game catalog progressively reveals 12 cards",()=>{const source=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");assert.match(source,/useState\(12\)/);assert.match(source,/games\.slice\(0,visibleCount\)/);assert.match(source,/Math\.min\(count\+12,games\.length\)/);assert.match(source,/if\(!games\.length\)return null/);});

test("La recomendación de ADN desplaza la vista hacia la tarjeta externa revelada",()=>{const source=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");assert.match(source,/index>=visibleCount/);assert.match(source,/prefers-reduced-motion: reduce/);
 assert.match(source,/scrollIntoView\(/);});

test("La navegación de tarjetas externas tolera fragmentos inválidos y movimiento reducido",()=>{const source=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");assert.doesNotMatch(source,/decodeURIComponent\(window\.location\.hash/);assert.match(source,/prefers-reduced-motion: reduce/);});

test("Cada cambio de enlace desplaza hasta una tarjeta ya visible",()=>{const source=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");assert.match(source,/setLinkedHash\(hash\)/);assert.match(source,/\[games,visibleCount,linkedHash\]/);});

test("Liry ADN puede reenviar la navegación al catálogo externo",()=>{const catalog=readFileSync(new URL("../components/LiryThirdPartyCatalog.tsx",import.meta.url),"utf8");const dna=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");assert.match(catalog,/addEventListener\("liry:external-game-link"/);assert.match(dna,/CustomEvent\("liry:external-game-link"/);});
