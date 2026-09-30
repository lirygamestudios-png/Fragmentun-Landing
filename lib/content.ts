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
  const[{data:books},{data:editions}]=await Promise.all([
    supabase.from("books").select("*").order("sort_order"),
    supabase.from("book_editions")
      .select("book_id,locale,marketplace,asin,amazon_url,status,cover_media_slug")
      .eq("locale",locale)
  ]);
  const byBook=new Map((editions||[]).map((e:any)=>[e.book_id,e]));
  return (books||[]).map((book:any)=>{
    const ed=byBook.get(book.id) as any;
    const legacy=locale==="es"?book.amazon_url_es:book.amazon_url_en;
    return {
      ...book,
      amazon_url:ed?.amazon_url||legacy||null,
      asin:ed?.asin||null,
      edition_status:ed?.status||((legacy&&book.status==="published")?"published":"coming_soon"),
      marketplace:ed?.marketplace||"amazon.com",
      cover_media_slug:ed?.cover_media_slug||null
    };
  });
}
