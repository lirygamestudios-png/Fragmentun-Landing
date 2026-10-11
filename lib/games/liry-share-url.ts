/** Resolución de URL de compartir; admite dominio oficial solo cuando está configurado. */
export function resolveLiryShareUrl(configured:unknown,origin:unknown):string|null{
 const candidate=typeof configured==="string"&&configured.trim()?configured.trim():origin;
 if(typeof candidate!=="string")return null;
 let parsed:URL;
 try{parsed=new URL(candidate);}catch{return null;}
 if(parsed.protocol!=="https:"&&!(parsed.protocol==="http:"&&["localhost","127.0.0.1"].includes(parsed.hostname)))return null;
 if(parsed.username||parsed.password||parsed.search||parsed.hash)return null;
 if(parsed.pathname!=="/"&&parsed.pathname!=="/lirygames"&&parsed.pathname!=="/lirygames/")return null;
 return new URL("/lirygames",parsed.origin).toString();
}
