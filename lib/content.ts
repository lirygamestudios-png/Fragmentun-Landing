import { createClient } from "@supabase/supabase-js";

type Locale="es"|"en";
type LocalizedRecord={content_key:string;es:any;en:any};

function client(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return null;
  return createClient(url,key,{auth:{persistSession:false}});
}

export async function getLocalizedContent(locale:Locale){
  const supabase=client();
  if(!supabase) return {};
  const{data}=await supabase.from("localized_content").select("content_key,es,en");
  const out:Record<string,any>={};
  for(const row of (data||[]) as LocalizedRecord[]) out[row.content_key]=locale==="en"?row.en:row.es;
  return out;
}

export async function getBooks(locale:Locale="es"){
  const supabase=client();
  if(!supabase) return [];
  const[{data:books},{data:editions},{data:media}]=await Promise.all([
    supabase.from("books").select("*").order("sort_order"),
    supabase.from("book_editions")
      .select("book_id,locale,marketplace,asin,amazon_url,status,cover_media_slug")
      .eq("locale",locale),
    supabase.from("media_assets")
      .select("slug,storage_path,alt_es,alt_en,public_visible")
      .eq("kind","image")
      .eq("public_visible",true)
  ]);
  const byBook=new Map((editions||[]).map((e:any)=>[e.book_id,e]));
  const mediaBySlug=new Map((media||[]).map((m:any)=>[m.slug,m]));
  return (books||[]).map((book:any)=>{
    const ed=byBook.get(book.id) as any;
    const legacy=locale==="es"?book.amazon_url_es:book.amazon_url_en;
    const cover:any=ed?.cover_media_slug?mediaBySlug.get(ed.cover_media_slug):null;
    return {
      ...book,
      amazon_url:ed?.amazon_url||legacy||null,
      asin:ed?.asin||null,
      edition_status:ed?.status||((legacy&&book.status==="published")?"published":"coming_soon"),
      marketplace:ed?.marketplace||"amazon.com",
      cover_media_slug:ed?.cover_media_slug||null,
      cover_url:mediaPublicUrl(cover?.storage_path)||null,
      cover_alt:locale==="en"?(cover?.alt_en||cover?.alt_es||null):(cover?.alt_es||cover?.alt_en||null)
    };
  });
}


export async function getPublishedReviews(locale:Locale){
  const supabase=client();
  if(!supabase) return [];
  const{data}=await supabase
    .from("reviews")
    .select("id,source,author_display,body_original,body_es,body_en,source_url,verified,created_at")
    .eq("published",true)
    .eq("verified",true)
    .order("created_at",{ascending:false})
    .limit(12);

  return (data||[]).map((r:any)=>({
    ...r,
    body:locale==="es"?(r.body_es||r.body_original):(r.body_en||r.body_original)
  }));
}


function mediaPublicUrl(storagePath:string|null|undefined){
  if(!storagePath)return null;
  if(storagePath.startsWith("/")||/^https?:\/\//i.test(storagePath))return storagePath;
  const slash=storagePath.indexOf("/");
  if(slash<1)return null;
  const bucket=storagePath.slice(0,slash);
  const path=storagePath.slice(slash+1);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  if(!url)return null;
  return `${url}/storage/v1/object/public/${bucket}/${path}`;
}

export async function getPublishedCharacters(locale:Locale){
  const supabase=client();
  if(!supabase)return [];
  const[{data:characters},{data:media}]=await Promise.all([
    supabase.from("characters")
      .select("id,slug,name,role_es,role_en,bio_es,bio_en,image_asset_id,video_asset_id,territory,status,sort_order")
      .eq("status","published")
      .order("sort_order"),
    supabase.from("media_assets")
      .select("id,slug,kind,storage_path,alt_es,alt_en,public_visible")
      .eq("public_visible",true)
  ]);
  const byId=new Map((media||[]).map((m:any)=>[m.id,m]));
  return (characters||[]).map((character:any)=>{
    const image:any=character.image_asset_id?byId.get(character.image_asset_id):null;
    const video:any=character.video_asset_id?byId.get(character.video_asset_id):null;
    return {
      key:character.slug==="elyon-voss"?"elyon":character.slug,
      name:character.name,
      role:locale==="en"?(character.role_en||character.role_es||""):(character.role_es||character.role_en||""),
      body:locale==="en"?(character.bio_en||character.bio_es||""):(character.bio_es||character.bio_en||""),
      tone:character.territory||character.slug,
      image_url:mediaPublicUrl(image?.storage_path)||"",
      image_alt:locale==="en"?(image?.alt_en||image?.alt_es||character.name):(image?.alt_es||image?.alt_en||character.name),
      video_url:mediaPublicUrl(video?.storage_path)||""
    };
  });
}
