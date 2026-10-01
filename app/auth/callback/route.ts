import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

async function ensureAdminProfile(supabase:any,user:{id:string;email?:string|null}){
  let{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(profile)return profile;
  if(!user.email)return null;

  const{data:allowed}=await supabase
    .from("admin_access_allowlist")
    .select("role,display_name")
    .ilike("email",user.email)
    .maybeSingle();

  if(!allowed)return null;

  const{error}=await supabase.from("admin_profiles").upsert({
    user_id:user.id,
    display_name:allowed.display_name??null,
    role:allowed.role
  },{onConflict:"user_id"});

  if(error)return null;

  const refreshed=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  return refreshed.data||null;
}

export async function GET(request:NextRequest){
  const url=new URL(request.url);
  const code=url.searchParams.get("code");
  let next=url.searchParams.get("next")||"/admin";

  if(!next.startsWith("/admin")) next="/admin";

  if(code){
    const supabase=await createSupabaseServerClient();
    const{error}=await supabase.auth.exchangeCodeForSession(code);

    if(!error){
      const{data:{user}}=await supabase.auth.getUser();
      if(user){
        const profile=await ensureAdminProfile(supabase,user);
        if(profile)return NextResponse.redirect(new URL(next,request.url));
        await supabase.auth.signOut();
        return NextResponse.redirect(new URL("/admin/login?unauthorized=1",request.url));
      }
    }
  }

  return NextResponse.redirect(new URL("/admin/login?auth_error=1",request.url));
}
