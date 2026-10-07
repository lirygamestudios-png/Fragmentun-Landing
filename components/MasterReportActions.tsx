"use client";

type ReportMetric={label:string;value:string;detail:string};

export function MasterReportActions({metrics}:{metrics:ReportMetric[]}){
  function downloadCsv(){
    const rows=[["Indicador","Valor","Detalle"],...metrics.map(m=>[m.label,m.value,m.detail])];
    const csv=rows.map(row=>row.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");
    const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8"});
    const url=URL.createObjectURL(blob);
    const a=document.createElement("a");
    a.href=url;
    a.download=`lirygames-reporte-ejecutivo-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  return <div className="masterReportActions">
    <button type="button" onClick={()=>window.print()}>Imprimir / Guardar PDF</button>
    <button type="button" onClick={downloadCsv}>Exportar CSV</button>
  </div>;
}
