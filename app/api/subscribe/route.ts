import { NextRequest,NextResponse } from "next/server";
import { consumePublicRateLimit } from "../../../lib/rate-limit";

const ML="https://connect.mailerlite.com/api/subscribers";
const ML_GROUPS="https://connect.mailerlite.com/api/groups";

function normalizeGroupName(value:string){
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim();
}

function isLikelySecret(value:string){
  return value.startsWith("eyJ") || value.split(".").length===3 || value.length>80;
}

async function resolveMailerLiteGroup(token:string,raw:string,locale:"es"|"en"){
  const value=String(raw||"").trim();

  if(value && !isLikelySecret(value)){
    if(/^\d+$/.test(value)) return {id:Number(value),debug:null};

    const embedded=value.match(/(?:^|\D)(\d{8,})(?:\D|$)/);
    if(embedded?.[1]) return {id:Number(embedded[1]),debug:null};
  }

  const res=await fetch(`${ML_GROUPS}?limit=100`,{
    headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},
    cache:"no-store",
    signal:AbortSignal.timeout(8000)
  }).catch(()=>null);

  if(!res?.ok){
    return {id:null as number|null,debug:res?`groups endpoint HTTP ${res.status}`:"groups endpoint request failed"};
  }

  const data=await res.json().catch(()=>({}));
  const groups=Array.isArray(data?.data)?data.data:[];

  if(value && !isLikelySecret(value)){
    const normalizedConfigured=normalizeGroupName(value);
    const exact=groups.find((g:any)=>normalizeGroupName(String(g?.name||""))===normalizedConfigured);
    if(exact?.id) return {id:Number(exact.id),debug:null};
  }

  const fragmentunGroups=groups.filter((g:any)=>normalizeGroupName(String(g?.name||"")).includes("fragmentun"));

  const languageMatched=fragmentunGroups.filter((g:any)=>{
    const n=` ${normalizeGroupName(String(g?.name||""))} `;
    return locale==="es"
      ? / (es|esp|espanol|spanish) /.test(n)
      : / (en|eng|english|ingles) /.test(n);
  });

  if(languageMatched.length===1 && languageMatched[0]?.id){
    return {id:Number(languageMatched[0].id),debug:null};
  }

  const chapterMatched=fragmentunGroups.filter((g:any)=>{
    const n=normalizeGroupName(String(g?.name||""));
    const hasChapter=/cap(itulo)? ?1|chapter ?1/.test(n);
    const langOk=locale==="es"
      ? /(^| )(es|esp|espanol|spanish)( |$)/.test(n)
      : /(^| )(en|eng|english|ingles)( |$)/.test(n);
    return hasChapter && langOk;
  });

  if(chapterMatched.length===1 && chapterMatched[0]?.id){
    return {id:Number(chapterMatched[0].id),debug:null};
  }

  const safePreview=fragmentunGroups.slice(0,20).map((g:any)=>`${g?.id}:${g?.name}`).join(" | ");
  return {id:null,debug:`fragmentun_groups=${safePreview||"none"}`.slice(0,900)};
}

function clean(value:FormDataEntryValue|null,max=200){
  return String(value??"").trim().slice(0,max);
}

