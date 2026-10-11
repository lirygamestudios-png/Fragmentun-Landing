import test from "node:test";
import assert from "node:assert/strict";
import {resolveLiryShareUrl} from "../lib/games/liry-share-url.ts";
test("sin dominio oficial utiliza origen actual",()=>{assert.equal(resolveLiryShareUrl(undefined,"https://preview.example"),"https://preview.example/lirygames")});
test("dominio oficial validado reemplaza preview",()=>{assert.equal(resolveLiryShareUrl("https://games.example/lirygames","https://preview.example"),"https://games.example/lirygames")});
test("rechaza credenciales, parámetros y rutas externas",()=>{
 for(const url of ["https://u:p@games.example","https://games.example/?ref=bad","https://games.example/another","javascript:alert(1)"]){
  assert.equal(resolveLiryShareUrl(url,"https://preview.example"),null);
 }
});
test("solo admite HTTP para desarrollo local",()=>{
 assert.equal(resolveLiryShareUrl("http://localhost:3000","https://preview.example"),"http://localhost:3000/lirygames");
 assert.equal(resolveLiryShareUrl("http://games.example","https://preview.example"),null);
});
