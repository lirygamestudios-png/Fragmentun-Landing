import {NextResponse} from "next/server";
import {createHmac,timingSafeEqual} from "node:crypto";
import {createSupabaseServiceClient} from "../../../../../lib/supabase/service";
import {consumePublicRateLimit} from "../../../../../lib/rate-limit";

export const runtime="nodejs";

function secureEqualHex(a:string,b:string){
  try{
    const ab=Buffer.from(a,"hex");
    const bb=Buffer.from(b,"hex");
    return ab.length===bb.length&&timingSafeEqual(ab,bb);
  }catch{return false;}
}

function verifySignature(raw:string,timestamp:string,signature:string,secret:string){
  const ts=Number(timestamp);
  if(!Number.isFinite(ts)) return false;
  const now=Math.floor(Date.now()/1000);
  if(Math.abs(now-ts)>300) return false;
  const expected=createHmac("sha256",secret).update(timestamp+"."+raw).digest("hex");
  return secureEqualHex(expected,signature);
}

function integer(value:unknown,fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?Math.trunc(n):fallback;
}

function nonNegative(value:unknown,fallback=0){
  return Math.max(0,integer(value,fallback));
}

export async function POST(request:Request){
  const secret=process.env.GAME_INGEST_SECRET;
  if(!secret) return NextResponse.json({ok:false,error:"ingest_not_configured"},{status:503});

  const timestamp=request.headers.get("x-lirygames-timestamp")||"";
  const signature=request.headers.get("x-lirygames-signature")||"";
  const raw=await request.text();

  if(!verifySignature(raw,timestamp,signature,secret)){
    return NextResponse.json({ok:false,error:"invalid_signature"},{status:401});
  }

  let body:any;
  try{body=JSON.parse(raw);}catch{
    return NextResponse.json({ok:false,error:"invalid_json"},{status:400});
  }

  const eventType=String(body?.event_type||"");
  const discriminator=String(body?.provider||body?.platform||body?.game_id||eventType||"game");
  const rate=await consumePublicRateLimit(request,"/api/games/monetization/ingest",discriminator,60,240);
  if(!rate.allowed) return NextResponse.json({ok:false,error:"rate_limited"},{status:429});

  const supabase=createSupabaseServiceClient();

  if(eventType==="purchase"){
    const gameId=String(body?.game_id||"").trim();
    const itemId=body?.item_id?String(body.item_id):null;
    const offerId=body?.offer_id?String(body.offer_id):null;
    const playerRef=String(body?.player_ref||"").trim();
    const platform=String(body?.platform||"").trim();
    const provider=String(body?.provider||"").trim();
    const externalTransactionId=String(body?.external_transaction_id||"").trim();
    const currency=String(body?.currency||"USD").trim().toUpperCase();
    const status=String(body?.status||"pending");
    const sourceChannel=String(body?.source_channel||"in_game");
    const quantity=Math.max(1,integer(body?.quantity,1));
    const grossCents=nonNegative(body?.gross_cents);
    const feeCents=nonNegative(body?.fee_cents);
    const taxCents=nonNegative(body?.tax_cents);
    const netCents=body?.net_cents==null?Math.max(0,grossCents-feeCents-taxCents):nonNegative(body.net_cents);
    const purchasedAt=body?.purchased_at?String(body.purchased_at):new Date().toISOString();

    const allowedStatus=new Set(["pending","paid","refunded","partially_refunded","failed","canceled","chargeback"]);
    const allowedSource=new Set(["in_game","web","platform_store","promo","admin_grant","other"]);

    if(!gameId||!playerRef||!platform||!provider||!externalTransactionId||!/^[A-Z]{3}$/.test(currency)||!allowedStatus.has(status)||!allowedSource.has(sourceChannel)){
      return NextResponse.json({ok:false,error:"invalid_purchase"},{status:400});
    }

    const {data:purchase,error:purchaseError}=await supabase
      .from("game_purchase_events")
      .upsert({
        game_id:gameId,item_id:itemId,offer_id:offerId,player_ref:playerRef,platform,provider,
        external_transaction_id:externalTransactionId,quantity,gross_cents:grossCents,
        fee_cents:feeCents,tax_cents:taxCents,net_cents:netCents,currency,status,
        source_channel:sourceChannel,purchased_at:purchasedAt,metadata:body?.metadata||{}
      },{onConflict:"provider,external_transaction_id"})
      .select("id,item_id,status")
      .single();

    if(purchaseError) return NextResponse.json({ok:false,error:"purchase_write_failed"},{status:500});

    if(itemId&&purchase?.id){
      if(status==="paid"||status==="partially_refunded"){
        const {data:item}=await supabase.from("game_virtual_items").select("grant_type,duration_seconds").eq("id",itemId).maybeSingle();
        const expiresAt=item?.grant_type==="timed"&&item?.duration_seconds
          ?new Date(Date.now()+Number(item.duration_seconds)*1000).toISOString()
          :null;
        await supabase.from("game_entitlements").upsert({
          game_id:gameId,player_ref:playerRef,item_id:itemId,purchase_id:purchase.id,
          quantity,status:"active",granted_at:new Date().toISOString(),expires_at:expiresAt,
          revoked_at:null,metadata:{source:"purchase_ingest"}
        },{onConflict:"purchase_id,item_id"});
      }else if(["refunded","chargeback","canceled"].includes(status)){
        await supabase.from("game_entitlements").update({
          status:"revoked",revoked_at:new Date().toISOString(),updated_at:new Date().toISOString()
        }).eq("purchase_id",purchase.id).eq("item_id",itemId);
      }
    }

    return NextResponse.json({ok:true,event_type:"purchase",purchase_id:purchase?.id,rate_limit_degraded:rate.degraded});
  }

  if(eventType==="engagement_daily"){
    const metricDate=String(body?.metric_date||"").trim();
    const gameId=String(body?.game_id||"").trim();
    const platform=String(body?.platform||"all").trim()||"all";
    if(!/^\d{4}-\d{2}-\d{2}$/.test(metricDate)||!gameId){
      return NextResponse.json({ok:false,error:"invalid_engagement"},{status:400});
    }

    const {error}=await supabase.from("game_engagement_daily").upsert({
      metric_date:metricDate,game_id:gameId,platform,
      active_players:nonNegative(body?.active_players),
      new_players:nonNegative(body?.new_players),
      sessions:nonNegative(body?.sessions),
      session_minutes:nonNegative(body?.session_minutes),
      metadata:body?.metadata||{},
      updated_at:new Date().toISOString()
    },{onConflict:"metric_date,game_id,platform"});

    if(error) return NextResponse.json({ok:false,error:"engagement_write_failed"},{status:500});
    return NextResponse.json({ok:true,event_type:"engagement_daily",rate_limit_degraded:rate.degraded});
  }

  return NextResponse.json({ok:false,error:"unsupported_event_type"},{status:400});
}
