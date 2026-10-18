import {LIRY_AVATAR_STORAGE} from "./liry-avatar-storage-contract";
/** Validación local de avatar. Es una prevalidación; cualquier almacenamiento
 * futuro debe volver a validar contenido real, dimensiones y propietario en servidor.
 */
export function validateTemporaryGamerAvatar(file:{name:string;type:string;size:number}|null):{ok:boolean;message:string}{
 if(!file)return {ok:false,message:"Selecciona una imagen."};
 const types:Record<string,RegExp>={
  "image/jpeg":/\.jpe?g$/i,
  "image/png":/\.png$/i,
  "image/webp":/\.webp$/i
 };
 if(typeof file.name!=="string"||typeof file.type!=="string"||
  !Object.hasOwn(types,file.type)||!types[file.type].test(file.name)||
  !Number.isSafeInteger(file.size)||file.size<=0||file.size>LIRY_AVATAR_STORAGE.maxBytes)
  return {ok:false,message:"Usa JPG, PNG o WebP de hasta 2 MB."};
 return {ok:true,message:""};
}

/** Verifica los primeros bytes reales antes de mostrar una vista previa local. */
export async function validateTemporaryGamerAvatarContent(file:File):Promise<boolean>{
 try{
  const bytes=new Uint8Array(await file.slice(0,16).arrayBuffer());
  if(file.type==="image/png")return bytes.length>=8&&[137,80,78,71,13,10,26,10].every((n,i)=>bytes[i]===n);
  if(file.type==="image/jpeg")return bytes.length>=3&&bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
  if(file.type==="image/webp")return bytes.length>=12&&
   [82,73,70,70].every((n,i)=>bytes[i]===n)&&[87,69,66,80].every((n,i)=>bytes[i+8]===n);
  return false;
 }catch{return false;}
}
