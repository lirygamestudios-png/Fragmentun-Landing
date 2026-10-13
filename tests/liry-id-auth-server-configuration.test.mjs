import test from "node:test";
import assert from "node:assert/strict";
import {readLiryGamerAuthConfiguration} from "../lib/games/liry-auth-server-configuration.ts";
const base={LIRY_GAMER_SUPABASE_URL:"https://gamer-test.supabase.co/",LIRY_GAMER_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_gamer_fixture_only",NEXT_PUBLIC_SUPABASE_URL:"https://fragment-test.supabase.co/",NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:"sb_publishable_fragment_fixture"};
test("configuración aislada detectada, sin activar cuentas",()=>{const r=readLiryGamerAuthConfiguration(base);assert.equal(r.configured,true);assert.equal(r.registrationsEnabled,false);assert.equal(r.signInEnabled,false)});
test("sin configuración gamer queda cerrada",()=>assert.equal(readLiryGamerAuthConfiguration({...base,LIRY_GAMER_SUPABASE_URL:undefined}).configured,false));
test("no autoriza compartir el proyecto administrativo",()=>assert.equal(readLiryGamerAuthConfiguration({...base,LIRY_GAMER_SUPABASE_URL:base.NEXT_PUBLIC_SUPABASE_URL}).configured,false));
test("recuperación sigue deshabilitada aunque exista configuración",()=>assert.equal(readLiryGamerAuthConfiguration(base).recoveryEnabled,false));
