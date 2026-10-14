"use client";
import {useState} from "react";
import styles from "../app/lirygames/mi-liry/mi-liry.module.css";
type Model="premium"|"freemium";
const textLength=(value:string,max:number)=>value.trim().slice(0,max);
export function LiryDeveloperGameListingPreview(){
 const [name,setName]=useState("");
 const [summary,setSummary]=useState("");
 const [model,setModel]=useState<Model>("premium");
 const [price,setPrice]=useState("");
 const [age,setAge]=useState("");
 const [platform,setPlatform]=useState("");
 const priceValid=model==="freemium"||(/^\d{1,4}(?:\.\d{1,2})?$/.test(price)&&Number(price)>0);
 const ready=name.trim().length>=2&&summary.trim().length>=20&&priceValid&&age!==""&&platform!=="";
 return <section className={`${styles.notice} ${styles.developerForm}`} aria-labelledby="developer-listing-preview-title">
  <h2 id="developer-listing-preview-title">FICHA DEL VIDEOJUEGO · VISTA PREVIA</h2>
  <p>Prepara la información que acompañará una futura solicitud. Los datos permanecen únicamente en esta pantalla mientras esté abierta; no se envían ni se publican.</p>
  <div><label htmlFor="developer-game-title">Nombre comercial del videojuego</label><input id="developer-game-title" value={name} maxLength={100} onChange={event=>setName(textLength(event.target.value,100))} placeholder="Nombre del videojuego"/></div>
  <div><label htmlFor="developer-game-summary">Descripción del videojuego</label><textarea id="developer-game-summary" value={summary} maxLength={600} onChange={event=>setSummary(textLength(event.target.value,600))} placeholder="Describe las características reales de tu juego"/></div>
  <fieldset><legend>Modalidad de comercialización</legend>
   <label><input type="radio" name="developer-listing-model" checked={model==="premium"} onChange={()=>setModel("premium")}/> Premium</label>
   <label><input type="radio" name="developer-listing-model" checked={model==="freemium"} onChange={()=>setModel("freemium")}/> Freemium</label>
  </fieldset>
  {model==="premium"&&<div><label htmlFor="developer-game-price">Precio propuesto en USD (sin aprobación comercial)</label><input id="developer-game-price" inputMode="decimal" value={price} maxLength={8} onChange={event=>setPrice(event.target.value)} placeholder="Ej. 9.99"/></div>}
  {model==="freemium"&&<p>El acceso base es gratuito. Las compras opcionales de bienes digitales necesitarán fichas y precios autorizados por separado.</p>}
  <div><label htmlFor="developer-game-age">Clasificación por edad declarada</label><select id="developer-game-age" value={age} onChange={event=>setAge(event.target.value)}><option value="">Selecciona una opción</option><option value="pending">Pendiente de clasificación oficial</option><option value="classified">Dispongo de clasificación vigente</option></select></div>
  <div><label htmlFor="developer-game-platform">Plataforma de ejecución</label><select id="developer-game-platform" value={platform} onChange={event=>setPlatform(event.target.value)}><option value="">Selecciona una opción</option><option value="browser">Navegador web</option><option value="windows">Windows</option><option value="macos">macOS</option><option value="linux">Linux</option></select></div>
  <p role="status" aria-live="polite">{ready?"Ficha preliminar completa: se requerirá revisión de derechos, contenido, precio y versión antes de publicar.":"Completa todos los campos para revisar la información preliminar. No equivale a admisión."}</p>
  <button type="button" className={styles.previewReset} onClick={()=>{setName("");setSummary("");setModel("premium");setPrice("");setAge("");setPlatform("")}}>BORRAR VISTA PREVIA</button>
  <p>VISTA PREPARATORIA · Sin guardado, carga de archivos, envío ni ventas.</p>
 </section>;
}
