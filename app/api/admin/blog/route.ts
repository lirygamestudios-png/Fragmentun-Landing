import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../lib/supabase/mfa";

async function permitted(){
 const db=await createSupabaseServerClient();const {data:{user}}=await db.auth.getUser();
 if(!user||!(await hasSatisfiedMfa(db)))return {db,user:null};
 const {data:p}=await db.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!p||!["admin","editor"].includes(p.role))return {db,user:null};
 return {db,user};
}
function clean(x:unknown,max:number){return typeof x==="string"?x.trim().slice(0,max):"";}
function validSlug(x:string){return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x)&&x.length<=90;}
export async function GET(){
 const {db,user}=await permitted();if(!user)return NextResponse.json({error:"forbidden"},{status:403});
 const {data,error}=await db.from("fragmentun_blog_posts").select("*").order("updated_at",{ascending:false}).limit(150);
 return error?NextResponse.json({error:"blog_not_ready"},{status:503}):NextResponse.json({data});
}
export async function PUT(request:NextRequest){
 const {db,user}=await permitted();if(!user)return NextResponse.json({error:"forbidden"},{status:403});
 const body=await request.json().catch(()=>null);if(!body||typeof body!=="object")return NextResponse.json({error:"invalid_request"},{status:400});
 const slug=clean(body.slug,91);if(!validSlug(slug))return NextResponse.json({error:"invalid_slug"},{status:400});
 const title_es=clean(body.title_es,180),title_en=clean(body.title_en,180);
 const excerpt_es=clean(body.excerpt_es,400),excerpt_en=clean(body.excerpt_en,400);
 const body_es=clean(body.body_es,50000),body_en=clean(body.body_en,50000);
 const image_url=clean(body.image_url,1000);
 if(image_url&&!/^https:\/\/[^\s]+$/i.test(image_url)&&!/^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(image_url))return NextResponse.json({error:"invalid_image_url"},{status:400});
 const published_es=body.published_es===true,published_en=body.published_en===true;
 if(published_es!==published_en)return NextResponse.json({error:"publish_both_languages_together"},{status:400});
 if(published_es&&(!title_es||!excerpt_es||!body_es||!title_en||!excerpt_en||!body_en))return NextResponse.json({error:"published_content_missing"},{status:400});
 const id=typeof body.id==="string"&&/^[0-9a-f-]{36}$/i.test(body.id)?body.id:null;
 const payload={slug,title_es,title_en,excerpt_es,excerpt_en,body_es,body_en,image_url:image_url||null,published_es,published_en,updated_by:user.id,updated_at:new Date().toISOString()};
 if(id){
   const {data:current,error:readError}=await db.from("fragmentun_blog_posts").select("published_at").eq("id",id).maybeSingle();
   if(readError||!current)return NextResponse.json({error:"not_found"},{status:404});
   const {data,error}=await db.from("fragmentun_blog_posts").update({...payload,published_at:(published_es||published_en)?(current.published_at||new Date().toISOString()):null}).eq("id",id).select().single();
   return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json({data});
 }
 const {data,error}=await db.from("fragmentun_blog_posts").insert({...payload,published_at:(published_es||published_en)?new Date().toISOString():null}).select().single();
 return error?NextResponse.json({error:"save_failed"},{status:400}):NextResponse.json({data});
}

export async function DELETE(request:NextRequest){
 const {db,user}=await permitted();
 if(!user)return NextResponse.json({error:"forbidden"},{status:403});
 // MFA AAL2 is checked in permitted(); deletion additionally requires admin, never editor.
 const {data:profile,error:profileError}=await db.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(profileError||profile?.role!=="admin")return NextResponse.json({error:"admin_required"},{status:403});
 const body=await request.json().catch(()=>null);
 if(!body||typeof body!=="object")return NextResponse.json({error:"invalid_request"},{status:400});
 const id=typeof body.id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.id)?body.id:null;
 const slug=typeof body.slug==="string"?body.slug:"";
 if(!id||!validSlug(slug)||body.confirmation!=="ELIMINAR DEFINITIVAMENTE")return NextResponse.json({error:"invalid_confirmation"},{status:400});
 const {data:article,error:readError}=await db.from("fragmentun_blog_posts").select("id,slug,published_es,published_en").eq("id",id).maybeSingle();
 if(readError||!article)return NextResponse.json({error:"not_found"},{status:404});
 if(article.slug!==slug)return NextResponse.json({error:"slug_mismatch"},{status:409});
 if(article.published_es||article.published_en)return NextResponse.json({error:"unpublish_before_delete"},{status:409});
 // Database RLS policy independently enforces admin/AAL2 and unpublished state.
 const {data:deleted,error}=await db.from("fragmentun_blog_posts").delete().eq("id",id).eq("slug",slug).eq("published_es",false).eq("published_en",false).select("id").maybeSingle();
 if(error)return NextResponse.json({error:"delete_not_authorized_or_failed"},{status:403});
 if(!deleted)return NextResponse.json({error:"not_deleted"},{status:409});
 return NextResponse.json({deleted:true});
}
