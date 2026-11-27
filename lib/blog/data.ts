import { createClient } from "@supabase/supabase-js";

export type BlogLocale = "es" | "en";
export type BlogPost = {
  id: string; slug: string; title_es: string; title_en: string;
  excerpt_es: string; excerpt_en: string; body_es: string; body_en: string;
  image_url: string | null; published_es: boolean; published_en: boolean;
  published_at: string | null; updated_at: string;
};

export function publicBlogClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function publishedPosts(locale: BlogLocale): Promise<BlogPost[]> {
  const client = publicBlogClient();
  if (!client) return [];
  const field = locale === "es" ? "published_es" : "published_en";
  const {data,error} = await client.from("fragmentun_blog_posts")
    .select("id,slug,title_es,title_en,excerpt_es,excerpt_en,body_es,body_en,image_url,published_es,published_en,published_at,updated_at")
    .eq(field,true).order("published_at",{ascending:false}).limit(100);
  if (error) { console.error("fragmentun_blog_read_failed",error.code); return []; }
  return (data || []) as BlogPost[];
}

export async function publishedPost(locale: BlogLocale, slug: string): Promise<BlogPost | null> {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
  const client = publicBlogClient();
  if (!client) return null;
  const field = locale === "es" ? "published_es" : "published_en";
  const {data,error} = await client.from("fragmentun_blog_posts")
    .select("id,slug,title_es,title_en,excerpt_es,excerpt_en,body_es,body_en,image_url,published_es,published_en,published_at,updated_at")
    .eq("slug",slug).eq(field,true).maybeSingle();
  if (error) { console.error("fragmentun_blog_post_failed",error.code); return null; }
  return data as BlogPost | null;
}
export function localized(post: BlogPost, locale: BlogLocale){
  return locale === "es"
    ? {title:post.title_es,excerpt:post.excerpt_es,body:post.body_es}
    : {title:post.title_en,excerpt:post.excerpt_en,body:post.body_en};
}
export function safeImage(url: string | null) {
  if (!url) return "";
  if (/^https:\/\/[^\s]+$/i.test(url) || /^\/(?!\/)[a-zA-Z0-9/_\-.]+$/.test(url)) return url;
  return "";
}
