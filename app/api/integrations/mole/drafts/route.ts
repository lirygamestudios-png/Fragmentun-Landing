import {createHash,timingSafeEqual} from "node:crypto";
import {NextRequest,NextResponse} from "next/server";
import {createClient} from "@supabase/supabase-js";

// P10: disabled until a server-only Bearer digest is configured and the database-scoped RPC is reviewed.
// Never provide the raw Bearer secret or administrator credentials in a repository, browser or logs.
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
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url||!/^https:\/\/[a-z0-9.-]+\.supabase\.co\/?$/i.test(url)||!key)return null;
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
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
 const db=config();
 if(!db)return rejected("integration_disabled",503);
 const parsed=await parse(request,update).catch(()=>null);
 if(!parsed)return rejected("invalid_draft",400);
 // A separate restricted database function enforces the draft-only state and editor ownership.
 // The public Supabase key has NO direct draft table write privileges.
 const bearer=request.headers.get("authorization")!.slice(7);
 const {data,error}=await db.rpc("fragmentun_mole_draft_upsert_v1",{
   p_token:bearer,p_draft:{...parsed.draft,image_url:parsed.draft.image_url||null},
   p_id:update?parsed.id:null
 });
 if(error){
   if(error.code==="23505")return rejected("slug_conflict",409);
   if(error.code==="P0002")return rejected("not_found_or_not_editable",409);
   if(error.code==="28000")return rejected("unauthorized",401);
   return rejected("save_unavailable",503);
 }
 if(!data||typeof data!=="object"||typeof data.id!=="string")return rejected("save_unavailable",503);
 return NextResponse.json({data,status:update?"draft_updated":"draft_created"},{status:update?200:201,headers:{"Cache-Control":"no-store"}});

}
export async function POST(request:NextRequest){return handle(request,false);}
export async function PATCH(request:NextRequest){return handle(request,true);}
export async function GET(){return rejected("method_not_allowed",405);}
export async function PUT(){return rejected("method_not_allowed",405);}
export async function DELETE(){return rejected("method_not_allowed",405);}
