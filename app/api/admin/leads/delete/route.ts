import { NextRequest,NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../../lib/supabase/server";

export async function POST(request:NextRequest){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"forbidden"},{status:403});

  const{data:profile}=await supabase
    .from("admin_profiles")
    .select("role")
    .eq("user_id",user.id)
    .maybeSingle();

  if(!profile||!["admin","marketing"].includes(profile.role)){
    return NextResponse.json({error:"forbidden"},{status:403});
  }

  const body=await request.json().catch(()=>null);
  const id=String(body?.id??"");
  const confirmation=String(body?.confirmation??"");

  if(!id||confirmation!=="DELETE"){
    return NextResponse.json({error:"confirmation_required"},{status:400});
  }

  const{data:lead,error:leadError}=await supabase
    .from("leads")
    .select("id,email,mailerlite_subscriber_id")
    .eq("id",id)
    .maybeSingle();

  if(leadError||!lead)return NextResponse.json({error:"lead_not_found"},{status:404});

  let mailerliteForgotten=false;
  let mailerliteMessage:string|null=null;
  const token=process.env.MAILERLITE_API_TOKEN;

  if(token&&lead.mailerlite_subscriber_id){
    const ml=await fetch(
      `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(lead.mailerlite_subscriber_id)}/forget`,
      {
        method:"POST",
        headers:{
          Authorization:`Bearer ${token}`,
          Accept:"application/json"
        },
        cache:"no-store",
        signal:AbortSignal.timeout(8000)
      }
    ).catch(()=>null);

    mailerliteForgotten=!!ml?.ok;
    if(!mailerliteForgotten){
      mailerliteMessage=ml?`MailerLite forget HTTP ${ml.status}`:"MailerLite forget request failed";
    }
  }

  if(mailerliteMessage){
    await supabase.from("integration_logs").insert({
      integration:"privacy",
      event_type:"lead_delete",
      status:"error",
      entity_type:"lead",
      entity_id:id,
      message:mailerliteMessage,
      metadata:{
        mailerlite_forget_attempted:true,
        mailerlite_forgotten:false
      }
    });

    return NextResponse.json({
      ok:false,
      error:"mailerlite_forget_failed"
    },{status:502});
  }

  const{error:deleteError}=await supabase.from("leads").delete().eq("id",id);
  if(deleteError)return NextResponse.json({error:"delete_failed"},{status:500});

  await supabase.from("integration_logs").insert({
    integration:"privacy",
    event_type:"lead_delete",
    status:"success",
    entity_type:"lead",
    entity_id:id,
    message:null,
    metadata:{
      mailerlite_forget_attempted:!!(token&&lead.mailerlite_subscriber_id),
      mailerlite_forgotten:mailerliteForgotten
    }
  });

  return NextResponse.json({
    ok:true,
    mailerlite_forgotten:mailerliteForgotten
  });
}
