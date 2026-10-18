import test from "node:test";import assert from "node:assert/strict";
import {isValidLiryProfileUpdate,mayPersistLiryPlayerProfile} from "../lib/games/liry-player-profile-persistence.ts";
const id={application:"lirygames",audience:"lirygames-player",subject:"player_00001",emailVerified:true,sessionVerifiedByServer:true};
const profile={ownerId:"player_00001",displayName:"Gamer Uno",preferences:{notifications:false,reduceMotion:false,privateProfile:true,locale:"es"},avatarObjectKey:"player_00001/photo_00001"};
test("Las preferencias validan dueño, imagen y privacidad",()=>{assert.equal(isValidLiryProfileUpdate(profile),true);assert.equal(isValidLiryProfileUpdate({...profile,avatarObjectKey:"player_00002/photo_00001"}),false);assert.equal(isValidLiryProfileUpdate({...profile,preferences:{...profile.preferences,privateProfile:"yes"}}),false);});
test("No se graban perfiles hasta habilitar almacenamiento y acceso independiente",()=>{assert.equal(mayPersistLiryPlayerProfile(id,profile),false);assert.equal(mayPersistLiryPlayerProfile({...id,application:"fragmentun"},profile),false);});

test("Los datos corruptos no provocan errores de validación",()=>{assert.equal(isValidLiryProfileUpdate({...profile,displayName:null}),false);assert.equal(isValidLiryProfileUpdate({...profile,ownerId:null}),false);assert.equal(isValidLiryProfileUpdate({...profile,avatarObjectKey:42}),false);});
test("Las preferencias sin fotografía pueden usar infraestructura de perfil independiente",()=>{assert.equal(isValidLiryProfileUpdate({...profile,avatarObjectKey:null}),true);});

test("Se rechazan nombres con controles invisibles y preferencias malformadas",()=>{assert.equal(isValidLiryProfileUpdate({...profile,displayName:" Gamer Uno "}),false);assert.equal(isValidLiryProfileUpdate({...profile,displayName:"Gamer\u007fUno"}),false);assert.equal(isValidLiryProfileUpdate({...profile,preferences:"es"}),false);assert.equal(isValidLiryProfileUpdate({...profile,preferences:[]}),false);});

test("No se admiten arrays ni entradas nulas como perfil",()=>{assert.equal(isValidLiryProfileUpdate(null),false);assert.equal(isValidLiryProfileUpdate([]),false);assert.equal(isValidLiryProfileUpdate({}),false);});

test("Nombre público comparte la misma regla de interfaz y perfil",async()=>{const {isValidLiryDisplayName}=await import("../lib/games/liry-display-name-validation.ts");assert.equal(isValidLiryDisplayName("Jugador Uno"),true);assert.equal(isValidLiryDisplayName(" Visitante "),false);assert.equal(isValidLiryDisplayName("<script>"),false);assert.equal(isValidLiryProfileUpdate({...profile,displayName:"Jugador Uno"}),true);assert.equal(isValidLiryProfileUpdate({...profile,displayName:" Visitante "}),false);});
