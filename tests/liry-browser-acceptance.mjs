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
 * Requiere conectividad y acceso SSO autorizado. Si hay sesión Playwright exportada localmente,\n * definir LIRY_STORAGE_STATE=/ruta/privada/auth.json; nunca agregar este archivo a Git.\n * La redirección a login NO es aprobación.
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

const storageStatePath=process.env.LIRY_STORAGE_STATE?.trim();
if(storageStatePath){console.log("QA: usando sesión Playwright autorizada desde archivo local; no se publicarán credenciales.");}
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
  const context=await browser.newContext({viewport:{width:item.width,height:item.height},isMobile:item.mobile,hasTouch:item.mobile,deviceScaleFactor:1,...(storageStatePath?{storageState:storageStatePath}:{})});
  const page=await context.newPage();
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  try {
   const response=await page.goto(base+"/lirygames?lang="+item.locale,{waitUntil:"domcontentloaded",timeout:30000});
   assert.equal(response?.status(),200,"FrontDesk debe responder 200");
   assert.equal(new URL(page.url()).pathname,"/lirygames","La sesión SSO debe llegar al FrontDesk, no a la pantalla de autenticación");
   await page.locator("body").waitFor();
   await page.locator('[class*="liryCatalogFilters"] input[type="search"]').waitFor({state:"visible"});
   await page.screenshot({path:join(out,item.label+"-frontdesk.png"),fullPage:true});
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1);
   assert.equal(overflow,false,"No debe aparecer scroll horizontal");
   // Recorridos observables de catálogo y ADN (sin escribir datos de usuario).
   if(item.label==="desktop-es-1440"||item.label==="desktop-en-1024"){
    const catalogImages=page.locator('img[class*="gameCardArt"]');
    assert.equal(await catalogImages.count(),9,"Las nueve tarjetas públicas deben conservar sus imágenes");
    const sources=await catalogImages.evaluateAll(images=>images.map(img=>new URL(img.getAttribute("src"),location.href).pathname));
    assert.deepEqual([...sources].sort(),Array.from({length:9},(_,i)=>"/liry-assets/world-"+String(i+1).padStart(2,"0")+".webp"),"Las nueve imágenes deben apuntar a recursos públicos distintos");
    for(const image of await catalogImages.all()){
     await image.scrollIntoViewIfNeeded();
     await image.evaluate(img=>img.decode());
     assert.equal(await image.evaluate(img=>img.complete&&img.naturalWidth>0),true,"La imagen pública debe cargarse y decodificarse");
    }
    const catalogSearch=page.locator('[class*="liryCatalogFilters"] input[type=search]');
    await catalogSearch.fill("codigo-improbable-sin-coincidencia-qa");
    await page.locator('[class*="liryCatalogCount"]').waitFor();
    await page.waitForFunction(()=>document.querySelectorAll('[class*="worldCardOpen"]').length===0);
    await catalogSearch.fill("");
    const openGame=page.locator('[class*="worldCardOpen"]').first();
    await openGame.click();
    const gameDialog=page.locator('[role="dialog"][aria-labelledby="liry-world-dialog-title"]');
    assert.equal(await gameDialog.isVisible(),true,"La ficha del catálogo debe abrirse");
    await page.keyboard.press("Escape");
    await gameDialog.waitFor({state:"detached"});
    await page.waitForFunction(()=>{const opener=document.querySelector('[class*="worldCardOpen"]');return opener&&document.activeElement===opener},undefined,{timeout:5000});
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
   // Tienda: filtros y estados reales; la prueba no inventa productos publicados.
   if(item.label==="desktop-es-1440"||item.label==="desktop-en-1024"){
    const store=page.locator('[class*="liryStoreListing"]');
    const filters=store.locator('[class*="liryStoreFilters"]');
    const search=filters.locator('input[type="search"]');
    const selects=filters.locator("select");
    assert.equal(await selects.count(),3,"La tienda debe mostrar categoría, disponibilidad y orden");
    const reset=filters.locator("button");
    assert.equal(await reset.isDisabled(),true,"El restablecimiento comienza deshabilitado");
    await search.fill("qa-producto-inexistente-20261025");
    await store.locator('[role="status"]').waitFor();
    await page.waitForFunction(()=>document.querySelectorAll('[data-liry-store-product]').length===0);
    assert.equal(await reset.isEnabled(),true,"La búsqueda habilita limpiar filtros");
    await reset.click();
    assert.equal(await search.inputValue(),"","Limpiar filtros vacía la búsqueda");
    await selects.nth(1).selectOption("available");
    await selects.nth(1).selectOption("all");
    await selects.nth(2).selectOption("price-desc");
    await selects.nth(2).selectOption("name");
    await reset.waitFor({state:"visible"});
    assert.equal(await reset.isDisabled(),true,"La configuración inicial deshabilita limpiar");
    const category=page.locator('button[aria-controls="liry-store-category-dialog"]').first();
    await category.click();
    const categoryDialog=page.locator("#liry-store-category-dialog");
    assert.equal(await categoryDialog.evaluate(el=>el.open),true,"La categoría abre modal nativo");
    await page.keyboard.press("Escape");
    await page.waitForFunction(()=>document.querySelector("#liry-store-category-dialog")?.open===false);
    await page.waitForFunction(()=>{const opener=document.querySelector('button[aria-controls="liry-store-category-dialog"]');return opener&&document.activeElement===opener},undefined,{timeout:5000});
    const items=store.locator("[data-liry-store-product]");
    if(await items.count()>12)throw new Error("La tienda no debe superar 12 productos por página");
    const pages=store.locator('[class*="liryStorePages"]');
    if(await pages.count()){
     const next=pages.locator("button").last();
     await next.click();
     assert.equal(await store.locator('nav [aria-current="page"]').count(),1,"Paginación mantiene una página activa");
     assert.ok(await items.count()<=12,"Paginación respeta el límite de doce");
    }
   }
   if(item.mobile){
    const toggle=page.locator('button[aria-controls="liry-mobile-nav"]');
    await toggle.click();
    assert.equal(await toggle.getAttribute("aria-expanded"),"true");
    await page.keyboard.press("Escape");
    await page.waitForFunction(()=>{const button=document.querySelector('button[aria-controls="liry-mobile-nav"]');return button?.getAttribute("aria-expanded")==="false"&&document.activeElement===button},undefined,{timeout:5000});
    await toggle.click();
    const menu=page.locator("#liry-mobile-nav");
    await menu.locator('a[href="#mundos"]').click();
    await page.waitForFunction(()=>location.hash==="#mundos"&&document.querySelector('button[aria-controls="liry-mobile-nav"]')?.getAttribute("aria-expanded")==="false");
    await page.waitForFunction(()=>document.activeElement?.id==="mundos",undefined,{timeout:5000});
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),false,"Navegar con el menú móvil no debe generar scroll horizontal");
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
