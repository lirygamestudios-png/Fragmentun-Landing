"use client";
import {useRef,useState} from "react";
import styles from "../app/lirygames/lirygames.module.css";
const collections=[
 {name:"ROPA",symbol:"♧",tone:"wear",message:"Moda LIRY · colección en preparación."},
 {name:"ACCESORIOS",symbol:"◆",tone:"accessories",message:"Accesorios LIRY · colección en preparación."},
 {name:"COLECCIONABLES",symbol:"✧",tone:"collectibles",message:"Piezas exclusivas · colección en preparación."},
 {name:"ARTE DIGITAL",symbol:"▧",tone:"art",message:"Arte digital · colección en preparación."},
 {name:"EQUIPO GAMER",symbol:"⌘",tone:"gear",message:"Equipo gamer · colección en preparación."}
] as const;
export function LiryStoreCategories(){
 const [selected,setSelected]=useState<(typeof collections)[number]>(collections[0]);
 const dialogRef=useRef<HTMLDialogElement>(null);
 const triggerRef=useRef<HTMLButtonElement|null>(null);
 return <>
  <div className={styles.storeCategories} aria-label="Categorías previstas para Tienda Liry">
   {collections.map(item=><button type="button" key={item.name} className={styles.storeCategory} aria-haspopup="dialog" onClick={event=>{setSelected(item);triggerRef.current=event.currentTarget;dialogRef.current?.showModal()}}>
     <span className={`${styles.storeCategoryVisual} ${styles[`storeTone_${item.tone}` ]}`} aria-hidden="true">{item.symbol}</span><strong>{item.name}</strong><span className={styles.storeCategoryLine}/>
   </button>)}
  </div>
  <dialog ref={dialogRef} className={styles.gamerInfoDialog} aria-labelledby="liry-store-detail-title" onClose={()=>triggerRef.current?.focus({preventScroll:true})} onClick={event=>{if(event.target===dialogRef.current)dialogRef.current.close()}}>
   <div className={styles.gamerInfoDialogInside}>
    <form method="dialog"><button type="submit" className={styles.gamerInfoClose} aria-label="Cerrar categoría">×</button></form>
    <p className={styles.gamerInfoEyebrow}>LIRYGAMES STUDIOS · TIENDA LIRY</p>
    <h3 id="liry-store-detail-title">{selected.name}</h3>
    <p>{selected.message}</p><p>Sin artículos ni pagos activos. Anunciaremos proveedores y condiciones oficiales al abrir la tienda.</p>
    <form method="dialog"><button type="submit" className={styles.gamerInfoDone}>ENTENDIDO</button></form>
   </div>
  </dialog>
 </>;
}
