import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function editor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:!!p&&["admin","editor"].includes(p.role),supabase};
}

async function loadBooks(supabase:any){
  const{data:books,error}=await supabase.from("books").select("*").order("sort_order");
  if(error)return {data:null,error};
  const ids=(books||[]).map((b:any)=>b.id);
  const{data:editions,error:editionError}=ids.length
    ?await supabase.from("book_editions").select("*").in("book_id",ids).order("locale")
    :{data:[],error:null};
  if(editionError)return {data:null,error:editionError};
  return {
    data:(books||[]).map((b:any)=>({
      ...b,
      editions:(editions||[]).filter((e:any)=>e.book_id===b.id)
    })),
    error:null
  };
}

export async function GET(){
  const x=await editor();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const result=await loadBooks(x.supabase);
  return NextResponse.json(result.error?{error:result.error.message}:{data:result.data},{status:result.error?500:200});
}

export async function PUT(request:NextRequest){
  const x=await editor();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});

  const allowed={
    title_es:body.title_es,
    title_en:body.title_en,
    subtitle_es:body.subtitle_es,
    subtitle_en:body.subtitle_en,
    description_es:body.description_es,
    description_en:body.description_en,
    status:body.status,
    sort_order:Number(body.sort_order??0)
  };
  const{error}=await x.supabase.from("books").update(allowed).eq("id",body.id);
  if(error)return NextResponse.json({error:error.message},{status:500});

  for(const ed of Array.isArray(body.editions)?body.editions:[]){
    const locale=String(ed.locale||"").trim().toLowerCase();
    if(!locale)continue;
    const marketplace=String(ed.marketplace||"amazon.com").trim();
    const payload={
      book_id:body.id,
      locale,
      marketplace,
      asin:String(ed.asin||"").trim()||null,
      amazon_url:String(ed.amazon_url||"").trim()||null,
      status:String(ed.status||"coming_soon"),
      cover_media_slug:String(ed.cover_media_slug||"").trim()||null,
      updated_at:new Date().toISOString()
    };
    const{error:editionError}=await x.supabase.from("book_editions").upsert(payload,{onConflict:"book_id,locale,marketplace"});
    if(editionError)return NextResponse.json({error:editionError.message},{status:500});
  }

  const result=await loadBooks(x.supabase);
  return NextResponse.json(
    result.error?{error:result.error.message}:{data:(result.data||[]).find((b:any)=>b.id===body.id)},
    {status:result.error?500:200}
  );
}
