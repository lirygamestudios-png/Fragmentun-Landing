import fs from "node:fs";
import path from "node:path";

const root=process.cwd();
const sourceRoot=path.join(root,"assets","frontdesk-b64");
const publicDir=path.join(root,"public");
const assets=[
  ["umbral","umbral-final.avif"],
  ["ethelis","ethelis-final.avif"],
  ["vorax","vorax-final.avif"],
  ["nara","nara-final.avif"],
  ["lumen","lumen-frontdesk-final.avif"]
];

for(const [name,outName] of assets){
  const dir=path.join(sourceRoot,name);
  if(!fs.existsSync(dir)) continue;
  const files=fs.readdirSync(dir).filter(f=>f.endsWith(".b64")).sort();
  if(!files.length) continue;
  const b64=files.map(f=>fs.readFileSync(path.join(dir,f),"utf8").trim()).join("");
  const bytes=Buffer.from(b64,"base64");
  if(bytes.length<20000) throw new Error(`Decoded asset ${name} is unexpectedly small (${bytes.length} bytes)`);
  fs.writeFileSync(path.join(publicDir,outName),bytes);
  console.log(`Decoded ${outName}: ${bytes.length} bytes`);
}
