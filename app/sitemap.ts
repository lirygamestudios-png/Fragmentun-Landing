import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";
  const now=new Date();
  const routes=["","/test","/mapa"];

  return ["es","en"].flatMap(locale=>
    routes.map(route=>({
      url:`${site}/${locale}${route}`,
      lastModified:now,
      changeFrequency:route===""?"weekly":"monthly",
      priority:route===""?1:0.7
    }))
  );
}
