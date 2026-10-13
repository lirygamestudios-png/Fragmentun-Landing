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
  !Number.isSafeInteger(file.size)||file.size<=0||file.size>2*1024*1024)
  return {ok:false,message:"Usa JPG, PNG o WebP de hasta 2 MB."};
 return {ok:true,message:""};
}
