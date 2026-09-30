import { NextRequest,NextResponse } from "next/server";

const ML="https://connect.mailerlite.com/api/subscribers";

export async function POST(request:NextRequest){
  const form=await request.formData();
  const email=String(form.get("email")??"").trim();
  const name=String(form.get("name")??"").trim();
  const locale=String(form.get("locale")??"es")==="en"?"en":"es";
  const source=String(form.get("utm_source")??"");
  const medium=String(form.get("utm_medium")??"");
  const campaign=String(form.get("utm_campaign")??"");
  const content=String(form.get("utm_content")??"");

  if(!email||!email.includes("@")) return NextResponse.redirect(new URL(`/${locale}?signup=invalid#capitulo`,request.url),303);

  const token=process.env.MAILERLITE_API_TOKEN;
  const group=locale==="en"?process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN:process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES;
  if(!token||!group) return NextResponse.redirect(new URL(`/${locale}?signup=unconfigured#capitulo`,request.url),303);

  const ml=await fetch(ML,{
    method:"POST",
    headers:{Authorization:`Bearer ${token}`,"Content-Type":"application/json",Accept:"application/json"},
    body:JSON.stringify({email,fields:name?{name}:undefined,groups:[group],status:"active"}),
    cache:"no-store"
  });
  if(!ml.ok) return NextResponse.redirect(new URL(`/${locale}?signup=error#capitulo`,request.url),303);

  const data=await ml.json().catch(()=>({}));
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(url&&key){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};

    await fetch(`${url}/functions/v1/collect-lead`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        email,name,locale,source,medium,campaign,content,
        mailerlite_subscriber_id:data?.data?.id??null
      }),
      cache:"no-store"
    }).catch(()=>{});

    await fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"lead_submit",locale,path:`/${locale}`,source,medium,campaign,content
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  return NextResponse.redirect(new URL(`/${locale}/gracias`,request.url),303);
}
