import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

test("Catálogo principal permite limpiar filtros cuando no hay resultados",()=>{
 const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");
 assert.match(src,/publicGameEntries\.length===0&&<div role="status">/);
 assert.match(src,/No se encontraron videojuegos públicos con estos criterios/);
 assert.match(src,/No public games match these criteria/);
 assert.match(src,/Mostrar todos los videojuegos/);
 assert.match(src,/Show all games/);
 assert.match(src,/onClick=\{\(\)=>\{setCatalogSearch\(""\);setCatalogStatus\("all"\);setCatalogPage\(1\)\}\}/);
});
