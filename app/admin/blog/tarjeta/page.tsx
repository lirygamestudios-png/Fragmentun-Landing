import Link from 'next/link';
import {redirect} from 'next/navigation';
import {createSupabaseServerClient} from '../../../../lib/supabase/server';
import {hasSatisfiedMfa} from '../../../../lib/supabase/mfa';

export const dynamic='force-dynamic';
export const revalidate=0;
type Props={searchParams:Promise<{slug?:string;locale?:string}>};
export default async function SocialPreviewPage({searchParams}:Props){
 const db=await createSupabaseServerClient();
 const {data:{user}}=await db.auth.getUser();
 if(!user||!(await hasSatisfiedMfa(db)))redirect('/admin/login');
 const {data:profile}=await db.from('admin_profiles').select('role').eq('user_id',user.id).maybeSingle();
 if(!profile||!['admin','editor'].includes(profile.role))redirect('/admin');
 const query=await searchParams;
 const slug=typeof query.slug==='string'?query.slug:'prueba-editorial-fragmentun';
 const locale=query.locale==='en'?'en':'es';
 const valid=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)&&slug.length<=90;
 const url=valid?`/api/admin/blog/social-card?slug=${encodeURIComponent(slug)}&locale=${locale}`:null;
 const field:React.CSSProperties={padding:12,borderRadius:8,border:'1px solid #8b9cbb',background:'#121f36',color:'#fff'};
 return <main style={{minHeight:'100vh',background:'#050c1c',color:'#f7eedb',padding:'40px 24px',fontFamily:'Arial,sans-serif'}}>
  <div style={{maxWidth:1040,margin:'0 auto'}}>
   <Link href="/admin/blog" style={{color:'#d7b96e'}}>← Volver al administrador del blog</Link>
   <h1 style={{fontSize:30,margin:'24px 0 8px'}}>Vista previa privada · Tarjeta WhatsApp</h1>
   <p style={{color:'#b7cee9'}}>Muestra el título guardado del artículo, incluso si está en borrador. Esta imagen requiere sesión autorizada y MFA; no es un enlace público para compartir.</p>
   <form method="get" action="/admin/blog/tarjeta" style={{display:'flex',gap:12,flexWrap:'wrap',alignItems:'end',margin:'28px 0'}}>
    <label style={{display:'flex',flexDirection:'column',gap:8,flex:'1 1 330px'}}>Identificador del artículo (slug)<input name="slug" defaultValue={slug} required maxLength={90} style={field}/></label>
    <label style={{display:'flex',flexDirection:'column',gap:8}}>Idioma<select name="locale" defaultValue={locale} style={field}><option value="es">Español</option><option value="en">Inglés</option></select></label>
    <button type="submit" style={{...field,background:'#bf9e56',color:'#071020',fontWeight:700,cursor:'pointer'}}>Ver tarjeta</button>
   </form>
   {url?<div style={{border:'1px solid #52678d',borderRadius:14,padding:8,background:'#0a1932'}}>
    {/* eslint-disable-next-line @next/next/no-img-element */}
    <img src={url} alt={`Tarjeta privada FRAGMENTUN en ${locale==='es'?'español':'inglés'}`} width={1200} height={630} style={{display:'block',width:'100%',height:'auto',borderRadius:8}}/>
   </div>:<p role="alert">Slug no válido. Utiliza letras minúsculas, números y guiones.</p>}
   <p style={{color:'#b7cee9',marginTop:18}}>Solo lectura. No cambia publicaciones ni modifica la base de datos. Si la imagen no se carga, confirma que el slug exista y que tu sesión MFA siga activa.</p>
  </div>
 </main>;
}
