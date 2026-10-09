import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../lib/supabase/mfa";
import {createHash} from "node:crypto";
import {REAL_PAYMENTS_ENABLED,paymentProviders} from "../../../../lib/payments/provider-contract";

export const dynamic="force-dynamic";
const catalog={"skin-demo":{title:"Skin de prueba",cents:499},"effect-demo":{title:"Efecto visual de prueba",cents:299}} as const;
type CatalogId=keyof typeof catalog;
const outcomes=["paid","failed","refunded"] as const;

export async function POST(request:Request){
  if(REAL_PAYMENTS_ENABLED)return NextResponse.json({error:"simulation_disabled"},{status:503});
  const supabase=await createSupabaseServerClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user)return NextResponse.json({error:"authentication_required"},{status:401});
  if(!(await hasSatisfiedMfa(supabase)))return NextResponse.json({error:"mfa_required"},{status:403});
  const {data:profile,error}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
  if(error||!profile||!["admin","editor"].includes(profile.role))
    return NextResponse.json({error:"forbidden"},{status:403});
  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return NextResponse.json({error:"invalid_json"},{status:400});}
  const itemId=String(body.itemId||"");
  const provider=String(body.provider||"");
  const outcome=String(body.outcome||"");
  const key=String(body.idempotencyKey||"");
  if(!Object.hasOwn(catalog,itemId)||!paymentProviders.some(p=>p.id===provider)||
    !outcomes.includes(outcome as typeof outcomes[number])||!/^[a-zA-Z0-9_-]{16,100}$/.test(key))
    return NextResponse.json({error:"invalid_simulation_request"},{status:400});
  const item=catalog[itemId as CatalogId];
  // Stable receipt for a retry of the SAME request; no persistence and no
  // durable uniqueness protection. Real payments require database constraints.
  const receipt=createHash("sha256").update(JSON.stringify([user.id,key,itemId,provider,outcome])).digest("hex").slice(0,20);
  return NextResponse.json({
    simulation:true,persisted:false,realCharge:false,entitlementGranted:false,
    reference:"SIM-"+receipt.toUpperCase(),itemId,itemName:item.title,
    amountCents:item.cents,currency:"USD",provider,outcome,
    message:"Resultado simulado por el servidor. No se creó un pedido ni se entregó un artículo."
  },{headers:{"Cache-Control":"no-store"}});
}
