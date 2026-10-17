"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
type Model="premium"|"freemium";
const textLength=(value:string,max:number)=>value.trim().slice(0,max);
export function LiryDeveloperGameListingPreview({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).developerListing;
 const [name,setName]=useState("");
 const [summary,setSummary]=useState("");
 const [model,setModel]=useState<Model>("premium");
 const [price,setPrice]=useState("");
 const [age,setAge]=useState("");
 const [platform,setPlatform]=useState("");
 const priceValid=model==="freemium"||(/^\d{1,4}(?:\.\d{1,2})?$/.test(price)&&Number(price)>0);
 const ready=name.trim().length>=2&&summary.trim().length>=20&&priceValid&&age!==""&&platform!=="";
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="developer-listing-preview-title">
  <h2 id="developer-listing-preview-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <div><label htmlFor="developer-game-title">{copy.name}</label><input id="developer-game-title" value={name} maxLength={100} onChange={event=>setName(textLength(event.target.value,100))} placeholder={copy.namePlaceholder}/></div>
  <div><label htmlFor="developer-game-summary">{copy.summary}</label><textarea id="developer-game-summary" value={summary} maxLength={600} onChange={event=>setSummary(textLength(event.target.value,600))} placeholder={copy.summaryPlaceholder}/></div>
  <fieldset><legend>{copy.model}</legend>
   <label><input type="radio" name="developer-listing-model" checked={model==="premium"} onChange={()=>setModel("premium")}/> Premium</label>
   <label><input type="radio" name="developer-listing-model" checked={model==="freemium"} onChange={()=>setModel("freemium")}/> Freemium</label>
  </fieldset>
  {model==="premium"&&<div><label htmlFor="developer-game-price">{copy.price}</label><input id="developer-game-price" inputMode="decimal" value={price} maxLength={8} onChange={event=>setPrice(event.target.value)} placeholder={copy.pricePlaceholder}/></div>}
  {model==="freemium"&&<p>{copy.freemium}</p>}
  <div><label htmlFor="developer-game-age">{copy.age}</label><select id="developer-game-age" value={age} onChange={event=>setAge(event.target.value)}><option value="">{copy.select}</option><option value="pending">{copy.agePending}</option><option value="classified">{copy.ageClassified}</option></select></div>
  <div><label htmlFor="developer-game-platform">{copy.platform}</label><select id="developer-game-platform" value={platform} onChange={event=>setPlatform(event.target.value)}><option value="">{copy.select}</option><option value="browser">{copy.browser}</option><option value="windows">Windows</option><option value="macos">macOS</option><option value="linux">Linux</option></select></div>
  <p role="status" aria-live="polite">{ready?copy.ready:copy.pending}</p>
  <button type="button" className={styles.previewReset} onClick={()=>{setName("");setSummary("");setModel("premium");setPrice("");setAge("");setPlatform("")}}>{copy.reset}</button>
  <p>{copy.inactive}</p>
 </section>;
}
