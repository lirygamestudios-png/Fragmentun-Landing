import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const allowedStatuses = new Set(["pending","synced","error","unconfigured"]);
const allowedProfiles = new Set(["vorax","umbral","ethelis","nara","balance"]);

async function hashKey(value:string){
  const bytes=new TextEncoder().encode(value);
  const digest=await crypto.subtle.digest("SHA-256",bytes);
  return Array.from(new Uint8Array(digest)).map(b=>b.toString(16).padStart(2,"0")).join("");
}

async function rateLimit(supabase:any,req:Request,email:string){
  const ip=(req.headers.get("x-forwarded-for")||req.headers.get("cf-connecting-ip")||"unknown").split(",")[0].trim();
  const key=await hashKey(`lead|${ip}|${email}`);
  const {data,error}=await supabase.rpc("consume_rate_limit",{
    p_route:"lead_edge",p_key_hash:key,p_window_seconds:3600,p_limit:8
  });
  return error ? true : data===true;
}

async function verifySignedLead(req:Request, rawBody:string, secret:string):Promise<boolean>{
  const stamp=req.headers.get("x-fragmentun-timestamp")??"";
  const provided=req.headers.get("x-fragmentun-signature")??"";
  if(!/^\d{10}$/.test(stamp)||!/^[a-f0-9]{64}$/.test(provided))return false;
  if(Math.abs(Math.floor(Date.now()/1000)-Number(stamp))>300)return false;
  const encoder=new TextEncoder();
  const key=await crypto.subtle.importKey("raw",encoder.encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
  const signed=await crypto.subtle.sign("HMAC",key,encoder.encode(stamp+"."+rawBody));
  const expected=new Uint8Array(signed);
  const supplied=new Uint8Array(provided.match(/.{2}/g)!.map(x=>parseInt(x,16)));
  let difference=0;
  for(let i=0;i<expected.length;i++)difference|=expected[i]^supplied[i];
  return difference===0;
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const rawBody=await req.text();
  const authSecret=Deno.env.get("FRAGMENTUN_LEAD_AUTH_SECRET");
  if(authSecret&&!await verifySignedLead(req,rawBody,authSecret)){
    return Response.json({ok:false,error:"unauthorized_lead_request"},{status:401});
  }
  const body = (()=>{try{return JSON.parse(rawBody)}catch{return null}})();
  const email = String(body?.email ?? "").trim().toLowerCase();
  const consentMarketing = body?.consent_marketing === true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return Response.json({ ok:false, error:"invalid_email" }, { status:400 });
  }
  if (!consentMarketing) {
    return Response.json({ ok:false, error:"consent_required" }, { status:400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession:false } }
  );

  if(!(await rateLimit(supabase,req,email))){
    return Response.json({ok:false,error:"rate_limited"},{status:429});
  }

  const { data:existing } = await supabase
    .from("leads")
    .select("id,name,locale,source,medium,campaign,content,session_id,mailerlite_subscriber_id,mailerlite_status,last_error,emotional_profile,emotional_scores,consent_version,consented_at")
    .eq("email",email)
    .maybeSingle();

  const statusRaw = String(body?.mailerlite_status ?? "pending");
  const requestedStatus = allowedStatuses.has(statusRaw) ? statusRaw : "pending";
  const profileRaw = String(body?.emotional_profile ?? "").toLowerCase();
  const requestedProfile = allowedProfiles.has(profileRaw) ? profileRaw : null;
  const requestedScores =
    body?.emotional_scores && typeof body.emotional_scores === "object"
      ? body.emotional_scores
      : {};

  const preserveSynced = existing?.mailerlite_status === "synced" && requestedStatus !== "synced";
  const mailerliteStatus = preserveSynced ? "synced" : requestedStatus;
  const mailerliteSubscriberId = preserveSynced
    ? existing?.mailerlite_subscriber_id ?? null
    : String(body?.mailerlite_subscriber_id ?? "").slice(0,200) || existing?.mailerlite_subscriber_id || null;
  const lastError = preserveSynced
    ? existing?.last_error ?? null
    : String(body?.last_error ?? "").slice(0,500) || null;

  const payload = {
    email,
    name: String(body?.name ?? "").trim().slice(0,200) || existing?.name || null,
    locale: body?.locale === "en" ? "en" : (existing?.locale || "es"),
    source: String(body?.source ?? "").slice(0,200) || existing?.source || null,
    medium: String(body?.medium ?? "").slice(0,200) || existing?.medium || null,
    campaign: String(body?.campaign ?? "").slice(0,200) || existing?.campaign || null,
    content: String(body?.content ?? "").slice(0,200) || existing?.content || null,
    session_id: String(body?.session_id ?? "").slice(0,200) || existing?.session_id || null,
    mailerlite_subscriber_id: mailerliteSubscriberId,
    consent_marketing: true,
    consent_version: String(body?.consent_version ?? existing?.consent_version ?? "2026-09-30").slice(0,50),
    consented_at: existing?.consented_at || new Date().toISOString(),
    mailerlite_status: mailerliteStatus,
    last_error: lastError,
    emotional_profile: requestedProfile || existing?.emotional_profile || null,
    emotional_scores: Object.keys(requestedScores).length ? requestedScores : (existing?.emotional_scores || {})
  };

  // The signed path claims the signature and stores the lead in ONE DB transaction.
  // An upsert failure rolls back the claim; a replay cannot write the lead twice.
  let lead: {id:string}|null = null;
  let error: {message:string}|null = null;
  if(authSecret){
    const signature=req.headers.get("x-fragmentun-signature")??"";
    const result=await supabase.rpc("fragmentun_store_signed_lead",{
      p_signature:signature,p_lead:payload
    });
    if(result.error){
      error={message:result.error.message};
    }else if(result.data?.[0]?.accepted!==true){
      return Response.json({ok:false,error:"duplicate_lead_request"},{status:409});
    }else{
      lead={id:String(result.data[0].lead_id)};
    }
  }else{
    const result=await supabase.from("leads").upsert(payload,{onConflict:"email"}).select("id").single();
    lead=result.data;
    error=result.error;
  }

  if(!error){
    await supabase.from("integration_logs").insert({
      integration:"mailerlite",
      event_type:existing ? "lead_update" : "lead_create",
      status:mailerliteStatus==="synced" ? "success" : (mailerliteStatus==="error" ? "error" : "info"),
      entity_type:"lead",
      entity_id:String(lead?.id ?? existing?.id ?? email),
      message:lastError || null,
      metadata:{
        mailerlite_status:mailerliteStatus,
        locale:payload.locale,
        source:payload.source,
        campaign:payload.campaign,
        preserved_synced:preserveSynced
      }
    });
  }

  return Response.json({ ok:!error, error:error?.message ?? null }, { status:error ? 500 : 200 });
});