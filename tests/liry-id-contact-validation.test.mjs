import test from "node:test";import assert from "node:assert/strict";import {validateLiryContactPayload} from "../lib/games/liry-contact-validation.ts";
const valid={name:" Visitante ",email:" TEST@example.com ",subject:"opinion",message:"Un mensaje suficientemente detallado.",gameSlug:"",privacyAcknowledged:true};
test("Contacto normaliza nombre y correo antes de registrar",()=>{const x=validateLiryContactPayload(valid);assert.equal(x.ok,true);if(x.ok){assert.equal(x.fields.name,"Visitante");assert.equal(x.fields.email,"test@example.com")}});
test("Contacto rechaza envíos sin consentimiento",()=>assert.equal(validateLiryContactPayload({...valid,privacyAcknowledged:false}).ok,false));
test("Contacto rechaza mensaje vacío, asunto y correo incorrectos",()=>{for(const change of [{message:"corto"},{subject:"arbitrary"},{email:"mal"}])assert.equal(validateLiryContactPayload({...valid,...change}).ok,false)});
test("Contacto no acepta objetos ni entradas sin estructura",()=>{assert.equal(validateLiryContactPayload(null).ok,false);assert.equal(validateLiryContactPayload([]).ok,false)});
