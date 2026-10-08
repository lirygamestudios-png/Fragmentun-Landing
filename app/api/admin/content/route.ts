import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { hasSatisfiedMfa } from "../../../../lib/supabase/mfa";

async function requireEditor(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user) return {supabase,user:null,role:null,error:"forbidden"};
  if(!(await hasSatisfiedMfa(supabase))) return {supabase,user,role:null,error:"mfa_required"};
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {supabase,user,role:profile?.role??null,error:null};
}

function shopProductReady(product:any){
  if(!product||typeof product!=="object"||!String(product.name||"").trim())return false;
  const mode=["external","internal","interest"].includes(product.mode)?product.mode:(product.external_url||product.url?"external":"interest");
  if(mode==="external")return Boolean(String(product.external_url||product.url||"").trim());
  if(mode==="internal"){
    const price=product.price_cents;
    const currency=String(product.currency||"USD").toUpperCase();
    return price!==undefined&&price!==null&&Number.isFinite(Number(price))&&Number(price)>=0&&/^[A-Z]{3}$/.test(currency);
  }
  return true;
}

function validateShopLanguage(value:any){
  const data=value&&typeof value==="object"?value:{};
  const products=Array.isArray(data.featured_products)?data.featured_products:[];
  const validProducts=products.filter(shopProductReady);
  if(data.enabled&&!String(data.shop_url||"").trim()&&validProducts.length===0)return false;
  return products.every((p:any)=>!String(p?.name||"").trim()||shopProductReady(p));
}

export async function GET(){
  const{user,role,supabase,error:authError}=await requireEditor();
  if(authError) return NextResponse.json({error:authError},{status:403});
  if(!user||!["admin","editor"].includes(role??"")) return NextResponse.json({error:"forbidden"},{status:403});
  const{data,error}=await supabase.from("localized_content").select("*").order("section").order("content_key");
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data});
}

export async function PUT(request:NextRequest){
  const{user,role,supabase,error:authError}=await requireEditor();
  if(authError) return NextResponse.json({error:authError},{status:403});
  if(!user||!["admin","editor"].includes(role??"")) return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.content_key) return NextResponse.json({error:"invalid_request"},{status:400});
  if(body.content_key==="home.shop"){
    if(!validateShopLanguage(body.es)) return NextResponse.json({error:"shop_es_incomplete"},{status:400});
    if(!validateShopLanguage(body.en)) return NextResponse.json({error:"shop_en_incomplete"},{status:400});
  }

  const payload={
    es:body.es??{},
    en:body.en??{},
    status_es:["draft","review","published"].includes(body.status_es)?body.status_es:"draft",
    status_en:["draft","review","published"].includes(body.status_en)?body.status_en:"draft",
    updated_by:user.id,
    updated_at:new Date().toISOString()
  };
  const{data,error}=await supabase.from("localized_content").update(payload).eq("content_key",body.content_key).select().single();
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data});
}
