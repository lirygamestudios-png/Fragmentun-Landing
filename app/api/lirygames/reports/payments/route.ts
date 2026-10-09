import {NextResponse} from "next/server";
import {createSupabaseServerClient} from "../../../../../lib/supabase/server";
import {hasSatisfiedMfa} from "../../../../../lib/supabase/mfa";

export const dynamic="force-dynamic";
function safeCell(value:unknown):string{
 const raw=String(value??"");
 const escaped=/^[=+@-]/.test(raw.trimStart())?"'"+raw:raw;
 return '"'+escaped.replaceAll('"','""').replace(/[\r\n]+/g," ")+'"';
}
export async function GET(request:Request){
 const supabase=await createSupabaseServerClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:"unauthorized"},{status:401});
 if(!(await hasSatisfiedMfa(supabase)))return NextResponse.json({error:"mfa_required"},{status:403});
 const {data:profile}=await supabase.from("admin_profiles").select("role").eq("user_id",user.id).maybeSingle();
 if(!profile||!["admin","editor"].includes(profile.role))return NextResponse.json({error:"forbidden"},{status:403});
 const u=new URL(request.url);
 const period=u.searchParams.get("period")||"30d";
 const days:Record<string,number>={"7d":7,"30d":30,"90d":90};
 if(period!=="all"&&!Object.hasOwn(days,period))return NextResponse.json({error:"invalid_period"},{status:400});
 const pageRaw=u.searchParams.get("page")||"1";
 const page=Number(pageRaw);
 if(!Number.isSafeInteger(page)||page<1||page>10000)return NextResponse.json({error:"invalid_page"},{status:400});
 const pageSize=200;
 const game=(u.searchParams.get("game")||"all").slice(0,120);
 const provider=(u.searchParams.get("provider")||"all").slice(0,60);
 let query=supabase.from("game_purchase_events")
 .select("id,game_id,item_id,provider,platform,currency,gross_cents,net_cents,status,purchased_at")
 .in("status",["paid","refunded","partially_refunded"])
 .order("purchased_at",{ascending:false}).order("id",{ascending:false}).range((page-1)*pageSize,page*pageSize);
 if(period!=="all")query=query.gte("purchased_at",new Date(Date.now()-days[period]*86400000).toISOString());
 if(game!=="all")query=query.eq("game_id",game);
 if(provider!=="all")query=query.eq("provider",provider);
 const {data,error}=await query;
 if(error)return NextResponse.json({error:"report_unavailable"},{status:503});
 const headers=["Fecha","Videojuego","Articulo","Procesador","Plataforma","Estado","Moneda","Bruto_cents","Neto_cents","Referencia"];
 const lines=[headers.map(safeCell).join(","),...(data||[]).slice(0,pageSize).map(x=>
 [x.purchased_at,x.game_id,x.item_id,x.provider,x.platform,x.status,x.currency,x.gross_cents,x.net_cents,x.id].map(safeCell).join(","))];
 const csv="\uFEFF"+lines.join("\r\n");
 return new Response(csv,{headers:{"Content-Type":"text/csv; charset=utf-8","Content-Disposition":"attachment; filename=\"lirygames-pagos-pagina-"+page+".csv\"","Cache-Control":"no-store","X-Report-Page":String(page),"X-Report-Has-More":String((data||[]).length>pageSize)}});
}
