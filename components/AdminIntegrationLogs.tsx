"use client";
import { useEffect,useState } from "react";
import { FRAGMENTUN_EMAIL_SEQUENCE,FRAGMENTUN_EMAIL_SEQUENCE_EN,FRAGMENTUN_EMAIL_BRAND } from "../lib/fragmentun-email-sequence";
import {FragmentunProcessOverlay} from "./FragmentunProcessOverlay";

function AdIntegrationCard({ad,label,saving,feedback,onSave}:any){
  const[enabled,setEnabled]=useState(!!ad.enabled);
  const[publicId,setPublicId]=useState(ad.public_id||"");
  const[secondaryId,setSecondaryId]=useState(ad.secondary_id||"");

  useEffect(()=>{
    setEnabled(!!ad.enabled);
    setPublicId(ad.public_id||"");
    setSecondaryId(ad.secondary_id||"");
  },[ad.enabled,ad.public_id,ad.secondary_id]);

  return <div style={{padding:"18px",border:"1px solid rgba(201,168,76,.22)",borderRadius:"18px",background:"rgba(7,17,31,.72)"}}>
    <div style={{display:"flex",justifyContent:"space-between",gap:"12px",alignItems:"center",flexWrap:"wrap"}}>
      <div>
        <strong style={{fontSize:"1rem"}}>{label.name}</strong>
        <div style={{marginTop:"4px",fontSize:".8rem",opacity:.68}}>{enabled?"Activo al existir consentimiento":"Desactivado"}</div>
      </div>
      <label style={{display:"flex",alignItems:"center",gap:"8px",fontSize:".88rem",fontWeight:800}}>
        <input type="checkbox" checked={enabled} onChange={e=>setEnabled(e.target.checked)}/>
        Activar
      </label>
    </div>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px",marginTop:"14px"}}>
      <label style={{display:"grid",gap:"6px"}}>
        <span style={{fontSize:".78rem",fontWeight:800,opacity:.78}}>{label.main}</span>
        <input className="input" value={publicId} onChange={e=>setPublicId(e.target.value)} placeholder="Pegar aquí"/>
      </label>
      {ad.provider==="google"?<label style={{display:"grid",gap:"6px"}}>
        <span style={{fontSize:".78rem",fontWeight:800,opacity:.78}}>{label.secondary}</span>
        <input className="input" value={secondaryId} onChange={e=>setSecondaryId(e.target.value)} placeholder="Opcional"/>
      </label>:null}
    </div>
    <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:"10px",marginTop:"14px"}}>
      {feedback?<span className={feedback==="Guardado"?"adminSaveFeedback success":"adminSaveFeedback error"}>{feedback}</span>:null}
      <button className="btn btnPrimary" type="button" disabled={saving} onClick={()=>onSave(ad.provider,enabled,publicId,secondaryId)}>
        {saving?"Guardando…":"Guardar"}
      </button>
    </div>
  </div>;
}

function formatAutomationTrigger(trigger:any){
  if(!trigger||typeof trigger!=="object")return "Automático";
  const type=String(trigger.type||trigger.event||"").toLowerCase();
  if(Array.isArray(trigger.group_ids)&&trigger.group_ids.length)return "Entrada al grupo asignado";
  if(trigger.group_id)return "Entrada al grupo asignado";
  if(trigger.segment_id)return "Entrada a segmento";
  if(trigger.form_id)return "Formulario completado";
  if(type.includes("group"))return "Entrada al grupo asignado";
  if(type.includes("form"))return "Formulario completado";
  return "Automático";
}

