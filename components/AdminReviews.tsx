"use client";
import { useEffect,useState } from "react";
const empty={source:"Amazon",author_display:"",body_original:"",body_es:"",body_en:"",source_url:"",verified:false,published:false};

export function AdminReviews(){
 const[rows,setRows]=useState<any[]>([]);const[form,setForm]=useState<any>(empty);const[msg,setMsg]=useState("");
 const load=()=>fetch("/api/admin/reviews").then(r=>r.json()).then(j=>setRows(j.data||[]));
 useEffect(()=>{load()},[]);
 async function add(){const r=await fetch("/api/admin/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(r.ok){setForm(empty);load();setMsg("GUARDADO SATISFACTORIAMENTE")}else setMsg("ERROR: NO FUE POSIBLE GUARDAR")}
 async function save(row:any){const r=await fetch("/api/admin/reviews",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(row)});setMsg(r.ok?"GUARDADO SATISFACTORIAMENTE":"ERROR: NO FUE POSIBLE GUARDAR")}
 return <div className="adminSecondaryModule adminReviewsModule">
  <div className="card adminSecondaryPanel"><div className="adminPanelHeader"><div><div className="kicker">Prueba social</div><h2>Nueva reseña</h2></div><span className="adminPanelBadge">Verificable</span></div><div className="adminReviewGrid">
    <input placeholder="Fuente" value={form.source} onChange={e=>setForm({...form,source:e.target.value})}/>
    <input placeholder="Autor mostrado" value={form.author_display} onChange={e=>setForm({...form,author_display:e.target.value})}/>
    <input placeholder="URL de origen" value={form.source_url} onChange={e=>setForm({...form,source_url:e.target.value})}/>
    <textarea placeholder="Texto original" value={form.body_original} onChange={e=>setForm({...form,body_original:e.target.value})}/>
    <label><input type="checkbox" checked={form.verified} onChange={e=>setForm({...form,verified:e.target.checked})}/> Verificada</label>
    <label><input type="checkbox" checked={form.published} onChange={e=>setForm({...form,published:e.target.checked})}/> Publicada</label>
    <button className="btn btnPrimary" onClick={add}>Añadir reseña</button>
  </div><p className="note">Solo publica reseñas auténticas y verificables. No se generan testimonios ficticios.</p></div>
  <div className="adminQuestionList" style={{marginTop:22}}>{rows.map((r,i)=><article className="card" key={r.id}>
    <div className="kicker">{r.source}</div><h3>{r.author_display||"Sin nombre"}</h3><textarea className="adminSmallArea" value={r.body_original||""} onChange={e=>setRows(a=>a.map((x,n)=>n===i?{...x,body_original:e.target.value}:x))}/>
    <label><input type="checkbox" checked={!!r.verified} onChange={e=>setRows(a=>a.map((x,n)=>n===i?{...x,verified:e.target.checked}:x))}/> Verificada</label>
    <label><input type="checkbox" checked={!!r.published} onChange={e=>setRows(a=>a.map((x,n)=>n===i?{...x,published:e.target.checked}:x))}/> Publicada</label>
    <button className="btn btnGhost" onClick={()=>save(r)}>Guardar</button>
  </article>)}</div><p className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</p>
 </div>;
}
