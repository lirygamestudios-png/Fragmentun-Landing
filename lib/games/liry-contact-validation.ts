/** Validación de Contacto. No escribe datos ni simula su recepción. */
export const LIRY_CONTACT_SUBJECTS=["opinion","suggestion","problem","business","other"] as const;
export type LiryContactFields={name:string;email:string;subject:string;message:string;gameSlug:string};
export function validateLiryContactPayload(value:unknown):{ok:true;fields:LiryContactFields}|{ok:false;message:string}{
 if(!value||typeof value!=="object"||Array.isArray(value))return {ok:false,message:"Revisa los datos del formulario."};
 const x=value as Record<string,unknown>;
 const name=typeof x.name==="string"?x.name.trim():"";
 const email=typeof x.email==="string"?x.email.trim().toLowerCase():"";
 const subject=typeof x.subject==="string"?x.subject:"";
 const message=typeof x.message==="string"?x.message.trim():"";
 const gameSlug=typeof x.gameSlug==="string"?x.gameSlug.trim():"";
 if(name.length<2||name.length>100||email.length>254||
   !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
   !LIRY_CONTACT_SUBJECTS.includes(subject as typeof LIRY_CONTACT_SUBJECTS[number])||
   message.length<10||message.length>3000||gameSlug.length>80||
   x.privacyAcknowledged!==true)return {ok:false,message:"Revisa los campos y acepta el aviso de privacidad."};
 return {ok:true,fields:{name,email,subject,message,gameSlug}};
}
