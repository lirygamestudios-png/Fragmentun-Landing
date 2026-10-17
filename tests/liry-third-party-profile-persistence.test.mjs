import test from "node:test";import assert from "node:assert/strict";
import {isValidLiryProfileUpdate,mayPersistLiryPlayerProfile} from "../lib/games/liry-player-profile-persistence.ts";
const id={application:"lirygames",audience:"lirygames-player",subject:"player_00001",emailVerified:true,sessionVerifiedByServer:true};
const profile={ownerId:"player_00001",displayName:"Gamer Uno",preferences:{notifications:false,reduceMotion:false,privateProfile:true,locale:"es"},avatarObjectKey:"player_00001/photo_00001"};
test("Las preferencias validan dueño, imagen y privacidad",()=>{assert.equal(isValidLiryProfileUpdate(profile),true);assert.equal(isValidLiryProfileUpdate({...profile,avatarObjectKey:"player_00002/photo_00001"}),false);assert.equal(isValidLiryProfileUpdate({...profile,preferences:{...profile.preferences,privateProfile:"yes"}}),false);});
test("No se graban perfiles hasta habilitar almacenamiento y acceso independiente",()=>{assert.equal(mayPersistLiryPlayerProfile(id,profile),false);assert.equal(mayPersistLiryPlayerProfile({...id,application:"fragmentun"},profile),false);});
