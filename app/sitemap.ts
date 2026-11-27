import type { MetadataRoute } from "next";
import {publishedPosts} from "../lib/blog/data";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";
  const now=new Date();
  const routes=[
    {path:"",priority:1,changeFrequency:"weekly" as const},
    {path:"/test",priority:.8,changeFrequency:"monthly" as const},
    {path:"/mapa",priority:.8,changeFrequency:"monthly" as const},
    {path:"/autor",priority:.7,changeFrequency:"monthly" as const},
    {path:"/privacidad",priority:.3,changeFrequency:"yearly" as const}
  ];

  const entries=await Promise.all([publishedPosts("es"),publishedPosts("en")]);
  const blog=entries.flatMap((posts,i)=>{const loc=i===0?"es":"en";return [{url:`${site}/${loc}/blog`,lastModified:now,changeFrequency:"weekly" as const,priority:.8},...posts.map(p=>({url:`${site}/${loc}/blog/${p.slug}`,lastModified:new Date(p.updated_at),changeFrequency:"monthly" as const,priority:.7}))]});
  return [...["es","en"].flatMap(locale=>
    routes.map(route=>({
      url:`${site}/${locale}${route.path}`,
      lastModified:now,
      changeFrequency:route.changeFrequency,
      priority:route.priority
    }))
  ),...blog];
}