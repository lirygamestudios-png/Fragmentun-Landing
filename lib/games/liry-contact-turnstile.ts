/** Verificación antirrobot obligatoria, falla de forma segura si faltan claves. */
export async function verifyLiryContactTurnstile(token:unknown):Promise<boolean>{
 const secret=process.env.LIRY_TURNSTILE_SECRET_KEY;
 if(!secret||typeof token!=="string"||token.length<1||token.length>2048)return false;
 try{
  const result=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
   method:"POST",headers:{"Content-Type":"application/json"},
   body:JSON.stringify({secret,response:token}),cache:"no-store",signal:AbortSignal.timeout(7000)
  });
  if(!result.ok)return false;
  const data:unknown=await result.json();
  return !!data&&typeof data==="object"&&!Array.isArray(data)&&(data as {success?:unknown}).success===true;
 }catch{return false;}
}
