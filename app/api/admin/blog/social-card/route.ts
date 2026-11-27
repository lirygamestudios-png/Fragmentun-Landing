import {NextRequest,NextResponse} from 'next/server';
import {createSupabaseServerClient} from '../../../../../lib/supabase/server';
import {hasSatisfiedMfa} from '../../../../../lib/supabase/mfa';
import {privateBlogCard} from '../../../../../lib/blog/private-social-card';

export const runtime='nodejs';
export const dynamic='force-dynamic';
export const revalidate=0;
const headers={'Cache-Control':'private, no-store, max-age=0','X-Content-Type-Options':'nosniff'};
const err=(code:string,status:number)=>NextResponse.json({error:code},{status,headers});

export async function GET(request:NextRequest){
 const locale=request.nextUrl.searchParams.get('locale');
 const slug=request.nextUrl.searchParams.get('slug')||'';
 if((locale!=='es'&&locale!=='en')||!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)||slug.length>90)return err('invalid_parameters',400);
 try{
  const db=await createSupabaseServerClient();
  const {data:{user},error:userError}=await db.auth.getUser();
  if(userError||!user||!(await hasSatisfiedMfa(db)))return err('forbidden',403);
  const {data:profile,error:roleError}=await db.from('admin_profiles').select('role').eq('user_id',user.id).maybeSingle();
  if(roleError||!profile||!['admin','editor'].includes(profile.role))return err('forbidden',403);
  const {data:post,error:postError}=await db.from('fragmentun_blog_posts').select('title_es,title_en').eq('slug',slug).maybeSingle();
  if(postError)return err('unavailable',503);
  if(!post)return err('not_found',404);
  const title=locale==='es'?post.title_es:post.title_en;
  const result=await privateBlogCard(typeof title==='string'?title:'',locale,request.nextUrl.origin);
  for(const [name,value] of Object.entries(headers))result.headers.set(name,value);
  return result;
 }catch{
  return err('unavailable',503);
 }
}