import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import styles from "../master-admin.module.css";

async function requireAdmin(){
  "use server";
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) redirect("/admin/login");
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
  const rollout=Math.max(0,Math.min(100,Number(formData.get("rollout_percent")||0)));
  if(!key||!label||!["shared","development","preview","production"].includes(scope)||!Number.isFinite(rollout)) throw new Error("invalid_flag");
  const{error}=await supabase.from("feature_flags").insert({
    flag_key:key,label,description,environment_scope:scope,rollout_percent:rollout,enabled:false,updated_by:user.id,created_by:user.id
  });
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

  const[{data:settings},{data:flags}]=await Promise.all([
    supabase.from("corporate_settings").select("id,setting_key,category,label,description,value_json,environment_scope,status,updated_at").order("category",{ascending:true}),
    supabase.from("feature_flags").select("id,flag_key,label,description,enabled,environment_scope,rollout_percent,updated_at").order("flag_key",{ascending:true})
  ]);

  const settingRows=(settings||[]) as any[];
  const flagRows=(flags||[]) as any[];
  const enabledFlags=flagRows.filter(f=>f.enabled);
  const prodScoped=settingRows.filter(s=>s.environment_scope==="production").length;

  return <main className={styles.workspace}>
    <header className={styles.topbar}>
      <div><span className={styles.eyebrow}>MASTER ADMIN · CONFIGURACIÓN</span><h1>Configuración</h1><p>Parámetros operativos no secretos y feature flags. Credenciales y tokens permanecen en Vercel/Supabase, nunca aquí.</p></div>
      <a className={styles.publicSite} href="/admin/master">← Command Center</a>
    </header>

    <section className={styles.kpis}>
      <article><small>Settings</small><strong>{settingRows.length}</strong><span>{prodScoped} production-scoped</span></article>
      <article><small>Feature flags</small><strong>{flagRows.length}</strong><span>{enabledFlags.length} enabled</span></article>
      <article><small>Secret storage</small><strong>PROHIBIDO</strong><span>Solo configuración no sensible</span></article>
      <article><small>Acceso</small><strong>ADMIN</strong><span>RLS restringido</span></article>
    </section>

    <section className={styles.sectionHead}><div><span>SETTINGS REGISTRY</span><h2>Parámetros operativos</h2></div></section>
    <section className={styles.grid}>
      {settingRows.map((s:any)=><article key={s.id} className={styles.card}>
        <div className={styles.cardTop}><span className={s.status==="active"?styles.badgeActive:styles.badgePlanned}>{String(s.status).toUpperCase()}</span><em>{s.environment_scope}</em></div>
        <h3>{s.label}</h3><p>{s.setting_key} · {s.category}<br/>{s.description||"Sin descripción"}<br/>Valor: {String(s.value_json?.value??"—")}</p>
      </article>)}
      {!settingRows.length&&<article className={styles.card}><h3>Settings Registry preparado</h3><p>No hay parámetros corporativos cargados todavía.</p></article>}
    </section>

    <section className={styles.sectionHead}><div><span>FEATURE FLAGS</span><h2>Controles de activación</h2></div><p>Las flags nacen deshabilitadas; habilitación y promoción seguirán un flujo controlado.</p></section>
    <section className={styles.grid}>
      {flagRows.map((f:any)=><article key={f.id} className={styles.card}>
        <div className={styles.cardTop}><span className={f.enabled?styles.badgeActive:styles.badgePlanned}>{f.enabled?"ENABLED":"DISABLED"}</span><em>{f.environment_scope}</em></div>
        <h3>{f.label}</h3><p>{f.flag_key}<br/>{f.description||"Sin descripción"}<br/>Rollout: {f.rollout_percent}%</p>
      </article>)}
      {!flagRows.length&&<article className={styles.card}><h3>Feature Flag Registry preparado</h3><p>No hay flags cargadas todavía.</p></article>}
    </section>

    <section className={styles.adminForms}>
      <form action={createSetting} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVO SETTING</span><h2>Registrar parámetro</h2></div>
        <div className={styles.formGrid}>
          <label>Key<input name="setting_key" required placeholder="ui.default_locale"/></label>
          <label>Label<input name="label" required/></label>
          <label>Categoría<input name="category" defaultValue="general"/></label>
          <label>Scope<select name="environment_scope" defaultValue="shared"><option value="shared">Shared</option><option value="development">Development</option><option value="preview">Preview</option><option value="production">Production</option></select></label>
          <label className={styles.span2}>Valor<input name="value"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <button className={styles.formButton}>Registrar setting</button>
      </form>

      <form action={createFlag} className={styles.adminForm}>
        <div className={styles.formTitle}><span>NUEVA FLAG</span><h2>Registrar feature flag</h2></div>
        <div className={styles.formGrid}>
          <label>Key<input name="flag_key" required placeholder="master.experimental_feature"/></label>
          <label>Label<input name="label" required/></label>
          <label>Scope<select name="environment_scope" defaultValue="preview"><option value="shared">Shared</option><option value="development">Development</option><option value="preview">Preview</option><option value="production">Production</option></select></label>
          <label>Rollout %<input type="number" min="0" max="100" name="rollout_percent" defaultValue="0"/></label>
          <label className={styles.span2}>Descripción<textarea name="description" rows={3}/></label>
        </div>
        <button className={styles.formButton}>Registrar flag</button>
      </form>
    </section>
  </main>;
}