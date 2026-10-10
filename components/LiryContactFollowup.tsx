"use client";
import visual from "../app/admin/master/community/messages/messages.module.css";
import {useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
type Owner={user_id:string;display_name:string|null};
export function LiryContactFollowup({id,status,note,assignedTo,responseDraft,owners}:{id:string;status:string;note:string|null;assignedTo:string|null;responseDraft:string|null;owners:Owner[]}){
 const router=useRouter();
 const[state,setState]=useState(status),[memo,setMemo]=useState(note||""),[owner,setOwner]=useState(assignedTo||"");
 const[draft,setDraft]=useState(responseDraft||"");
 const[busy,setBusy]=useState(false),[feedback,setFeedback]=useState("");
 const [saved,setSaved]=useState({status,note:note||"",owner:assignedTo||"",draft:responseDraft||""});
 const hasChanges=state!==saved.status||memo!==saved.note||owner!==saved.owner||draft!==saved.draft;
 async function save(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setFeedback("");
  try{
   const r=await fetch("/api/admin/lirygames-contact",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({id,status:state,internalNote:memo,assignedTo:owner||null,responseDraft:draft})});
   const result=await r.json();
   if(!r.ok||!result.ok)throw Error(result.message||"No se pudo guardar.");
   setSaved({status,note:memo.trim(),owner,draft:draft.trim()});
   setFeedback("Cambios guardados correctamente.");
   router.refresh();
  }catch(err){setFeedback(err instanceof Error?err.message:"No se pudo guardar.")}
  finally{setBusy(false)}
 }
 return <form className={visual.followup} onSubmit={save} style={{display:"grid",gap:9,marginTop:13,borderTop:"1px solid #254960",paddingTop:11}}>
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
  <label style={{display:"grid",gap:4,fontSize:11,color:"#aac7dd"}}>Borrador de respuesta (no se envía automáticamente)
   <textarea maxLength={5000} rows={4} value={draft} onChange={e=>setDraft(e.target.value)} placeholder="Redacta aquí la respuesta para el usuario..." style={{background:"#071728",color:"#fff",padding:9,border:"1px solid #35688b",borderRadius:4,resize:"vertical"}}/>
  </label>
  <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
   <button disabled={busy} type="submit" style={{background:"#086fa9",border:"1px solid #24cafa",borderRadius:5,padding:"9px 13px",color:"#fff",fontWeight:700,cursor:"pointer"}}>{busy?"GUARDANDO...":"GUARDAR SEGUIMIENTO"}</button>
   <span role="status" aria-live="polite" style={{fontSize:11,color:feedback.startsWith("Cambios guardados")?"#9eddd4":"#ffcd9e"}}>{feedback|| (hasChanges?"● Cambios sin guardar":"Sin cambios pendientes")}</span>
  </div>
 </form>
}
