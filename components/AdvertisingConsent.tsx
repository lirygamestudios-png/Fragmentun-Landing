"use client";
import { useEffect,useState } from "react";
import { usePathname } from "next/navigation";

const STORAGE_KEY="fragmentun_ad_consent_v1";
const MAX_AGE=180*24*60*60*1000;

type Choice="accepted"|"rejected"|null;

function readChoice():Choice{
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(!raw)return null;
    const parsed=JSON.parse(raw);
    if(!parsed?.value||!parsed?.at||Date.now()-Number(parsed.at)>MAX_AGE){
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed.value==="accepted"?"accepted":"rejected";
  }catch{return null;}
}

function writeChoice(value:Exclude<Choice,null>){
  try{localStorage.setItem(STORAGE_KEY,JSON.stringify({value,at:Date.now()}));}catch{}
}

function loadMeta(pixelId:string){
  const w=window as any;
  if(w.fbq){
    w.fbq("init",pixelId);
    w.fbq("track","PageView");
    return;
  }
  const fbq:any=function(...args:any[]){fbq.callMethod?fbq.callMethod(...args):fbq.queue.push(args)};
  fbq.push=fbq; fbq.loaded=true; fbq.version="2.0"; fbq.queue=[];
  w.fbq=fbq; w._fbq=fbq;
  const s=document.createElement("script");
  s.async=true;
  s.src="https://connect.facebook.net/en_US/fbevents.js";
  s.onload=()=>{w.fbq("init",pixelId);w.fbq("track","PageView")};
  document.head.appendChild(s);
}

function loadGoogle(tagId:string){
  const w=window as any;
  w.dataLayer=w.dataLayer||[];
  w.gtag=w.gtag||function(){w.dataLayer.push(arguments)};
  w.gtag("js",new Date());
  w.gtag("config",tagId);
  if(!document.querySelector('script[data-fragmentun-google-ads]')){
    const s=document.createElement("script");
    s.async=true;
    s.src=`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tagId)}`;
    s.dataset.fragmentunGoogleAds="1";
    document.head.appendChild(s);
  }
}

function loadTikTok(pixelId:string){
  const w=window as any;
  if(w.ttq?.load){w.ttq.load(pixelId);w.ttq.page();return;}
  const t="ttq";
  const ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(obj:any,method:string){obj[method]=function(){obj.push([method].concat(Array.prototype.slice.call(arguments,0)))}}; 
  for(let i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(id:string){
    const instance=(ttq._i?.[id])||[];
    for(let i=0;i<ttq.methods.length;i++)ttq.setAndDefer(instance,ttq.methods[i]);
    return instance;
  };
  ttq.load=function(id:string,options?:any){
    const src="https://analytics.tiktok.com/i18n/pixel/events.js";
    ttq._i=ttq._i||{}; ttq._i[id]=[]; ttq._i[id]._u=src;
    ttq._t=ttq._t||{}; ttq._t[id]=+new Date();
    ttq._o=ttq._o||{}; ttq._o[id]=options||{};
    const s=document.createElement("script");
    s.type="text/javascript"; s.async=true; s.src=src+"?sdkid="+encodeURIComponent(id)+"&lib="+t;
    document.head.appendChild(s);
  };
  ttq.load(pixelId); ttq.page();
}

async function loadConfiguredAds(){
  try{
    const r=await fetch("/api/ad-settings",{cache:"no-store"});
    const j=await r.json();
    for(const item of j.items||[]){
      const id=String(item.public_id||"").trim();
      if(!id)continue;
      if(item.provider==="meta")loadMeta(id);
      if(item.provider==="google")loadGoogle(id);
      if(item.provider==="tiktok")loadTikTok(id);
    }
  }catch{}
}

export function AdvertisingConsent(){
  const pathname=usePathname();
  const[choice,setChoice]=useState<Choice>(null);
  const[ready,setReady]=useState(false);
  const isAdmin=pathname?.startsWith("/admin");
  const en=pathname?.startsWith("/en");

  useEffect(()=>{
    if(isAdmin){setReady(true);return;}
    const saved=readChoice();
    setChoice(saved);
    setReady(true);
    if(saved==="accepted")loadConfiguredAds();
  },[isAdmin]);

  if(!ready||isAdmin||choice)return null;

  const choose=(value:Exclude<Choice,null>)=>{
    writeChoice(value);
    setChoice(value);
    if(value==="accepted")loadConfiguredAds();
  };

  return <aside style={{
    position:"fixed",left:"18px",right:"18px",bottom:"18px",zIndex:9999,
    maxWidth:"920px",margin:"0 auto",padding:"18px 20px",borderRadius:"20px",
    border:"1px solid rgba(201,168,76,.38)",background:"rgba(7,17,31,.97)",
    boxShadow:"0 24px 70px rgba(0,0,0,.48)",backdropFilter:"blur(16px)",
    color:"#fff"
  }} aria-label={en?"Advertising preferences":"Preferencias de publicidad"}>
    <div style={{display:"flex",gap:"18px",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap"}}>
      <div style={{flex:"1 1 420px"}}>
        <div style={{color:"#C9A84C",fontSize:".72rem",fontWeight:900,letterSpacing:".12em",textTransform:"uppercase"}}>
          {en?"Privacy preferences":"Preferencias de privacidad"}
        </div>
        <strong style={{display:"block",marginTop:"4px",fontSize:"1rem"}}>
          {en?"Help us measure which campaigns work":"Ayúdanos a medir qué campañas funcionan"}
        </strong>
        <p style={{margin:"6px 0 0",opacity:.78,lineHeight:1.5,fontSize:".86rem"}}>
          {en
            ?"With your permission, we can use advertising measurement from Meta, Google and TikTok. Essential site functions work either way."
            :"Con tu permiso, podemos usar medición publicitaria de Meta, Google y TikTok. Las funciones esenciales del sitio funcionan de cualquier manera."}
          {" "}<a href={en?"/en/privacy":"/es/privacidad"} style={{color:"#4A90D9"}}>{en?"Privacy":"Privacidad"}</a>
        </p>
      </div>
      <div style={{display:"flex",gap:"9px",flexWrap:"wrap"}}>
        <button type="button" className="btn btnGhost" onClick={()=>choose("rejected")}>
          {en?"Essential only":"Solo necesario"}
        </button>
        <button type="button" className="btn btnPrimary" onClick={()=>choose("accepted")}>
          {en?"Accept advertising":"Aceptar publicidad"}
        </button>
      </div>
    </div>
  </aside>;
}
