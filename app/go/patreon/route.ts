import { NextRequest,NextResponse } from "next/server";

const PATREON_BASE="https://www.patreon.com/15059528/join";

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
        event_name:"patreon_click",
        locale,
        path:"/go/patreon",
        source:source||"direct",medium:medium||"none",campaign,content,session_id:sessionId,
        metadata:{placement:"external_redirect",creator:"sagaFragmentun",human_navigation:humanNavigation,user_agent:userAgent}
      }),
      cache:"no-store"
    }).catch(()=>{});
  }

  const target=new URL(PATREON_BASE);
  target.searchParams.set("utm_source",source||"fragmentun");
  target.searchParams.set("utm_medium",medium||"website");
  target.searchParams.set("utm_campaign",campaign||"patreon_support");
  if(content)target.searchParams.set("utm_content",content);

  return NextResponse.redirect(target,302);
}
