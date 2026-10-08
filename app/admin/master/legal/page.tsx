import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function invalidDateRange(start:string|null,end:string|null){
  return Boolean(start&&end&&end<start);
}
function validCurrency(value:string){
  return /^[A-Z]{3}$/.test(value);
}

function assetEstadoLabel(value:string){
  const map:Record<string,string>={draft:"BORRADOR",active:"ACTIVO",licensed:"LICENCIADO",archived:"ARCHIVADO",disputed:"EN DISPUTA",retired:"RETIRADO"};
  return map[value]||String(value||"").toUpperCase();
}

function rightEstadoLabel(value:string){
  const map:Record<string,string>={owned:"PROPIO",licensed_out:"LICENCIADO A TERCEROS",licensed_in:"LICENCIADO POR TERCEROS",expired:"VENCIDO",terminated:"TERMINADO",disputed:"EN DISPUTA",pending:"PENDIENTE"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

function contractEstadoLabel(value:string){
  const map:Record<string,string>={draft:"BORRADOR",review:"EN REVISIÓN",signature:"EN FIRMA",active:"ACTIVO",expired:"VENCIDO",terminated:"TERMINADO",canceled:"CANCELADO"};
  return map[value]||String(value||"").toUpperCase();
}

async function requireLegalAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createIpAsset(formData:FormData){
  "use server";
  const {supabase,user}=await requireLegalAdmin();
  const code=String(formData.get("code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const name=String(formData.get("name")||"").trim();
  const ipName=String(formData.get("ip_name")||"").trim();
  const type=String(formData.get("asset_type")||"other");
  const ownerEntity=String(formData.get("owner_entity")||"").trim()||null;
  const jurisdiction=String(formData.get("jurisdiction")||"").trim()||null;
  const registrationNumber=String(formData.get("registration_number")||"").trim()||null;
  const registrationDate=String(formData.get("registration_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowed=new Set(["book","game","character","world","art","trademark","script","music","video","software","other"]);
  if(!code||!name||!ipName||!allowed.has(type)) throw new Error("invalid_ip_asset");
  const{error}=await supabase.from("ip_assets").insert({
    code,name,ip_name:ipName,asset_type:type,owner_entity:ownerEntity,jurisdiction,
    registration_number:registrationNumber,registration_date:registrationDate,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}

async function createRight(formData:FormData){
  "use server";
  const {supabase,user}=await requireLegalAdmin();
  const assetId=String(formData.get("asset_id")||"").trim();
  const rightType=String(formData.get("right_type")||"copyright");
  const territory=String(formData.get("territory")||"mundial").trim()||"mundial";
  const exclusivity=String(formData.get("exclusivity")||"exclusive");
  const holderName=String(formData.get("holder_name")||"").trim()||null;
  const licenseeName=String(formData.get("licensee_name")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const status=String(formData.get("status")||"owned");
  const allowedRight=new Set(["copyright","trademark","publishing","audiovisual","game","merchandising","translation","distribution","adaptation","music","other"]);
  const allowedExclusivity=new Set(["exclusive","non_exclusive","shared","unknown"]);
  const allowedEstado=new Set(["owned","licensed_out","licensed_in","expired","terminated","disputed","pending"]);
  if(!assetId||!allowedRight.has(rightType)||!allowedExclusivity.has(exclusivity)||!allowedEstado.has(status)||invalidDateRange(startDate,endDate)) throw new Error("invalid_right");
  const{error}=await supabase.from("ip_rights").insert({
    asset_id:assetId,right_type:rightType,territory,exclusivity,holder_name:holderName,licensee_name:licenseeName,
    start_date:startDate,end_date:endDate,status,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}

async function createContract(formData:FormData){
  "use server";
  const {supabase,user}=await requireLegalAdmin();
  const code=String(formData.get("contract_code")||"").trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
  const title=String(formData.get("title")||"").trim();
  const type=String(formData.get("contract_type")||"other");
  const counterparty=String(formData.get("counterparty")||"").trim()||null;
  const effectiveDate=String(formData.get("effective_date")||"").trim()||null;
  const expirationDate=String(formData.get("expiration_date")||"").trim()||null;
  const autoRenew=String(formData.get("auto_renew")||"false")==="true";
  const noticeRaw=String(formData.get("renewal_notice_days")||"").trim();
  const noticeDays=noticeRaw?Math.max(0,Number(noticeRaw)):null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowed=new Set(["nda","license","publishing","development","employment","contractor","vendor","distribution","investment","partnership","other"]);
  if(!code||!title||!allowed.has(type)||(noticeDays!==null&&(!Number.isFinite(noticeDays)||!Number.isInteger(noticeDays)))||invalidDateRange(effectiveDate,expirationDate)) throw new Error("invalid_contract");
  const{error}=await supabase.from("legal_contracts").insert({
    contract_code:code,title,contract_type:type,counterparty,effective_date:effectiveDate,expiration_date:expirationDate,
    auto_renew:autoRenew,renewal_notice_days:noticeDays,notes,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}


async function updateIpAsset(formData:FormData){
  "use server";
  const {supabase}=await requireLegalAdmin();
  const id=String(formData.get("asset_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const ownerEntity=String(formData.get("owner_entity")||"").trim()||null;
  const jurisdiction=String(formData.get("jurisdiction")||"").trim()||null;
  const registrationNumber=String(formData.get("registration_number")||"").trim()||null;
  const registrationDate=String(formData.get("registration_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["draft","active","licensed","archived","disputed","retired"]);
  if(!id||!allowedEstado.has(status)) throw new Error("invalid_asset_update");
  const{error}=await supabase.from("ip_assets").update({
    status,owner_entity:ownerEntity,jurisdiction,registration_number:registrationNumber,
    registration_date:registrationDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}

async function updateRight(formData:FormData){
  "use server";
  const {supabase}=await requireLegalAdmin();
  const id=String(formData.get("right_id")||"").trim();
  const status=String(formData.get("status")||"owned");
  const exclusivity=String(formData.get("exclusivity")||"exclusive");
  const territory=String(formData.get("territory")||"mundial").trim()||"mundial";
  const holderName=String(formData.get("holder_name")||"").trim()||null;
  const licenseeName=String(formData.get("licensee_name")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["owned","licensed_out","licensed_in","expired","terminated","disputed","pending"]);
  const allowedEx=new Set(["exclusive","non_exclusive","shared","unknown"]);
  if(!id||!allowedEstado.has(status)||!allowedEx.has(exclusivity)||invalidDateRange(startDate,endDate)) throw new Error("invalid_right_update");
  const{error}=await supabase.from("ip_rights").update({
    status,exclusivity,territory,holder_name:holderName,licensee_name:licenseeName,
    start_date:startDate,end_date:endDate,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}

async function updateContract(formData:FormData){
  "use server";
  const {supabase}=await requireLegalAdmin();
  const id=String(formData.get("contract_id")||"").trim();
  const status=String(formData.get("status")||"review");
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const effectiveDate=String(formData.get("effective_date")||"").trim()||null;
  const expirationDate=String(formData.get("expiration_date")||"").trim()||null;
  const autoRenew=String(formData.get("auto_renew")||"false")==="true";
  const noticeRaw=String(formData.get("renewal_notice_days")||"").trim();
  const noticeDays=noticeRaw?Math.max(0,Number(noticeRaw)):null;
  const valueRaw=String(formData.get("value")||"").trim();
  const valueCents=valueRaw?Math.round(Number(valueRaw)*100):null;
  const currency=(String(formData.get("currency")||"USD").trim()||"USD").toUpperCase();
  const notes=String(formData.get("notes")||"").trim()||null;
  const allowedEstado=new Set(["draft","review","signature","active","expired","terminated","canceled"]);
  if(!id||!allowedEstado.has(status)||(noticeDays!==null&&(!Number.isFinite(noticeDays)||!Number.isInteger(noticeDays)))||(valueCents!==null&&(!Number.isFinite(valueCents)||valueCents<0))||!validCurrency(currency)||invalidDateRange(effectiveDate,expirationDate)) throw new Error("invalid_contract_update");
  const{error}=await supabase.from("legal_contracts").update({
    status,owner_user_id:ownerUserId,effective_date:effectiveDate,expiration_date:expirationDate,
    auto_renew:autoRenew,renewal_notice_days:noticeDays,value_cents:valueCents,currency,notes,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/legal");
}

export default async function MasterLegalPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[
    {data:assets},
    {data:rights},
    {data:contracts},
    {count:books},
    {count:media},
    {count:characters},
    {data:owners}
  ]=await Promise.all([
    supabase.from("ip_assets").select("id,code,name,ip_name,asset_type,status,jurisdiction,registration_number,registration_date,owner_entity,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("ip_rights").select("id,asset_id,right_type,territory,exclusivity,holder_name,licensee_name,start_date,end_date,status,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("legal_contracts").select("id,contract_code,title,contract_type,counterparty,status,effective_date,expiration_date,auto_renew,renewal_notice_days,value_cents,currency,owner_user_id,notes,created_at").order("created_at",{ascending:false}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const assetRows=(assets||[]) as any[];
  const rightRows=(rights||[]) as any[];
  const contractRows=(contracts||[]) as any[];
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";
  const activeContracts=contractRows.filter(c=>c.status==="active");
  const expiringSoon=contractRows.filter(c=>{
    if(!c.expiration_date) return false;
    const days=(new Date(c.expiration_date).getTime()-Date.now())/86400000;
    return days>=0&&days<=90;
  });
  const disputed=assetRows.filter(a=>a.status==="disputed").length+rightRows.filter(r=>r.status==="disputed").length;

  return <main className={`${styles.workspace} ${styles.modulePage} ${styles.moduleLegal}`}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · LEGAL E IP</span><h1>Legal e IP</h1><p>Registro persistente de activos, derechos/licencias y contratos con acceso administrativo restringido.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio LIRYGAMES</a>
    </header>

    <section className={styles.moduleStrip} aria-label="Estado del módulo">
      <span className={styles.moduleGlyph} aria-hidden="true">IP</span>
      <div className={styles.moduleStripCopy}><small>LEGAL E IP</small><strong>Activos, derechos y contratos</strong></div>
      <div className={styles.moduleStripMeta}>
        <span><i className={styles.signalLive} aria-hidden="true"></i>Registro legal conectado</span>
        <span>Gestión exclusiva · MFA</span>
      </div>
    </section>

    <section className={styles.kpis}>
      <article><small>Activos de propiedad intelectual</small><strong>{assetRows.length}</strong><span>Registrados</span></article>
      <article><small>Derechos</small><strong>{rightRows.length}</strong><span>Registrados</span></article>
      <article className={expiringSoon.length?styles.kpiAttention:undefined}><small>Contratos activos</small><strong>{activeContracts.length}</strong><span>{expiringSoon.length?expiringSoon.length+" vencen ≤90 días":"Sin vencimientos próximos"}</span></article>
      <article className={disputed?styles.kpiAttention:undefined}><small>Disputas</small><strong>{disputed}</strong><span>{disputed?"Activos + derechos en disputa":"Sin disputas registradas"}</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>PROPIEDAD INTELECTUAL</span><h2>Activos intelectuales</h2></div><p>Inventario legal separado del catálogo editorial y multimedia.</p></section>
    <section className={styles.grid}>
      {assetRows.map((a:any)=><article key={a.id} className={`${styles.card} ${a.status==="disputed"?styles.cardAttention:["draft","archived","retired"].includes(a.status)?styles.cardMuted:a.status==="licensed"?styles.cardPriority:""}`}>
        <div className={styles.cardTop}><span className={a.status==="active"?styles.badgeActive:styles.badgePlanned}>{assetEstadoLabel(a.status)}</span><em>{a.asset_type}</em></div>
        <h3>{a.name}</h3>
        <p>{a.ip_name} · {a.owner_entity||"Titular no registrado"}<br/>{a.jurisdiction||"Jurisdicción pendiente"} · {a.registration_number||"Sin registro externo"}</p>
      </article>)}
      {!assetRows.length&&<article className={styles.card}><h3>Registro de propiedad intelectual preparado</h3><p>No se cargaron activos ficticios. El registro empieza vacío hasta documentar cada activo real.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>DERECHOS Y LICENCIAS</span><h2>Derechos y licencias</h2></div><p>Territorio, exclusividad, titular, licenciatario y vigencia por activo.</p></section>
    <section className={styles.grid}>
      {rightRows.map((r:any)=><article key={r.id} className={`${styles.card} ${r.status==="disputed"?styles.cardAttention:r.status==="pending"?styles.cardWarning:["expired","terminated"].includes(r.status)?styles.cardMuted:["licensed_in","licensed_out"].includes(r.status)?styles.cardPriority:""}`}>
        <div className={styles.cardTop}><span className={r.status==="owned"?styles.badgeActive:styles.badgePlanned}>{rightEstadoLabel(r.status)}</span><em>{r.exclusivity}</em></div>
        <h3>{r.right_type}</h3>
        <p>{assetRows.find(a=>a.id===r.asset_id)?.name||"Activo"} · {r.territory}<br/>{r.holder_name||"Titular pendiente"}{r.licensee_name?" → "+r.licensee_name:""}<br/>{r.start_date||"sin inicio"} → {r.end_date||"sin vencimiento"}</p>
      </article>)}
      {!rightRows.length&&<article className={styles.card}><h3>Matriz de derechos vacía</h3><p>Los derechos se registrarán únicamente contra activos IP reales.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CONTRATOS</span><h2>Contratos</h2></div><p>Registro operativo de contratos; los documentos firmados pueden almacenarse después en un repositorio documental controlado.</p></section>
    <section className={styles.grid}>
      {contractRows.map((c:any)=><article key={c.id} className={`${styles.card} ${c.status==="signature"||c.status==="review"?styles.cardPriority:["expired","terminated","canceled"].includes(c.status)?styles.cardMuted:""}`}>
        <div className={styles.cardTop}><span className={c.status==="active"?styles.badgeActive:styles.badgePlanned}>{contractEstadoLabel(c.status)}</span><em>{c.contract_type}</em></div>
        <h3>{c.title}</h3>
        <p>{c.counterparty||"Sin contraparte"} · {c.contract_code}<br/>Responsable: {ownerName(c.owner_user_id)}<br/>{c.effective_date||"Sin fecha efectiva"} → {c.expiration_date||"Sin vencimiento"}<br/>Renovación automática: {c.auto_renew?"Sí":"No"} · {c.value_cents!=null?new Intl.NumberFormat("en-US",{style:"currency",currency:c.currency||"USD"}).format(Number(c.value_cents)/100):"Valor no registrado"}</p>
      </article>)}
      {!contractRows.length&&<article className={styles.card}><h3>Registro de contratos preparado</h3><p>No hay contratos cargados todavía.</p></article>}
    </section>

    <details className={styles.advancedPanel}>
      <summary>Opciones avanzadas</summary>
      <p className={styles.advancedHint}>Úsalas para registrar o modificar activos, derechos, licencias y contratos manualmente.</p>
        <section className={styles.adminForms}>
      <MasterActionForm action={createIpAsset} className={styles.adminForm} successText="Activo de propiedad intelectual registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO ACTIVO</span><h2>Registrar IP</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="fragmentun-book-1"/></label>
          <label>Nombre<input name="name" required placeholder="El Despertar Emocional"/></label>
          <label>IP<input name="ip_name" required placeholder="FRAGMENTUN"/></label>
          <label>Tipo<select name="asset_type" defaultValue="book">
            <option value="book">Libro</option><option value="game">Videojuego</option><option value="character">Personaje</option><option value="world">Mundo</option>
            <option value="art">Arte</option><option value="trademark">Marca registrada</option><option value="script">Guion</option>
            <option value="music">Música</option><option value="video">Video</option><option value="software">Software</option><option value="other">Otro</option>
          </select></label>
          <label>Entidad titular<input name="owner_entity" placeholder="LIRYGAMES STUDIOS"/></label>
          <label>Jurisdicción<input name="jurisdiction" placeholder="EE. UU. / RD / Mundial"/></label>
          <label>Registro<input name="registration_number" placeholder="Número de registro"/></label>
          <label>Fecha registro<input type="date" name="registration_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar activo</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createRight} className={styles.adminForm} successText="Derecho o licencia registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO DERECHO</span><h2>Registrar derecho/licencia</h2></div>
        <div className={styles.formGrid}>
          <label>Activo<select name="asset_id" required defaultValue="">
            <option value="" disabled>Seleccionar activo</option>
            {assetRows.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
          <label>Derecho<select name="right_type" defaultValue="copyright">
            <option value="copyright">Derechos de autor</option><option value="trademark">Marca registrada</option><option value="publishing">Publicación</option>
            <option value="audiovisual">Audiovisual</option><option value="game">Videojuego</option><option value="merchandising">Productos derivados</option>
            <option value="translation">Traducción</option><option value="distribution">Distribución</option><option value="adaptation">Adaptación</option><option value="music">Música</option><option value="other">Otro</option>
          </select></label>
          <label>Territorio<input name="territory" defaultValue="mundial"/></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="exclusive">
            <option value="exclusive">Exclusivo</option><option value="non_exclusive">No exclusivo</option><option value="shared">Compartido</option><option value="unknown">Desconocido</option>
          </select></label>
          <label>Estado<select name="status" defaultValue="owned">
            <option value="owned">Propio</option><option value="licensed_out">Licenciado a terceros</option><option value="licensed_in">Licenciado por terceros</option>
            <option value="expired">Vencido</option><option value="terminated">Terminado</option><option value="disputed">En disputa</option><option value="pending">Pendiente</option>
          </select></label>
          <label>Titular<input name="holder_name"/></label>
          <label>Licenciatario<input name="licensee_name"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit" disabled={!assetRows.length} disabledReason="Primero registra un activo de propiedad intelectual para poder añadir un derecho o licencia.">Registrar derecho</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createContract} className={styles.adminForm} successText="Contrato registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO CONTRATO</span><h2>Registrar contrato</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="contract_code" required placeholder="nda-001"/></label>
          <label>Título<input name="title" required placeholder="Acuerdo de confidencialidad - Socio"/></label>
          <label>Tipo<select name="contract_type" defaultValue="nda">
            <option value="nda">Acuerdo de confidencialidad</option><option value="license">Licencia</option><option value="publishing">Publicación</option>
            <option value="development">Desarrollo</option><option value="employment">Empleo</option><option value="contractor">Contratista</option>
            <option value="vendor">Proveedor</option><option value="distribution">Distribución</option><option value="investment">Inversión</option><option value="partnership">Alianza</option><option value="other">Otro</option>
          </select></label>
          <label>Contraparte<input name="counterparty"/></label>
          <label>Fecha efectiva<input type="date" name="effective_date"/></label>
          <label>Vencimiento<input type="date" name="expiration_date"/></label>
          <label>Renovación automática<select name="auto_renew" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Aviso renovación (días)<input type="number" min="0" name="renewal_notice_days"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} type="submit">Registrar contrato</MasterSubmitButton>
      </MasterActionForm>
    </section>


    <section className={styles.adminForms}>
      <MasterActionForm action={updateIpAsset} className={styles.adminForm} successText="Activo de propiedad intelectual actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR ACTIVO</span><h2>Actualizar IP</h2></div>
        <div className={styles.formGrid}>
          <label>Activo<select name="asset_id" required defaultValue=""><option value="" disabled>Seleccionar activo</option>{assetRows.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="draft">Borrador</option><option value="active">Activo</option><option value="licensed">Licenciado</option><option value="archived">Archivado</option><option value="disputed">En disputa</option><option value="retired">Retirado</option></select></label>
          <label>Entidad titular<input name="owner_entity"/></label>
          <label>Jurisdicción<input name="jurisdiction"/></label>
          <label>Registro<input name="registration_number"/></label>
          <label>Fecha registro<input type="date" name="registration_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!assetRows.length} disabledReason="No hay activos de propiedad intelectual registrados para actualizar.">Actualizar activo</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateRight} className={styles.adminForm} successText="Derecho o licencia actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR DERECHO</span><h2>Actualizar vigencia/licencia</h2></div>
        <div className={styles.formGrid}>
          <label>Derecho<select name="right_id" required defaultValue=""><option value="" disabled>Seleccionar derecho</option>{rightRows.map((r:any)=><option key={r.id} value={r.id}>{r.right_type} · {assetRows.find(a=>a.id===r.asset_id)?.name||"Activo"}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="owned"><option value="owned">Propio</option><option value="licensed_out">Licenciado a terceros</option><option value="licensed_in">Licenciado por terceros</option><option value="expired">Vencido</option><option value="terminated">Terminado</option><option value="disputed">En disputa</option><option value="pending">Pendiente</option></select></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="exclusive"><option value="exclusive">Exclusivo</option><option value="non_exclusive">No exclusivo</option><option value="shared">Compartido</option><option value="unknown">Desconocido</option></select></label>
          <label>Territorio<input name="territory" defaultValue="mundial"/></label>
          <label>Titular<input name="holder_name"/></label>
          <label>Licenciatario<input name="licensee_name"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!rightRows.length} disabledReason="No hay derechos o licencias registrados para actualizar.">Actualizar derecho</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateContract} className={styles.adminForm} successText="Contrato actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR CONTRATO</span><h2>Actualizar contrato</h2></div>
        <div className={styles.formGrid}>
          <label>Contrato<select name="contract_id" required defaultValue=""><option value="" disabled>Seleccionar contrato</option>{contractRows.map((c:any)=><option key={c.id} value={c.id}>{c.contract_code} · {c.title}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="review"><option value="draft">Borrador</option><option value="review">En revisión</option><option value="signature">En firma</option><option value="active">Activo</option><option value="expired">Vencido</option><option value="terminated">Terminado</option><option value="canceled">Cancelado</option></select></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label>Fecha efectiva<input type="date" name="effective_date"/></label>
          <label>Vencimiento<input type="date" name="expiration_date"/></label>
          <label>Renovación automática<select name="auto_renew" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Aviso renovación (días)<input type="number" min="0" name="renewal_notice_days"/></label>
          <label>Valor<input type="number" min="0" step="0.01" name="value"/></label>
          <label>Moneda<input name="currency" defaultValue="USD"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!contractRows.length} disabledReason="No hay contratos registrados para actualizar.">Actualizar contrato</MasterSubmitButton>
      </MasterActionForm>
      </section>
    </details>

    <section className={styles.sectionHead}><div><span>ACTIVOS EXISTENTES</span><h2>Activos operativos existentes</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Catálogo editorial</span></article>
      <article><small>Multimedia</small><strong>{(media||0).toLocaleString()}</strong><span>Activos operativos</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Universo creativo</span></article>
      <article><small>Acceso</small><strong className={styles.kpiLongValue}>ADMINISTRADOR</strong><span>Acceso a datos restringido</span></article>
    </section>
  </main>;
}
