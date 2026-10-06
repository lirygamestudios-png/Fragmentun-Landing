import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import { createSupabaseServiceClient } from "../../../../lib/supabase/service";

async function admin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  if(!(await hasSatisfiedMfa(supabase)))return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:p?.role==="admin",supabase};
}

export async function GET(){
  const env=(upper:string,lower:string)=>(process.env[upper]||process.env[lower]||"").trim();
  const x=await admin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const checks:any[]=[
    {key:"supabase_url",label:"Supabase URL",ok:!!process.env.NEXT_PUBLIC_SUPABASE_URL,required:true,category:"Infraestructura"},
    {key:"supabase_key",label:"Supabase publishable key",ok:!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,required:true,category:"Infraestructura"},
    {key:"supabase_service",label:"Supabase servicio privado",ok:!!process.env.SUPABASE_SECRET_KEY,required:false,category:"Seguridad",detail:process.env.SUPABASE_SECRET_KEY?"Disponible · rate limiting central habilitable":"No configurado · rate limiting usa fallback local"},
    {key:"rate_limit_secret",label:"Secreto dedicado antiabuso",ok:!!process.env.RATE_LIMIT_SECRET,required:false,category:"Seguridad",detail:process.env.RATE_LIMIT_SECRET?"Configurado":"No configurado · se usa fallback seguro"},
    {key:"chapter_access",label:"Protección Capítulo 1",ok:!!(process.env.CHAPTER_ACCESS_SECRET||process.env.MAILERLITE_API_TOKEN||process.env.SUPABASE_SECRET_KEY),required:true,category:"Seguridad",detail:(process.env.CHAPTER_ACCESS_SECRET||process.env.MAILERLITE_API_TOKEN||process.env.SUPABASE_SECRET_KEY)?"Firma HMAC disponible":"Falta secreto de firma"},
    {key:"site_url",label:"URL pública del sitio",ok:!!env("NEXT_PUBLIC_SITE_URL","next_public_site_url"),required:true,category:"Infraestructura"},
    {key:"patreon",label:"Patreon",ok:!!env("NEXT_PUBLIC_PATREON_URL","next_public_patreon_url"),required:false,category:"Canales"},
    {key:"instagram",label:"Instagram oficial",ok:!!env("NEXT_PUBLIC_INSTAGRAM_URL","next_public_instagram_url"),required:false,category:"Canales"},
    {key:"youtube",label:"YouTube oficial",ok:!!env("NEXT_PUBLIC_YOUTUBE_URL","next_public_youtube_url"),required:false,category:"Canales"},
    {key:"facebook",label:"Facebook oficial",ok:!!env("NEXT_PUBLIC_FACEBOOK_URL","next_public_facebook_url"),required:false,category:"Canales"},
    {key:"facebook_community",label:"Comunidad Facebook",ok:!!env("NEXT_PUBLIC_FACEBOOK_COMMUNITY_URL","next_public_facebook_community_url"),required:false,category:"Canales"},
    {key:"mailerlite_token",label:"MailerLite API token",ok:!!process.env.MAILERLITE_API_TOKEN,required:true,category:"Integraciones"},
    {key:"mailerlite_es",label:"MailerLite grupo ES",ok:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES,required:true,category:"Integraciones"},
    {key:"mailerlite_en",label:"MailerLite grupo EN",ok:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN,required:false,category:"Integraciones"}
  ];

  const started=Date.now();
  const serviceConfigured=!!process.env.SUPABASE_SECRET_KEY;

  let contentCount=0,characterCount=0,mediaCount=0,analyticsCount=0,leadCount=0;
  let contentError:any=null,characterError:any=null,mediaError:any=null,analyticsError:any=null,leadError:any=null,bucketsError:any=null;
  let latestAnalytics:any=null,latestLead:any=null,leadHealth:any[]=[];
  let buckets:any[]=[];

  const dbClient=serviceConfigured?createSupabaseServiceClient():x.supabase;
  const dbResults=await Promise.all([
    dbClient.from("localized_content").select("*",{count:"exact",head:true}),
    dbClient.from("characters").select("*",{count:"exact",head:true}).eq("status","published"),
    dbClient.from("media_assets").select("*",{count:"exact",head:true}).eq("public_visible",true),
    dbClient.from("analytics_events").select("*",{count:"exact",head:true}),
    dbClient.from("leads").select("*",{count:"exact",head:true}),
    dbClient.from("analytics_events").select("created_at,event_name").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    dbClient.from("leads").select("created_at,mailerlite_status").order("created_at",{ascending:false}).limit(1).maybeSingle(),
    dbClient.from("leads").select("mailerlite_status")
  ]);
  contentCount=dbResults[0].count||0;contentError=dbResults[0].error;
  characterCount=dbResults[1].count||0;characterError=dbResults[1].error;
  mediaCount=dbResults[2].count||0;mediaError=dbResults[2].error;
  analyticsCount=dbResults[3].count||0;analyticsError=dbResults[3].error;
  leadCount=dbResults[4].count||0;leadError=dbResults[4].error;
  latestAnalytics=dbResults[5].data||null;
  latestLead=dbResults[6].data||null;
  leadHealth=dbResults[7].data||[];

  if(serviceConfigured){
    const service=createSupabaseServiceClient();
    const storageResult=await service.storage.listBuckets();
    buckets=storageResult.data||[];
    bucketsError=storageResult.error;
  }else{
    bucketsError={message:"advanced_diagnostics_not_configured"};
  }

  const queryMs=Date.now()-started;
  const storageNames=new Set((buckets||[]).map((b:any)=>b.name));
  const expectedBuckets=["editorial-media","official-media","press-kit"];
  const storageReady=serviceConfigured&&!bucketsError&&expectedBuckets.every(name=>storageNames.has(name));

  checks.push(
    {key:"db_content",label:"CMS localizado accesible",ok:!contentError&&(contentCount||0)>0,required:true,category:"Datos",detail:`${contentCount||0} bloques`},
    {key:"db_characters",label:"Personajes publicados",ok:!characterError&&(characterCount||0)>=5,required:true,category:"Datos",detail:`${characterCount||0} publicados`},
    {key:"db_media",label:"Biblioteca multimedia pública",ok:!mediaError&&(mediaCount||0)>0,required:true,category:"Datos",detail:`${mediaCount||0} recursos`},
    {key:"analytics_pipeline",label:"Pipeline Analytics",ok:!analyticsError,required:true,category:"Operación",detail:`${analyticsCount||0} eventos · último ${latestAnalytics?.created_at||"—"}`},
    {key:"lead_pipeline",label:"Pipeline Leads",ok:!leadError,required:true,category:"Operación",detail:`${leadCount||0} leads · último ${latestLead?.created_at||"—"}`},
    {key:"storage",label:"Supabase Storage",ok:serviceConfigured?storageReady:true,required:false,category:"Infraestructura",detail:serviceConfigured?(storageReady?"Buckets esperados disponibles":"Revisar buckets"):"Diagnóstico avanzado no configurado"},
    {key:"db_latency",label:"Latencia de comprobación Backend",ok:queryMs<3000,required:false,category:"Operación",detail:`${queryMs} ms`}
  );

  const mlToken=process.env.MAILERLITE_API_TOKEN;
  let mailerliteReachable=false;
  let mailerliteHttp:number|null=null;
  if(mlToken){
    const ml=await fetch("https://connect.mailerlite.com/api/subscribers?limit=1",{
      headers:{Authorization:`Bearer ${mlToken}`,Accept:"application/json"},
      cache:"no-store",
      signal:AbortSignal.timeout(6000)
    }).catch(()=>null);
    mailerliteHttp=ml?.status??null;
    mailerliteReachable=!!ml?.ok;
  }
  checks.push({
    key:"mailerlite_health",
    label:"MailerLite API responde",
    ok:mailerliteReachable,
    required:true,
    category:"Integraciones",
    detail:mailerliteHttp?`HTTP ${mailerliteHttp}`:(mlToken?"Sin respuesta":"Sin token")
  });

  const leadStatuses=(leadHealth||[]).reduce((acc:any,row:any)=>{
    const key=row.mailerlite_status||"unknown";
    acc[key]=(acc[key]||0)+1;
    return acc;
  },{});

  const{data:book}=await x.supabase
    .from("book_editions")
    .select("amazon_url,status,locale,marketplace")
    .eq("locale","es")
    .eq("status","published")
    .limit(1)
    .maybeSingle();

  checks.push({
    key:"amazon_es",
    label:"Amazon edición ES",
    ok:!!book?.amazon_url,
    required:true,
    category:"Comercial"
  });

  const[{count:allowlistCount},{count:profileCount}]=await Promise.all([
    x.supabase.from("admin_access_allowlist").select("*",{count:"exact",head:true}),
    x.supabase.from("admin_profiles").select("*",{count:"exact",head:true})
  ]);

  checks.push({
    key:"admin_provisioning",
    label:"Perfiles administrativos aprovisionados",
    ok:(profileCount||0)>0,
    required:true,
    category:"Seguridad"
  });

  const blockers=checks.filter(c=>c.required&&!c.ok);
  const optionalPending=checks.filter(c=>!c.required&&!c.ok);

  return NextResponse.json({
    checks,
    admin_access:{
      allowlisted:allowlistCount||0,
      provisioned:profileCount||0
    },
    operations:{
      query_ms:queryMs,
      content_blocks:contentCount||0,
      published_characters:characterCount||0,
      public_media:mediaCount||0,
      analytics_events:analyticsCount||0,
      leads:leadCount||0,
      latest_analytics_at:latestAnalytics?.created_at||null,
      latest_analytics_event:latestAnalytics?.event_name||null,
      latest_lead_at:latestLead?.created_at||null,
      storage_buckets:[...(storageNames as any)],
      mailerlite_http:mailerliteHttp,
      mailerlite_reachable:mailerliteReachable,
      lead_sync:leadStatuses
    },
    ready_required:blockers.length===0,
    launch_status:blockers.length===0?"GO":"NO_GO",
    blockers:blockers.map(c=>({key:c.key,label:c.label})),
    blocker_count:blockers.length,
    optional_pending:optionalPending.map(c=>({key:c.key,label:c.label})),
    configured:checks.filter(c=>c.ok).length,
    total:checks.length
  });
}
