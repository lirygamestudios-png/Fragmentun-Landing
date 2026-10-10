"use client";
import {useState} from "react";
type Member={id:string;name:string;points:number;status:string};
export function CommunityPointsPreview({members}:{members:Member[]}){
 const [memberId,setMemberId]=useState("");
 const [raw,setRaw]=useState("0");
 const member=members.find(m=>m.id===memberId);
 const n=Number(raw);
 const valid=raw.trim()!==""&&Number.isSafeInteger(n)&&Math.abs(n)<=100000;
 const effective=member&&valid?Math.max(-member.points,n):0;
 const projected=member&&valid?member.points+effective:null;
 return <div style={{display:"grid",gap:10}}>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:12}}>
   <label>Miembro<select name="member_id" required value={memberId} onChange={e=>setMemberId(e.target.value)}><option value="">Seleccionar miembro</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
   <label>Puntos<input name="points_delta" type="number" min={-100000} max={100000} step={1} value={raw} onChange={e=>setRaw(e.target.value)} required/></label>
  </div>
  {member&&valid?<div role="status" aria-live="polite" style={{padding:"12px 14px",border:"1px solid rgba(201,168,76,.38)",borderRadius:10}}>
    <strong>VISTA PREVIA · NO GUARDA CAMBIOS</strong>
    <p>Saldo actual: {member.points.toLocaleString("es-US")} puntos · Movimiento solicitado: {n>0?"+":""}{n.toLocaleString("es-US")} · Aplicación estimada: {effective>0?"+":""}{effective.toLocaleString("es-US")}</p>
    <p><strong>Saldo estimado después: {projected?.toLocaleString("es-US")} puntos</strong></p>
    {n<0&&effective!==n&&<p role="alert">El descuento solicitado supera el saldo actual. Se aplicaría únicamente el saldo disponible.</p>}
    {member.status!=="active"&&<p role="alert">El miembro no está activo. El servidor podría rechazar la operación.</p>}
    <small>Vista basada en el saldo consultado al abrir la página. El servidor vuelve a comprobarlo al guardar; si otro movimiento cambia el saldo, el resultado definitivo puede variar.</small>
   </div>:<p>Selecciona un miembro e introduce un número entero de puntos para consultar el efecto previsto.</p>}
 </div>;
}
