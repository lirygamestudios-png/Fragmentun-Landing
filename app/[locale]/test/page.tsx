import { notFound } from "next/navigation";
import { PublicHeader } from "../../../components/PublicHeader";
import { EmotionalTest } from "../../../components/EmotionalTest";
import { locales,type Locale } from "../../../lib/i18n";
import { createClient } from "@supabase/supabase-js";

export default async function TestPage({params}:{params:Promise<{locale:string}>}){
  const{locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const supabase=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,{auth:{persistSession:false}});
  const[{data:questions},{data:profiles}]=await Promise.all([
    supabase.from("test_questions").select("id,prompt_es,prompt_en,sort_order,test_options(id,label_es,label_en,score_key,score_value,sort_order)").eq("active",true).order("sort_order"),
    supabase.from("test_profiles").select("*")
  ]);
  return <><PublicHeader locale={locale}/><main className="section"><div className="container"><EmotionalTest locale={locale} questions={(questions||[]) as any} profiles={(profiles||[]) as any}/></div></main></>;
}
