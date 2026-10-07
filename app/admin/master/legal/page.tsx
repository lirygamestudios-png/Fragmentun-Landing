import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireLegalAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
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
  const territory=String(formData.get("territory")||"worldwide").trim()||"worldwide";
  const exclusivity=String(formData.get("exclusivity")||"exclusive");
  const holderName=String(formData.get("holder_name")||"").trim()||null;
  const licenseeName=String(formData.get("licensee_name")||"").trim()||null;
  const startDate=String(formData.get("start_date")||"").trim()||null;
  const endDate=String(formData.get("end_date")||"").trim()||null;
  const status=String(formData.get("status")||"owned");
  const allowedRight=new Set(["copyright","trademark","publishing","audiovisual","game","merchandising","translation","distribution","adaptation","music","other"]);
  const allowedExclusivity=new Set(["exclusive","non_exclusive","shared","unknown"]);
  const allowedStatus=new Set(["owned","licensed_out","licensed_in","expired","terminated","disputed","pending"]);
  if(!assetId||!allowedRight.has(rightType)||!allowedExclusivity.has(exclusivity)||!allowedStatus.has(status)) throw new Error("invalid_right");
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
  if(!code||!title||!allowed.has(type)||(noticeDays!==null&&!Number.isFinite(noticeDays))) throw new Error("invalid_contract");
  const{error}=await supabase.from("legal_contracts").insert({
    contract_code:code,title,contract_type:type,counterparty,effective_date:effectiveDate,expiration_date:expirationDate,
    auto_renew:autoRenew,renewal_notice_days:noticeDays,notes,created_by:user.id
  });
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
    {count:characters}
  ]=await Promise.all([
    supabase.from("ip_assets").select("id,code,name,ip_name,asset_type,status,jurisdiction,registration_number,registration_date,owner_entity,created_at").order("created_at",{ascending:false}),
    supabase.from("ip_rights").select("id,asset_id,right_type,territory,exclusivity,holder_name,licensee_name,start_date,end_date,status,created_at").order("created_at",{ascending:false}),
    supabase.from("legal_contracts").select("id,contract_code,title,contract_type,counterparty,status,effective_date,expiration_date,auto_renew,renewal_notice_days,created_at").order("created_at",{ascending:false}),
    supabase.from("books").select("*",{count:"exact",head:true}),
    supabase.from("media_assets").select("*",{count:"exact",head:true}),
    supabase.from("characters").select("*",{count:"exact",head:true})
  ]);

  const assetRows=(assets||[]) as any[];
  const rightRows=(rights||[]) as any[];
  const contractRows=(contracts||[]) as any[];
  const activeContracts=contractRows.filter(c=>c.status==="active");
  const expiringSoon=contractRows.filter(c=>{
    if(!c.expiration_date) return false;
    const days=(new Date(c.expiration_date).getTime()-Date.now())/86400000;
    return days>=0&&days<=90;
  });
  const disputed=assetRows.filter(a=>a.status==="disputed").length+rightRows.filter(r=>r.status==="disputed").length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · LEGAL & IP</span><h1>Legal & IP</h1><p>Registro persistente de activos, derechos/licencias y contratos con acceso administrativo restringido.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Activos IP</small><strong>{assetRows.length}</strong><span>ip_assets</span></article>
      <article><small>Rights</small><strong>{rightRows.length}</strong><span>ip_rights</span></article>
      <article><small>Contratos activos</small><strong>{activeContracts.length}</strong><span>{expiringSoon.length} vencen ≤90 días</span></article>
      <article><small>Disputas</small><strong>{disputed}</strong><span>Assets + rights</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>IP REGISTER</span><h2>Activos intelectuales</h2></div><p>Inventario legal separado del catálogo editorial y multimedia.</p></section>
    <section className={styles.grid}>
      {assetRows.map((a:any)=><article key={a.id} className={styles.card}>
        <div className={styles.cardTop}><span className={a.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(a.status).toUpperCase()}</span><em>{a.asset_type}</em></div>
        <h3>{a.name}</h3>
        <p>{a.ip_name} · {a.owner_entity||"Owner no registrado"}<br/>{a.jurisdiction||"Jurisdicción pendiente"} · {a.registration_number||"Sin registro externo"}</p>
      </article>)}
      {!assetRows.length&&<article className={styles.card}><h3>IP Register preparado</h3><p>No se cargaron activos ficticios. El registro empieza vacío hasta documentar cada activo real.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>RIGHTS MATRIX</span><h2>Derechos & licencias</h2></div><p>Territorio, exclusividad, titular, licenciatario y vigencia por activo.</p></section>
    <section className={styles.grid}>
      {rightRows.map((r:any)=><article key={r.id} className={styles.card}>
        <div className={styles.cardTop}><span className={r.status==="owned"?styles.badgeActive:styles.badgePlanned}>{String(r.status).toUpperCase()}</span><em>{r.exclusivity}</em></div>
        <h3>{r.right_type}</h3>
        <p>{assetRows.find(a=>a.id===r.asset_id)?.name||"Activo"} · {r.territory}<br/>{r.holder_name||"Holder pendiente"}{r.licensee_name?" → "+r.licensee_name:""}<br/>{r.start_date||"sin inicio"} → {r.end_date||"sin vencimiento"}</p>
      </article>)}
      {!rightRows.length&&<article className={styles.card}><h3>Rights Matrix vacía</h3><p>Los derechos se registrarán únicamente contra activos IP reales.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CLM</span><h2>Contratos</h2></div><p>Registro operativo de contratos; los documentos firmados pueden almacenarse después en un repositorio documental controlado.</p></section>
    <section className={styles.grid}>
      {contractRows.map((c:any)=><article key={c.id} className={styles.card}>
        <div className={styles.cardTop}><span className={c.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(c.status).toUpperCase()}</span><em>{c.contract_type}</em></div>
        <h3>{c.title}</h3>
        <p>{c.counterparty||"Sin contraparte"} · {c.contract_code}<br/>{c.effective_date||"Sin fecha efectiva"} → {c.expiration_date||"Sin vencimiento"}<br/>Auto-renew: {c.auto_renew?"Sí":"No"}</p>
      </article>)}
      {!contractRows.length&&<article className={styles.card}><h3>CLM preparado</h3><p>No hay contratos cargados todavía.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createIpAsset} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO ACTIVO</span><h2>Registrar IP</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="code" required placeholder="fragmentun-book-1"/></label>
          <label>Nombre<input name="name" required placeholder="El Despertar Emocional"/></label>
          <label>IP<input name="ip_name" required placeholder="FRAGMENTUN"/></label>
          <label>Tipo<select name="asset_type" defaultValue="book">
            <option value="book">Book</option><option value="game">Game</option><option value="character">Character</option><option value="world">World</option>
            <option value="art">Art</option><option value="trademark">Trademark</option><option value="script">Script</option>
            <option value="music">Music</option><option value="video">Video</option><option value="software">Software</option><option value="other">Other</option>
          </select></label>
          <label>Owner entity<input name="owner_entity" placeholder="LIRYGAMES STUDIOS"/></label>
          <label>Jurisdicción<input name="jurisdiction" placeholder="US / RD / Worldwide"/></label>
          <label>Registro<input name="registration_number" placeholder="Número de registro"/></label>
          <label>Fecha registro<input type="date" name="registration_date"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar activo</button>
      </form>

      <form action={createRight} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO DERECHO</span><h2>Registrar derecho/licencia</h2></div>
        <div className={styles.formGrid}>
          <label>Activo<select name="asset_id" required defaultValue="">
            <option value="" disabled>Seleccionar activo</option>
            {assetRows.map((a:any)=><option key={a.id} value={a.id}>{a.name}</option>)}
          </select></label>
          <label>Derecho<select name="right_type" defaultValue="copyright">
            <option value="copyright">Copyright</option><option value="trademark">Trademark</option><option value="publishing">Publishing</option>
            <option value="audiovisual">Audiovisual</option><option value="game">Game</option><option value="merchandising">Merchandising</option>
            <option value="translation">Translation</option><option value="distribution">Distribution</option><option value="adaptation">Adaptation</option><option value="music">Music</option><option value="other">Other</option>
          </select></label>
          <label>Territorio<input name="territory" defaultValue="worldwide"/></label>
          <label>Exclusividad<select name="exclusivity" defaultValue="exclusive">
            <option value="exclusive">Exclusive</option><option value="non_exclusive">Non-exclusive</option><option value="shared">Shared</option><option value="unknown">Unknown</option>
          </select></label>
          <label>Status<select name="status" defaultValue="owned">
            <option value="owned">Owned</option><option value="licensed_out">Licensed out</option><option value="licensed_in">Licensed in</option>
            <option value="expired">Expired</option><option value="terminated">Terminated</option><option value="disputed">Disputed</option><option value="pending">Pending</option>
          </select></label>
          <label>Holder<input name="holder_name"/></label>
          <label>Licensee<input name="licensee_name"/></label>
          <label>Inicio<input type="date" name="start_date"/></label>
          <label>Fin<input type="date" name="end_date"/></label>
        </div>
        <button className={styles.formButton} type="submit" disabled={!assetRows.length}>Registrar derecho</button>
      </form>

      <form action={createContract} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO CONTRATO</span><h2>Registrar contrato</h2></div>
        <div className={styles.formGrid}>
          <label>Código<input name="contract_code" required placeholder="nda-001"/></label>
          <label>Título<input name="title" required placeholder="NDA - Partner"/></label>
          <label>Tipo<select name="contract_type" defaultValue="nda">
            <option value="nda">NDA</option><option value="license">License</option><option value="publishing">Publishing</option>
            <option value="development">Development</option><option value="employment">Employment</option><option value="contractor">Contractor</option>
            <option value="vendor">Vendor</option><option value="distribution">Distribution</option><option value="investment">Investment</option><option value="partnership">Partnership</option><option value="other">Other</option>
          </select></label>
          <label>Contraparte<input name="counterparty"/></label>
          <label>Fecha efectiva<input type="date" name="effective_date"/></label>
          <label>Vencimiento<input type="date" name="expiration_date"/></label>
          <label>Auto-renew<select name="auto_renew" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Aviso renovación (días)<input type="number" min="0" name="renewal_notice_days"/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <button className={styles.formButton} type="submit">Registrar contrato</button>
      </form>
    </section>

    <section className={styles.sectionHead}><div><span>EXISTING IP SIGNALS</span><h2>Activos operativos existentes</h2></div></section>
    <section className={styles.kpis}>
      <article><small>Libros</small><strong>{(books||0).toLocaleString()}</strong><span>Catálogo editorial</span></article>
      <article><small>Media</small><strong>{(media||0).toLocaleString()}</strong><span>Assets operativos</span></article>
      <article><small>Personajes</small><strong>{(characters||0).toLocaleString()}</strong><span>Worldbuilding</span></article>
      <article><small>Acceso</small><strong>ADMIN</strong><span>RLS restringido</span></article>
    </section>
  </main>;
}
