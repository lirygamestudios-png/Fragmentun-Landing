import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";

export async function POST(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();

  if(user){
    const{error:contextError}=await supabase.from("admin_mfa_context_sessions")
      .delete()
      .eq("user_id",user.id)
      .eq("context","lirygames_commander");
    if(contextError){
      console.error("lirygames_logout_context_revocation_failed",contextError.code);
      return NextResponse.json({ok:false,error:"context_revocation_failed"},{status:500,headers:{"Cache-Control":"no-store"}});
    }
  }

  const{error:signOutError}=await supabase.auth.signOut();

  const response=NextResponse.json(signOutError?{ok:false,error:"logout_failed"}:{ok:true},{status:signOutError?500:200,headers:{"Cache-Control":"no-store"}});
  response.cookies.set("liry_mfa_context","",{
    httpOnly:true,
    secure:process.env.NODE_ENV==="production",
    sameSite:"strict",
    path:"/admin",
    maxAge:0
  });
  return response;
}
