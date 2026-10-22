import Link from "next/link";
import {liryFrontdeskStrings,getReleasedLiryFrontdeskLocale} from "../../../lib/games/liry-frontdesk-i18n";
export const metadata={title:"Centro legal | LIRYGAMES STUDIOS",robots:{index:false,follow:false}};
export default async function LegalIndex({searchParams}:{searchParams:Promise<{lang?:string}>}){const locale=getReleasedLiryFrontdeskLocale((await searchParams).lang);const legal=liryFrontdeskStrings(locale).legalCenter;const documents=legal.documents.map(([slug,title,about])=>({slug,title,about}));return <main lang={locale} style={{minHeight:"100vh",background:"#041222",color:"#e7f7ff",fontFamily:"Arial,sans-serif",padding:"clamp(24px,5vw,72px)"}}>
 <Link href={`/lirygames?lang=${locale}`} style={{color:"#63e2ff",fontSize:13}}>← {legal.back}</Link>
 <p style={{color:"#65d9ff",letterSpacing:3,fontSize:12,marginTop:36}}>LIRYGAMES STUDIOS</p><h1 style={{fontSize:"clamp(28px,4vw,46px)"}}>{legal.title}</h1>
 <p style={{color:"#b4cfdf",maxWidth:760,lineHeight:1.6}}>{legal.intro}</p>
 <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:14,maxWidth:1050,marginTop:32}}>{documents.map(d=><Link key={d.slug} href={`/lirygames/legal/${d.slug}?lang=${locale}`} style={{padding:20,borderRadius:12,border:"1px solid #236c91",background:"#091e34",color:"#effaff",textDecoration:"none",display:"grid",gap:10}}><strong>{d.title} ↗</strong><span style={{fontSize:13,color:"#a7cadb",lineHeight:1.5}}>{d.about}</span><small style={{color:"#5dd6f5"}}>{legal.draft}</small></Link>)}</div>
 </main>}