export function AdminIntegrationLogs(){
  const[data,setData]=useState<any>(null);
  const[emailLocale,setEmailLocale]=useState<"es"|"en">("es");
  const[localeFeedback,setLocaleFeedback]=useState("");
  const[provisioning,setProvisioning]=useState(false);
  const[provisionResult,setProvisionResult]=useState<any>(null);
  const[plantillaStatus,setPlantillaStatus]=useState<"idle"|"copied"|"error">("idle");
  const[adSaving,setAdSaving]=useState<string>("");
  const[adFeedback,setAdFeedback]=useState<Record<string,string>>({});
  useEffect(()=>{fetch("/api/admin/integrations").then(async r=>{const j=await r.json().catch(()=>({error:"load_failed"}));setData(r.ok?j:{error:j?.error||"load_failed"});}).catch(()=>setData({error:"load_failed"}))},[]);

  if(!data)return <FragmentunProcessOverlay compact state="loading" title="CARGANDO INTEGRACIONES…"/>;
  if(data.error)return <p className="adminSaveFeedback error">No fue posible cargar el historial de integraciones.</p>;

  const items=data.items||[];
  const health=data.health||{};
  const errors=items.filter((x:any)=>x.status==="error").length;
  const success=items.filter((x:any)=>x.status==="success").length;
  const approvedSequence=emailLocale==="es"?FRAGMENTUN_EMAIL_SEQUENCE:FRAGMENTUN_EMAIL_SEQUENCE_EN;

  async function copyPlantilla(){
    setPlantillaStatus("idle");
    const lines=approvedSequence.map((mail:any)=>[
      `${mail.order}. ${mail.subject}`,
      `   Fase: ${mail.phase}`,
      `   Espera: ${mail.delay}`,
      `   Inicio: ${mail.trigger}`,
      `   CTA principal: ${mail.primaryCta.label} → ${mail.primaryCta.href}`,
      `   CTA secundario: ${mail.secondaryCta.label} → ${mail.secondaryCta.href}`,
      mail.downloadCta?`   Descarga: ${mail.downloadCta.label} → ${mail.downloadCta.href}`:"",
      `   Nota: ${mail.note}`
    ].filter(Boolean).join("\n")).join("\n\n");
    try{
      await navigator.clipboard.writeText(lines);
      setPlantillaStatus("copied");
      window.setTimeout(()=>setPlantillaStatus("idle"),3000);
    }catch{
      setPlantillaStatus("error");
    }
  }

  async function provisionAutomations(){
    setProvisioning(true);
    setProvisionResult(null);
    try{
      const r=await fetch("/api/admin/integrations",{method:"POST"});
      const j=await r.json();
      setProvisionResult(j);
      if(r.ok){
        const refreshed=await fetch("/api/admin/integrations").then(x=>x.json());
        setData(refreshed);
      }
    }catch{
      setProvisionResult({ok:false,error:"request_failed"});
    }finally{
      setProvisioning(false);
    }
  }

  async function saveAdIntegration(provider:string,enabled:boolean,public_id:string,secondary_id:string){
    setAdSaving(provider);
    setAdFeedback(x=>({...x,[provider]:""}));
    try{
      const r=await fetch("/api/admin/integrations",{
        method:"PUT",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({provider,enabled,public_id,secondary_id})
      });
      const j=await r.json();
      if(!r.ok){
        setAdFeedback(x=>({...x,[provider]:j.error==="missing_id"?"Agrega el ID antes de activar.":"No fue posible guardar."}));
        return;
      }
      const refreshed=await fetch("/api/admin/integrations").then(x=>x.json());
      setData(refreshed);
      setAdFeedback(x=>({...x,[provider]:"Guardado"}));
      window.setTimeout(()=>setAdFeedback(x=>({...x,[provider]:""})),2500);
    }catch{
      setAdFeedback(x=>({...x,[provider]:"No fue posible guardar."}));
    }finally{
      setAdSaving("");
    }
  }

  return <div className="adminSecondaryModule adminIntegrationsModule">
    <div className="kpis">
      <div className="kpi"><span>Estado del correo</span><strong>{health.state||"—"}</strong></div>
      <div className="kpi"><span>Suscriptores sincronizados</span><strong>{health.leads?.synced||0}</strong></div>
      <div className="kpi"><span>Pendientes / sin configurar</span><strong>{(health.leads?.pending||0)+(health.leads?.unconfigured||0)}</strong></div>
      <div className="kpi"><span>Errores de sincronización</span><strong>{health.leads?.error||0}</strong></div>
      <div className="kpi"><span>Eventos recientes</span><strong>{items.length}</strong></div>
      <div className="kpi"><span>Éxitos</span><strong>{success}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{errors}</strong></div>
    </div>

    <div className="card adminSecondaryPanel">
      <div className="adminPanelHeader">
        <div>
          <div className="kicker">Publicidad</div>
          <h2>Meta, Google y TikTok</h2>
        </div>
        <span className="adminPanelBadge">LISTO PARA CONFIGURAR</span>
      </div>
      <p className="note">Configura aquí los identificadores públicos de cada plataforma. Los seguimientos permanecerán inactivos hasta que también exista consentimiento de publicidad en la web.</p>
      <div style={{display:"grid",gap:"14px"}}>
        {(data.ads||[]).map((ad:any)=>{
          const labels:any={
            meta:{name:"Meta Ads",main:"ID del píxel",secondary:""},
            google:{name:"Google Ads",main:"ID de seguimiento",secondary:"ID de conversión (opcional)"},
            tiktok:{name:"TikTok Ads",main:"ID del píxel",secondary:""}
          };
          const label=labels[ad.provider]||{name:ad.provider,main:"ID",secondary:"ID adicional"};
          return <AdIntegrationCard
            key={ad.provider}
            ad={ad}
            label={label}
            saving={adSaving===ad.provider}
            feedback={adFeedback[ad.provider]||""}
            onSave={saveAdIntegration}
          />;
        })}
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Estado de la conexión de correo</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <tbody>
            <tr><td>Conexión con MailerLite</td><td><strong>{health.configured?.token?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo Español</td><td><strong>{health.configured?.group_es?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo Inglés</td><td><strong>{health.configured?.group_en?"✓ Configurado":"— Opcional / pendiente"}</strong></td></tr>
            <tr><td>Último éxito</td><td>{health.last_success_at?new Date(health.last_success_at).toLocaleString():"—"}</td></tr>
            <tr><td>Último error</td><td>{health.last_error_at?new Date(health.last_error_at).toLocaleString():"—"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <div>
          <h2 style={{marginBottom:".25rem"}}>Secuencia de correos</h2>
          <p style={{marginTop:0,opacity:.75}}>Automatizaciones reales detectadas en la cuenta conectada.</p>
        </div>
        <button type="button" className="btn btnPrimary" onClick={provisionAutomations} disabled={provisioning}>
          {provisioning?"Creando borradores…":"Crear / verificar borradores ES + EN"}
        </button>
      </div>
      {provisionResult&&<div style={{margin:"0 0 16px",padding:"12px 14px",borderRadius:"12px",border:"1px solid rgba(201,168,76,.25)"}}>
        {provisionResult.ok?<strong>✓ Borradores verificados en MailerLite</strong>:<strong>No fue posible completar la creación.</strong>}
        {(provisionResult.results||[]).map((x:any)=><div key={x.name} style={{marginTop:"6px",fontSize:".86rem",opacity:.82}}>
          {x.error?"✕":"✓"} {x.name} {x.created?"· creado":x.id?"· ya existía":""} {x.error?"· "+x.error:""}
        </div>)}
      </div>}
      {!data.automations?.ok
        ? <p>No fue posible leer las automatizaciones de MailerLite: {data.automations?.error||"—"}</p>
        : (data.automations?.automations||[]).length===0
          ? <p>No hay automatizaciones disponibles en la cuenta conectada.</p>
          : <div className="adminTableWrap">
              <table className="adminTable">
                <thead><tr><th>Automatización</th><th>Estado</th><th>Disparador</th><th>Secuencia</th></tr></thead>
                <tbody>{(data.automations?.automations||[]).map((a:any)=><tr key={a.id}>
                  <td><strong>{a.name||"Sin nombre"}</strong></td>
                  <td>{a.enabled?"✓ Activa":"⏸ Inactiva"}</td>
                  <td><span className="adminReadableStatus">{formatAutomationTrigger(a.trigger_data)}</span></td>
                  <td>
                    {(a.steps||[]).length===0?"—":<ol style={{margin:0,paddingLeft:"1.2rem"}}>
                      {(a.steps||[]).map((s:any)=><li key={s.id||s.type}>
                        <strong>{s.type||"paso"}</strong>
                        {s.subject?<> · {s.subject}</>:null}
                        {s.from_name?<> · De: {s.from_name}</>:null}
                        {s.value!=null||s.unit?<> · {String(s.value??"")} {s.unit||""}</>:null}
                        {s.preview_url?<>{' '}· <a href={s.preview_url} target="_blank" rel="noreferrer">Ver correo</a></>:null}
                        {s.screenshot_url?<>{' '}· <a href={s.screenshot_url} target="_blank" rel="noreferrer">Captura</a></>:null}
                      </li>)}
                    </ol>}
                  </td>
                </tr>)}</tbody>
              </table>
            </div>}
    </div>

    <div className="card adminSecondaryPanel">
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:"12px",flexWrap:"wrap"}}>
        <div>
          <h2 style={{marginBottom:".25rem"}}>Secuencia aprobada · FRAGMENTUN</h2>
          <p style={{opacity:.8,marginTop:0}}>Referencia editorial y visual aprobada para los correos de captación, nutrición, conversión y reseña.</p>
        </div>
        <div style={{display:"flex",gap:"8px"}}>
          <button type="button" className="btn btnGhost" onClick={()=>{setEmailLocale("es");setLocaleFeedback("Plantilla en español seleccionada.");}} aria-pressed={emailLocale==="es"} style={emailLocale==="es"?{borderColor:FRAGMENTUN_EMAIL_BRAND.gold,color:FRAGMENTUN_EMAIL_BRAND.gold}:undefined}>ES</button>
          <button type="button" className="btn btnGhost" onClick={()=>{setEmailLocale("en");setLocaleFeedback("Plantilla en inglés seleccionada.");}} aria-pressed={emailLocale==="en"} style={emailLocale==="en"?{borderColor:FRAGMENTUN_EMAIL_BRAND.gold,color:FRAGMENTUN_EMAIL_BRAND.gold}:undefined}>EN</button>
        </div>
      </div>
      {localeFeedback?<p role="status" style={{margin:"0 0 10px",fontSize:".8rem",color:FRAGMENTUN_EMAIL_BRAND.gold}}>{localeFeedback}</p>:null}
      <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",gap:"10px",marginBottom:"12px",flexWrap:"wrap"}}>
        {plantillaStatus==="copied"?<span style={{fontSize:".82rem",color:FRAGMENTUN_EMAIL_BRAND.gold,fontWeight:800}}>✓ Plantilla {emailLocale.toUpperCase()} copiado al portapapeles</span>:null}
        {plantillaStatus==="error"?<span style={{fontSize:".82rem",color:"#ff8a8a",fontWeight:800}}>No fue posible copiar automáticamente. Revisa los permisos del portapapeles.</span>:null}
        <button type="button" className="btn btnGhost" onClick={copyPlantilla}>Copiar plantilla</button>
      </div>
      <div style={{display:"grid",gap:"1rem"}}>
        {approvedSequence.map((mail:any)=><div key={mail.id} style={{
          border:"1px solid rgba(201,168,76,.28)",
          borderRadius:"22px",
          overflow:"hidden",
          background:"#07111f",
          boxShadow:"0 18px 50px rgba(0,0,0,.28)"
        }}>
          <div style={{
            padding:"22px 24px",
            borderBottom:"1px solid rgba(201,168,76,.18)",
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            gap:"16px",
            background:"linear-gradient(135deg,rgba(10,22,40,.98),rgba(14,37,66,.98))"
          }}>
            <div style={{display:"flex",alignItems:"center",gap:"12px"}}>
              <img src="/fragmentun-mark.png" alt="FRAGMENTUN" width="42" height="42" style={{objectFit:"contain"}}/>
              <div>
                <div style={{fontWeight:900,letterSpacing:".14em",color:FRAGMENTUN_EMAIL_BRAND.gold}}>FRAGMENTUN</div>
                <div style={{fontSize:".76rem",opacity:.62,letterSpacing:".05em"}}>UNA SAGA DE CIENCIA FICCIÓN EMOCIONAL</div>
              </div>
            </div>
            <span style={{
              padding:"6px 10px",
              borderRadius:"999px",
              border:"1px solid rgba(74,144,217,.45)",
              color:FRAGMENTUN_EMAIL_BRAND.blue,
              fontSize:".72rem",
              fontWeight:800,
              letterSpacing:".08em"
            }}>{mail.phase}</span>
          </div>

          <div style={{
            padding:"34px 26px 28px",
            background:"radial-gradient(circle at 85% 15%,rgba(74,144,217,.16),transparent 32%),radial-gradient(circle at 10% 0%,rgba(201,168,76,.12),transparent 28%),#0A1628"
          }}>
            <div style={{fontSize:".75rem",textTransform:"uppercase",letterSpacing:".12em",color:FRAGMENTUN_EMAIL_BRAND.blue}}>
              Correo {mail.order} · {mail.delay}
            </div>
            <h3 style={{
              margin:"10px 0 10px",
              color:FRAGMENTUN_EMAIL_BRAND.gold,
              fontSize:"1.55rem",
              lineHeight:1.15,
              maxWidth:"760px"
            }}>{mail.subject}</h3>
            <p style={{margin:"0 0 18px",color:"rgba(255,255,255,.82)",fontSize:"1rem",lineHeight:1.6,maxWidth:"760px"}}>
              {mail.preheader}
            </p>

            <div style={{
              margin:"20px 0 22px",
              padding:"18px 20px",
              border:"1px solid rgba(255,255,255,.08)",
              borderRadius:"16px",
              background:"rgba(255,255,255,.035)",
              color:"rgba(255,255,255,.86)",
              lineHeight:1.65
            }}>
              <strong style={{color:"#fff"}}>{mail.purpose}</strong>
              <div style={{marginTop:"6px",opacity:.78}}>{mail.note}</div>
            </div>

            <div style={{display:"flex",gap:"12px",flexWrap:"wrap"}}>
              <a href={mail.primaryCta.href} target="_blank" rel="noreferrer" style={{
                display:"inline-block",
                padding:"12px 18px",
                borderRadius:"999px",
                background:FRAGMENTUN_EMAIL_BRAND.gold,
                color:FRAGMENTUN_EMAIL_BRAND.background,
                fontWeight:900,
                textDecoration:"none",
                letterSpacing:".03em"
              }}>{mail.primaryCta.label}</a>
              <a href={mail.secondaryCta.href} target="_blank" rel="noreferrer" style={{
                display:"inline-block",
                padding:"12px 18px",
                borderRadius:"999px",
                border:`1px solid ${FRAGMENTUN_EMAIL_BRAND.blue}`,
                color:"#fff",
                fontWeight:800,
                textDecoration:"none"
              }}>{mail.secondaryCta.label}</a>
              {mail.downloadCta?<a href={mail.downloadCta.href} target="_blank" rel="noreferrer" style={{
                display:"inline-block",
                padding:"12px 18px",
                borderRadius:"999px",
                border:"1px solid rgba(201,168,76,.45)",
                color:FRAGMENTUN_EMAIL_BRAND.gold,
                fontWeight:800,
                textDecoration:"none"
              }}>{mail.downloadCta.label}</a>:null}
            </div>

            <div style={{marginTop:"24px",fontSize:".8rem",color:"rgba(255,255,255,.58)"}}>
              <strong style={{color:"rgba(255,255,255,.78)"}}>Inicio:</strong> {mail.trigger}
            </div>
          </div>

          <div style={{
            padding:"20px 24px 22px",
            borderTop:"1px solid rgba(201,168,76,.14)",
            background:"#07111f",
            textAlign:"center"
          }}>
            <div style={{color:"#fff",fontWeight:700}}>José Liranzo</div>
            <div style={{marginTop:"4px",fontSize:".78rem",color:"rgba(255,255,255,.5)"}}>{emailLocale==="es"?"Autor de FRAGMENTUN":"Author of FRAGMENTUN"}</div>
            <div style={{marginTop:"14px",fontSize:".72rem",color:"rgba(255,255,255,.42)",lineHeight:1.6}}>
              {emailLocale==="es"?"© 2026 José Liranzo · FRAGMENTUN · Todos los derechos reservados.":"© 2026 José Liranzo · FRAGMENTUN · All rights reserved."}
            </div>
            <div style={{marginTop:"8px",fontSize:".72rem"}}>
              <a href="/es/privacidad" style={{color:"rgba(255,255,255,.56)",textDecoration:"underline"}}>Privacidad</a>
              <span style={{margin:"0 8px",color:"rgba(255,255,255,.25)"}}>·</span>
              <span style={{color:"rgba(255,255,255,.56)",textDecoration:"underline"}}>{emailLocale==="es"?"Cancelar suscripción":"Unsubscribe"}</span>
            </div>
          </div>
        </div>)}
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Historial de integraciones</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Fecha</th><th>Servicio</th><th>Evento</th><th>Estado</th><th>Referencia</th><th>Mensaje</th></tr></thead>
          <tbody>{items.map((r:any)=><tr key={r.id}>
            <td>{new Date(r.created_at).toLocaleString()}</td>
            <td>{r.integration}</td>
            <td>{r.event_type}</td>
            <td>{r.status}</td>
            <td>{r.entity_type ? r.entity_type+":"+(r.entity_id||"—") : "—"}</td>
            <td>{r.message||"—"}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </div>
  </div>;
}
