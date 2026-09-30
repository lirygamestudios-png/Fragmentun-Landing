"use client";
import { useEffect,useState } from "react";

export function AdminUsers(){
 const[data,setData]=useState<any>({allowlist:[],profiles:[]});const[form,setForm]=useState({email:"",display_name:"",role:"editor"});const[msg,setMsg]=useState("");
 const load=()=>fetch("/api/admin/users").then(r=>r.json()).then(setData);
 useEffect(()=>{load()},[]);
 async function add(){setMsg("Guardando…");const r=await fetch("/api/admin/users",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(r.ok){setForm({email:"",display_name:"",role:"editor"});load();setMsg("Acceso guardado ✓")}else setMsg("Error")}
 async function remove(email:string){if(!confirm("¿Quitar este correo de la lista de acceso?"))return;await fetch("/api/admin/users?email="+encodeURIComponent(email),{method:"DELETE"});load()}
 return <div>
   <div className="card"><h2>Autorizar usuario</h2><div className="adminFormGrid"><input placeholder="Nombre" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})}/><input placeholder="email@dominio.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/><select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}><option value="admin">Administrador</option><option value="editor">Editor</option><option value="marketing">Marketing</option></select><button className="btn btnPrimary" onClick={add}>Autorizar</button></div></div>
   <div className="card" style={{marginTop:22}}><h2>Lista de acceso</h2><div className="adminTableWrap"><table className="adminTable"><thead><tr><th>Correo</th><th>Nombre</th><th>Rol</th><th></th></tr></thead><tbody>{(data.allowlist||[]).map((u:any)=><tr key={u.email}><td>{u.email}</td><td>{u.display_name||"—"}</td><td>{u.role}</td><td><button className="btn btnGhost" onClick={()=>remove(u.email)}>Quitar</button></td></tr>)}</tbody></table></div></div><p>{msg}</p>
 </div>;
}
