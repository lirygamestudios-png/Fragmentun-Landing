"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";
type Model="premium"|"freemium";
const textLength=(value:string,max:number)=>value.slice(0,max);
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
 const missing=[name.trim().length<2?(locale==="es"?"nombre (mínimo 2 caracteres)":"title (minimum 2 characters)"):null,summary.trim().length<20?(locale==="es"?"descripción (mínimo 20 caracteres)":"description (minimum 20 characters)"):null,!priceValid?(locale==="es"?"precio válido":"valid price"):null,age===""?(locale==="es"?"clasificación de edad":"age rating"):null,platform===""?(locale==="es"?"plataforma":"platform"):null].filter(Boolean);
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="developer-listing-preview-title">
  <h2 id="developer-listing-preview-title">{copy.title}</h2>
  <p>{copy.intro}</p>
  <div><label htmlFor="developer-game-title">{copy.name}</label><input id="developer-game-title" value={name} maxLength={100} aria-invalid={name.length>0&&name.trim().length<2} aria-describedby="developer-game-title-help" onChange={event=>setName(textLength(event.target.value,100))} placeholder={copy.namePlaceholder}/><small id="developer-game-title-help">{locale==="es"?"Mínimo 2 caracteres; máximo 100. Solo borrador.":"Minimum 2 characters; maximum 100. Draft only."}</small></div>
  <div><label htmlFor="developer-game-summary">{copy.summary}</label><textarea id="developer-game-summary" value={summary} maxLength={600} aria-invalid={summary.length>0&&summary.trim().length<20} aria-describedby="developer-game-summary-help" onChange={event=>setSummary(textLength(event.target.value,600))} placeholder={copy.summaryPlaceholder}/><small id="developer-game-summary-help">{locale==="es"?"Mínimo 20 caracteres; máximo 600. No incluyas información confidencial de propiedad intelectual.":"Minimum 20 characters; maximum 600. Do not include confidential IP information."}</small></div>
  <fieldset><legend>{copy.model}</legend>
   <label><input type="radio" name="developer-listing-model" checked={model==="premium"} onChange={()=>setModel("premium")}/> Premium</label>
   <label><input type="radio" name="developer-listing-model" checked={model==="freemium"} onChange={()=>{setModel("freemium");setPrice("")}}/> Freemium</label>
  </fieldset>
  {model==="premium"&&<div><label htmlFor="developer-game-price">{copy.price}</label><input id="developer-game-price" inputMode="decimal" aria-invalid={price!==""&&!priceValid} aria-describedby="developer-game-price-help" value={price} maxLength={8} onChange={event=>setPrice(event.target.value)} placeholder={copy.pricePlaceholder}/><small id="developer-game-price-help">{locale==="es"?"Introduce un importe positivo con hasta dos decimales (USD); solo vista previa.":"Enter a positive amount with up to two decimals (USD); preview only."}</small></div>}
  {model==="freemium"&&<p>{copy.freemium}</p>}
  <div><label htmlFor="developer-game-age">{copy.age}</label><select id="developer-game-age" aria-describedby="developer-game-age-help" value={age} onChange={event=>setAge(event.target.value)}><option value="">{copy.select}</option><option value="pending">{copy.agePending}</option><option value="classified">{copy.ageClassified}</option></select><small id="developer-game-age-help">{locale==="es"?"Selección preliminar; no certifica ninguna clasificación de edad.":"Preliminary selection; this is not an age-rating certification."}</small></div>
  <div><label htmlFor="developer-game-platform">{copy.platform}</label><select id="developer-game-platform" aria-describedby="developer-game-platform-help" value={platform} onChange={event=>setPlatform(event.target.value)}><option value="">{copy.select}</option><option value="browser">{copy.browser}</option><option value="windows">Windows</option><option value="macos">macOS</option><option value="linux">Linux</option></select><small id="developer-game-platform-help">{locale==="es"?"Selecciona la plataforma prevista; no confirma compatibilidad técnica.":"Select the intended platform; technical compatibility is not verified."}</small></div>
  <p role="status" aria-live="polite">{ready?copy.ready:copy.pending}</p>
  <p className={styles.accountIntro}>{locale==="es"?"La clasificación indicada es una declaración preliminar: debe verificarse antes de publicar. La ficha no se envía ni se guarda en un servidor.":"The selected age classification is preliminary and must be verified before publication. This listing is not submitted or stored on a server."}</p>
  {!ready&&<p className={styles.accountIntro}>{locale==="es"?"Faltan datos para completar la vista previa: ":"Complete the preview fields: "}{missing.join(", ")}.</p>}
  {ready&&<p className={styles.accountIntro}>{locale==="es"?"Ficha completa únicamente como borrador; todavía requiere revisión de derechos, seguridad y aprobación de LIRYGAMES.":"Draft fields complete only; IP, security and LIRYGAMES approval are still required."}</p>}
  <button type="button" className={styles.previewReset} onClick={()=>{setName("");setSummary("");setModel("premium");setPrice("");setAge("");setPlatform("")}}>{copy.reset}</button>
  <p>{copy.inactive}</p>
 </section>;
}
