/**
 * LIRYGAMES FrontDesk — pruebas reales de aceptación en navegador.
 * Ejecución MANUAL y LOCAL, nunca en CI automáticamente:
 *   npm install --no-save --package-lock=false playwright
 *   npx playwright install chromium
 *   node tests/liry-browser-acceptance.mjs
 *
 * BASE_URL es obligatorio: especificar el Preview protegido de LIRYGAMES a verificar.
 * Ejemplo: BASE_URL=https://<preview-lirygames>.vercel.app node tests/liry-browser-acceptance.mjs
 * Capturas: /tmp/liry-browser-acceptance
 * No transmite formularios, no crea cuentas, no compra, no modifica datos.
 * Requiere conectividad directa y sesión SSO autenticada. Redirección a login NO es aprobación.
 */
import assert from "node:assert/strict";
import {mkdir} from "node:fs/promises";
import {join} from "node:path";

const requestedBase = process.env.BASE_URL?.trim();
if(!requestedBase){console.error("BASE_URL obligatorio: indicar explícitamente el Preview SSO de LIRYGAMES.");process.exit(2)}
let previewUrl;
try{previewUrl=new URL(requestedBase)}catch{console.error("BASE_URL no es una URL válida.");process.exit(2)}
if(previewUrl.protocol!=="https:"||!previewUrl.hostname.startsWith("lirygames-studios-frontdesk-")||!previewUrl.hostname.endsWith(".vercel.app")||previewUrl.pathname!=="/"||previewUrl.search||previewUrl.hash){console.error("BASE_URL debe señalar la raíz HTTPS de un Preview Vercel de LIRYGAMES, sin ruta ni parámetros.");process.exit(2)}
const base=previewUrl.origin;
const out = process.env.LIRY_EVIDENCE_DIR || "/tmp/liry-browser-acceptance";
await mkdir(out,{recursive:true});
let chromium;
try { ({chromium}=await import("playwright")); }
catch { console.error("Falta playwright. Consultar las instrucciones al principio de este archivo."); process.exit(2); }

