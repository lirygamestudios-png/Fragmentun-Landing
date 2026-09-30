import { createClient } from "@supabase/supabase-js";

type LocalizedRecord={content_key:string;es:any;en:any};

export async function getLocalizedContent(locale:"es"|"en"){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return {};
  const supabase=createClient(url,key,{auth:{persistSession:false}});
  const{data}=await supabase.from("localized_content").select("content_key,es,en");
  const out:Record<string,any>={};
  for(const row of (data||[]) as LocalizedRecord[]) out[row.content_key]=locale==="en"?row.en:row.es;
  return out;
}

export async function getBooks(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key) return [];
  const supabase=createClient(url,key,{auth:{persistSession:false}});
  const{data}=await supabase.from("books").select("*").order("sort_order");
  return data||[];
}
