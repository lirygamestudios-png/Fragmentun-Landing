"use client";
import {useState} from "react";

type CheckResult={
  name:string;
  path:string;
  method:"GET";
  expected:number;
  actual:number|null;
  status:"passed"|"failed";
  redirect:string|null;
  detail:string;
  latency:number;
};

export function PreviewValidationButton(){
  const[loading,setLoading]=useState(false);
  const[message,setMessage]=useState("");
  const[ok,setOk]=useState<boolean|null>(null);

  async function run(){
    if(loading)return;
    setLoading(true);
    setOk(null);
    setMessage("Comprobando este Preview…");

    const checks=[
      {name:"Página pública",path:"/es",expected:200},
      {name:"Acceso al Admin",path:"/admin/login",expected:200},
      {name:"Panel LIRYGAMES",path:"/admin/master",expected:200},
      {name:"Estado del sistema",path:"/api/admin/status",expected:200},
      {name:"Comercio",path:"/api/admin/commerce",expected:200},
      {name:"Reportes",path:"/admin/master/reports",expected:200},
      {name:"Copias y Recuperación",path:"/admin/master/backups",expected:200},
      {name:"Integraciones",path:"/admin/master/integrations",expected:200},
      {name:"Mantenimiento",path:"/admin/master/maintenance",expected:200},
      {name:"Checklist visual",path:"/admin/master/checklist",expected:200},
      {name:"QA final",path:"/admin/master/qa",expected:200}
    ] as const;

    const results:CheckResult[]=[];
    for(const check of checks){
      const started=Date.now();
      try{
        const response=await fetch(check.path,{method:"GET",credentials:"include",redirect:"manual",cache:"no-store"});
        const actual=response.status;
        results.push({
          name:check.name,path:check.path,method:"GET",expected:check.expected,actual,
          status:actual===check.expected?"passed":"failed",
          redirect:response.headers.get("location"),
          detail:actual===check.expected?"Respuesta correcta.":"La respuesta fue distinta a la esperada.",
          latency:Date.now()-started
        });
      }catch(error:any){
        results.push({
          name:check.name,path:check.path,method:"GET",expected:check.expected,actual:null,status:"failed",
          redirect:null,detail:"No fue posible completar la comprobación: "+String(error?.message||error),
          latency:Date.now()-started
        });
      }
    }

    try{
      const save=await fetch("/api/admin/observability/validate",{
        method:"POST",
        credentials:"include",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({results})
      });
      const body=await save.json().catch(()=>({}));
      if(!save.ok)throw new Error(body?.error||"save_failed");
      const passed=results.filter(r=>r.status==="passed").length;
      const success=passed===results.length;
      setOk(success);
      setMessage(success
        ?`Todo correcto: ${passed}/${results.length} comprobaciones superadas.`
        :`Revisar: ${passed}/${results.length} comprobaciones superadas.`);
      window.setTimeout(()=>window.location.reload(),900);
    }catch(error:any){
      setOk(false);
      setMessage("La comprobación terminó, pero no fue posible guardar el resultado.");
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button type="button" onClick={run} disabled={loading} className="masterQaButton">
      {loading?"Comprobando…":"Comprobar este Preview"}
    </button>
    {message&&<p role="status" style={{margin:"8px 0 0",fontSize:".74rem",color:ok===false?"#e7b477":"#9fb0c6"}}>{message}</p>}
  </div>;
}
