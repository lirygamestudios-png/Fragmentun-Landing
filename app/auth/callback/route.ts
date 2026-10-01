import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../lib/supabase/server";

export async function GET(request:NextRequest){
  const url=new URL(request.url);
  const code=url.searchParams.get("code");
  let next=url.searchParams.get("next")||"/admin";

  if(!next.startsWith("/admin")) next="/admin";

  if(code){
    const supabase=await createSupabaseServerClient();
    const{error}=await supabase.auth.exchangeCodeForSession(code);

    if(!error){
      return NextResponse.redirect(new URL(next,request.url));
    }
  }

  return NextResponse.redirect(new URL("/admin/login?auth_error=1",request.url));
}
