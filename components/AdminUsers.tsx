"use client";
import { useEffect,useState } from "react";

const errorText:Record<string,string>={
  invalid_request:"Datos inválidos.",
  cannot_demote_self:"No puedes quitarte a ti mismo el rol de administrador.",
  cannot_remove_self:"No puedes quitar tu propio acceso mientras tu sesión está activa.",
  cannot_remove_last_admin:"Debe permanecer al menos un administrador autorizado.",
  save_failed:"No fue posible guardar el acceso.",
  delete_failed:"No fue posible revocar el acceso.",
  forbidden:"No tienes permisos para realizar esta acción."
};

export function AdminUsers(){
  const[data,setData]=useState<any>({allowlist:[],profiles:[],current_user:null});
  const[form,setForm]=useState({email:"",display_name:"",role:"editor"});
  const[msg,setMsg]=useState("");

  const load=()=>fetch("/api/admin/users",{cache:"no-store"}).then(r=>r.json()).then(setData);
  useEffect(()=>{load()},[]);

  async function add(){
    setMsg("Guardando…");
    const r=await fetch("/api/admin/users",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(form)
    });
    const j=await r.json().catch(()=>({}));
    if(r.ok){
      setForm({email:"",display_name:"",role:"editor"});
      await load();
      setMsg(j.synced_profile?"Acceso y perfil actualizados ✓":"Acceso guardado ✓ · el perfil se activará cuando el usuario acceda.");
    }else{
      setMsg(errorText[j.error]||"No fue posible guardar el acceso.");
    }
  }

  async function remove(email:string){
    if(!confirm("¿Revocar este acceso administrativo?"))return;
    setMsg("Revocando acceso…");
    const r=await fetch("/api/admin/users?email="+encodeURIComponent(email),{method:"DELETE"});
    const j=await r.json().catch(()=>({}));
    if(r.ok){
      await load();
      setMsg("Acceso revocado ✓");
    }else{
      setMsg(errorText[j.error]||"No fue posible revocar el acceso.");
    }
  }

  const current=(data.current_user?.email||"").toLowerCase();

  return <div>
    <div className="card">
      <h2>Autorizar usuario</h2>
      <p className="note">Los cambios de rol se sincronizan también con perfiles ya aprovisionados. Tu propio acceso administrativo está protegido contra revocación o degradación accidental.</p>
      <div className="adminFormGrid">
        <input placeholder="Nombre" value={form.display_name} onChange={e=>setForm({...form,display_name:e.target.value})}/>
        <input type="email" placeholder="email@dominio.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
        <select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
          <option value="admin">Administrador</option>
          <option value="editor">Editor</option>
          <option value="marketing">Marketing</option>
        </select>
        <button className="btn btnPrimary" onClick={add}>Autorizar / actualizar</button>
      </div>
    </div>

    <div className="card" style={{marginTop:22}}>
      <h2>Lista de acceso</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Correo</th><th>Nombre</th><th>Rol</th><th>Perfil</th><th></th></tr></thead>
          <tbody>{(data.allowlist||[]).map((u:any)=>{
            const profile=(data.profiles||[]).find((p:any)=>String(p.user_id)===(u.user_id||""));
            const isSelf=String(u.email||"").toLowerCase()===current;
            return <tr key={u.email}>
              <td>{u.email}{isSelf&&<small style={{marginLeft:8}}>Tú</small>}</td>
              <td>{u.display_name||"—"}</td>
              <td>{u.role}</td>
              <td>{profile?"Activo":"Pendiente de primer acceso"}</td>
              <td><button className="btn btnGhost" disabled={isSelf} onClick={()=>remove(u.email)}>{isSelf?"Protegido":"Quitar"}</button></td>
            </tr>;
          })}</tbody>
        </table>
      </div>
    </div>

    <div className="card" style={{marginTop:22}}>
      <h2>Perfiles aprovisionados</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Usuario</th><th>Nombre</th><th>Rol</th><th>Creado</th></tr></thead>
          <tbody>{(data.profiles||[]).map((p:any)=><tr key={p.user_id}>
            <td>{String(p.user_id).slice(0,8)}…</td>
            <td>{p.display_name||"—"}</td>
            <td>{p.role}</td>
            <td>{p.created_at?new Date(p.created_at).toLocaleString():"—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>

    {msg&&<p>{msg}</p>}
  </div>;
}
