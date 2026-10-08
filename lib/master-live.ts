export type MasterGameLiveMetric={
  id:string;
  slug:string;
  name:string;
  lifecycleStage:string;
  healthStatus:string;
  activeUsers:number|null;
  salesTodayCents:number|null;
  salesMonthCents:number|null;
  currency:string;
  telemetryConnected:boolean;
  commerceConnected:boolean;
};

export type MasterLiveSnapshot={
  generatedAt:string;
  timeZone:string;
  activeUsers:number;
  gamePlayersToday:number;
  salesTodayCents:number;
  salesMonthCents:number;
  salesCurrency:string;
  paidOrdersToday:number;
  paidOrdersMonth:number;
  failedPaymentsToday:number;
  leadsToday:number;
  activeGames:number;
  portfolioCapacity:number;
  games:MasterGameLiveMetric[];
};

const TIME_ZONE="America/New_York";
const PORTFOLIO_CAPACITY=9;

function zonedParts(date:Date,timeZone:string){
  const parts=new Intl.DateTimeFormat("en-US",{
    timeZone,year:"numeric",month:"2-digit",day:"2-digit",
    hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"
  }).formatToParts(date);
  const values:Record<string,string>={};
  for(const part of parts) if(part.type!=="literal") values[part.type]=part.value;
  return {
    year:Number(values.year),month:Number(values.month),day:Number(values.day),
    hour:Number(values.hour),minute:Number(values.minute),second:Number(values.second)
  };
}

function zoneOffsetMs(date:Date,timeZone:string){
  const p=zonedParts(date,timeZone);
  return Date.UTC(p.year,p.month-1,p.day,p.hour,p.minute,p.second)-Math.floor(date.getTime()/1000)*1000;
}

function zonedStartIso(date:Date,timeZone:string,monthStart=false){
  const p=zonedParts(date,timeZone);
  const wallUtc=Date.UTC(p.year,p.month-1,monthStart?1:p.day,0,0,0);
  let offset=zoneOffsetMs(new Date(wallUtc),timeZone);
  let instant=wallUtc-offset;
  const corrected=zoneOffsetMs(new Date(instant),timeZone);
  if(corrected!==offset) instant=wallUtc-corrected;
  return new Date(instant).toISOString();
}

function metadataGameKey(metadata:any){
  if(!metadata||typeof metadata!=="object") return null;
  return String(metadata.game_id||metadata.gameId||metadata.game_slug||metadata.gameSlug||"").trim()||null;
}

function currencySummary(rows:any[]){
  const currencies=[...new Set(rows.map(x=>String(x.currency||"USD").toUpperCase()))];
  return currencies.length<=1?(currencies[0]||"USD"):"MULTI";
}

