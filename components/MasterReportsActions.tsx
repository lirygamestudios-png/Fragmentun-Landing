"use client";
import {useState} from "react";

type Row={label:string;value:string|number};

export function MasterReportsActions({rows}:{rows:Row[]}){
  const[message,setMessage]=useState("");
  const[state,setState]=useState<"info"|"success"|"error">("info");

  function exportCsv(){
    try{
      const csv=["Indicador,Valor",...rows.map(r=>`"${String(r.label).replaceAll('"','""')}","${String(r.value).replaceAll('"','""')}"`)].join("\r\n");
      const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");
      a.href=url;
      a.download="lirygames-reporte-ejecutivo.csv";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(()=>URL.revokeObjectURL(url),1000);
      setState("success");
      setMessage("Reporte exportado correctamente.");
    }catch{
      setState("error");
      setMessage("No fue posible exportar el reporte.");
    }
  }

  return <div className="adminNoPrint">
    <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
      <button type="button" className="btn btnPrimary" onClick={()=>{setState("info");setMessage("Abriendo opciones de impresión…");window.print();}}>Imprimir / Guardar PDF</button>
      <button type="button" className="btn btnGhost" onClick={exportCsv}>Exportar CSV</button>
    </div>
    {message&&<p role={state==="error"?"alert":"status"} aria-live="polite" style={{margin:"8px 0 0",fontSize:".76rem",color:state==="error"?"#ffaaaa":state==="success"?"#8aebbd":"#9fb0c6"}}>{message}</p>}
  </div>;
}
