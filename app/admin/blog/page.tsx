import Link from "next/link";
import {redirect} from "next/navigation";
import {createSupabaseServerClient} from "../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../lib/supabase/mfa";
import {AdminBlogEditor} from "../../../components/AdminBlogEditor";
export default async function AdminBlog(){
 const db=await createSupabaseServerClient(); const {data:{user}}=await db.auth.getUser();
 if(!user)redirect("/admin/login");
 if(!(await hasSatisfiedMfa(db)))return <main className="adminMain"><h1>MFA requerida</h1><p>Verifica tu identidad para administrar el blog.</p><Link href="/admin">Volver</Link></main>;
 const {data:profile}=await db.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||!["admin","editor"].includes(profile.role))redirect("/admin");
 return <main className="adminMain"><div className="adminTopbar"><div><div className="kicker">FRAGMENTUN</div><h1>Blog editorial</h1></div><Link className="btn btnGhost" href="/admin/contenido">← Contenido web</Link></div><p className="lead">Gestiona artículos públicos y borradores en español e inglés. El embudo existente no cambia.</p><AdminBlogEditor/></main>;
}
