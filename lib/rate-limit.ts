import { createHash,createHmac } from "node:crypto";
import { createSupabaseServiceClient } from "./supabase/service";

function clientAddress(request:Request){
  const forwarded=request.headers.get("x-forwarded-for")||"";
  const first=forwarded.split(",")[0]?.trim();
  return first||request.headers.get("x-real-ip")||"unknown";
}

function hashKey(value:string){
  const secret=process.env.RATE_LIMIT_SECRET||process.env.SUPABASE_SECRET_KEY;
  return secret
    ?createHmac("sha256",secret).update(value).digest("hex")
    :createHash("sha256").update(value).digest("hex");
}

type LocalBucket={windowStart:number;count:number};
const globalRateState=globalThis as typeof globalThis & {__fragmentunRateLimit?:Map<string,LocalBucket>};

function localFallback(key:string,windowSeconds:number,limit:number){
  const now=Math.floor(Date.now()/1000);
  const windowStart=Math.floor(now/windowSeconds)*windowSeconds;
  const store=globalRateState.__fragmentunRateLimit??(globalRateState.__fragmentunRateLimit=new Map());
  const current=store.get(key);
  const next=current&&current.windowStart===windowStart
    ?{windowStart,count:current.count+1}
    :{windowStart,count:1};
  store.set(key,next);

  if(store.size>5000){
    for(const[k,v]of store){
      if(v.windowStart+windowSeconds<now)store.delete(k);
      if(store.size<=4000)break;
    }
  }
  return next.count<=limit;
}

export async function consumePublicRateLimit(
  request:Request,
  route:string,
  discriminator:string,
  windowSeconds:number,
  limit:number
){
  const ip=clientAddress(request);
  const keyHash=hashKey(`${route}|${ip}|${discriminator}`);

  try{
    const supabase=createSupabaseServiceClient();
    const {data,error}=await supabase.rpc("consume_rate_limit",{
      p_route:route,
      p_key_hash:keyHash,
      p_window_seconds:windowSeconds,
      p_limit:limit
    });
    if(error)return {allowed:localFallback(keyHash,windowSeconds,limit),degraded:true};
    return {allowed:data===true,degraded:false};
  }catch{
    return {allowed:localFallback(keyHash,windowSeconds,limit),degraded:true};
  }
}
