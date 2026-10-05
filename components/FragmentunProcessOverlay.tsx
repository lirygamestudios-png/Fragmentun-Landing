"use client";

type ProcessState="loading"|"processing"|"uploading"|"success"|"error";

export function FragmentunProcessOverlay({
  state="processing",
  title,
  detail
}:{
  state?:ProcessState;
  title?:string;
  detail?:string;
}){
  const labels={
    loading:"CARGANDO…",
    processing:"PROCESANDO…",
    uploading:"SUBIENDO…",
    success:"GUARDADO SATISFACTORIAMENTE",
    error:"ERROR"
  };
  return <div className={"fragmentunProcessOverlay state-"+state} role="status" aria-live="polite">
    <div className="fragmentunProcessCore">
      <div className="fragmentunProcessMark">
        <span className="fragmentunProcessOrbit orbitOne"/>
        <span className="fragmentunProcessOrbit orbitTwo"/>
        <span className="fragmentunProcessGlow"/>
        <img src="/fragmentun-logo-official.webp" alt="FRAGMENTUN"/>
      </div>
      <strong>{title||labels[state]}</strong>
      {detail&&<p>{detail}</p>}
      <div className="fragmentunProcessLine"><i/></div>
    </div>
  </div>;
}
