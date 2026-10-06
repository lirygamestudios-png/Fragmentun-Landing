"use client";
import {useEffect,useMemo,useState} from "react";

const sources=["Amazon","Goodreads","Facebook","Instagram","YouTube","Editorial","Prensa","Otro"];
const empty={source:"Amazon",author_display:"",body_original:"",body_es:"",body_en:"",source_url:"",verified:false,published:false};

function statusOf(row:any){
  if(row.published&&row.verified)return "PUBLICADA";
  if(row.verified)return "VERIFICADA";
  return "BORRADOR";
}

export function AdminReviews(){
  const[rows,setRows]=useState<any[]>([]);
  const[form,setForm]=useState<any>(empty);
  const[msg,setMsg]=useState("");
  const[customSource,setCustomSource]=useState("");
  const load=()=>fetch("/api/admin/reviews").then(r=>r.json()).then(j=>setRows(j.data||[]));
  useEffect(()=>{load()},[]);

  const sourceValue=useMemo(()=>sources.includes(form.source)?form.source:"Otro",[form.source]);
  const resolvedForm={...form,source:sourceValue==="Otro"?(customSource.trim()||"Otro"):sourceValue};

  async function add(mode:"draft"|"verified"|"published"){
    const payload={
      ...resolvedForm,
      verified:mode!=="draft",
      published:mode==="published"
    };
    const r=await fetch("/api/admin/reviews",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(r.ok){
      setForm(empty);setCustomSource("");load();setMsg("GUARDADO SATISFACTORIAMENTE");
    }else setMsg(j.error==="publication_requires_verification"?"No se puede publicar una reseña sin verificar.":"ERROR: NO FUE POSIBLE GUARDAR");
  }

  async function save(row:any,mode?:"draft"|"verified"|"published"){
    const payload={
      ...row,
      verified:mode?mode!=="draft":!!row.verified,
      published:mode?mode==="published":!!row.published
    };
    const r=await fetch("/api/admin/reviews",{method:"PUT",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const j=await r.json().catch(()=>({}));
    if(r.ok){setMsg("GUARDADO SATISFACTORIAMENTE");load()}
    else setMsg(j.error==="publication_requires_verification"?"No se puede publicar una reseña sin verificar.":"ERROR: NO FUE POSIBLE GUARDAR");
  }

  function updateRow(i:number,key:string,value:any){
    setRows(a=>a.map((x,n)=>n===i?{...x,[key]:value}:x));
  }

  async function remove(row:any){
    const label=row.author_display||row.source||"esta reseña";
    if(!window.confirm(`¿Eliminar definitivamente ${label}? Esta acción no se puede deshacer.`))return;
    const r=await fetch("/api/admin/reviews",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({id:row.id})});
    if(r.ok){setMsg("GUARDADO SATISFACTORIAMENTE");load()}
    else setMsg("ERROR: NO FUE POSIBLE ELIMINAR");
  }

  return <div className="adminSecondaryModule adminReviewsModule">
    <div className="card adminSecondaryPanel">
      <div className="adminPanelHeader">
        <div><div className="kicker">Prueba social</div><h2>Nueva reseña</h2><p className="note">Flujo editorial: Fuente → Texto → Verificar → Publicar.</p></div>
        <span className="adminPanelBadge">CONTROL EDITORIAL</span>
      </div>

      <div className="adminReviewWorkflow">
        <div className="adminReviewStep isActive"><span>1</span><strong>Fuente</strong></div>
        <div className="adminReviewStep"><span>2</span><strong>Texto</strong></div>
        <div className="adminReviewStep"><span>3</span><strong>Verificar</strong></div>
        <div className="adminReviewStep"><span>4</span><strong>Publicar</strong></div>
      </div>

      <div className="adminReviewGrid">
        <label><span>Fuente</span><select value={sourceValue} onChange={e=>setForm({...form,source:e.target.value})}>{sources.map(s=><option key={s} value={s}>{s}</option>)}</select></label>
        {sourceValue==="Otro"&&<label><span>Nombre de la fuente</span><input placeholder="Ej. Blog especializado" value={customSource} onChange={e=>setCustomSource(e.target.value)}/></label>}
        <label><span>Autor mostrado</span><input placeholder="Nombre visible del lector o medio" value={form.author_display} onChange={e=>setForm({...form,author_display:e.target.value})}/></label>
        <label className="wide"><span>URL de origen</span><input placeholder="https://..." value={form.source_url} onChange={e=>setForm({...form,source_url:e.target.value})}/></label>
        <label className="wide"><span>Texto original</span><textarea placeholder="Pega aquí la reseña exactamente como fue publicada." value={form.body_original} onChange={e=>setForm({...form,body_original:e.target.value})}/></label>
        <label className="wide"><span>Versión en español · opcional</span><textarea value={form.body_es} onChange={e=>setForm({...form,body_es:e.target.value})}/></label>
        <label className="wide"><span>English version · optional</span><textarea value={form.body_en} onChange={e=>setForm({...form,body_en:e.target.value})}/></label>
      </div>

      <div className="adminReviewActions">
        <button className="btn btnGhost" onClick={()=>add("draft")}>Guardar borrador</button>
        <button className="btn btnSecondary" onClick={()=>add("verified")}>Guardar como verificada</button>
        <button className="btn btnPrimary" onClick={()=>add("published")}>Verificar y publicar</button>
      </div>
      <p className="note">Solo se publican reseñas auténticas y verificables. El FrontDesk nunca mostrará una reseña pública si no está verificada.</p>
    </div>

    <div className="adminQuestionList adminReviewsList" style={{marginTop:22}}>
      {rows.length===0&&<div className="card adminReviewsEmpty"><strong>No hay reseñas cargadas todavía.</strong><span>La primera reseña que agregues aparecerá aquí para revisión editorial.</span></div>}
      {rows.map((r,i)=><article className="card adminReviewEditor" key={r.id}>
        <div className="adminPanelHeader">
          <div><div className="kicker">{r.source}</div><h3>{r.author_display||"Sin nombre"}</h3></div>
          <span className={"adminReviewState "+statusOf(r).toLowerCase()}>{statusOf(r)}</span>
        </div>

        <div className="adminReviewGrid">
          <label><span>Fuente</span><input value={r.source||""} onChange={e=>updateRow(i,"source",e.target.value)}/></label>
          <label><span>Autor mostrado</span><input value={r.author_display||""} onChange={e=>updateRow(i,"author_display",e.target.value)}/></label>
          <label className="wide"><span>URL de origen</span><input value={r.source_url||""} onChange={e=>updateRow(i,"source_url",e.target.value)}/></label>
          <label className="wide"><span>Texto original</span><textarea value={r.body_original||""} onChange={e=>updateRow(i,"body_original",e.target.value)}/></label>
          <label className="wide"><span>Versión en español</span><textarea value={r.body_es||""} onChange={e=>updateRow(i,"body_es",e.target.value)}/></label>
          <label className="wide"><span>English version</span><textarea value={r.body_en||""} onChange={e=>updateRow(i,"body_en",e.target.value)}/></label>
        </div>

        <div className="adminReviewStatusLine">
          <label><input type="checkbox" checked={!!r.verified} onChange={e=>updateRow(i,"verified",e.target.checked)}/> Verificada</label>
          <label><input type="checkbox" checked={!!r.published} onChange={e=>updateRow(i,"published",e.target.checked)}/> Publicada</label>
        </div>

        <div className="adminReviewActions">
          <button className="btn btnGhost" onClick={()=>save(r,"draft")}>Mover a borrador</button>
          <button className="btn btnSecondary" onClick={()=>save(r,"verified")}>Marcar verificada</button>
          <button className="btn btnPrimary" onClick={()=>save(r,"published")}>Verificar y publicar</button>
          <button className="btn btnGhost" onClick={()=>save(r)}>Guardar cambios</button>
          <button className="btn adminReviewDelete" onClick={()=>remove(r)}>Eliminar reseña</button>
        </div>
      </article>)}
    </div>

    <p className={msg==="GUARDADO SATISFACTORIAMENTE"?"adminSaveFeedback success":(msg?"adminSaveFeedback error":"adminSaveFeedback")}>{msg}</p>
  </div>;
}
