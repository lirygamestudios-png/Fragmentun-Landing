import {BlogRichContent} from "../../../../components/FragmentunRichContent";
import FragmentunWhatsAppShare from "../../../../components/FragmentunWhatsAppShare";
import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PublicHeader} from "../../../../components/PublicHeader";
import {publishedPost,localized,safeImage,type BlogLocale} from "../../../../lib/blog/data";
import styles from "../../../../components/FragmentunBlog.module.css";

export const dynamic="force-dynamic";
type Props={params:Promise<{locale:string;slug:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
 const {locale,slug}=await params;if(locale!=="es"&&locale!=="en")return {};
 const post=await publishedPost(locale,slug);if(!post)return {robots:{index:false,follow:false}};
 const t=localized(post,locale);const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com").replace(/\/$/,"");
 const img=safeImage(post.image_url);
 return {title:`${t.title} | FRAGMENTUN`,description:t.excerpt,alternates:{canonical:`${site}/${locale}/blog/${slug}`,languages:{...(post.published_es?{es:`${site}/es/blog/${slug}`}:{}) ,...(post.published_en?{en:`${site}/en/blog/${slug}`}:{})}},openGraph:{type:"article",title:t.title,description:t.excerpt,url:`${site}/${locale}/blog/${slug}`,images:[{url:`${site}/${locale}/blog/${encodeURIComponent(slug)}/opengraph-image`,width:1200,height:630,alt:`FRAGMENTUN — ${t.title}`}]}};
}
export default async function BlogArticle({params}:Props){
 const {locale:raw,slug}=await params;if(raw!=="es"&&raw!=="en")notFound();
 const locale=raw as BlogLocale;const es=locale==="es";
 const post=await publishedPost(locale,slug);if(!post)notFound();
 const item=localized(post,locale);const img=safeImage(post.image_url);
 const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com").replace(/\/$/,"");
 const articleJson={"@context":"https://schema.org","@type":"BlogPosting",headline:item.title,description:item.excerpt,author:{"@type":"Person",name:"José Liranzo"},publisher:{"@type":"Organization",name:"FRAGMENTUN"},datePublished:post.published_at||post.updated_at,dateModified:post.updated_at,mainEntityOfPage:`${site}/${locale}/blog/${slug}`};
 return <><PublicHeader locale={locale}/><main className={styles.shell}>
 <article className={styles.article}><Link href={`/${locale}/blog`} className={styles.back}>{es?"← Todos los artículos":"← All articles"}</Link><p className="kicker">FRAGMENTUN · BLOG</p><h1>{item.title}</h1><p className={styles.excerpt}>{item.excerpt}</p><p className={styles.byline}>José Liranzo · {post.published_at?new Date(post.published_at).toLocaleDateString(es?"es-ES":"en-US"):"FRAGMENTUN"}</p>{img?<img src={img} alt={item.title} className={styles.feature} />:null}<div className={styles.prose}><BlogRichContent value={item.body}/></div><FragmentunWhatsAppShare title={item.title} locale={locale}/><div className={styles.articleCta}><h2>{es?"Comienza tu viaje a Lumen":"Begin your journey into Lumen"}</h2><Link className="btn btnPrimary" href={`/${locale}#capitulo`}>{es?"Capítulo 1 gratuito":"Free Chapter 1"}</Link></div></article>
 <script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(articleJson).replace(/</g,"\\u003c")}}/>
 </main></>;
}
