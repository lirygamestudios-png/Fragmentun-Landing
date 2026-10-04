import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { createSupabaseServiceClient } from "../../../../lib/supabase/service";

const ROLES=new Set(["admin","editor","marketing"]);
const EMAIL_RE=/^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function admin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return{ok:false,supabase,user:null,profile:null};
  const{data:profile}=await supabase.from("admin_profiles").select("role,display_name").eq("user_id",user.id).maybeSingle();
  return{ok:profile?.role==="admin",supabase,user,profile};
}

async function authUserByEmail(email:string){
  try{
    const service=createSupabaseServiceClient();
    for(let page=1;page<=10;page++){
      const{data,error}=await service.auth.admin.listUsers({page,perPage:100});
      if(error)return null;
      const match=data.users.find(u=>(u.email||"").toLowerCase()===email);
      if(match)return match;
      if(data.users.length<100)break;
    }
  }catch{}
  return null;
}

export async function GET(){
  const x=await admin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const[{data:allowlist},{data:profiles}]=await Promise.all([
    x.supabase.from("admin_access_allowlist").select("*").order("created_at"),
    x.supabase.from("admin_profiles").select("*").order("created_at")
  ]);

  const profileRows=profiles||[];
  const profileByEmail=new Map<string,any>();
  try{
    const service=createSupabaseServiceClient();
    for(let page=1;page<=10;page++){
      const{data,error}=await service.auth.admin.listUsers({page,perPage:100});
      if(error)break;
      for(const authUser of data.users){
        const profile=profileRows.find((p:any)=>p.user_id===authUser.id);
        if(profile&&authUser.email)profileByEmail.set(authUser.email.toLowerCase(),profile);
      }
      if(data.users.length<100)break;
    }
  }catch{}

  const access=(allowlist||[]).map((row:any)=>({
    ...row,
    profile_active:profileByEmail.has(String(row.email||"").toLowerCase())
  }));

  return NextResponse.json({
    allowlist:access,
    profiles:profileRows,
    current_user:{email:x.user?.email||"",role:x.profile?.role||""}
  });
}

export async function POST(request:NextRequest){
  const x=await admin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const b=await request.json().catch(()=>null);
  const email=String(b?.email||"").trim().toLowerCase();
  const role=String(b?.role||"editor");
  const displayName=String(b?.display_name||"").trim().slice(0,120)||null;

  if(!EMAIL_RE.test(email)||!ROLES.has(role)){
    return NextResponse.json({error:"invalid_request"},{status:400});
  }

  const selfEmail=(x.user?.email||"").trim().toLowerCase();
  if(email===selfEmail&&role!=="admin"){
    return NextResponse.json({error:"cannot_demote_self"},{status:409});
  }

  const payload={email,role,display_name:displayName};
  const{data,error}=await x.supabase.from("admin_access_allowlist").upsert(payload).select().single();
  if(error)return NextResponse.json({error:"save_failed"},{status:500});

  const target=await authUserByEmail(email);
  if(target){
    const service=createSupabaseServiceClient();
    await service.from("admin_profiles").upsert({
      user_id:target.id,
      display_name:displayName,
      role
    },{onConflict:"user_id"});
  }

  return NextResponse.json({data,synced_profile:!!target});
}

export async function DELETE(request:NextRequest){
  const x=await admin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const email=String(new URL(request.url).searchParams.get("email")||"").trim().toLowerCase();
  if(!EMAIL_RE.test(email))return NextResponse.json({error:"invalid_request"},{status:400});

  const selfEmail=(x.user?.email||"").trim().toLowerCase();
  if(email===selfEmail){
    return NextResponse.json({error:"cannot_remove_self"},{status:409});
  }

  const{data:targetAccess}=await x.supabase
    .from("admin_access_allowlist")
    .select("role")
    .eq("email",email)
    .maybeSingle();

  if(targetAccess?.role==="admin"){
    const{count}=await x.supabase
      .from("admin_access_allowlist")
      .select("*",{count:"exact",head:true})
      .eq("role","admin");
    if((count||0)<=1){
      return NextResponse.json({error:"cannot_remove_last_admin"},{status:409});
    }
  }

  const{error}=await x.supabase.from("admin_access_allowlist").delete().eq("email",email);
  if(error)return NextResponse.json({error:"delete_failed"},{status:500});

  const target=await authUserByEmail(email);
  if(target){
    const service=createSupabaseServiceClient();
    await service.from("admin_profiles").delete().eq("user_id",target.id);
  }

  return NextResponse.json({ok:true,revoked_profile:!!target});
}
