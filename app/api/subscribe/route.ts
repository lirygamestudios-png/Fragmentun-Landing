import { NextRequest,NextResponse } from "next/server";

const ML="https://connect.mailerlite.com/api/subscribers";

function clean(value:FormDataEntryValue|null,max=200){
  return String(value??"").trim().slice(0,max);
}

export async function POST(request:NextRequest){
  const form=await request.formData();
  const email=clean(form.get("email"),320).toLowerCase();
  const name=clean(form.get("name"));
  const locale=clean(form.get("locale"))==="en"?"en":"es";
  const source=clean(form.get("utm_source"));
  const medium=clean(form.get("utm_medium"));
  const campaign=clean(form.get("utm_campaign"));
  const content=clean(form.get("utm_content"));
  const consentMarketing=form.get("consent_marketing")==="yes";
  const consentVersion=clean(form.get("consent_version"),50)||"2026-09-30";
  const honeypot=clean(form.get("website"));

  if(honeypot) return NextResponse.redirect(new URL(`/${locale}/gracias`,request.url),303);
  if(!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.redirect(new URL(`/${locale}?signup=invalid#capitulo`,request.url),303);
  }
  if(!consentMarketing) {
    return NextResponse.redirect(new URL(`/${locale}?signup=consent#capitulo`,request.url),303);
  }

  const token=process.env.MAILERLITE_API_TOKEN;
  const group=locale==="en"
    ?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN
    :process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;

  let mailerliteStatus:"pending"|"synced"|"error"|"unconfigured"="unconfigured";
  let mailerliteSubscriberId:string|null=null;
  let lastError:string|null=null;

  if(token&&group){
    const ml=await fetch(ML,{
      method:"POST",
      headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},
      body:JSON.stringify({email,fields:name?{name}:undefined,groups:[group],status:"active"}),
      cache:"no-store"
    }).catch(()=>null);

    if(ml?.ok){
      const data=await ml.json().catch(()=>({}));
      mailerliteStatus="synced";
      mailerliteSubscriberId=data?.data?.id??null;
    }else{
      mailerliteStatus="error";
      lastError=ml? `MailerLite HTTP ${ml.status}` : "MailerLite request failed";
    }
  }

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(url&&key){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};

    await fetch(`${url}/functions/v1/collect-lead`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        email,name,locale,source,medium,campaign,content,
        mailerlite_subscriber_id:mailerliteSubscriberId,
        mailerlite_status:mailerliteStatus,
        last_error:lastError,
        consent_marketing:true,
        consent_version:consentVersion
      }),
      cache:"no-store"
    }).catch(()=>{});

    await fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"lead_submit",
        locale,
        path:`/${locale}`,
        source,medium,campaign,content,
        metadata:{mailerlite_status:mailerliteStatus}
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  const delivery=mailerliteStatus==="synced"?"email":"pending";
  return NextResponse.redirect(new URL(`/${locale}/gracias?delivery=${delivery}`,request.url),303);
}
