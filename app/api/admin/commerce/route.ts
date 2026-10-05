import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";

async function requireAdmin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase,user:null};
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:profile?.role==="admin",supabase,user};
}

export const dynamic="force-dynamic";

export async function GET(){
  const x=await requireAdmin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});

  const[
    {data:settings,error:settingsError},
    {count:productCount},
    {count:activeProductCount},
    {count:orderCount},
    {count:paidOrderCount},
    {count:pendingFulfillmentCount},
    {count:labelCount}
  ]=await Promise.all([
    x.supabase.from("commerce_settings").select("*").eq("id","default").maybeSingle(),
    x.supabase.from("shop_products").select("*",{count:"exact",head:true}),
    x.supabase.from("shop_products").select("*",{count:"exact",head:true}).eq("active",true),
    x.supabase.from("shop_orders").select("*",{count:"exact",head:true}),
    x.supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","paid"),
    x.supabase.from("shop_orders").select("*",{count:"exact",head:true}).in("fulfillment_status",["unfulfilled","processing","partially_fulfilled"]),
    x.supabase.from("shop_fulfillments").select("*",{count:"exact",head:true}).not("shipping_label_url","is",null)
  ]);

  if(settingsError)return NextResponse.json({error:settingsError.message},{status:500});
  return NextResponse.json({
    settings,
    stats:{
      products:productCount||0,
      active_products:activeProductCount||0,
      orders:orderCount||0,
      paid_orders:paidOrderCount||0,
      pending_fulfillment:pendingFulfillmentCount||0,
      shipping_labels:labelCount||0
    }
  });
}

export async function PUT(request:NextRequest){
  const x=await requireAdmin();
  if(!x.ok||!x.user)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body)return NextResponse.json({error:"invalid_request"},{status:400});

  const allowedProvider=["stripe","paypal","both","auto"];
  const allowedTax=["manual","stripe_tax","external_tax"];
  const allowedTaxStatus=["not_configured","review","configured"];
  const allowedLabel=["manual","provider","shippo","easypost"];

  const payload={
    default_payment_provider:allowedProvider.includes(body.default_payment_provider)?body.default_payment_provider:"auto",
    tax_mode:allowedTax.includes(body.tax_mode)?body.tax_mode:"manual",
    seller_legal_name:String(body.seller_legal_name||"").slice(0,200)||null,
    seller_country:String(body.seller_country||"").slice(0,100)||null,
    seller_region:String(body.seller_region||"").slice(0,100)||null,
    tax_registration_status:allowedTaxStatus.includes(body.tax_registration_status)?body.tax_registration_status:"not_configured",
    returns_policy_url:String(body.returns_policy_url||"").slice(0,1000)||null,
    shipping_label_mode:allowedLabel.includes(body.shipping_label_mode)?body.shipping_label_mode:"manual",
    updated_by:x.user.id,
    updated_at:new Date().toISOString()
  };

  const{data,error}=await x.supabase.from("commerce_settings").update(payload).eq("id","default").select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({data});
}
