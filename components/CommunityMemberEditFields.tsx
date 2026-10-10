"use client";
import {useState} from "react";
type Member={id:string;display_name:string|null;handle:string|null;email:string|null;status:string;tier:string;beta_priority:boolean;points:number;source:string|null;tags:string[]|null;notes:string|null};
export function CommunityMemberEditFields({members}:{members:Member[]}){
 const [selected,setSelected]=useState("");
 const [resetKey,setResetKey]=useState(0);
 const member=members.find(m=>m.id===selected);
 const [confirmed,setConfirmed]=useState(false);
 return <div className="community-member-edit-fields">
  <div className="community-member-edit-picker">
   <label>Miembro
    <select name="member_id" required value={selected} onChange={e=>{setSelected(e.target.value);setResetKey(v=>v+1);setConfirmed(false);}}>
     <option value="" disabled>Seleccionar miembro</option>
     {members.map(m=><option key={m.id} value={m.id}>{m.display_name||m.handle||m.email||"Miembro"}</option>)}
    </select>
   </label>
   <p role="status">{member?"Datos actuales cargados. Revisa los cambios antes de guardar.":"Selecciona un miembro para cargar sus datos actuales."}</p>
   {member&&<div className="community-member-edit-identity" aria-label="Identidad del miembro seleccionado">
    <strong>{member.display_name||member.handle||"Miembro registrado"}</strong>
    <span>{member.email||"Sin correo registrado"}</span>
    <span>{member.handle||"Sin usuario registrado"}</span>
    <button type="button" onClick={()=>{setResetKey(v=>v+1);setConfirmed(false);}}>RESTAURAR DATOS CARGADOS ↻</button>
   </div>}
  </div>
  {member&&<label className="community-member-edit-confirm"><input type="checkbox" checked={confirmed} onChange={e=>setConfirmed(e.target.checked)}/>Confirmo que revisé los datos de este miembro antes de actualizarlos.</label>}
  <input type="hidden" name="member_update_confirmed" value={confirmed?"yes":"no"}/>
  {member&&<div key={member.id+"-"+resetKey} className="community-member-edit-grid">
   <label>Estado<select name="status" defaultValue={member.status}><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="blocked">Bloqueado</option><option value="left">Salida</option></select></label>
   <label>Nivel<select name="tier" defaultValue={member.tier}><option value="member">Miembro</option><option value="engaged">Participativo</option><option value="advocate">Promotor</option><option value="beta_priority">Prioridad beta</option><option value="moderator">Moderador</option></select></label>
   <label>Prioridad beta<select name="beta_priority" defaultValue={String(member.beta_priority)}><option value="false">No</option><option value="true">Sí</option></select></label>
   <label>Puntos acumulados<input type="number" min="0" max="100000000" step="1" value={member.points} readOnly aria-describedby="community-points-hint"/><small id="community-points-hint">Para sumar o descontar puntos utiliza Registrar participación; así queda constancia en el historial.</small></label>
   <label>Fuente<input name="source" maxLength={200} defaultValue={member.source||""}/></label>
   <label>Etiquetas<input name="tags" maxLength={1529} defaultValue={(member.tags||[]).join(", ")} placeholder="beta, promotor, creador"/></label>
   <label className="community-member-notes">Notas<textarea name="notes" rows={3} maxLength={3000} defaultValue={member.notes||""}/></label>
  </div>}
 </div>;
}
