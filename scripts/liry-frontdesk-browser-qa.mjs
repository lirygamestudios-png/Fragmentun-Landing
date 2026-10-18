// QA manual asistida de LIRYGAMES: ejecutar fuera del entorno bloqueado.
// Instalación local opcional: npm install --no-save playwright && npx playwright install chromium
// Ejecución: LIRY_QA_URL=https://...vercel.app node scripts/liry-frontdesk-browser-qa.mjs
// No envía formularios, crea cuentas, compra artículos ni publica videojuegos.
import {createRequire} from "node:module";
import {mkdir,writeFile} from "node:fs/promises";
import path from "node:path";
const require=createRequire(import.meta.url);
let chromium;
try{({chromium}=require("playwright"));}catch{console.error("Playwright no está instalado. Ejecuta: npm install --no-save playwright");process.exit(2);}
const base=process.env.LIRY_QA_URL;
if(!base||!/^https:\/\//.test(base)&&!/^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/.test(base)){console.error("Define LIRY_QA_URL con el Preview HTTPS autorizado o un servidor local HTTP en localhost/127.0.0.1.");process.exit(2);}
const out=path.resolve("qa-evidence","lirygames");
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
for(const route of [{name:"frontdesk",path:"/lirygames"},{name:"player",path:"/lirygames/mi-liry"},{name:"developer",path:"/lirygames/developer"}]){
 for(const locale of ["es","en"]){
 for(const width of [320,375,768,1024]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const url=new URL(route.path,base);url.searchParams.set("lang",locale);
  try{
   const res=await page.goto(url.toString(),{waitUntil:"domcontentloaded",timeout:30000});
   await page.evaluate(async()=>{await Promise.race([document.fonts.ready,new Promise(resolve=>setTimeout(resolve,2500))]);});
   await page.waitForTimeout(500);
   const status=res?.status()??0;
   const finalUrl=new URL(page.url());
   const wrongRoute=finalUrl.pathname!==route.path;
   const geometry=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,mainPresent:Boolean(document.querySelector("main")),bodyTextLength:document.body?.innerText?.trim().length??0}));
   const missingMain=!geometry.mainPresent||geometry.bodyTextLength<20;
   // Captura de referencia antes de alterar temporalmente controles de la página.
   const initialScreenshot=`${route.name}-${locale}-${width}-initial.png`;
   await page.screenshot({path:path.join(out,initialScreenshot),fullPage:true});
   // Smoke interactivo inocuo: abrir y cerrar solo la primera subpantalla del portal.
   let developerDialogCheck=null;
   if(route.name==="developer"&&!wrongRoute&&!missingMain&&status<400){
    const trigger=page.locator('button[aria-haspopup="dialog"]').first();
    const count=await trigger.count();
    if(count){
     await trigger.click();
     const opened=await page.locator('dialog[open]').count()>0;
     await page.keyboard.press("Escape");
     const closed=await page.locator('dialog[open]').count()===0;
     const focusRestored=await trigger.evaluate(el=>document.activeElement===el);
     developerDialogCheck={opened,closed,focusRestored,passed:opened&&closed&&focusRestored};
    }else developerDialogCheck={passed:false,reason:"Missing developer modal trigger"};
   }
   let dnaExplorerCheck=null;
   if(route.name==="frontdesk"&&!wrongRoute&&!missingMain&&status<400){
    const toggle=page.locator('button[class*="dnaSideButton"]').first();
    if(await toggle.count()){
     await toggle.click();
     const opened=await toggle.getAttribute("aria-expanded")==="true";
     await page.keyboard.press("Escape");
     const closed=await toggle.getAttribute("aria-expanded")==="false";
     dnaExplorerCheck={opened,closed,passed:opened&&closed};
    }else dnaExplorerCheck={passed:false,reason:"Missing DNA explorer button"};
   }
   // Mi Liry: prueba efímera de alias, sin subir fotos ni persistir información.
   let playerDraftCheck=null;
   if(route.name==="player"&&!wrongRoute&&!missingMain&&status<400){
    const alias=page.locator('input[aria-describedby="liry-name-note"]').first();
    if(await alias.count()){
     await alias.fill("Liry QA");
     const accepted=await alias.inputValue()==="Liry QA";
     const reset=page.getByRole("button",{name:locale==="es"?"Restablecer nombre y fotografía":"Reset name and photo"});
     if(await reset.count())await reset.click();
     const cleared=await alias.inputValue()==="";
     playerDraftCheck={accepted,cleared,passed:accepted&&cleared};
    }else playerDraftCheck={passed:false,reason:"Missing player alias preview"};
   }
   // Avatar de prueba generado en memoria: no se usa una fotografía personal.
   let avatarCheck=null;
   if(route.name==="player"&&!wrongRoute&&!missingMain&&status<400){
    const fileInput=page.locator('input[type="file"][accept*="image/png"]').first();
    if(await fileInput.count()){
     const png=Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==","base64");
     await fileInput.setInputFiles({name:"liry-qa.png",mimeType:"image/png",buffer:png});
     const picture=page.locator('[class*="accountAvatarPicture"] img').first();
     const displayed=await picture.waitFor({state:"visible",timeout:6000}).then(()=>true).catch(()=>false);
     const remove=page.getByRole("button",{name:locale==="es"?"Quitar fotografía":"Remove photo"});
     if(await remove.count())await remove.click();
     const cleared=await picture.count()===0;
     avatarCheck={displayed,cleared,passed:displayed&&cleared};
    }else avatarCheck={passed:false,reason:"Missing avatar file input"};
   }
   // Cuestionario ADN temporal: seis respuestas, resultados, reinicio y cierre.
   let dnaSurveyCheck=null;
   if(route.name==="frontdesk"&&!wrongRoute&&!missingMain&&status<400){
    const explorer=page.locator('button[class*="dnaSideButton"]').first();
    if(await explorer.count()){
     await explorer.click();
     const surveyToggle=page.locator('button[class*="dnaSurveyToggle"]').first();
     await surveyToggle.click();
     let answered=0;
     for(let question=0;question<6;question++){
      const radio=page.locator(`input[name="liry-dna-q-${question}"]`).first();
      await radio.waitFor({state:"attached",timeout:6000});
      await radio.check();
      answered++;
     }
     const result=page.locator('[class*="dnaSurveyResult"]').first();
     const resultVisible=await result.waitFor({state:"visible",timeout:7000}).then(()=>true).catch(()=>false);
     const restart=page.locator('button[class*="dnaSurveyRestart"]').first();
     if(resultVisible)await restart.click();
     const resetToFirst=await page.locator('input[name="liry-dna-q-0"]').count()>0;
     await page.locator('button[class*="dnaExplorerClose"]').first().click();
     const closed=await explorer.getAttribute("aria-expanded")==="false";
     await explorer.click();
     const oldResultAbsent=await page.locator('[class*="dnaSurveyResult"]').count()===0;
     await page.locator('button[class*="dnaExplorerClose"]').first().click();
     dnaSurveyCheck={answered,resultVisible,resetToFirst,closed,oldResultAbsent,passed:answered===6&&resultVisible&&resetToFirst&&closed&&oldResultAbsent};
    }else dnaSurveyCheck={passed:false,reason:"Missing DNA explorer"};
   }
   await page.screenshot({path:path.join(out,`${route.name}-${locale}-${width}.png`),fullPage:true});
   const entry={route:route.path,locale,width,status,finalUrl:page.url(),wrongRoute,missingMain,developerDialogCheck,dnaExplorerCheck,dnaSurveyCheck,playerDraftCheck,avatarCheck,overflow:geometry.scrollWidth>geometry.clientWidth+2,errors,title:await page.title(),screenshot:`${route.name}-${locale}-${width}.png`,initialScreenshot};
   results.push(entry);console.log(JSON.stringify(entry));
  }catch(e){const failureScreenshot=`${route.name}-${locale}-${width}-failure.png`;let screenshot=null;try{await page.screenshot({path:path.join(out,failureScreenshot),fullPage:true,timeout:5000});screenshot=failureScreenshot;}catch{}const entry={route:route.path,locale,width,error:String(e),screenshot};results.push(entry);console.error(JSON.stringify(entry));}
  await page.close();
 }
 }
}
await browser.close();
await writeFile(path.join(out,"results.json"),JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));
if(results.some(r=>r.error||!r.status||r.status>=400||r.wrongRoute||r.missingMain||r.developerDialogCheck?.passed===false||r.dnaExplorerCheck?.passed===false||r.dnaSurveyCheck?.passed===false||r.playerDraftCheck?.passed===false||r.avatarCheck?.passed===false||r.overflow||r.errors?.length))process.exitCode=1;
