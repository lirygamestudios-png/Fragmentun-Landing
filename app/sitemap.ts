import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";
  const now=new Date();
  const routes=[
    {path:"",priority:1,changeFrequency:"weekly" as const},
    {path:"/test",priority:.8,changeFrequency:"monthly" as const},
    {path:"/mapa",priority:.8,changeFrequency:"monthly" as const},
    {path:"/privacidad",priority:.3,changeFrequency:"yearly" as const}
  ];

  return ["es","en"].flatMap(locale=>
    routes.map(route=>({
      url:`${site}/${locale}${route.path}`,
      lastModified:now,
      changeFrequency:route.changeFrequency,
      priority:route.priority
    }))
  );
}
