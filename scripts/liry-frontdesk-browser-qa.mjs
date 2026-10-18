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
if(!base||!/^https:\/\//.test(base)){console.error("Define LIRY_QA_URL con la URL HTTPS del Preview autorizado.");process.exit(2);}
const out=path.resolve("qa-evidence","lirygames");
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true});
const results=[];
for(const locale of ["es","en"]){
 for(const width of [320,375,768,1024]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:"reduce"});
  const errors=[];
  page.on("pageerror",e=>errors.push(e.message));
  const url=new URL("/lirygames",base);url.searchParams.set("lang",locale);
  try{
   const res=await page.goto(url.toString(),{waitUntil:"domcontentloaded",timeout:30000});
   await page.waitForTimeout(700);
   const status=res?.status()??0;
   const geometry=await page.evaluate(()=>({scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth}));
   const snapshot=await page.screenshot({path:path.join(out,`frontdesk-${locale}-${width}.png`),fullPage:true});
   const entry={locale,width,status,overflow:geometry.scrollWidth>geometry.clientWidth+2,errors,title:await page.title(),screenshot:`frontdesk-${locale}-${width}.png`};
   results.push(entry);console.log(JSON.stringify(entry));
  }catch(e){const entry={locale,width,error:String(e)};results.push(entry);console.error(JSON.stringify(entry));}
  await page.close();
 }
}
await browser.close();
await writeFile(path.join(out,"results.json"),JSON.stringify({base,checkedAt:new Date().toISOString(),results},null,2));
if(results.some(r=>r.error||r.status>=400||r.overflow||r.errors?.length))process.exitCode=1;
