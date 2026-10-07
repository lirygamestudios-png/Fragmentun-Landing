"use client";

type Row={label:string;value:string|number};

export function MasterReportsActions({rows}:{rows:Row[]}){
  function exportCsv(){
    const csv=["Indicador,Valor",...rows.map(r=>`"${String(r.label).replaceAll('"','""')}","${String(r.value).replaceAll('"','""')}"`)].join("\n");
    const blob=new Blob([csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download="lirygames-reporte-ejecutivo.csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return <div className="adminNoPrint" style={{display:"flex",gap:10,flexWrap:"wrap"}}>
    <button className="btn btnPrimary" onClick={()=>window.print()}>Imprimir / Guardar PDF</button>
    <button className="btn btnGhost" onClick={exportCsv}>Exportar CSV</button>
  </div>;
}
