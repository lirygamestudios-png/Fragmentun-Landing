"use client";
import { useEffect,useState } from "react";

export function AdminTestEditor(){
 const[questions,setQuestions]=useState<any[]>([]);const[profiles,setProfiles]=useState<any[]>([]);const[msg,setMsg]=useState("");
 useEffect(()=>{fetch("/api/admin/test").then(r=>r.json()).then(j=>{setQuestions(j.questions||[]);setProfiles(j.profiles||[])})},[]);
 async function save(kind:string,item:any){setMsg("Guardando…");const r=await fetch("/api/admin/test",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify({...item,kind})});setMsg(r.ok?"Guardado ✓":"Error")}
 return <div className="adminSecondaryModule adminTestModule">
   <div className="adminModuleSectionHead"><div><div className="kicker">Experiencia emocional</div><h2>Preguntas</h2></div><span>{questions.length} preguntas</span></div>
   <div className="adminQuestionList">{questions.map((q,qi)=><article className="card" key={q.id}>
     <div className="kicker">Pregunta {q.sort_order}</div>
     <label>Español</label><textarea className="adminSmallArea" value={q.prompt_es||""} onChange={e=>setQuestions(a=>a.map((x,n)=>n===qi?{...x,prompt_es:e.target.value}:x))}/>
     <label>Inglés</label><textarea className="adminSmallArea" value={q.prompt_en||""} onChange={e=>setQuestions(a=>a.map((x,n)=>n===qi?{...x,prompt_en:e.target.value}:x))}/>
     <button className="btn btnPrimary" onClick={()=>save("question",q)}>Guardar pregunta</button>
     <div className="adminOptionGrid">{(q.test_options||[]).map((o:any,oi:number)=><div className="adminOption" key={o.id}>
       <strong>Opción {oi+1}</strong>
       <label>Español</label>
       <input value={o.label_es||""} onChange={e=>setQuestions(a=>a.map((x,n)=>n===qi?{...x,test_options:x.test_options.map((z:any,m:number)=>m===oi?{...z,label_es:e.target.value}:z)}:x))}/>
       <label>Inglés</label>
       <input value={o.label_en||""} onChange={e=>setQuestions(a=>a.map((x,n)=>n===qi?{...x,test_options:x.test_options.map((z:any,m:number)=>m===oi?{...z,label_en:e.target.value}:z)}:x))}/>
       <button className="btn btnGhost" onClick={()=>save("option",o)}>Guardar opción</button>
     </div>)}</div>
   </article>)}</div>
   <div className="adminModuleSectionHead" style={{marginTop:32}}><div><div className="kicker">Resultados</div><h2>Perfiles</h2></div><span>{profiles.length} perfiles</span></div>
   <div className="adminBookGrid">{profiles.map((p,i)=><article className="card" key={p.id}>
     <div className="kicker">{p.profile_key}</div>
     <label>Nombre · Español</label><input value={p.name_es||""} onChange={e=>setProfiles(a=>a.map((x,n)=>n===i?{...x,name_es:e.target.value}:x))}/>
     <label>Nombre · Inglés</label><input value={p.name_en||""} onChange={e=>setProfiles(a=>a.map((x,n)=>n===i?{...x,name_en:e.target.value}:x))}/>
     <label>Fortaleza · Español</label><input value={p.superpower_es||""} onChange={e=>setProfiles(a=>a.map((x,n)=>n===i?{...x,superpower_es:e.target.value}:x))}/>
     <label>Fortaleza · Inglés</label><input value={p.superpower_en||""} onChange={e=>setProfiles(a=>a.map((x,n)=>n===i?{...x,superpower_en:e.target.value}:x))}/>
     <button className="btn btnPrimary" onClick={()=>save("profile",p)}>Guardar perfil</button>
   </article>)}</div><p>{msg}</p>
 </div>;
}
