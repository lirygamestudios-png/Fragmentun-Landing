"use client";
import {useState,type FormEvent} from "react";
export function LiryContactForm(){
 const[name,setName]=useState("");
 const[email,setEmail]=useState("");
 const[subject,setSubject]=useState("opinion");
 const[gameSlug,setGameSlug]=useState("");
 const[message,setMessage]=useState("");
 const[ack,setAck]=useState(false);
 const[busy,setBusy]=useState(false);
 const[result,setResult]=useState("");
 const[done,setDone]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setResult("");
  try{
   const r=await fetch("/api/lirygames/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,subject,gameSlug,message,privacyAcknowledged:ack})});
   const j=await r.json();
   if(!r.ok||!j.ok)throw Error(j.message||"No se pudo enviar.");
   setDone(true);setResult(j.message);
  }catch(error){setResult(error instanceof Error?error.message:"Error de envío");}
  finally{setBusy(false)}
 }
 const field={width:"100%",minWidth:0,padding:"11px 12px",border:"1px solid #286e98",borderRadius:6,background:"#061429",color:"#f2fbff",fontSize:12};
 return <form onSubmit={submit} style={{display:"grid",gap:11,maxWidth:700}} aria-label="Formulario de contacto LIRYGAMES">
  {!done&&<>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(210px,1fr))",gap:10}}>
    <input style={field} type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" aria-label="Nombre" required minLength={2} maxLength={100}/>
    <input style={field} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Correo electrónico" aria-label="Correo electrónico" required maxLength={254}/>
   </div>
   <select style={field} aria-label="Motivo del contacto" value={subject} onChange={e=>setSubject(e.target.value)} required>
    <option value="opinion">Opinión sobre nuestros juegos</option>
    <option value="suggestion">Sugerencia de mejora</option>
    <option value="problem">Reportar un problema</option>
    <option value="business">Propuesta comercial o colaboración</option>
    <option value="other">Otra consulta</option>
   </select>
   <input style={field} type="text" value={gameSlug} onChange={e=>setGameSlug(e.target.value)} placeholder="Videojuego o producto (opcional)" aria-label="Videojuego o producto (opcional)" maxLength={80}/>
   <textarea style={{...field,minHeight:112,resize:"vertical"}} aria-label="Tu mensaje" placeholder="Escribe tu mensaje aquí..." value={message} onChange={e=>setMessage(e.target.value)} minLength={10} maxLength={3000} required/>
   <label className="liryContactConsent"><input className="liryContactCheck" type="checkbox" checked={ack} onChange={e=>setAck(e.target.checked)} required/><span>Autorizo el tratamiento de mis datos para responder a este mensaje. No implica suscripción a publicidad.</span></label>
   <input name="website" aria-hidden="true" autoComplete="off" tabIndex={-1} style={{position:"absolute",left:-9999}}/>
   <button className="liryContactSubmit" disabled={busy} type="submit">{busy?"ENVIANDO...":"ENVIAR MENSAJE →"}</button>
  </>}
  {result&&<p role="status" style={{fontSize:12,color:done?"#89ebd0":"#ffb2b2",margin:0}}>{result}</p>}
 </form>;
}
