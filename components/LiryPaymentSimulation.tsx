"use client";
import {useState} from "react";
import styles from "../app/admin/master/master-admin.module.css";
import {paymentProviders,type PaymentProviderId} from "../lib/payments/provider-contract";

type Step="select"|"pending"|"confirmed";
const demoItems=[{id:"skin-demo",name:"Skin de prueba",cents:499},{id:"effect-demo",name:"Efecto visual de prueba",cents:299}] as const;
export function LiryPaymentSimulation(){
 const [item,setItem]=useState<string>(demoItems[0].id);
 const [provider,setProvider]=useState<PaymentProviderId>("stripe");
 const [step,setStep]=useState<Step>("select");
 const [event,setEvent]=useState<"paid"|"failed"|"refunded">("paid");
 const [receipt,setReceipt]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(false);
 const reset=()=>{setStep("select");setEvent("paid");setReceipt("");setError("");};
 async function simulate(outcome:"paid"|"failed"|"refunded"){
   setLoading(true);setError("");
   try{
     const idempotencyKey=crypto.randomUUID().replaceAll("-","");
     const response=await fetch("/api/lirygames/payment-simulation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:item,provider,outcome,idempotencyKey})});
     const data=await response.json();
     if(!response.ok||!data.simulation||data.realCharge||data.entitlementGranted)throw new Error(data.error||"simulation_failed");
     setReceipt(data.reference);setEvent(outcome);setStep("confirmed");
   }catch(e){setError(e instanceof Error?e.message:"simulation_failed");}
   finally{setLoading(false);}
 }
 return <section className={styles.commerceSimulation}>
   <p className={styles.commerceSimulationTitle}>LABORATORIO DE PAGOS · PRUEBA PROTEGIDA EN SERVIDOR</p>
   <p>Esta simulación solicita una respuesta al servidor, pero no llama a procesadores, no crea pedidos, no cobra, no guarda transacciones ni concede artículos reales.</p>
   <div className={styles.commerceSimulationGrid}>
    <div className={styles.commerceSimulationField}><label>Artículo de demostración<select className={styles.commerceSimulationSelect} value={item} disabled={step!=="select"} onChange={e=>setItem(e.target.value)}>{demoItems.map(x=><option value={x.id} key={x.id}>{x.name} · US${(x.cents/100).toFixed(2)}</option>)}</select></label></div>
    <div className={styles.commerceSimulationField}><label>Procesador previsto<select className={styles.commerceSimulationSelect} value={provider} disabled={step!=="select"} onChange={e=>setProvider(e.target.value as PaymentProviderId)}>{paymentProviders.map(x=><option key={x.id} value={x.id}>{x.displayName}</option>)}</select></label></div>
   </div>
   <div className={styles.commerceSimulationResult} aria-live="polite">
    <strong>Paso actual: {step==="select"?"Selección":step==="pending"?"Pago simulado pendiente":"Resultado simulado"}</strong>
    <p>{step==="select"?"Escoge artículo y procesador para ensayar el flujo.":step==="pending"?"Elige qué respuesta hipotética devolvería la pasarela.":event==="paid"?"Pago simulado confirmado. Entrega DEMOSTRATIVA, no registrada.":event==="refunded"?"Devolución simulada. No hubo movimiento de dinero.":"Pago simulado rechazado; no corresponde entrega."}</p>
    {error&&<p role="alert">No se completó la simulación: {error}</p>}
    {receipt&&<p>Referencia de prueba: <strong>{receipt}</strong> · Sin persistencia ni cargo.</p>}
    {step==="select"?<button type="button" className={styles.commerceSimulationButton} onClick={()=>setStep("pending")}>INICIAR SIMULACIÓN ↗</button>:
     step==="pending"?<div className={styles.commerceSimulationActions}>{(["paid","failed","refunded"] as const).map(v=><button type="button" key={v} className={styles.commerceSimulationButton} disabled={loading} onClick={()=>simulate(v)}>{v==="paid"?"Simular aprobado":v==="failed"?"Simular rechazado":"Simular devolución"}</button>)}</div>:
     <button type="button" onClick={reset} className={styles.commerceSimulationButton}>REINICIAR DEMOSTRACIÓN ↻</button>}
   </div>
 </section>;
}
