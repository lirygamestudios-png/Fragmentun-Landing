import { NextResponse } from "next/server";

export async function GET(){
  const started=Date.now();
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  let supabase=false;
  if(url&&key){
    const r=await fetch(`${url}/rest/v1/`,{
      headers:{apikey:key,Authorization:`Bearer ${key}`},
      cache:"no-store"
    }).catch(()=>null);
    supabase=!!r&&r.status<500;
  }

  const ok=!!url&&!!key&&supabase;

  return NextResponse.json({
    ok,
    app:"fragmentun-landing",
    supabase,
    response_ms:Date.now()-started
  },{
    status:ok?200:503,
    headers:{"Cache-Control":"no-store"}
  });
}
