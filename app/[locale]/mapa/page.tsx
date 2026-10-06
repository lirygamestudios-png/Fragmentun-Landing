export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { PublicHeader } from "../../../components/PublicHeader";
import { LumenMap } from "../../../components/LumenMap";
import { PageView } from "../../../components/PageView";
import { locales,type Locale } from "../../../lib/i18n";
import { getBooks } from "../../../lib/content";
import { createClient } from "@supabase/supabase-js";

export default async function MapPage({params}:{params:Promise<{locale:string}>}){
  const{locale:raw}=await params;
  if(!locales.includes(raw as Locale)) notFound();
  const locale=raw as Locale;
  const supabase=createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {auth:{persistSession:false}}
  );

  const[{data:regions},{data:points},books]=await Promise.all([
    supabase.from("map_regions").select("slug,name_es,name_en,description_es,description_en,color").eq("visible",true).order("sort_order"),
    supabase.from("map_points").select("slug,name_es,name_en,description_es,description_en,x,y,icon").eq("visible",true),
    getBooks(locale)
  ]);

  const firstBook=(books as any[]).find((b:any)=>b.slug==="fragmentun-i")||(books as any[])[0];
  const amazonUrl=firstBook?.edition_status==="published"?firstBook?.amazon_url:null;

  return <>
    <PageView locale={locale}/>
    <PublicHeader locale={locale} amazonUrl={amazonUrl}/>
    <main className="section">
      <div className="container">
        <div className="sectionIntro">
          <div className="kicker">LUMEN</div>
          <h1>{locale==="es"?"Mapa interactivo":"Interactive map"}</h1>
          <p className="lead">{locale==="es"
            ?"Explora los territorios emocionales y algunos de sus puntos de interés."
            :"Explore the emotional territories and some of their points of interest."}</p>
        </div>
        <LumenMap locale={locale} regions={(regions||[]) as any} points={(points||[]) as any}/>
      </div>
    </main>
  </>;
}
