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

function validationErrorMessage(code:string){
  const map:Record<string,string>={
    mfa_required:"Completa la verificación en dos pasos antes de guardar esta validación.",
    forbidden:"Tu usuario no tiene permiso para guardar esta validación.",
    validation_results_save_failed:"La prueba terminó, pero no fue posible guardar sus resultados.",
    invalid_results:"Los resultados de la prueba no tienen un formato válido.",
    invalid_run_code:"No fue posible identificar correctamente esta ejecución."
  };
  return map[code]||"La comprobación terminó, pero no fue posible guardar el resultado.";
}

export function PreviewValidationButton(){
  const[loading,setLoading]=useState(false);
  const[message,setMessage]=useState("");
  const[ok,setOk]=useState<boolean|null>(null);

  async function run(){
    if(loading)return;
    setLoading(true);
    setOk(null);
    setMessage("Comprobando esta versión de prueba…");

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
      {name:"Revisión visual",path:"/admin/master/checklist",expected:200},
      {name:"Pruebas finales",path:"/admin/master/qa",expected:200}
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
      const success=body?.status==="passed";
      setOk(success);
      setMessage(success
        ?`Todo correcto: ${passed}/${results.length} comprobaciones superadas.`
        :`Revisar: el servidor registró la validación con observaciones.`);
      window.setTimeout(()=>window.location.reload(),900);
    }catch(error:any){
      setOk(false);
      setMessage(validationErrorMessage(String(error?.message||error)));
    }finally{
      setLoading(false);
    }
  }

  return <div>
    <button type="button" onClick={run} disabled={loading} className="masterQaButton">
      {loading?"Comprobando…":"Comprobar versión de prueba"}
    </button>
    {message&&<p role={ok===false?"alert":"status"} aria-live="polite" style={{margin:"8px 0 0",fontSize:".74rem",color:ok===false?"#ffaaaa":ok===true?"#8aebbd":"#9fb0c6"}}>{message}</p>}
  </div>;
}
