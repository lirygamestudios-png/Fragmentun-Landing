import {createHash,timingSafeEqual} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

// P10: Disabled until three server-only variables are deliberately configured.
// Never provide the service credential, editor UUID, or token hash to Mole.
export const runtime="nodejs";
export const dynamic="force-dynamic";
const maxBytes=125000;
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const slugRx=/^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const fields=["slug","title_es","title_en","excerpt_es","excerpt_en","body_es","body_en","image_url"] as const;
type DraftField=(typeof fields)[number];
type Draft=Record<DraftField,string>;
const rejected=(error:string,status:number)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
function authorize(request:NextRequest):boolean{
 const hash=process.env.FRAGMENTUN_MOLE_TOKEN_SHA256;
 const header=request.headers.get("authorization")||"";
 if(!hash||!/^[a-f0-9]{64}$/i.test(hash)||!/^Bearer [A-Za-z0-9._~-]{32,256}$/.test(header))return false;
 const actual=createHash("sha256").update(header.slice(7),"utf8").digest();
 return timingSafeEqual(actual,Buffer.from(hash,"hex"));
}
function config(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.FRAGMENTUN_MOLE_SUPABASE_SERVICE_ROLE_KEY;
 const editor=process.env.FRAGMENTUN_MOLE_EDITOR_UUID;
 if(!url||!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url)||!key||!uuid.test(editor||""))return null;
 return {editor:editor!,db:createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}})};
}
async function parse(request:NextRequest,update:boolean):Promise<{draft:Draft;id?:string}|null>{
 if(!/^application\/json(?:\s*;|$)/i.test(request.headers.get("content-type")||""))return null;
 const length=Number(request.headers.get("content-length")||"0");
 if(length>maxBytes)return null;
 const raw=await request.text();
 if(Buffer.byteLength(raw,"utf8")>maxBytes)return null;
 let input:unknown;
 try{input=JSON.parse(raw);}catch{return null;}
 if(!input||typeof input!=="object"||Array.isArray(input))return null;
 const data=input as Record<string,unknown>;
 const allowed=new Set<string>([...fields,...(update?["id"]:[])]);
 if(Object.keys(data).some(k=>!allowed.has(k)))return null;
 if(update&&(!data.id||typeof data.id!=="string"||!uuid.test(data.id)))return null;
 const draft={} as Draft;
 for(const field of fields){
   if(field==="image_url"&&(data[field]===null||data[field]===undefined)){draft[field]="";continue;}
   if(typeof data[field]!=="string")return null;
   draft[field]=(data[field] as string).trim();
 }
 if(!slugRx.test(draft.slug)||draft.slug.length>90)return null;
 for(const f of ["title_es","title_en"] as const)if(!draft[f]||draft[f].length>180)return null;
 for(const f of ["excerpt_es","excerpt_en"] as const)if(draft[f].length>400)return null;
 for(const f of ["body_es","body_en"] as const)if(!draft[f]||draft[f].length>50000)return null;
 const img=draft.image_url;
 if(img.length>1000||(img&&!/^https:\/\/[^\s]+$/i.test(img)&&!/^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(img)))return null;
 return update?{draft,id:data.id as string}:{draft};
}
async function handle(request:NextRequest,update:boolean){
 if(!authorize(request))return rejected("unauthorized",401);
 const cfg=config();
 if(!cfg)return rejected("integration_disabled",503);
 const parsed=await parse(request,update).catch(()=>null);
 if(!parsed)return rejected("invalid_draft",400);
 const {draft}=parsed;
 // Explicit allowlist: publication state and writer identity are never client-controlled.
 const record={...draft,image_url:draft.image_url||null,updated_by:cfg.editor,
   published_es:false,published_en:false,published_at:null,updated_at:new Date().toISOString()};
 if(!update){
   const {data,error}=await cfg.db.from("fragmentun_blog_posts").insert(record).select("id,slug").single();
   if(error)return rejected(error.code==="23505"?"slug_conflict":"save_failed",error.code==="23505"?409:503);
   return NextResponse.json({data,status:"draft_created"},{status:201,headers:{"Cache-Control":"no-store"}});
 }
 // Compare-and-update predicates: never modify an existing published article or another editor's draft.
 // In particular we do NOT write published_* or published_at in an update request.
 const {published_es,published_en,published_at,...changes}=record;
 void published_es;void published_en;void published_at;
 const {data,error}=await cfg.db.from("fragmentun_blog_posts").update(changes)
   .eq("id",parsed.id!).eq("updated_by",cfg.editor).eq("published_es",false).eq("published_en",false)
   .is("published_at",null).select("id,slug").maybeSingle();
 if(error)return rejected(error.code==="23505"?"slug_conflict":"save_failed",error.code==="23505"?409:503);
 if(!data)return rejected("not_found_or_not_editable",409);
 return NextResponse.json({data,status:"draft_updated"},{headers:{"Cache-Control":"no-store"}});
}
export async function POST(request:NextRequest){return handle(request,false);}
export async function PATCH(request:NextRequest){return handle(request,true);}
export async function GET(){return rejected("method_not_allowed",405);}
export async function PUT(){return rejected("method_not_allowed",405);}
export async function DELETE(){return rejected("method_not_allowed",405);}
