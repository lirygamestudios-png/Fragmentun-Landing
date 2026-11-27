import type {Metadata} from "next";
import Link from "next/link";
import {notFound} from "next/navigation";
import {PublicHeader} from "../../../components/PublicHeader";
import {publishedPosts,localized,safeImage, type BlogLocale} from "../../../lib/blog/data";
import styles from "../../../components/FragmentunBlog.module.css";

export const dynamic = "force-dynamic";
type Props={params:Promise<{locale:string}>};
export async function generateMetadata({params}:Props):Promise<Metadata>{
  const {locale}=await params; if(locale!=="es"&&locale!=="en")return {};
  const es=locale==="es";const site=(process.env.NEXT_PUBLIC_SITE_URL||"https://www.fragmentun.com").replace(/\/$/,"");
  const title=es?"Blog FRAGMENTUN | Lumen, Elyon y ciencia ficción":"FRAGMENTUN Blog | Lumen, Elyon & Science Fiction";
  const description=es?"Artículos oficiales sobre FRAGMENTUN, Lumen, Elyon Voss y el universo de la saga.":"Official stories about FRAGMENTUN, Lumen, Elyon Voss and the world of the saga.";
  return {title,description,alternates:{canonical:`${site}/${locale}/blog`,languages:{es:`${site}/es/blog`,en:`${site}/en/blog`}},openGraph:{title,description,url:`${site}/${locale}/blog`,images:[`${site}/elyon-hero.jpg`]}};
}
export default async function BlogIndex({params}:Props){
 const {locale:raw}=await params;if(raw!=="es"&&raw!=="en")notFound();
 const locale=raw as BlogLocale;const es=locale==="es";
 const posts=await publishedPosts(locale);
 return <><PublicHeader locale={locale}/><main className={styles.shell}>
   <section className={styles.hero}><div className="container"><p className="kicker">FRAGMENTUN · {es?"BITÁCORA DE LUMEN":"LUMEN JOURNAL"}</p><h1>{es?"Historias más allá de Lumen":"Stories beyond Lumen"}</h1><p className="lead">{es?"El universo de FRAGMENTUN, sus personajes y las ideas que inspiran la saga.":"Explore the world, characters and ideas behind FRAGMENTUN."}</p></div></section>
   <section className="container"><div className={styles.grid}>{posts.map(p=>{const item=localized(p,locale);const img=safeImage(p.image_url);return <article className={styles.card} key={p.id}>{img?<img src={img} alt={item.title} className={styles.image} loading="lazy"/>:null}<div className={styles.cardBody}><p className="kicker">FRAGMENTUN</p><h2><Link href={`/${locale}/blog/${p.slug}`}>{item.title}</Link></h2><p>{item.excerpt}</p><Link className="btn btnGhost" href={`/${locale}/blog/${p.slug}`}>{es?"Leer artículo":"Read article"}</Link></div></article>})}</div>{posts.length===0?<p className={styles.empty}>{es?"Próximamente: nuevas historias del universo FRAGMENTUN.":"New stories from FRAGMENTUN are coming soon."}</p>:null}</section>
   <section className={styles.cta}><div className="container"><h2>{es?"¿Te atreves a sentir?":"Dare to feel?"}</h2><p>{es?"Descubre FRAGMENTUN y accede al Capítulo 1 gratuito.":"Discover FRAGMENTUN and get the free first chapter."}</p><Link className="btn btnPrimary" href={`/${locale}#capitulo`}>{es?"Leer el Capítulo 1":"Read Chapter 1"}</Link></div></section>
 </main></>;
}
