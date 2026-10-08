import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";

export async function POST(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();

  if(user){
    await supabase.from("admin_mfa_context_sessions")
      .delete()
      .eq("user_id",user.id)
      .eq("context","lirygames_commander");
  }

  await supabase.auth.signOut();

  const response=NextResponse.json({ok:true});
  response.cookies.set("liry_mfa_context","",{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
    path:"/admin",
    maxAge:0
  });
  return response;
}
