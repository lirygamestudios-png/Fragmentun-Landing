import { NextRequest,NextResponse } from "next/server";

const PATREON_BASE="https://patreon.com/sagaFragmentun";

function clean(v:string|null,max=200){return String(v??"").slice(0,max);}

export async function GET(request:NextRequest){
  const q=new URL(request.url).searchParams;
  const locale=q.get("locale")==="en"?"en":"es";
  const source=clean(q.get("utm_source"))||"email";
  const medium=clean(q.get("utm_medium"))||"email";
  const campaign=clean(q.get("utm_campaign"))||"fragmentun_patreon";
  const content=clean(q.get("utm_content"));

  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if(url&&key){
    const headers={"Content-Type":"application/json","apikey":key,"Authorization":`Bearer ${key}`};
    fetch(`${url}/functions/v1/collect-analytics`,{
      method:"POST",
      headers,
      body:JSON.stringify({
        event_name:"patreon_click",
        locale,
        path:"/go/patreon",
        source,medium,campaign,content,
        metadata:{placement:"email_or_external_redirect",creator:"sagaFragmentun"}
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
