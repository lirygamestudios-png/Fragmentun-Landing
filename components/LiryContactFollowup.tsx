"use client";
import {useState,type FormEvent} from "react";
type Owner={user_id:string;display_name:string|null};
export function LiryContactFollowup({id,status,note,assignedTo,owners}:{id:string;status:string;note:string|null;assignedTo:string|null;owners:Owner[]}){
 const[state,setState]=useState(status),[memo,setMemo]=useState(note||""),[owner,setOwner]=useState(assignedTo||"");
 const[busy,setBusy]=useState(false),[feedback,setFeedback]=useState("");
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setFeedback("");
  try{
   const r=await fetch("/api/admin/lirygames-contact",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:state,internalNote:memo,assignedTo:owner||null})});
   const result=await r.json();
   if(!r.ok||!result.ok)throw Error(result.message||"No se pudo guardar.");
   setFeedback("Cambios guardados correctamente.");
  }catch(err){setFeedback(err instanceof Error?err.message:"No se pudo guardar.")}
  finally{setBusy(false)}
 }
 return <form onSubmit={save} style={{display:"grid",gap:9,marginTop:13,borderTop:"1px solid #254960",paddingTop:11}}>
  <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
   <label style={{display:"grid",gap:4,fontSize:11,color:"#aac7dd"}}>Estado
    <select value={state} onChange={e=>setState(e.target.value)} style={{background:"#0b2843",color:"#fff",padding:8,border:"1px solid #35688b",borderRadius:4}}>
     <option value="new">Nuevo</option><option value="reviewing">En revisión</option><option value="resolved">Resuelto</option><option value="archived">Archivado</option>
    </select>
   </label>
   <label style={{display:"grid",gap:4,fontSize:11,color:"#aac7dd"}}>Responsable
    <select value={owner} onChange={e=>setOwner(e.target.value)} style={{background:"#0b2843",color:"#fff",padding:8,border:"1px solid #35688b",borderRadius:4}}>
     <option value="">Sin asignar</option>{owners.map(o=><option key={o.user_id} value={o.user_id}>{o.display_name||"Administrador"}</option>)}
    </select>
   </label>
  </div>
  <label style={{display:"grid",gap:4,fontSize:11,color:"#aac7dd"}}>Nota de seguimiento (solo interna)
   <textarea maxLength={3000} rows={2} value={memo} onChange={e=>setMemo(e.target.value)} style={{background:"#071728",color:"#fff",padding:9,border:"1px solid #35688b",borderRadius:4,resize:"vertical"}}/>
  </label>
  <div style={{display:"flex",alignItems:"center",gap:12}}>
   <button disabled={busy} type="submit" style={{background:"#086fa9",border:"1px solid #24cafa",borderRadius:5,padding:"9px 13px",color:"#fff",fontWeight:700,cursor:"pointer"}}>{busy?"GUARDANDO...":"GUARDAR SEGUIMIENTO"}</button>
   <span role="status" style={{fontSize:11,color:"#9eddd4"}}>{feedback}</span>
  </div>
 </form>
}