const browser=await chromium.launch({headless:true});
let failures=0;
const cases=[
 {label:"desktop-es-1440",width:1440,height:900,locale:"es",mobile:false},
 {label:"desktop-es-1280",width:1280,height:800,locale:"es",mobile:false},
 {label:"desktop-en-1024",width:1024,height:768,locale:"en",mobile:false},
 {label:"mobile-es-320",width:320,height:720,locale:"es",mobile:true},
 {label:"mobile-es-360",width:360,height:780,locale:"es",mobile:true},
 {label:"mobile-es-375",width:375,height:812,locale:"es",mobile:true},
 {label:"mobile-en-390",width:390,height:844,locale:"en",mobile:true},
 {label:"mobile-es-430",width:430,height:932,locale:"es",mobile:true}
];
try {
 for (const item of cases) {
  const context=await browser.newContext({viewport:{width:item.width,height:item.height},isMobile:item.mobile,hasTouch:item.mobile,deviceScaleFactor:1});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try {
   const response=await page.goto(base+"/lirygames?lang="+item.locale,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(response?.status(),200,"FrontDesk debe responder 200");
   assert.equal(new URL(page.url()).pathname,"/lirygames","La sesión SSO debe llegar al FrontDesk, no a la pantalla de autenticación");
   await page.locator("body").waitFor();
   await page.screenshot({path:join(out,item.label+"-frontdesk.png"),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
   assert.equal(overflow,false,"No debe aparecer scroll horizontal");
   // Recorridos observables de catálogo y ADN (sin escribir datos de usuario).
   if(item.label==="desktop-es-1440"||item.label==="desktop-en-1024"){
    const catalogSearch=page.locator("[class*="liryCatalogFilters"] input[type=search]");
    await catalogSearch.fill("codigo-improbable-sin-coincidencia-qa");
    await page.locator('[class*="liryCatalogCount"]').waitFor();
    assert.equal(await page.locator('[class*="worldCardOpen"]').count(),0,"Un filtro inexistente no debe mostrar tarjetas");
    await catalogSearch.fill("");
    const openGame=page.locator('[class*="worldCardOpen"]').first();
    await openGame.click();
    const gameDialog=page.locator('[role="dialog"][aria-labelledby="liry-world-dialog-title"]');
    assert.equal(await gameDialog.isVisible(),true,"La ficha del catálogo debe abrirse");
    await page.keyboard.press("Escape");
    await gameDialog.waitFor({state:"detached"});
    assert.equal(await openGame.evaluate(el=>document.activeElement===el),true,"La ficha debe devolver el foco al botón");
    const dna=page.locator("#liry-dna");
    await dna.locator('button[aria-controls="liry-dna-explorer"]').click();
    await dna.locator('[class*="dnaSurveyToggle"]').click();
    for(let question=0;question<6;question++){
     const choice=dna.locator('input[name="liry-dna-q-'+question+'"]').last();
     await choice.check();
     if(question<5)await dna.locator('input[name="liry-dna-q-'+(question+1)+'"]').first().waitFor();
    }
    await dna.locator('[class*="dnaSurveyResult"]').waitFor();
    assert.equal(await dna.locator('[role="progressbar"]').count(),6,"ADN debe mostrar seis indicadores de resultado");
    await dna.locator('[class*="dnaSurveyRestart"]').click();
    await dna.locator('input[name="liry-dna-q-0"]').first().waitFor();
    await dna.locator('[class*="dnaExplorerClose"]').click();
    assert.equal(await dna.locator("#liry-dna-explorer").count(),0,"Cerrar ADN debe ocultar el explorador");
   }
   if(item.mobile){
    const toggle=page.locator('button[aria-controls="liry-mobile-nav"]');
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"),"true");
    await page.keyboard.press("Escape");
    await page.waitForFunction(()=>document.querySelector('button[aria-controls="liry-mobile-nav"]')?.getAttribute("aria-expanded")==="false");
   }
   const mi=await page.goto(base+"/lirygames/mi-liry?lang="+item.locale,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(mi?.status(),200,"Mi Liry debe responder 200");
   assert.equal(new URL(page.url()).pathname,"/lirygames/mi-liry","La sesión SSO debe llegar a Mi Liry, no a la pantalla de autenticación");
   const first=page.locator('button[aria-controls="mi-liry-area-dialog"]').first();
   await first.click();
   const dialog=page.locator("#mi-liry-area-dialog");
   assert.equal(await dialog.evaluate(el=>el.open),true,"Subpantalla debe abrirse");
   await page.waitForFunction(()=>document.querySelector('button[aria-controls="mi-liry-area-dialog"]')?.getAttribute("aria-expanded")==="true");
   await page.screenshot({path:join(out,item.label+"-mi-liry-modal.png")});
   await page.keyboard.press("Escape");
   await page.waitForFunction(()=>{const d=document.querySelector("#mi-liry-area-dialog");const b=document.querySelector('button[aria-controls="mi-liry-area-dialog"]');return d&&!d.open&&b?.getAttribute("aria-expanded")==="false"&&document.activeElement===b});
   assert.deepEqual(errors,[],"Sin errores JavaScript no capturados");
   console.log("PASS",item.label);
  }catch(e){failures++;console.error("FAIL",item.label,e.message);try{await page.screenshot({path:join(out,item.label+"-failed.png"),fullPage:true,timeout:5000})}catch{}}
  finally {await context.close();}
 }
}finally{await browser.close();}
if(failures) {console.error("Fallaron",failures,"casos. Auditar capturas en",out);process.exitCode=1;}
else console.log("PASS: casos ejecutados en navegador. Evidencia:",out,"; esto NO equivale a aprobación visual final.");
