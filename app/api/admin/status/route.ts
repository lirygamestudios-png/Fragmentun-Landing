import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

async function admin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  const{data:p}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:p?.role==="admin",supabase};
}

export async function GET(){
  const x=await admin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const checks=[
    {key:"supabase_url",label:"Supabase URL",ok:!!process.env.NEXT_PUBLIC_SUPABASE_URL,required:true},
    {key:"supabase_key",label:"Supabase publishable key",ok:!!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,required:true},
    {key:"site_url",label:"URL pública del sitio",ok:!!process.env.NEXT_PUBLIC_SITE_URL,required:true},
    {key:"patreon",label:"Patreon",ok:!!process.env.NEXT_PUBLIC_PATREON_URL,required:false},
    {key:"instagram",label:"Instagram oficial",ok:!!process.env.NEXT_PUBLIC_INSTAGRAM_URL,required:false},
    {key:"youtube",label:"YouTube oficial",ok:!!process.env.NEXT_PUBLIC_YOUTUBE_URL,required:false},
    {key:"facebook",label:"Facebook oficial",ok:!!process.env.NEXT_PUBLIC_FACEBOOK_URL,required:false},
    {key:"mailerlite_token",label:"MailerLite API token",ok:!!process.env.MAILERLITE_API_TOKEN,required:true},
    {key:"mailerlite_es",label:"MailerLite grupo ES",ok:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_ES,required:true},
    {key:"mailerlite_en",label:"MailerLite grupo EN",ok:!!process.env.MAILERLITE_GROUP_FRAGMENTUN_CAP1_EN,required:false}
  ];

  const{data:book}=await x.supabase
    .from("book_editions")
    .select("amazon_url,status,locale,marketplace")
    .eq("locale","es")
    .eq("status","published")
    .limit(1)
    .maybeSingle();

  checks.push({
    key:"amazon_es",
    label:"Amazon edición ES",
    ok:!!book?.amazon_url,
    required:true
  });

  const[{count:allowlistCount},{count:profileCount}]=await Promise.all([
    x.supabase.from("admin_access_allowlist").select("*",{count:"exact",head:true}),
    x.supabase.from("admin_profiles").select("*",{count:"exact",head:true})
  ]);

  checks.push({
    key:"admin_provisioning",
    label:"Perfiles administrativos aprovisionados",
    ok:(profileCount||0)>0,
    required:true
  });

  return NextResponse.json({
    checks,
    admin_access:{
      allowlisted:allowlistCount||0,
      provisioned:profileCount||0
    },
    ready_required:checks.filter(c=>c.required).every(c=>c.ok),
    configured:checks.filter(c=>c.ok).length,
    total:checks.length
  });
}
