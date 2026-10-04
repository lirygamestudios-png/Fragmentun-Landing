export const ANALYTICS_SESSION_KEY="fragmentun_session_id_v1";

export function analyticsSessionId(){
  if(typeof window==="undefined")return "";
  let id=sessionStorage.getItem(ANALYTICS_SESSION_KEY);
  if(!id){
    id=(globalThis.crypto?.randomUUID?.()||`s-${Date.now()}-${Math.random().toString(36).slice(2)}`).slice(0,120);
    sessionStorage.setItem(ANALYTICS_SESSION_KEY,id);
  }
  return id;
}

export function analyticsAttribution(){
  if(typeof window==="undefined")return {source:"",medium:"",campaign:"",content:"",session_id:""};
  const url=new URL(window.location.href);
  const read=(key:string)=>url.searchParams.get(key)||sessionStorage.getItem(key)||"";
  return {
    source:read("utm_source"),
    medium:read("utm_medium"),
    campaign:read("utm_campaign"),
    content:read("utm_content"),
    session_id:analyticsSessionId()
  };
}
