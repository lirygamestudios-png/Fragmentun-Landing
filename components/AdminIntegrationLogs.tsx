"use client";
import { useEffect,useState } from "react";
import { FRAGMENTUN_EMAIL_SEQUENCE,FRAGMENTUN_EMAIL_BRAND } from "../lib/fragmentun-email-sequence";

export function AdminIntegrationLogs(){
  const[data,setData]=useState<any>(null);
  useEffect(()=>{fetch("/api/admin/integrations").then(r=>r.json()).then(setData)},[]);

  if(!data)return <p>Cargando integraciones…</p>;
  if(data.error)return <p>No fue posible cargar el historial de integraciones.</p>;

  const items=data.items||[];
  const health=data.health||{};
  const errors=items.filter((x:any)=>x.status==="error").length;
  const success=items.filter((x:any)=>x.status==="success").length;

  return <div className="adminSecondaryModule adminIntegrationsModule">
    <div className="kpis">
      <div className="kpi"><span>Estado MailerLite</span><strong>{health.state||"—"}</strong></div>
      <div className="kpi"><span>Suscriptores sincronizados</span><strong>{health.leads?.synced||0}</strong></div>
      <div className="kpi"><span>Pendientes / sin configurar</span><strong>{(health.leads?.pending||0)+(health.leads?.unconfigured||0)}</strong></div>
      <div className="kpi"><span>Errores de sincronización</span><strong>{health.leads?.error||0}</strong></div>
      <div className="kpi"><span>Eventos recientes</span><strong>{items.length}</strong></div>
      <div className="kpi"><span>Éxitos</span><strong>{success}</strong></div>
      <div className="kpi"><span>Errores</span><strong>{errors}</strong></div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Salud de MailerLite</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <tbody>
            <tr><td>Clave de conexión API</td><td><strong>{health.configured?.token?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo Español</td><td><strong>{health.configured?.group_es?"✓ Configurado":"✕ Pendiente"}</strong></td></tr>
            <tr><td>Grupo Inglés</td><td><strong>{health.configured?.group_en?"✓ Configurado":"— Opcional / pendiente"}</strong></td></tr>
            <tr><td>Último éxito</td><td>{health.last_success_at?new Date(health.last_success_at).toLocaleString():"—"}</td></tr>
            <tr><td>Último error</td><td>{health.last_error_at?new Date(health.last_error_at).toLocaleString():"—"}</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Secuencia de correos · MailerLite</h2>
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
                  <td><code>{JSON.stringify(a.trigger_data||{})}</code></td>
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
      <h2>Secuencia aprobada · FRAGMENTUN</h2>
      <p style={{opacity:.8}}>Referencia editorial y visual aprobada para los correos de captación, nutrición, conversión y reseña.</p>
      <div style={{display:"grid",gap:"1rem"}}>
        {FRAGMENTUN_EMAIL_SEQUENCE.map((mail:any)=><div key={mail.id} style={{
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
            </div>

            <div style={{marginTop:"24px",fontSize:".8rem",color:"rgba(255,255,255,.58)"}}>
              <strong style={{color:"rgba(255,255,255,.78)"}}>Trigger:</strong> {mail.trigger}
            </div>
          </div>

          <div style={{
            padding:"20px 24px 22px",
            borderTop:"1px solid rgba(201,168,76,.14)",
            background:"#07111f",
            textAlign:"center"
          }}>
            <div style={{color:"#fff",fontWeight:700}}>José Liranzo</div>
            <div style={{marginTop:"4px",fontSize:".78rem",color:"rgba(255,255,255,.5)"}}>Autor de FRAGMENTUN</div>
            <div style={{marginTop:"14px",fontSize:".72rem",color:"rgba(255,255,255,.42)",lineHeight:1.6}}>
              © 2026 José Liranzo · FRAGMENTUN · Todos los derechos reservados.
            </div>
            <div style={{marginTop:"8px",fontSize:".72rem"}}>
              <a href="/es/privacidad" style={{color:"rgba(255,255,255,.56)",textDecoration:"underline"}}>Privacidad</a>
              <span style={{margin:"0 8px",color:"rgba(255,255,255,.25)"}}>·</span>
              <span style={{color:"rgba(255,255,255,.56)",textDecoration:"underline"}}>Cancelar suscripción</span>
            </div>
          </div>
        </div>)}
      </div>
    </div>

    <div className="card adminSecondaryPanel">
      <h2>Historial de integraciones</h2>
      <div className="adminTableWrap">
        <table className="adminTable">
          <thead><tr><th>Fecha</th><th>Integración</th><th>Evento</th><th>Estado</th><th>Entidad</th><th>Mensaje</th></tr></thead>
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
