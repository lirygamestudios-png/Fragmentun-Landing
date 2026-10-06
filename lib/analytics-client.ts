export const ANALYTICS_SESSION_KEY="fragmentun_session_id_v1";
const ATTR_SOURCE="fragmentun_source_v2";
const ATTR_MEDIUM="fragmentun_medium_v2";
const ATTR_CAMPAIGN="fragmentun_campaign_v2";
const ATTR_CONTENT="fragmentun_content_v2";
const ATTR_TERM="fragmentun_term_v1";
const ATTR_GCLID="fragmentun_gclid_v1";
const ATTR_GBRAID="fragmentun_gbraid_v1";
const ATTR_WBRAID="fragmentun_wbraid_v1";
const ATTR_FBCLID="fragmentun_fbclid_v1";

export function analyticsSessionId(){
  if(typeof window==="undefined")return "";
  let id=sessionStorage.getItem(ANALYTICS_SESSION_KEY);
  if(!id){
    id=(globalThis.crypto?.randomUUID?.()||`s-${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0,120);
    sessionStorage.setItem(ANALYTICS_SESSION_KEY,id);
  }
  return id;
}

function classifyReferrer(){
  if(typeof window==="undefined")return {source:"",medium:""};
  const raw=document.referrer||"";
  if(!raw)return {source:"direct",medium:"none"};
  try{
    const ref=new URL(raw);
    if(ref.hostname===window.location.hostname)return {source:"",medium:""};
    const host=ref.hostname.toLowerCase().replace(/^www\./,"");

    if(/(^|\.)google\./.test(host))return {source:"google",medium:"organic"};
    if(/(^|\.)bing\.com$/.test(host))return {source:"bing",medium:"organic"};
    if(/(^|\.)search\.yahoo\.com$/.test(host)||/(^|\.)yahoo\.com$/.test(host))return {source:"yahoo",medium:"organic"};
    if(/(^|\.)duckduckgo\.com$/.test(host))return {source:"duckduckgo",medium:"organic"};

    if(/(^|\.)facebook\.com$|(^|\.)fb\.com$|(^|\.)m\.facebook\.com$/.test(host))return {source:"facebook",medium:"social"};
    if(/(^|\.)instagram\.com$/.test(host))return {source:"instagram",medium:"social"};
    if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host))return {source:"youtube",medium:"social"};
    if(/(^|\.)tiktok\.com$/.test(host))return {source:"tiktok",medium:"social"};
    if(/(^|\.)x\.com$|(^|\.)twitter\.com$/.test(host))return {source:"x",medium:"social"};
    if(/(^|\.)linkedin\.com$/.test(host))return {source:"linkedin",medium:"social"};
    if(/(^|\.)reddit\.com$/.test(host))return {source:"reddit",medium:"social"};

    return {source:host,medium:"referral"};
  }catch{
    return {source:"referral",medium:"referral"};
  }
}

export function analyticsAttribution(){
  if(typeof window==="undefined")return {source:"",medium:"",campaign:"",content:"",session_id:""};

  const url=new URL(window.location.href);
  const utmSource=url.searchParams.get("utm_source")||"";
  const utmMedium=url.searchParams.get("utm_medium")||"";
  const utmCampaign=url.searchParams.get("utm_campaign")||"";
  const utmContent=url.searchParams.get("utm_content")||"";
  const utmTerm=url.searchParams.get("utm_term")||"";
  const gclid=url.searchParams.get("gclid")||"";
  const gbraid=url.searchParams.get("gbraid")||"";
  const wbraid=url.searchParams.get("wbraid")||"";
  const fbclid=url.searchParams.get("fbclid")||"";

  if(utmSource)sessionStorage.setItem(ATTR_SOURCE,utmSource);
  if(utmMedium)sessionStorage.setItem(ATTR_MEDIUM,utmMedium);
  if(utmCampaign)sessionStorage.setItem(ATTR_CAMPAIGN,utmCampaign);
  if(utmContent)sessionStorage.setItem(ATTR_CONTENT,utmContent);
  if(utmTerm)sessionStorage.setItem(ATTR_TERM,utmTerm);
  if(gclid)sessionStorage.setItem(ATTR_GCLID,gclid);
  if(gbraid)sessionStorage.setItem(ATTR_GBRAID,gbraid);
  if(wbraid)sessionStorage.setItem(ATTR_WBRAID,wbraid);
  if(fbclid)sessionStorage.setItem(ATTR_FBCLID,fbclid);

  let source=utmSource||sessionStorage.getItem(ATTR_SOURCE)||sessionStorage.getItem("utm_source")||"";
  let medium=utmMedium||sessionStorage.getItem(ATTR_MEDIUM)||sessionStorage.getItem("utm_medium")||"";
  let campaign=utmCampaign||sessionStorage.getItem(ATTR_CAMPAIGN)||sessionStorage.getItem("utm_campaign")||"";
  let content=utmContent||sessionStorage.getItem(ATTR_CONTENT)||sessionStorage.getItem("utm_content")||"";
  const term=utmTerm||sessionStorage.getItem(ATTR_TERM)||"";
  const googleClickId=gclid||sessionStorage.getItem(ATTR_GCLID)||"";
  const googleBraId=gbraid||sessionStorage.getItem(ATTR_GBRAID)||"";
  const googleWbraId=wbraid||sessionStorage.getItem(ATTR_WBRAID)||"";
  const facebookClickId=fbclid||sessionStorage.getItem(ATTR_FBCLID)||"";

  if(!source&&!medium){
    const inferred=classifyReferrer();
    source=inferred.source;
    medium=inferred.medium;
    if(source)sessionStorage.setItem(ATTR_SOURCE,source);
    if(medium)sessionStorage.setItem(ATTR_MEDIUM,medium);
  }

  return {
    source,medium,campaign,content,session_id:analyticsSessionId(),
    ad_metadata:{
      utm_term:term||null,
      gclid:googleClickId||null,
      gbraid:googleBraId||null,
      wbraid:googleWbraId||null,
      fbclid:facebookClickId||null
    }
  };
}