export async function POST(request:NextRequest){
  const origin=request.headers.get("origin");
  const host=request.headers.get("host");
  if(origin&&host){
    try{
      if(new URL(origin).host!==host){
        return NextResponse.json({ok:false,error:"invalid_origin"},{status:403});
      }
    }catch{
      return NextResponse.json({ok:false,error:"invalid_origin"},{status:403});
    }
  }

  const length=Number(request.headers.get("content-length")||"0");
  if(length>20000){
    return NextResponse.json({ok:false,error:"payload_too_large"},{status:413});
  }

  const form=await request.formData();
  const email=clean(form.get("email"),320).toLowerCase();
  const name=clean(form.get("name"));
  const locale=clean(form.get("locale"))==="en"?"en":"es";
  const source=clean(form.get("utm_source"));
  const medium=clean(form.get("utm_medium"));
  const campaign=clean(form.get("utm_campaign"));
  const content=clean(form.get("utm_content"));
  const sessionId=clean(form.get("session_id"),200);
  const consentMarketing=form.get("consent_marketing")==="yes";
  const consentVersion=clean(form.get("consent_version"),50)||"2026-09-30";
  const honeypot=clean(form.get("website"));
  const emotionalProfile=clean(form.get("emotional_profile"),20).toLowerCase();
  const experiment=clean(form.get("experiment"),100);
  const experimentVariant=clean(form.get("experiment_variant"),20);
  const emotionalScoresRaw=clean(form.get("emotional_scores"),1000);
  let emotionalScores:Record<string,number>={};
  try{emotionalScores=JSON.parse(emotionalScoresRaw||"{}")}catch{emotionalScores={}}

  if(honeypot) return NextResponse.redirect(new URL(`/${locale}/gracias`,request.url),303);
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL(`/${locale}?signup=invalid#capitulo`,request.url),303);
  }
  if(!consentMarketing) {
    return NextResponse.redirect(new URL(`/${locale}?signup=consent#capitulo`,request.url),303);
  }

  const rate=await consumePublicRateLimit(request,"lead_submit",email,3600,5);
  if(!rate.allowed){
    return NextResponse.redirect(new URL(`/${locale}?signup=rate#capitulo`,request.url),303);
  }

  const token=process.env.MAILERLITE_API_TOKEN;
  const configuredGroup=locale==="en"
    ?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN
    :process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;

  let mailerliteStatus:"pending"|"synced"|"error"|"unconfigured"="unconfigured";
  let mailerliteSubscriberId:string|null=null;
  let lastError:string|null=null;

  if(token&&configuredGroup){
    const resolvedGroup=await resolveMailerLiteGroup(token,configuredGroup,locale);
    const group=resolvedGroup.id;
    if(!group){
      mailerliteStatus="error";
      lastError=`MailerLite group could not be resolved — ${resolvedGroup.debug||"unknown"}`;
    }else{
    const ml=await fetch(ML,{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({email,fields:name?{name}:undefined,groups:[group],status:"active"}),
      cache:"no-store",
      signal:AbortSignal.timeout(8000)
    }).catch(()=>null);

    if(ml?.ok){
      const data=await ml.json().catch(()=>({}));
      mailerliteStatus="synced";
      mailerliteSubscriberId=data?.data?.id??null;
    }else{
      mailerliteStatus="error";
      if(ml){
        const detail=await ml.json().catch(()=>null);
        const message=detail?.message?String(detail.message):"";
        const errors=detail?.errors&&typeof detail.errors==="object"
          ?Object.entries(detail.errors).map(([k,v])=>`${k}: ${Array.isArray(v)?v.join(", "):String(v)}`).join(" | ")
          :"";
        lastError=[`MailerLite HTTP ${ml.status}`,message,errors].filter(Boolean).join(" — ").slice(0,1000);
      }else{
        lastError="MailerLite request failed";
      }
    }
    }
  }

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let leadStored=false;

  if(url&&key){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};

    const leadResponse=await fetch(`${url}/functions/v1/collect-lead`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        email,name,locale,source,medium,campaign,content,session_id:sessionId,
        mailerlite_subscriber_id:mailerliteSubscriberId,
        mailerlite_status:mailerliteStatus,
        last_error:lastError,
        consent_marketing:true,
        consent_version:consentVersion,
        emotional_profile:["vorax","umbral","ethelis","nara","balance"].includes(emotionalProfile)?emotionalProfile:null,
        emotional_scores:emotionalScores
      }),
      cache:"no-store"
    }).catch(()=>null);

    leadStored=!!leadResponse?.ok;

    await fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"lead_submit",
        locale,
        path:`/${locale}`,
        source,medium,campaign,content,session_id:sessionId,
        metadata:{
          mailerlite_status:mailerliteStatus,
          emotional_profile:["vorax","umbral","ethelis","nara","balance"].includes(emotionalProfile)?emotionalProfile:null,
          experiment:experiment||null,
          experiment_variant:experimentVariant||null
        }
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  if(!leadStored){
    return NextResponse.redirect(new URL(`/${locale}?signup=error#capitulo`,request.url),303);
  }

  const delivery=mailerliteStatus==="synced"?"email":"pending";
  const next=emotionalProfile? `/${locale}/gracias?delivery=${delivery}&profile=${encodeURIComponent(emotionalProfile)}` : `/${locale}/gracias?delivery=${delivery}`;
  return NextResponse.redirect(new URL(next,request.url),303);
}
