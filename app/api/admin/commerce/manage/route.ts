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

const PRODUCT_MODES=new Set(["external","internal","interest"]);
const PAYMENT_PROVIDERS=new Set(["stripe","paypal","both","auto"]);
const STOCK_STATUSES=new Set(["unknown","in_stock","out_of_stock","preorder","unlimited"]);
const PAYMENT_STATUSES=new Set(["pending","authorized","paid","failed","refunded","partially_refunded","canceled"]);
const FULFILLMENT_STATUSES=new Set(["unfulfilled","processing","partially_fulfilled","fulfilled","delivered","returned","canceled"]);
const REFUND_STATUSES=new Set(["none","requested","partial","full"]);
const SHIPMENT_STATUSES=new Set(["pending","label_created","shipped","in_transit","delivered","exception","returned","canceled"]);

function text(value:any,max=1000){return String(value??"").trim().slice(0,max)}
function cents(value:any){
  if(value===null||value===undefined||value==="")return null;
  const n=Number(value);
  return Number.isFinite(n)?Math.max(0,Math.round(n)):null;
}
function validCurrency(value:any){
  const currency=text(value||"USD",3).toUpperCase();
  return /^[A-Z]{3}$/.test(currency)?currency:"USD";
}
async function getCommerceSettings(supabase:any){
  const{data}=await supabase.from("commerce_settings")
    .select("stripe_enabled,paypal_enabled,default_payment_provider")
    .eq("id","default").maybeSingle();
  return data||{stripe_enabled:false,paypal_enabled:false,default_payment_provider:"auto"};
}
function providerReady(provider:string,settings:any){
  if(provider==="stripe")return settings.stripe_enabled===true;
  if(provider==="paypal")return settings.paypal_enabled===true;
  if(provider==="both")return settings.stripe_enabled===true&&settings.paypal_enabled===true;
  return settings.stripe_enabled===true||settings.paypal_enabled===true;
}


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
    const nameEs=text(body.name_es,240);
    const mode=PRODUCT_MODES.has(body.mode)?body.mode:"interest";
    const paymentProvider=PAYMENT_PROVIDERS.has(body.payment_provider)?body.payment_provider:"auto";
    const externalUrl=text(body.external_url,1000)||null;
    const priceCents=cents(body.price_cents);
    if(!nameEs)return NextResponse.json({error:"name_required"},{status:400});
    if(mode==="external"&&!externalUrl)return NextResponse.json({error:"external_url_required"},{status:400});
    if(mode==="internal"&&body.active===true){
      const settings=await getCommerceSettings(x.supabase);
      if(priceCents===null)return NextResponse.json({error:"price_required_for_internal_sale"},{status:400});
      if(!providerReady(paymentProvider,settings))return NextResponse.json({error:"payment_provider_not_enabled"},{status:400});
    }
    const payload={
      sku:String(body.sku||"").trim()||null,
      slug:String(body.slug||"").trim()||null,
      name_es:nameEs,
      name_en:String(body.name_en||"").trim()||null,
      description_es:String(body.description_es||"").trim()||null,
      description_en:String(body.description_en||"").trim()||null,
      image_url:String(body.image_url||"").trim()||null,
      price_label_es:String(body.price_label_es||"").trim()||null,
      price_label_en:String(body.price_label_en||"").trim()||null,
      mode,
      payment_provider:paymentProvider,
      external_url:externalUrl,
      supplier:String(body.supplier||"").trim()||null,
      supplier_product_id:String(body.supplier_product_id||"").trim()||null,
      price_cents:priceCents,
      currency:validCurrency(body.currency),
      taxable:body.taxable!==false,
      tax_code:String(body.tax_code||"").trim()||null,
      active:body.active===true,
      featured:body.featured===true,
      stock_status:STOCK_STATUSES.has(body.stock_status)?body.stock_status:"unknown",
      sort_order:Number.isFinite(Number(body.sort_order))?Number(body.sort_order):0,
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_products").insert(payload).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="fulfillment"){
    if(!body.order_id)return NextResponse.json({error:"order_required"},{status:400});
    const{data:order,error:orderError}=await x.supabase.from("shop_orders")
      .select("id,payment_status,fulfillment_status,shipping_address")
      .eq("id",body.order_id).maybeSingle();
    if(orderError)return NextResponse.json({error:orderError.message},{status:500});
    if(!order)return NextResponse.json({error:"order_not_found"},{status:404});
    if(order.payment_status!=="paid")return NextResponse.json({error:"order_must_be_paid_before_fulfillment"},{status:409});
    if(["delivered","returned","canceled"].includes(order.fulfillment_status)){
      return NextResponse.json({error:"order_not_eligible_for_fulfillment"},{status:409});
    }
    const address=order.shipping_address&&typeof order.shipping_address==="object"?order.shipping_address:{};
    const requiredAddress=["line1","city","postal_code","country"];
    const missingAddress=requiredAddress.some(key=>!String((address as any)[key]||"").trim());
    if(missingAddress)return NextResponse.json({error:"shipping_address_incomplete"},{status:409});

    const payload={
      order_id:body.order_id,
      supplier:text(body.supplier,200)||null,
      carrier:text(body.carrier,200)||null,
      service:text(body.service,200)||null,
      shipment_status:"pending",
      label_provider:text(body.label_provider,120)||null,
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
    const nameEs=text(body.name_es,240);
    const mode=PRODUCT_MODES.has(body.mode)?body.mode:"interest";
    const paymentProvider=PAYMENT_PROVIDERS.has(body.payment_provider)?body.payment_provider:"auto";
    const externalUrl=text(body.external_url,1000)||null;
    const priceCents=cents(body.price_cents);
    if(!nameEs)return NextResponse.json({error:"name_required"},{status:400});
    if(mode==="external"&&!externalUrl)return NextResponse.json({error:"external_url_required"},{status:400});
    if(mode==="internal"&&body.active===true){
      const settings=await getCommerceSettings(x.supabase);
      if(priceCents===null)return NextResponse.json({error:"price_required_for_internal_sale"},{status:400});
      if(!providerReady(paymentProvider,settings))return NextResponse.json({error:"payment_provider_not_enabled"},{status:400});
    }
    const payload={
      name_es:nameEs,
      name_en:text(body.name_en,240)||null,
      sku:text(body.sku,120)||null,
      mode,
      payment_provider:paymentProvider,
      external_url:externalUrl,
      price_cents:priceCents,
      currency:validCurrency(body.currency),
      active:body.active===true,
      featured:body.featured===true,
      stock_status:STOCK_STATUSES.has(body.stock_status)?body.stock_status:"unknown",
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_products").update(payload).eq("id",body.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="order"){
    const{data:existing,error:existingError}=await x.supabase.from("shop_orders")
      .select("id,payment_provider,payment_status,fulfillment_status,refund_status")
      .eq("id",body.id).maybeSingle();
    if(existingError)return NextResponse.json({error:existingError.message},{status:500});
    if(!existing)return NextResponse.json({error:"order_not_found"},{status:404});

    const requestedPayment=PAYMENT_STATUSES.has(body.payment_status)?body.payment_status:existing.payment_status;
    const requestedFulfillment=FULFILLMENT_STATUSES.has(body.fulfillment_status)?body.fulfillment_status:existing.fulfillment_status;
    const requestedRefund=REFUND_STATUSES.has(body.refund_status)?body.refund_status:existing.refund_status;
    const provider=String(existing.payment_provider||"manual");

    if(["stripe","paypal"].includes(provider)&&requestedPayment!==existing.payment_status){
      return NextResponse.json({error:"payment_status_managed_by_provider"},{status:409});
    }
    if(["stripe","paypal"].includes(provider)&&requestedRefund!==existing.refund_status){
      return NextResponse.json({error:"refund_status_managed_by_provider"},{status:409});
    }
    if(["processing","partially_fulfilled","fulfilled","delivered"].includes(requestedFulfillment)&&existing.payment_status!=="paid"){
      return NextResponse.json({error:"order_must_be_paid_before_fulfillment"},{status:409});
    }

    const payload={
      payment_status:requestedPayment,
      fulfillment_status:requestedFulfillment,
      refund_status:requestedRefund,
      notes:text(body.notes,5000)||null,
      updated_at:new Date().toISOString()
    };
    const{data,error}=await x.supabase.from("shop_orders").update(payload).eq("id",body.id).select().single();
    if(error)return NextResponse.json({error:error.message},{status:500});
    return NextResponse.json({data});
  }

  if(body.entity==="fulfillment"){
    const{data:existingFulfillment,error:fulfillmentError}=await x.supabase.from("shop_fulfillments")
      .select("id,order_id,shipment_status").eq("id",body.id).maybeSingle();
    if(fulfillmentError)return NextResponse.json({error:fulfillmentError.message},{status:500});
    if(!existingFulfillment)return NextResponse.json({error:"fulfillment_not_found"},{status:404});
    const{data:order,error:orderError}=await x.supabase.from("shop_orders")
      .select("payment_status,fulfillment_status").eq("id",existingFulfillment.order_id).maybeSingle();
    if(orderError)return NextResponse.json({error:orderError.message},{status:500});
    if(!order)return NextResponse.json({error:"order_not_found"},{status:404});

    const shipmentStatus=SHIPMENT_STATUSES.has(body.shipment_status)?body.shipment_status:existingFulfillment.shipment_status;
    if(["shipped","in_transit","delivered"].includes(shipmentStatus)&&order.payment_status!=="paid"){
      return NextResponse.json({error:"order_must_be_paid_before_shipping"},{status:409});
    }
    if(order.fulfillment_status==="canceled"&&shipmentStatus!=="canceled"){
      return NextResponse.json({error:"canceled_order_cannot_ship"},{status:409});
    }

    const payload={
      supplier:text(body.supplier,200)||null,
      carrier:text(body.carrier,200)||null,
      service:text(body.service,200)||null,
      tracking_number:text(body.tracking_number,240)||null,
      tracking_url:text(body.tracking_url,1000)||null,
      shipment_status:shipmentStatus,
      package_weight_grams:body.package_weight_grams===null||body.package_weight_grams===""?null:(Number.isFinite(Number(body.package_weight_grams))?Math.max(0,Math.round(Number(body.package_weight_grams))):null),
      package_dimensions:body.package_dimensions&&typeof body.package_dimensions==="object"?body.package_dimensions:{},
      label_provider:String(body.label_provider||"").trim()||null,
      shipping_label_url:String(body.shipping_label_url||"").trim()||null,
      shipping_label_format:String(body.shipping_label_format||"").trim()||null,
      label_cost_cents:Number.isFinite(Number(body.label_cost_cents))?Math.max(0,Math.round(Number(body.label_cost_cents))):0,
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