export async function getMasterLiveSnapshot(supabase:any):Promise<MasterLiveSnapshot>{
  const now=new Date();
  const since5=new Date(now.getTime()-5*60*1000).toISOString();
  const todayStart=zonedStartIso(now,TIME_ZONE,false);
  const monthStart=zonedStartIso(now,TIME_ZONE,true);
  const zp=zonedParts(now,TIME_ZONE);
  const todayDate=`${zp.year}-${String(zp.month).padStart(2,"0")}-${String(zp.day).padStart(2,"0")}`;

  const[
    {data:games},
    {data:presence},
    {data:paidOrders},
    {data:gamePurchases},
    {data:engagementToday},
    {count:failedWebPaymentsToday},
    {count:failedGamePaymentsToday},
    {count:leadsToday}
  ]=await Promise.all([
    supabase.from("game_titles").select("id,slug,name,lifecycle_stage,health_status,metadata").order("created_at",{ascending:true}),
    supabase.from("analytics_events").select("session_id,metadata,created_at").eq("event_name","presence_ping").gte("created_at",since5).limit(5000),
    supabase.from("shop_orders").select("id,total_cents,currency,created_at,metadata").eq("payment_status","paid").gte("created_at",monthStart).limit(5000),
    supabase.from("game_purchase_events").select("id,game_id,gross_cents,currency,status,purchased_at").eq("status","paid").gte("purchased_at",monthStart).limit(10000),
    supabase.from("game_engagement_daily").select("game_id,active_players,platform").eq("metric_date",todayDate).limit(5000),
    supabase.from("shop_orders").select("*",{count:"exact",head:true}).eq("payment_status","failed").gte("created_at",todayStart),
    supabase.from("game_purchase_events").select("*",{count:"exact",head:true}).in("status",["failed","chargeback"]).gte("purchased_at",todayStart),
    supabase.from("leads").select("*",{count:"exact",head:true}).gte("created_at",todayStart)
  ]);

  const gameRows=(games||[]) as any[];
  const presenceRows=(presence||[]) as any[];
  const paidRows=(paidOrders||[]) as any[];
  const gamePurchaseRows=(gamePurchases||[]) as any[];
  const engagementRows=(engagementToday||[]) as any[];

  const activeSessionIds=new Set(
    presenceRows.map(x=>String(x.session_id||"").trim()).filter(Boolean)
  );
  const todayPaid=paidRows.filter(x=>String(x.created_at||"")>=todayStart);
  const todayGamePurchases=gamePurchaseRows.filter(x=>String(x.purchased_at||"")>=todayStart);
  const salesTodayCents=
    todayPaid.reduce((sum,x)=>sum+Number(x.total_cents||0),0)+
    todayGamePurchases.reduce((sum,x)=>sum+Number(x.gross_cents||0),0);
  const salesMonthCents=
    paidRows.reduce((sum,x)=>sum+Number(x.total_cents||0),0)+
    gamePurchaseRows.reduce((sum,x)=>sum+Number(x.gross_cents||0),0);
  const salesCurrency=currencySummary([
    ...paidRows,
    ...gamePurchaseRows.map(x=>({currency:x.currency}))
  ]);
  const gamePlayersToday=engagementRows.reduce((sum,x)=>sum+Number(x.active_players||0),0);

  const gameLookup=new Map<string,any>();
  for(const game of gameRows){
    gameLookup.set(String(game.id),game);
    gameLookup.set(String(game.slug),game);
  }

  const sessionsByGame=new Map<string,Set<string>>();
  for(const event of presenceRows){
    const key=metadataGameKey(event.metadata);
    const session=String(event.session_id||"").trim();
    const game=key?gameLookup.get(key):null;
    if(!game||!session) continue;
    const set=sessionsByGame.get(game.id)||new Set<string>();
    set.add(session);
    sessionsByGame.set(game.id,set);
  }

  const ordersByGame=new Map<string,any[]>();
  for(const order of paidRows){
    const key=metadataGameKey(order.metadata);
    const game=key?gameLookup.get(key):null;
    if(!game) continue;
    const rows=ordersByGame.get(game.id)||[];
    rows.push(order);
    ordersByGame.set(game.id,rows);
  }

  const purchasesByGame=new Map<string,any[]>();
  for(const purchase of gamePurchaseRows){
    const rows=purchasesByGame.get(String(purchase.game_id))||[];
    rows.push(purchase);
    purchasesByGame.set(String(purchase.game_id),rows);
  }

  const engagementByGame=new Map<string,number>();
  for(const metric of engagementRows){
    engagementByGame.set(String(metric.game_id),(engagementByGame.get(String(metric.game_id))||0)+Number(metric.active_players||0));
  }

  const gameMetrics:MasterGameLiveMetric[]=gameRows.slice(0,PORTFOLIO_CAPACITY).map(game=>{
    const gamePresence=sessionsByGame.get(game.id)||new Set<string>();
    const gameOrders=ordersByGame.get(game.id)||[];
    const gamePurchases=purchasesByGame.get(game.id)||[];
    const dailyPlayers=engagementByGame.get(game.id)||0;
    const telemetryConnected=Boolean(game?.metadata?.telemetry_connected)||gamePresence.size>0||dailyPlayers>0;
    const commerceConnected=Boolean(game?.metadata?.commerce_connected)||gameOrders.length>0||gamePurchases.length>0;
    const gameTodayOrders=gameOrders.filter(x=>String(x.created_at||"")>=todayStart);
    const gameTodayPurchases=gamePurchases.filter(x=>String(x.purchased_at||"")>=todayStart);
    const combinedCurrencies=[
      ...gameOrders.map(x=>({currency:x.currency})),
      ...gamePurchases.map(x=>({currency:x.currency}))
    ];
    return{
      id:String(game.id),
      slug:String(game.slug),
      name:String(game.name),
      lifecycleStage:String(game.lifecycle_stage||"concept"),
      healthStatus:String(game.health_status||"green"),
      activeUsers:telemetryConnected?Math.max(gamePresence.size,dailyPlayers):null,
      salesTodayCents:commerceConnected?(
        gameTodayOrders.reduce((sum,x)=>sum+Number(x.total_cents||0),0)+
        gameTodayPurchases.reduce((sum,x)=>sum+Number(x.gross_cents||0),0)
      ):null,
      salesMonthCents:commerceConnected?(
        gameOrders.reduce((sum,x)=>sum+Number(x.total_cents||0),0)+
        gamePurchases.reduce((sum,x)=>sum+Number(x.gross_cents||0),0)
      ):null,
      currency:currencySummary(combinedCurrencies),
      telemetryConnected,
      commerceConnected
    };
  });

  return{
    generatedAt:now.toISOString(),
    timeZone:TIME_ZONE,
    activeUsers:activeSessionIds.size,
    gamePlayersToday,
    salesTodayCents,
    salesMonthCents,
    salesCurrency,
    paidOrdersToday:todayPaid.length+todayGamePurchases.length,
    paidOrdersMonth:paidRows.length+gamePurchaseRows.length,
    failedPaymentsToday:(failedWebPaymentsToday||0)+(failedGamePaymentsToday||0),
    leadsToday:leadsToday||0,
    activeGames:gameRows.length,
    portfolioCapacity:PORTFOLIO_CAPACITY,
    games:gameMetrics
  };
}
