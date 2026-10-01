import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const site=process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com";
  return {
    rules:[
      {
        userAgent:"*",
        allow:"/",
        disallow:[
          "/admin",
          "/api",
          "/go",
          "/es/capitulo-1",
          "/en/capitulo-1",
          "/es/gracias",
          "/en/gracias"
        ]
      }
    ],
    sitemap:`${site}/sitemap.xml`
  };
}
