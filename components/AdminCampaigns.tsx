"use client";
import { useEffect,useState } from "react";
const empty={code:"",locale:"es",source:"instagram",medium:"paid_social",campaign:"fragmentun_cap1",content:"",destination_url:"https://www.fragmentun.com/es",active:true};

const presets=[
  {label:"Instagram orgánico",source:"instagram",medium:"organic_social",campaign:"fragmentun_cap1",content:"post_01"},
  {label:"Meta Ads",source:"meta",medium:"paid_social",campaign:"fragmentun_cap1",content:"ad_01"},
  {label:"TikTok orgánico",source:"tiktok",medium:"organic_social",campaign:"fragmentun_cap1",content:"video_01"},
  {label:"YouTube",source:"youtube",medium:"organic_video",campaign:"fragmentun_cap1",content:"video_01"},
  {label:"Email",source:"email",medium:"email",campaign:"fragmentun_nurture",content:"email_01"},
  {label:"Amazon",source:"instagram",medium:"paid_social",campaign:"fragmentun_amazon",content:"ad_01"},
  {label:"Patreon",source:"instagram",medium:"paid_social",campaign:"fragmentun_patreon",content:"ad_01"}
];

export function AdminCampaigns(){
 const[rows,setRows]=useState<any[]>([]);const[form,setForm]=useState<any>(empty);const[msg,setMsg]=useState("");
 const load=()=>fetch("/api/admin/campaigns").then(r=>r.json()).then(j=>setRows(j.data||[]));
 useEffect(()=>{load()},[]);
 async function create(){setMsg("Creando…");const r=await fetch("/api/admin/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(r.ok){setForm(empty);load();setMsg("GUARDADO SATISFACTORIAMENTE")}else setMsg("ERROR: NO FUE POSIBLE GUARDAR")}
 async function save(row:any){const r=await fetch("/api/admin/campaigns",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(row)});setMsg(r.ok?"GUARDADO SATISFACTORIAMENTE":"ERROR: NO FUE POSIBLE GUARDAR")}
 const url=(r:any)=>{try{const u=new URL(r.destination_url||"https://www.fragmentun.com/es");if(r.source)u.searchParams.set("utm_source",r.source);if(r.medium)u.searchParams.set("utm_medium",r.medium);if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}catch{return ""}}
 async function copyUrl(r:any){const u=url(r);if(!u)return;await navigator.clipboard.writeText(u);setMsg("Enlace copiado ✓")}
 function emailAmazon(r:any){const u=new URL("https://www.fragmentun.com/go/amazon");u.searchParams.set("locale",r.locale||"es");u.searchParams.set("utm_source",r.source||"email");u.searchParams.set("utm_medium",r.medium||"email");if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}
 async function copyAmazon(r:any){await navigator.clipboard.writeText(emailAmazon(r));setMsg("Enlace de Amazon copiado ✓")}
 function emailPatreon(r:any){const u=new URL("https://www.fragmentun.com/go/patreon");u.searchParams.set("locale",r.locale||"es");u.searchParams.set("utm_source",r.source||"email");u.searchParams.set("utm_medium",r.medium||"email");if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}
 async function copyPatreon(r:any){await navigator.clipboard.writeText(emailPatreon(r));setMsg("Enlace de Patreon copiado ✓")}
 return <div className="adminSecondaryModule adminCampaignModule">
   <div className="card">
     <h2>Plantillas rápidas</h2>
     <div className="heroActions">
       {presets.map(p=><button key={p.label} className="btn btnGhost" onClick={()=>setForm({...form,...p,code:`${p.source}_${Date.now()}`})}>{p.label}</button>)}
     </div>
     <p className="note">Elige una plantilla y ajusta solo lo necesario. El seguimiento técnico se genera automáticamente.</p>
   </div>
   <div className="card adminSecondaryPanel"><h2>Nueva campaña</h2><div className="adminFormGrid">
     {[
  ["code","Nombre interno"],
  ["source","Origen"],
  ["medium","Canal"],
  ["campaign","Campaña"],
  ["content","Contenido"],
  ["destination_url","Página de destino"]
].map(([k,label])=><label key={k}>{label}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
     <select value={form.locale} onChange={e=>setForm({...form,locale:e.target.value})}><option value="es">ES</option><option value="en">EN</option></select>
     <button className="btn btnPrimary" onClick={create}>Crear campaña</button>
   </div></div>
   <div className="adminQuestionList" style={{marginTop:22}}>{rows.map((r,i)=><article className="card" key={r.id}>
     <div className="kicker">{r.code}</div><div className="adminFormGrid">
     {[
  ["source","Origen"],
  ["medium","Canal"],
  ["campaign","Campaña"],
  ["content","Contenido"],
  ["destination_url","Página de destino"]
].map(([k,label])=><label key={k}>{label}<input value={r[k]||""} onChange={e=>setRows(a=>a.map((x,n)=>n===i?{...x,[k]:e.target.value}:x))}/></label>)}
     <select value={r.locale} onChange={e=>setRows(a=>a.map((x,n)=>n===i?{...x,locale:e.target.value}:x))}><option value="es">ES</option><option value="en">EN</option></select>
     <button className="btn btnGhost" onClick={()=>save(r)}>Guardar</button></div>
     <p className="note" style={{wordBreak:"break-all"}}>{url(r)}</p>
     <div className="heroActions">
       <button className="btn btnGhost" onClick={()=>copyUrl(r)}>Copiar enlace</button>
       <button className="btn btnGhost" onClick={()=>copyAmazon(r)}>Copiar enlace Amazon</button>
       <button className="btn btnGhost" onClick={()=>copyPatreon(r)}>Copiar enlace Patreon</button>
     </div>
   </article>)}</div><p className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</p>
 </div>;
}
