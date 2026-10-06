import {createHmac,timingSafeEqual} from "node:crypto";

const COOKIE="fragmentun_chapter_access";
const MAX_AGE=60*60*24*30;

function secret(){
  return process.env.CHAPTER_ACCESS_SECRET||process.env.MAILERLITE_API_TOKEN||process.env.SUPABASE_SECRET_KEY||"";
}

function signature(expires:string){
  const key=secret();
  if(!key)return "";
  return createHmac("sha256",key).update(expires).digest("hex");
}

export function chapterAccessCookieName(){
  return COOKIE;
}

export function createChapterAccessToken(){
  const expires=String(Math.floor(Date.now()/1000)+MAX_AGE);
  const sig=signature(expires);
  return sig?`${expires}.${sig}`:"";
}

export function verifyChapterAccessToken(token:string|undefined|null){
  if(!token)return false;
  const [expires,sig]=token.split(".");
  if(!expires||!sig||!/^[0-9]+$/.test(expires))return false;
  if(Number(expires)<Math.floor(Date.now()/1000))return false;
  const expected=signature(expires);
  if(!expected||expected.length!==sig.length)return false;
  try{
    return timingSafeEqual(Buffer.from(expected),Buffer.from(sig));
  }catch{
    return false;
  }
}

export function chapterAccessMaxAge(){
  return MAX_AGE;
}
