import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";
import styles from "../master-admin.module.css";
import {MasterSubmitButton} from "../../../../components/MasterSubmitButton";
import {MasterActionForm} from "../../../../components/MasterActionForm";

function settingStatusLabel(value:string){
  const map:Record<string,string>={active:"ACTIVO",inactive:"INACTIVO",deprecated:"OBSOLETO"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}
function scopeLabel(value:string){
  const map:Record<string,string>={shared:"COMPARTIDO",development:"DESARROLLO",preview:"VERSIÓN DE PRUEBA",production:"PRODUCCIÓN"};
  return map[value]||String(value||"").replaceAll("_"," ").toUpperCase();
}

async function requireAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  if(!(await hasSatisfiedMfa(supabase))) throw new Error("mfa_required");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile||profile.role!=="admin") throw new Error("admin_required");
  return {supabase,user};
}

async function createSetting(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const key=String(formData.get("setting_key")||"").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g,"-");
  const category=String(formData.get("category")||"general").trim()||"general";
  const label=String(formData.get("label")||"").trim();
  const description=String(formData.get("description")||"").trim()||null;
  const scope=String(formData.get("environment_scope")||"shared");
  const raw=String(formData.get("value")||"").trim();
  const forbidden=/(secret|token|password|api[_-]?key|private[_-]?key|service[_-]?role)/i;
  if(!key||!label||forbidden.test(key)||forbidden.test(label)) throw new Error("secret_like_setting_forbidden");
  if(!["shared","development","preview","production"].includes(scope)) throw new Error("invalid_scope");
  const valueJson={value:raw};
  const{error}=await supabase.from("corporate_settings").insert({
    setting_key:key,category,label,description,value_json:valueJson,environment_scope:scope,is_sensitive:false,updated_by:user.id,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/settings");
}

async function createFlag(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const key=String(formData.get("flag_key")||"").trim().toLowerCase().replace(/[^a-z0-9_.-]+/g,"-");
  const label=String(formData.get("label")||"").trim();
  const description=String(formData.get("description")||"").trim()||null;
  const scope=String(formData.get("environment_scope")||"preview");
  const rollout=Number(formData.get("rollout_percent")||0);
  if(!key||!label||!["shared","development","preview","production"].includes(scope)||!Number.isFinite(rollout)||!Number.isInteger(rollout)||rollout<0||rollout>100) throw new Error("invalid_flag");
  const{error}=await supabase.from("feature_flags").insert({
    flag_key:key,label,description,environment_scope:scope,rollout_percent:rollout,enabled:false,updated_by:user.id,created_by:user.id
  });
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/settings");
}


async function updateSetting(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const id=String(formData.get("setting_id")||"").trim();
  const status=String(formData.get("status")||"active");
  const scope=String(formData.get("environment_scope")||"shared");
  const description=String(formData.get("description")||"").trim()||null;
  const raw=String(formData.get("value")||"").trim();
  const forbidden=/(secret|token|password|api[_-]?key|private[_-]?key|service[_-]?role)/i;
  const{data:existing}=await supabase.from("corporate_settings").select("setting_key,label").eq("id",id).maybeSingle();
  if(!id||!existing||forbidden.test(existing.setting_key)||forbidden.test(existing.label)) throw new Error("secret_like_setting_forbidden");
  if(!["active","inactive","deprecated"].includes(status)||!["shared","development","preview","production"].includes(scope)) throw new Error("invalid_setting_update");
  const{error}=await supabase.from("corporate_settings").update({
    status,environment_scope:scope,description,value_json:{value:raw},is_sensitive:false,
    updated_by:user.id,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/settings");
}

async function updateFlag(formData:FormData){
  "use server";
  const {supabase,user}=await requireAdmin();
  const id=String(formData.get("flag_id")||"").trim();
  const enabled=String(formData.get("enabled")||"false")==="true";
  const scope=String(formData.get("environment_scope")||"preview");
  const rollout=Math.max(0,Math.min(100,Number(formData.get("rollout_percent")||0)));
  const ownerRaw=String(formData.get("owner_user_id")||"").trim();
  const ownerUserId=ownerRaw||null;
  const description=String(formData.get("description")||"").trim()||null;
  const notes=String(formData.get("notes")||"").trim()||null;
  if(!id||!["shared","development","preview","production"].includes(scope)||!Number.isFinite(rollout)||!Number.isInteger(rollout)||rollout<0||rollout>100||(enabled&&!ownerUserId)) throw new Error("invalid_flag_update");
  if(enabled&&scope==="production") throw new Error("production_flag_requires_release_approval");
  const{error}=await supabase.from("feature_flags").update({
    enabled,environment_scope:scope,rollout_percent:Math.trunc(rollout),owner_user_id:ownerUserId,
    description,notes,updated_by:user.id,updated_at:new Date().toISOString()
  }).eq("id",id);
  if(error) throw new Error(error.message);
  revalidatePath("/admin/master/settings");
}

export default async function SettingsPage(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(!profile) redirect("/admin/login?unauthorized=1");
  if(profile.role!=="admin") redirect("/admin/master");

  const[{data:settings},{data:flags},{data:owners}]=await Promise.all([
    supabase.from("corporate_settings").select("id,setting_key,category,label,description,value_json,environment_scope,status,updated_at").order("category",{ascending:true}),
    supabase.from("feature_flags").select("id,flag_key,label,description,enabled,environment_scope,rollout_percent,owner_user_id,notes,updated_at").order("flag_key",{ascending:true}),
    supabase.from("admin_profiles").select("user_id,display_name,role").order("display_name",{ascending:true})
  ]);

  const settingRows=(settings||[]) as any[];
  const flagRows=(flags||[]) as any[];
  const enabledFlags=flagRows.filter(f=>f.enabled);
  const prodScoped=settingRows.filter(s=>s.environment_scope==="production").length;
  const ownerRows=(owners||[]) as any[];
  const ownerName=(id:string|null|undefined)=>ownerRows.find(o=>o.user_id===id)?.display_name||"Sin responsable";

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>LIRYGAMES · CONFIGURACIÓN</span><h1>Configuración</h1><p>Parámetros operativos y controles de activación. Las credenciales y claves sensibles permanecen fuera de este panel.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Inicio</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Parámetros</small><strong>{settingRows.length}</strong><span>{prodScoped} de producción</span></article>
      <article><small>Controles de activación</small><strong>{flagRows.length}</strong><span>{enabledFlags.length} activos</span></article>
      <article><small>Credenciales</small><strong>PROHIBIDO</strong><span>Solo parámetros no sensibles</span></article>
      <article><small>Acceso</small><strong>ADMINISTRADOR</strong><span>Acceso restringido</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>PARÁMETROS</span><h2>Parámetros operativos</h2></div></section>
    <section className={styles.grid}>
      {settingRows.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{settingStatusLabel(s.status)}</span><em>{scopeLabel(s.environment_scope)}</em></div>
        <h3>{s.label}</h3><p>{s.description||"Sin descripción"}<br/>Categoría: {s.category}<br/>Valor: {String(s.value_json?.value??"—")}</p>
      </article>)}
      {!settingRows.length&&<article className={styles.card}><h3>Registro de parámetros preparado</h3><p>No hay parámetros corporativos cargados todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>CONTROLES DE ACTIVACIÓN</span><h2>Controles de activación</h2></div><p>Los controles nacen desactivados; su activación sigue un flujo controlado.</p></section>
    <section className={styles.grid}>
      {flagRows.map((f:any)=><article key={f.id} className={styles.card}>
        <div className={styles.cardTop}><span className={f.enabled?styles.badgeActive:styles.badgePlanned}>{f.enabled?"ACTIVO":"INACTIVO"}</span><em>{scopeLabel(f.environment_scope)}</em></div>
        <h3>{f.label}</h3><p>Responsable: {ownerName(f.owner_user_id)}<br/>{f.description||"Sin descripción"}<br/>Activación: {f.rollout_percent}%</p>
      </article>)}
      {!flagRows.length&&<article className={styles.card}><h3>Registro de controles preparado</h3><p>No hay controles cargados todavía.</p></article>}
    </section>

    <details className={styles.advancedPanel}><summary>Opciones avanzadas</summary><section className={styles.adminForms}>
      <MasterActionForm action={createSetting} className={styles.adminForm} successText="Parámetro registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO PARÁMETRO</span><h2>Registrar parámetro</h2></div>
        <div className={styles.formGrid}>
          <label>Clave<input name="setting_key" required placeholder="interfaz.idioma_predeterminado"/></label>
          <label>Nombre visible<input name="label" required/></label>
          <label>Categoría<input name="category" defaultValue="general"/></label>
          <label>Entorno<select name="environment_scope" defaultValue="shared"><option value="shared">Compartido</option><option value="development">Desarrollo</option><option value="preview">Versión de prueba</option><option value="production">Producción</option></select></label>
          <label className={styles.span2}>Valor<input name="value"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton}>Registrar parámetro</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={createFlag} className={styles.adminForm} successText="Control registrado correctamente.">
        <div className={styles.formTitle}><span>NUEVO CONTROL</span><h2>Registrar control de activación</h2></div>
        <div className={styles.formGrid}>
          <label>Clave<input name="flag_key" required placeholder="control.nueva_funcion"/></label>
          <label>Nombre visible<input name="label" required/></label>
          <label>Entorno<select name="environment_scope" defaultValue="preview"><option value="shared">Compartido</option><option value="development">Desarrollo</option><option value="preview">Vista previa</option><option value="production">Producción</option></select></label>
          <label>Porcentaje de activación<input type="number" min="0" max="100" name="rollout_percent" defaultValue="0"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton}>Registrar control</MasterSubmitButton>
      </MasterActionForm>
    </section>

    <section className={styles.adminForms}>
      <MasterActionForm action={updateSetting} className={styles.adminForm} successText="Parámetro actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR PARÁMETRO</span><h2>Actualizar parámetro</h2></div>
        <div className={styles.formGrid}>
          <label>Parámetro<select name="setting_id" required defaultValue=""><option value="" disabled>Seleccionar parámetro</option>{settingRows.map((s:any)=><option key={s.id} value={s.id}>{s.setting_key} · {s.label}</option>)}</select></label>
          <label>Estado<select name="status" defaultValue="active"><option value="active">Activo</option><option value="inactive">Inactivo</option><option value="deprecated">Obsoleto</option></select></label>
          <label>Entorno<select name="environment_scope" defaultValue="shared"><option value="shared">Compartido</option><option value="development">Desarrollo</option><option value="preview">Vista previa</option><option value="production">Producción</option></select></label>
          <label className={styles.span2}>Valor<input name="value"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!settingRows.length} disabledReason="No hay parámetros registrados para actualizar.">Actualizar parámetro</MasterSubmitButton>
      </MasterActionForm>

      <MasterActionForm action={updateFlag} className={styles.adminForm} successText="Control actualizado correctamente.">
        <div className={styles.formTitle}><span>GESTIONAR CONTROL</span><h2>Actualizar control de activación</h2></div>
        <div className={styles.formGrid}>
          <label>Control<select name="flag_id" required defaultValue=""><option value="" disabled>Seleccionar control</option>{flagRows.map((f:any)=><option key={f.id} value={f.id}>{f.flag_key} · {f.label}</option>)}</select></label>
          <label>Activo<select name="enabled" defaultValue="false"><option value="false">No</option><option value="true">Sí</option></select></label>
          <label>Entorno<select name="environment_scope" defaultValue="preview"><option value="shared">Compartido</option><option value="development">Desarrollo</option><option value="preview">Vista previa</option><option value="production">Producción</option></select></label>
          <label>Porcentaje de activación<input type="number" min="0" max="100" name="rollout_percent" defaultValue="0"/></label>
          <label>Responsable<select name="owner_user_id" defaultValue=""><option value="">Sin responsable</option>{ownerRows.map((o:any)=><option key={o.user_id} value={o.user_id}>{o.display_name||o.user_id} · {o.role}</option>)}</select></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
          <label className={styles.span2}>Notas<textarea name="notes" rows={3}/></label>
        </div>
        <MasterSubmitButton className={styles.formButton} disabled={!flagRows.length} disabledReason="No hay controles de activación registrados para actualizar.">Actualizar control</MasterSubmitButton>
      </MasterActionForm>
    </section></details>

    <section className={styles.notice}>
      <div><strong>Protección antes de publicar</strong><span>Los controles de producción no pueden activarse desde esta vista previa; requieren aprobación explícita antes de publicar.</span></div>
      <code>producción protegida</code>
    </section>
  </main>;
}