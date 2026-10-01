import { NextRequest,NextResponse } from "next/server";

const AMAZON_FRAGMENTUN_I="https://www.amazon.com/dp/B0HBLTHT8S";

function clean(v:string|null,max=200){return String(v??"").slice(0,max);}

export async function GET(request:NextRequest){
  const q=new URL(request.url).searchParams;
  const locale=q.get("locale")==="en"?"en":"es";
  const source=clean(q.get("utm_source"))||"email";
  const medium=clean(q.get("utm_medium"))||"email";
  const campaign=clean(q.get("utm_campaign"));
  const content=clean(q.get("utm_content"));

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(url&&key){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};
    fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"amazon_click",
        locale,
        path:"/go/amazon",
        source,medium,campaign,content,
        metadata:{book:"fragmentun-i",placement:"email_or_external_redirect",marketplace:"amazon.com"}
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  return NextResponse.redirect(AMAZON_FRAGMENTUN_I,302);
}
