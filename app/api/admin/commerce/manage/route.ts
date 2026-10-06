import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";

async function requireAdmin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase,user:null};
  if(!(await hasSatisfiedMfa(supabase)))return {ok:false,supabase,user:null};
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:profile?.role==="admin",supabase,user};
}
export const dynamic="force-dynamic";

export async function GET(){
  const x=await requireAdmin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const[
    {data:products,error:productsError},
    {data:orders,error:ordersError},
    {data:fulfillments,error:fulfillmentsError}
  ]=await Promise.all([
    x.supabase.from("shop_products").select("*").order("sort_order").order("created_at",{ascending:false}),
    x.supabase.from("shop_orders").select("*").order("created_at",{ascending:false}).limit(100),
    x.supabase.from("shop_fulfillments").select("*").order("created_at",{ascending:false}).limit(100)
  ]);
  const error=productsError||ordersError||fulfillmentsError;
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({products:products||[],orders:orders||[],fulfillments:fulfillments||[]});
}

export async function POST(request:NextRequest){
  const x=await requireAdmin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.entity)return NextResponse.json({error:"invalid_request"},{status:400});

  if(body.entity==="product"){
    if(!String(body.name_es||"").trim())return NextResponse.json({error:"name_required"},{status:400});
    const payload={
      sku:String(body.sku||"").trim()||null,
      slug:String(body.slug||"").trim()||null,
      name_es:String(body.name_es||"").trim(),
      name_en:String(body.name_en||"").trim()||null,
      description_es:String(body.description_es||"").trim()||null,
      description_en:String(body.description_en||"").trim()||null,
      image_url:String(body.image_url||"").trim()||null,
      price_label_es:String(body.price_label_es||"").trim()||null,
      price_label_en:String(body.price_label_en||"").trim()||null,
      mode:["external","internal","interest"].includes(body.mode)?body.mode:"interest",
      payment_provider:["stripe","paypal","both","auto"].includes(body.payment_provider)?body.payment_provider:"auto",
      external_url:String(body.external_url||"").trim()||null,
      supplier:String(body.supplier||"").trim()||null,
      supplier_product_id:String(body.supplier_product_id||"").trim()||null,
      price_cents:Number.isFinite(Number(body.price_cents))?Math.max(0,Number(body.price_cents)):null,
      currency:String(body.currency||"USD").trim().toUpperCase().slice(0,3)||"USD",
      taxable:body.taxable!==false,
      tax_code:String(body.tax_code||"").trim()||null,
      active:body.active===true,
      featured:body.featured===true,
      stock_status:["unknown","in_stock","out_of_stock","preorder","unlimited"].includes(body.stock_status)?body.stock_status:"unknown",
      sort_order:Number.isFinite(Number(body.sort_order))?Number(body.sort_order):0,
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_products").insert(payload).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="fulfillment"){
    if(!body.order_id)return NextResponse.json({error:"order_required"},{status:400});
    const payload={
      order_id:body.order_id,
      supplier:String(body.supplier||"").trim()||null,
      carrier:String(body.carrier||"").trim()||null,
      service:String(body.service||"").trim()||null,
      shipment_status:"pending",
      label_provider:String(body.label_provider||"").trim()||null,
      created_at:new Date().toISOString(),
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_fulfillments").insert(payload).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  return NextResponse.json({error:"unsupported_entity"},{status:400});
}

export async function PUT(request:NextRequest){
  const x=await requireAdmin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const body=await request.json().catch(()=>null);
  if(!body?.entity||!body?.id)return NextResponse.json({error:"invalid_request"},{status:400});

  if(body.entity==="product"){
    const payload={
      name_es:String(body.name_es||"").trim(),
      name_en:String(body.name_en||"").trim()||null,
      sku:String(body.sku||"").trim()||null,
      mode:["external","internal","interest"].includes(body.mode)?body.mode:"interest",
      payment_provider:["stripe","paypal","both","auto"].includes(body.payment_provider)?body.payment_provider:"auto",
      external_url:String(body.external_url||"").trim()||null,
      price_cents:Number.isFinite(Number(body.price_cents))?Math.max(0,Number(body.price_cents)):null,
      currency:String(body.currency||"USD").trim().toUpperCase().slice(0,3)||"USD",
      active:body.active===true,
      featured:body.featured===true,
      stock_status:["unknown","in_stock","out_of_stock","preorder","unlimited"].includes(body.stock_status)?body.stock_status:"unknown",
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_products").update(payload).eq("id",body.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="order"){
    const payload={
      payment_status:["pending","authorized","paid","failed","refunded","partially_refunded","canceled"].includes(body.payment_status)?body.payment_status:"pending",
      fulfillment_status:["unfulfilled","processing","partially_fulfilled","fulfilled","delivered","returned","canceled"].includes(body.fulfillment_status)?body.fulfillment_status:"unfulfilled",
      refund_status:["none","requested","partial","full"].includes(body.refund_status)?body.refund_status:"none",
      notes:String(body.notes||"").slice(0,5000)||null,
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_orders").update(payload).eq("id",body.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="fulfillment"){
    const payload={
      supplier:String(body.supplier||"").trim()||null,
      carrier:String(body.carrier||"").trim()||null,
      service:String(body.service||"").trim()||null,
      tracking_number:String(body.tracking_number||"").trim()||null,
      tracking_url:String(body.tracking_url||"").trim()||null,
      shipment_status:["pending","label_created","shipped","in_transit","delivered","exception","returned","canceled"].includes(body.shipment_status)?body.shipment_status:"pending",
      package_weight_grams:Number.isFinite(Number(body.package_weight_grams))?Math.max(0,Math.round(Number(body.package_weight_grams))):null,
      package_dimensions:body.package_dimensions&&typeof body.package_dimensions==="object"?body.package_dimensions:{},
      label_provider:String(body.label_provider||"").trim()||null,
      shipping_label_url:String(body.shipping_label_url||"").trim()||null,
      shipping_label_format:String(body.shipping_label_format||"").trim()||null,
      label_cost_cents:Number.isFinite(Number(body.label_cost_cents))?Math.max(0,Number(body.label_cost_cents)):0,
      label_created_at:body.shipping_label_url?(body.label_created_at||new Date().toISOString()):null,
      shipped_at:body.shipment_status==="shipped"?(body.shipped_at||new Date().toISOString()):(body.shipped_at||null),
      delivered_at:body.shipment_status==="delivered"?(body.delivered_at||new Date().toISOString()):(body.delivered_at||null),
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_fulfillments").update(payload).eq("id",body.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  return NextResponse.json({error:"unsupported_entity"},{status:400});
}
