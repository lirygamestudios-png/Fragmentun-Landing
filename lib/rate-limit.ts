import { createHmac } from "node:crypto";
import { createSupabaseServiceClient } from "./supabase/service";

function clientAddress(request:Request){
  const forwarded=request.headers.get("x-forwarded-for")||"";
  const first=forwarded.split(",")[0]?.trim();
  return first||request.headers.get("x-real-ip")||"unknown";
}

function hashKey(value:string){
  const secret=process.env.RATE_LIMIT_SECRET||process.env.SUPABASE_SECRET_KEY||"fragmentun-rate-limit";
  return createHmac("sha256",secret).update(value).digest("hex");
}

export async function consumePublicRateLimit(
  request:Request,
  route:string,
  discriminator:string,
  windowSeconds:number,
  limit:number
){
  try{
    const ip=clientAddress(request);
    const keyHash=hashKey(`${route}|${ip}|${discriminator}`);
    const supabase=createSupabaseServiceClient();
    const {data,error}=await supabase.rpc("consume_rate_limit",{
      p_route:route,
      p_key_hash:keyHash,
      p_window_seconds:windowSeconds,
      p_limit:limit
    });
    if(error)return {allowed:true,degraded:true};
    return {allowed:data===true,degraded:false};
  }catch{
    return {allowed:true,degraded:true};
  }
}
