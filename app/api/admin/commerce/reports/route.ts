import {NextRequest,NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";

async function requireAdmin(){
  const supabase=await createSupabaseServerClient();
  const{data:{user}}=await supabase.auth.getUser();
  if(!user)return {ok:false,supabase};
  if(!(await hasSatisfiedMfa(supabase)))return {ok:false,supabase};
  const{data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  return {ok:profile?.role==="admin",supabase};
}

export const dynamic="force-dynamic";

function safeDate(value:string|null,end=false){
  if(!value)return null;
  const d=new Date(value+(value.length===10?(end?"T23:59:59.999Z":"T00:00:00.000Z"):""));
  return Number.isNaN(d.getTime())?null:d.toISOString();
}

export async function GET(request:NextRequest){
  const x=await requireAdmin();
  if(!x.ok)return NextResponse.json({error:"forbidden"},{status:403});
  const from=safeDate(request.nextUrl.searchParams.get("from"));
  const to=safeDate(request.nextUrl.searchParams.get("to"),true);
  let ordersQuery=x.supabase.from("shop_orders").select("*").order("created_at",{ascending:false}).limit(2000);
  if(from)ordersQuery=ordersQuery.gte("created_at",from);
  if(to)ordersQuery=ordersQuery.lte("created_at",to);
  const{data:orders,error:ordersError}=await ordersQuery;
  if(ordersError)return NextResponse.json({error:ordersError.message},{status:500});
  const orderIds=(orders||[]).map((o:any)=>o.id);
  let items:any[]=[];
  let fulfillments:any[]=[];
  if(orderIds.length){
    const[{data:itemRows,error:itemError},{data:fulfillmentRows,error:fulfillmentError}]=await Promise.all([
      x.supabase.from("shop_order_items").select("*").in("order_id",orderIds).limit(5000),
      x.supabase.from("shop_fulfillments").select("*").in("order_id",orderIds).limit(5000)
    ]);
    if(itemError)return NextResponse.json({error:itemError.message},{status:500});
    if(fulfillmentError)return NextResponse.json({error:fulfillmentError.message},{status:500});
    items=itemRows||[];
    fulfillments=fulfillmentRows||[];
  }
  const paidOrders=(orders||[]).filter((o:any)=>o.payment_status==="paid");
  const paidSum=(key:string)=>paidOrders.reduce((a:number,o:any)=>a+Number(o[key]||0),0);
  const byProvider:{[key:string]:{orders:number;revenue_cents:number}}={};
  for(const o of orders||[]){
    const key=o.payment_provider||"sin_definir";
    if(!byProvider[key])byProvider[key]={orders:0,revenue_cents:0};
    byProvider[key].orders++;
    if(o.payment_status==="paid")byProvider[key].revenue_cents+=Number(o.total_cents||0);
  }
  const byProduct:{[key:string]:{name:string;sku:string|null;quantity:number;revenue_cents:number;tax_cents:number;supplier_cost_cents:number}}={};
  for(const item of items){
    const key=item.product_id||item.sku||item.product_name;
    if(!byProduct[key])byProduct[key]={name:item.product_name,sku:item.sku||null,quantity:0,revenue_cents:0,tax_cents:0,supplier_cost_cents:0};
    byProduct[key].quantity+=Number(item.quantity||0);
    byProduct[key].revenue_cents+=Number(item.line_total_cents||0);
    byProduct[key].tax_cents+=Number(item.tax_cents||0);
    byProduct[key].supplier_cost_cents+=Number(item.supplier_cost_cents||0);
  }
  const fulfillmentStatus:{[key:string]:number}={};
  for(const f of fulfillments)fulfillmentStatus[f.shipment_status]=(fulfillmentStatus[f.shipment_status]||0)+1;
  return NextResponse.json({
    period:{from,to},
    summary:{
      orders:(orders||[]).length,
      paid_orders:paidOrders.length,
      gross_sales_cents:paidSum("total_cents"),
      subtotal_cents:paidSum("subtotal_cents"),
      tax_cents:paidSum("tax_cents"),
      shipping_charged_cents:paidSum("shipping_cents"),
      discounts_cents:paidSum("discount_cents"),
      payment_fees_cents:paidSum("payment_fee_cents"),
      supplier_cost_cents:paidSum("supplier_cost_cents"),
      shipping_cost_cents:paidSum("shipping_cost_cents"),
      margin_cents:paidSum("margin_cents"),
      labels:fulfillments.filter((f:any)=>!!f.shipping_label_url).length,
      label_cost_cents:fulfillments.reduce((a:number,f:any)=>a+Number(f.label_cost_cents||0),0)
    },
    by_provider:byProvider,
    by_product:Object.values(byProduct).sort((a:any,b:any)=>b.revenue_cents-a.revenue_cents),
    fulfillment_status:fulfillmentStatus,
    orders:(orders||[]).map((o:any)=>({
      order_number:o.order_number,created_at:o.created_at,customer_email:o.customer_email,payment_provider:o.payment_provider,
      payment_status:o.payment_status,fulfillment_status:o.fulfillment_status,subtotal_cents:o.subtotal_cents,tax_cents:o.tax_cents,
      shipping_cents:o.shipping_cents,total_cents:o.total_cents,payment_fee_cents:o.payment_fee_cents,supplier_cost_cents:o.supplier_cost_cents,
      shipping_cost_cents:o.shipping_cost_cents,margin_cents:o.margin_cents,currency:o.currency
    }))
  });
}