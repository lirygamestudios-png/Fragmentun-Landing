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

test("Paginación del catálogo principal devuelve foco al resumen",()=>{const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");assert.match(src,/catalogResultRef=useRef/);assert.match(src,/catalogResultRef\.current\?\.focus\(\{preventScroll:true\}\)/);assert.match(src,/ref=\{catalogResultRef\} tabIndex=\{-1\}/);assert.match(src,/navigateCatalogPage\(i\+1\)/);});

test("Filtros de catálogo y tienda respetan ancho móvil",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/\.liryCatalogFilters label,\.liryStoreFilters label,\.thirdPartyFilters label\{min-width:0\}/);assert.match(css,/@media\(max-width:560px\)\{\.liryCatalogFilters button,\.liryStoreFilters button,\.thirdPartyFilters button\{width:100%;box-sizing:border-box\}\}/);});
