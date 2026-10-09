"use client";
import {useState} from "react";
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
 const selected=demoItems.find(p=>p.id===item)!;
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
 const boxStyle:React.CSSProperties={border:"1px solid #4b7190",borderRadius:10,padding:16,background:"#0d1e38",color:"#dceaff"};
 const controlStyle:React.CSSProperties={width:"100%",padding:12,borderRadius:7,background:"#142b4a",border:"1px solid #577ca3",color:"#fff"};
 return <section style={{margin:"22px 0",padding:20,border:"1px solid #4c7298",borderRadius:14}}>
   <p style={{fontWeight:800,color:"#70dbf0"}}>LABORATORIO DE PAGOS · SIMULACIÓN LOCAL</p>
   <p>Este recorrido es únicamente visual: no crea pedidos, no llama a proveedores, no cobra, no persiste operaciones ni entrega artículos reales.</p>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))",gap:14}}>
    <div style={boxStyle}><label>Artículo de demostración<select style={controlStyle} value={item} disabled={step!=="select"} onChange={e=>setItem(e.target.value)}>{demoItems.map(x=><option value={x.id} key={x.id}>{x.name} · US${(x.cents/100).toFixed(2)}</option>)}</select></label></div>
    <div style={boxStyle}><label>Procesador previsto<select style={controlStyle} value={provider} disabled={step!=="select"} onChange={e=>setProvider(e.target.value as PaymentProviderId)}>{paymentProviders.map(x=><option key={x.id} value={x.id}>{x.displayName}</option>)}</select></label></div>
   </div>
   <div style={{marginTop:14,...boxStyle}} aria-live="polite">
    <strong>Paso actual: {step==="select"?"Selección":step==="pending"?"Pago simulado pendiente":"Resultado simulado"}</strong>
    <p>{step==="select"?"Escoge artículo y procesador para ensayar el flujo.":step==="pending"?"Elige qué respuesta hipotética devolvería la pasarela.":event==="paid"?"Pago simulado confirmado. Entrega DEMOSTRATIVA, no registrada.":event==="refunded"?"Devolución simulada. No hubo movimiento de dinero.":"Pago simulado rechazado; no corresponde entrega."}</p>
    {error&&<p role="alert">No se completó la simulación: {error}</p>}
    {receipt&&<p>Referencia de prueba: <strong>{receipt}</strong> · Sin persistencia ni cargo.</p>}
    {step==="select"?<button type="button" style={controlStyle} onClick={()=>setStep("pending")}>INICIAR SIMULACIÓN ↗</button>:
     step==="pending"?<div style={{display:"flex",flexWrap:"wrap",gap:9}}>{(["paid","failed","refunded"] as const).map(v=><button type="button" key={v} style={{...controlStyle,width:"auto"}} disabled={loading} onClick={()=>simulate(v)}>{v==="paid"?"Simular aprobado":v==="failed"?"Simular rechazado":"Simular devolución"}</button>)}</div>:
     <button type="button" onClick={reset} style={controlStyle}>REINICIAR DEMOSTRACIÓN ↻</button>}
   </div>
 </section>;
}
