import { NextRequest,NextResponse } from "next/server";

const AMAZON_FRAGMENTUN_I="https://www.amazon.com/dp/B0HBLTHT8S";

function clean(v:string|null,max=200){return String(v??"").slice(0,max);}

export async function GET(request:NextRequest){
  const q=new URL(request.url).searchParams;
  const locale=q.get("locale")==="en"?"en":"es";
  const source=clean(q.get("utm_source"));
  const medium=clean(q.get("utm_medium"));
  const campaign=clean(q.get("utm_campaign"));
  const content=clean(q.get("utm_content"));
  const sessionId=clean(q.get("session_id"),200);
  const hasExternalAttribution=!!(source||medium||campaign||content||sessionId);

  const humanNavigation=request.headers.get("sec-fetch-user")==="?1";
  const userAgent=clean(request.headers.get("user-agent"),300);

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(url&&key&&hasExternalAttribution){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};
    fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"amazon_click",
        locale,
        path:"/go/amazon",
        source:source||"direct",medium:medium||"none",campaign,content,session_id:sessionId,
        metadata:{book:"fragmentun-i",placement:"external_redirect",marketplace:"amazon.com",human_navigation:humanNavigation,user_agent:userAgent}
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  return NextResponse.redirect(AMAZON_FRAGMENTUN_I,302);
}
