"use client";
import { useEffect,useState } from "react";
const empty={code:"",locale:"es",source:"instagram",medium:"paid_social",campaign:"fragmentun_cap1",content:"",destination_url:"https://www.fragmentun.com/es",active:true};

const trafficOptions=[
  {value:"paid_social",label:"Anuncios en redes"},
  {value:"cpc",label:"Anuncios en buscadores"},
  {value:"organic_social",label:"Orgánico en redes"},
  {value:"organic_video",label:"Video orgánico"},
  {value:"organic",label:"Orgánico"},
  {value:"email",label:"Email"},
  {value:"referral",label:"Referido"},
  {value:"direct",label:"Directo"}
];

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
 const[rows,setRows]=useState<any[]>([]);const[form,setForm]=useState<any>(empty);const[msg,setMsg]=useState("");const[filterSource,setFilterSource]=useState("all");const[filterText,setFilterText]=useState("");
 const[organic,setOrganic]=useState({platform:"instagram",campaign:"lanzamiento_fragmentun",content:"post_01",locale:"es",destination_url:"https://www.fragmentun.com/es"});
 const load=()=>fetch("/api/admin/campaigns").then(r=>r.json()).then(j=>setRows(j.data||[]));
 useEffect(()=>{load()},[]);
 async function create(){setMsg("Creando…");const r=await fetch("/api/admin/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});if(r.ok){setForm(empty);load();setMsg("GUARDADO SATISFACTORIAMENTE")}else setMsg("ERROR: NO FUE POSIBLE GUARDAR")}
 async function save(row:any){const r=await fetch("/api/admin/campaigns",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(row)});setMsg(r.ok?"GUARDADO SATISFACTORIAMENTE":"ERROR: NO FUE POSIBLE GUARDAR")}
 async function removeCampaign(row:any){
   if(!window.confirm(`¿Eliminar definitivamente la campaña "${row.code}"?`))return;
   setMsg("Eliminando…");
   const r=await fetch("/api/admin/campaigns",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id})});
   if(!r.ok){setMsg("ERROR: NO FUE POSIBLE ELIMINAR");return}
   setRows(a=>a.filter(x=>x.id!==row.id));
   setMsg("CAMPAÑA ELIMINADA");
 }
 const url=(r:any)=>{try{const u=new URL(r.destination_url||"https://www.fragmentun.com/es");if(r.source)u.searchParams.set("utm_source",r.source);if(r.medium)u.searchParams.set("utm_medium",r.medium);if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}catch{return ""}}
 async function copyUrl(r:any){const u=url(r);if(!u)return;await navigator.clipboard.writeText(u);setMsg("Enlace copiado ✓")}
 function clean(value:string){return value.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"")}
 function organicMedium(platform:string){return platform==="youtube"?"organic_video":"organic_social"}
 function destinationFor(kind:string){
   const locale=organic.locale==="en"?"en":"es";
   if(kind==="chapter")return `https://www.fragmentun.com/${locale}#capitulo`;
   if(kind==="test")return `https://www.fragmentun.com/${locale}/test`;
   if(kind==="map")return `https://www.fragmentun.com/${locale}/mapa`;
   if(kind==="amazon")return `https://www.fragmentun.com/go/amazon?locale=${locale}`;
   if(kind==="patreon")return `https://www.fragmentun.com/go/patreon?locale=${locale}`;
   return `https://www.fragmentun.com/${locale}`;
 }
 function organicUrl(){
   try{
     const base=organic.destination_url||`https://www.fragmentun.com/${organic.locale}`;
     const u=new URL(base);
     u.searchParams.set("utm_source",organic.platform);
     u.searchParams.set("utm_medium",organicMedium(organic.platform));
     if(clean(organic.campaign))u.searchParams.set("utm_campaign",clean(organic.campaign));
     if(clean(organic.content))u.searchParams.set("utm_content",clean(organic.content));
     return u.toString();
   }catch{return ""}
 }
 async function copyOrganic(){
   const u=organicUrl();if(!u){setMsg("ERROR: REVISA LA PÁGINA DE DESTINO");return}
   await navigator.clipboard.writeText(u);setMsg("Enlace orgánico copiado ✓")
 }
 async function saveOrganic(){
   const campaign=clean(organic.campaign),content=clean(organic.content);
   if(!campaign||!content){setMsg("ERROR: COMPLETA CAMPAÑA Y PUBLICACIÓN");return}
   const payload={
     code:`${organic.platform}_${campaign}_${content}_${Date.now()}`,
     locale:organic.locale,
     source:organic.platform,
     medium:organicMedium(organic.platform),
     campaign,
     content,
     destination_url:organic.destination_url||`https://www.fragmentun.com/${organic.locale}`,
     active:true
   };
   setMsg("Guardando…");
   const r=await fetch("/api/admin/campaigns",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
   if(!r.ok){setMsg("ERROR: NO FUE POSIBLE GUARDAR");return}
   await navigator.clipboard.writeText(organicUrl());
   load();setMsg("Campaña guardada y enlace copiado ✓");
 }
 function emailAmazon(r:any){const u=new URL("https://www.fragmentun.com/go/amazon");u.searchParams.set("locale",r.locale||"es");u.searchParams.set("utm_source",r.source||"email");u.searchParams.set("utm_medium",r.medium||"email");if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}
 async function copyAmazon(r:any){await navigator.clipboard.writeText(emailAmazon(r));setMsg("Enlace de Amazon copiado ✓")}
 function emailPatreon(r:any){const u=new URL("https://www.fragmentun.com/go/patreon");u.searchParams.set("locale",r.locale||"es");u.searchParams.set("utm_source",r.source||"email");u.searchParams.set("utm_medium",r.medium||"email");if(r.campaign)u.searchParams.set("utm_campaign",r.campaign);if(r.content)u.searchParams.set("utm_content",r.content);return u.toString()}
 async function copyPatreon(r:any){await navigator.clipboard.writeText(emailPatreon(r));setMsg("Enlace de Patreon copiado ✓")}
 function useAsOrganicBase(r:any){
   const source=String(r.source||"instagram").toLowerCase();
   const allowed=["instagram","facebook","tiktok","youtube","x","linkedin","reddit"];
   setOrganic({
     platform:allowed.includes(source)?source:"instagram",
     campaign:r.campaign||"lanzamiento_fragmentun",
     content:r.content||"post_01",
     locale:r.locale==="en"?"en":"es",
     destination_url:r.destination_url||`https://www.fragmentun.com/${r.locale==="en"?"en":"es"}`
   });
   setMsg("Campaña cargada como base ✓");
   window.scrollTo({top:0,behavior:"smooth"});
 }
 const filteredRows=rows.filter((r:any)=>{
   const sourceOk=filterSource==="all"||String(r.source||"").toLowerCase()===filterSource;
   const q=filterText.trim().toLowerCase();
   const textOk=!q||[r.code,r.campaign,r.content,r.source,r.destination_url].some(v=>String(v||"").toLowerCase().includes(q));
   return sourceOk&&textOk;
 });
 return <div className="adminSecondaryModule adminCampaignModule">
   <div className="card adminSecondaryPanel organicLinkGenerator">
     <div className="adminPanelHeader">
       <div><div className="kicker">Tráfico orgánico</div><h2>Generador de enlaces para redes</h2></div>
       <span className="adminPanelBadge">LISTO PARA COPIAR</span>
     </div>
     <p className="note">Elige la red, identifica la campaña y la publicación. FRAGMENTUN añade el seguimiento automáticamente para que luego puedas ver qué contenido produjo visitas, registros y clics a Amazon o Patreon.</p>
     <div className="adminFormGrid organicGeneratorGrid">
       <label>Red social
         <select value={organic.platform} onChange={e=>setOrganic({...organic,platform:e.target.value})}>
           <option value="instagram">Instagram</option>
           <option value="facebook">Facebook</option>
           <option value="tiktok">TikTok</option>
           <option value="youtube">YouTube</option>
           <option value="x">X</option>
           <option value="linkedin">LinkedIn</option>
           <option value="reddit">Reddit</option>
         </select>
       </label>
       <label>Campaña
         <input value={organic.campaign} onChange={e=>setOrganic({...organic,campaign:e.target.value})} placeholder="Ej.: lanzamiento_fragmentun"/>
       </label>
       <label>Publicación / video
         <input value={organic.content} onChange={e=>setOrganic({...organic,content:e.target.value})} placeholder="Ej.: reel_01"/>
       </label>
       <label>Idioma
         <select value={organic.locale} onChange={e=>setOrganic({...organic,locale:e.target.value,destination_url:e.target.value==="en"?"https://www.fragmentun.com/en":"https://www.fragmentun.com/es"})}>
           <option value="es">Español</option>
           <option value="en">English</option>
         </select>
       </label>
       <label className="wide">Página de destino
         <input value={organic.destination_url} onChange={e=>setOrganic({...organic,destination_url:e.target.value})}/>
       </label>
     </div>
     <div className="organicDestinationShortcuts">
       <span>Destinos rápidos</span>
       <div className="heroActions">
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("home")})}>Inicio</button>
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("chapter")})}>Capítulo 1</button>
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("test")})}>Test</button>
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("map")})}>Mapa</button>
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("amazon")})}>Amazon</button>
         <button type="button" className="btn btnGhost" onClick={()=>setOrganic({...organic,destination_url:destinationFor("patreon")})}>Patreon</button>
       </div>
     </div>
     <div className="organicTrackingSummary">
       <div><span>Red social</span><strong>{organic.platform==="x"?"X":organic.platform.charAt(0).toUpperCase()+organic.platform.slice(1)}</strong></div>
       <div><span>Campaña</span><strong>{clean(organic.campaign)||"—"}</strong></div>
       <div><span>Publicación</span><strong>{clean(organic.content)||"—"}</strong></div>
       <div><span>Tipo de tráfico</span><strong>{organic.platform==="youtube"?"Video orgánico":"Orgánico"}</strong></div>
     </div>
     <div className="organicLinkPreview">
       <span>Enlace generado</span>
       <strong>{organicUrl()||"Revisa la página de destino"}</strong>
     </div>
     <div className="heroActions">
       <button className="btn btnPrimary" type="button" onClick={copyOrganic}>Copiar enlace</button>
       <button className="btn btnGhost" type="button" onClick={saveOrganic}>Guardar campaña y copiar</button>
     </div>
   </div>
   <div className="card">
     <h2>Plantillas rápidas</h2>
     <div className="heroActions">
       {presets.map(p=><button key={p.label} className="btn btnGhost" onClick={()=>setForm({...form,...p,code:`${p.source}_${Date.now()}`})}>{p.label}</button>)}
     </div>
     <p className="note">Úsalas cuando quieras crear una campaña manual o de pago. Para publicaciones orgánicas, utiliza el generador de arriba.</p>
   </div>
   <div className="card adminSecondaryPanel"><h2>Nueva campaña</h2><div className="adminFormGrid">
     {[
  ["code","Nombre interno"],
  ["source","Origen"],
  ["campaign","Campaña"],
  ["content","Anuncio / publicación"],
  ["destination_url","Página de destino"]
].map(([k,label])=><label key={k}>{label}<input value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})}/></label>)}
     <label>Tipo de tráfico
       <select value={form.medium} onChange={e=>setForm({...form,medium:e.target.value})}>
         {trafficOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
       </select>
     </label>
     <select value={form.locale} onChange={e=>setForm({...form,locale:e.target.value})}><option value="es">ES</option><option value="en">EN</option></select>
     <button className="btn btnPrimary" onClick={create}>Crear campaña</button>
   </div></div>
   <div className="card adminSecondaryPanel campaignHistoryTools" style={{marginTop:22}}>
     <div className="adminPanelHeader">
       <div><div className="kicker">Historial</div><h2>Campañas guardadas</h2></div>
       <span className="adminPanelBadge">{filteredRows.length} RESULTADOS</span>
     </div>
     <div className="campaignFilterGrid">
       <label>Buscar
         <input value={filterText} onChange={e=>setFilterText(e.target.value)} placeholder="Campaña, publicación o destino"/>
       </label>
       <label>Red social
         <select value={filterSource} onChange={e=>setFilterSource(e.target.value)}>
           <option value="all">Todas</option>
           <option value="instagram">Instagram</option>
           <option value="facebook">Facebook</option>
           <option value="tiktok">TikTok</option>
           <option value="youtube">YouTube</option>
           <option value="x">X</option>
           <option value="linkedin">LinkedIn</option>
           <option value="reddit">Reddit</option>
           <option value="meta">Meta Ads</option>
           <option value="google">Google Ads</option>
         </select>
       </label>
       <button className="btn btnGhost" type="button" onClick={()=>{setFilterText("");setFilterSource("all")}}>Limpiar</button>
     </div>
   </div>
   <div className="adminQuestionList" style={{marginTop:14}}>{filteredRows.map((r)=><article className="card" key={r.id}>
     <div className="kicker">{r.code}</div><div className="adminFormGrid">
     {[
  ["source","Origen"],
  ["campaign","Campaña"],
  ["content","Anuncio / publicación"],
  ["destination_url","Página de destino"]
].map(([k,label])=><label key={k}>{label}<input value={r[k]||""} onChange={e=>setRows(a=>a.map((x)=>x.id===r.id?{...x,[k]:e.target.value}:x))}/></label>)}
     <label>Tipo de tráfico
       <select value={r.medium||""} onChange={e=>setRows(a=>a.map((x)=>x.id===r.id?{...x,medium:e.target.value}:x))}>
         {!trafficOptions.some(o=>o.value===r.medium)&&r.medium&&<option value={r.medium}>Otro</option>}
         {trafficOptions.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
       </select>
     </label>
     <select value={r.locale} onChange={e=>setRows(a=>a.map((x)=>x.id===r.id?{...x,locale:e.target.value}:x))}><option value="es">ES</option><option value="en">EN</option></select>
     <button className="btn btnGhost" onClick={()=>save(r)}>Guardar</button></div>
     <p className="note" style={{wordBreak:"break-all"}}>{url(r)}</p>
     <div className="heroActions">
       <button className="btn btnGhost" onClick={()=>useAsOrganicBase(r)}>Usar como base</button>
       <button className="btn btnGhost" onClick={()=>copyUrl(r)}>Copiar enlace</button>
       <button className="btn btnGhost" onClick={()=>copyAmazon(r)}>Copiar enlace Amazon</button>
       <button className="btn btnGhost" onClick={()=>copyPatreon(r)}>Copiar enlace Patreon</button>
       <button className="btn btnGhost" type="button" onClick={()=>removeCampaign(r)}>Eliminar</button>
     </div>
   </article>)}</div><p className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg&&(msg.toLowerCase().includes("error")||msg.toLowerCase().includes("no fue")||msg.toLowerCase().includes("no se")||msg.toLowerCase().includes("inválid")||msg.toLowerCase().includes("obligatorio")||msg.toLowerCase().includes("falta"))?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</p>
 </div>;
}
