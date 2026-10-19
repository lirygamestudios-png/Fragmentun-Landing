"use client";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {liryFrontdeskStrings,type LiryFrontdeskLocale} from "../lib/games/liry-frontdesk-i18n";

declare global {interface Window {turnstile?:{render:(node:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;"expired-callback":()=>void;"error-callback":()=>void})=>string;remove:(id:string)=>void;reset:(id:string)=>void}}}
const turnstileSiteKey=process.env.NEXT_PUBLIC_LIRY_TURNSTILE_SITE_KEY;
export function LiryContactForm({locale="es"}:{locale?:LiryFrontdeskLocale}){
 const copy=liryFrontdeskStrings(locale).contact;
 const[name,setName]=useState("");
 const[email,setEmail]=useState("");
 const[subject,setSubject]=useState("opinion");
 const[gameSlug,setGameSlug]=useState("");
 const[message,setMessage]=useState("");
 const[ack,setAck]=useState(false);
 const[website,setWebsite]=useState("");
 const[busy,setBusy]=useState(false);
 const[turnstileToken,setTurnstileToken]=useState("");
 const[turnstileError,setTurnstileError]=useState("");
 const turnstileContainer=useRef<HTMLDivElement>(null);
 const turnstileWidgetId=useRef<string|null>(null);
 useEffect(()=>{
  if(!turnstileSiteKey)return;
  let cancelled=false;
  const script=document.createElement("script");
  script.src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";script.async=true;
  script.onload=()=>{if(cancelled||!turnstileContainer.current||!window.turnstile)return;
   turnstileWidgetId.current=window.turnstile.render(turnstileContainer.current,{sitekey:turnstileSiteKey,callback:token=>{setTurnstileToken(token);setTurnstileError("");},"expired-callback":()=>{setTurnstileToken("");setTurnstileError(copy.captchaExpired);},"error-callback":()=>{setTurnstileToken("");setTurnstileError(copy.captchaFailed);}});
  };
  script.onerror=()=>setTurnstileError(copy.captchaLoadFailed);
  document.head.appendChild(script);
  return ()=>{cancelled=true;if(turnstileWidgetId.current&&window.turnstile)window.turnstile.remove(turnstileWidgetId.current);script.remove();};
 },[locale]);
 const[result,setResult]=useState("");
 const[done,setDone]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy)return;if(!turnstileToken){setDone(false);setResult(copy.captchaRequired);return;}setBusy(true);setDone(false);setResult("");
  try{
   const r=await fetch("/api/lirygames/contact",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,subject,gameSlug,message,privacyAcknowledged:ack,website,turnstileToken})});
   const j=await r.json().catch(()=>null);
   if(!r.ok||!j?.ok)throw Error(typeof j?.message==="string"?j.message:copy.submitFailed);
   setName("");setEmail("");setSubject("opinion");setGameSlug("");setMessage("");setAck(false);setWebsite("");
   setDone(true);setResult(j.message||copy.success);
  }catch(error){setResult(error instanceof Error?error.message :copy.submitError);}
  finally{setBusy(false);setTurnstileToken("");if(turnstileWidgetId.current)window.turnstile?.reset(turnstileWidgetId.current)}
 }
 function resetFeedback(){setDone(false);setResult("");}
 const field={width:"100%",minWidth:0,padding:"11px 12px",border:"1px solid #286e98",borderRadius:6,background:"#061429",color:"#f2fbff",fontSize:16,colorScheme:"dark" as const};
 return <form onSubmit={submit} style={{display:"grid",gap:11,maxWidth:700}} aria-label={copy.formLabel}>
  <>
   <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(min(100%,210px),1fr))",gap:10}}>
    <input style={field} type="text" value={name} onChange={e=>{setName(e.target.value);resetFeedback()}} placeholder={copy.name} aria-label={copy.name} required minLength={2} maxLength={100}/>
    <input style={field} type="email" value={email} onChange={e=>{setEmail(e.target.value);resetFeedback()}} placeholder={copy.email} aria-label={copy.email} required maxLength={254}/>
   </div>
   <select style={field} aria-label={copy.subjectLabel} value={subject} onChange={e=>{setSubject(e.target.value);resetFeedback()}} required>
    <option value="opinion">{copy.subjectOptions[0]}</option>
    <option value="suggestion">{copy.subjectOptions[1]}</option>
    <option value="problem">{copy.subjectOptions[2]}</option>
    <option value="business">{copy.subjectOptions[3]}</option>
    <option value="other">{copy.subjectOptions[4]}</option>
   </select>
   <input style={field} type="text" value={gameSlug} onChange={e=>{setGameSlug(e.target.value);resetFeedback()}} placeholder={copy.game} aria-label={copy.game} maxLength={80}/>
   <textarea style={{...field,minHeight:112,resize:"vertical"}} aria-label={copy.message} placeholder={copy.messagePlaceholder} value={message} onChange={e=>{setMessage(e.target.value);resetFeedback()}} minLength={10} maxLength={3000} required/>
   <label className="liryContactConsent"><input className="liryContactCheck" type="checkbox" checked={ack} onChange={e=>{setAck(e.target.checked);resetFeedback()}} required/><span>{copy.consentText}</span></label>
   <input name="website" aria-hidden="true" autoComplete="off" tabIndex={-1} value={website} onChange={e=>setWebsite(e.target.value)} style={{position:"absolute",left:-9999}}/>
   <div aria-label={copy.captchaLabel} ref={turnstileContainer} style={{minHeight:65}}/>
   {!turnstileSiteKey&&<p role="status" style={{color:"#ffb2b2",fontSize:12}}>{copy.captchaUnavailable}</p>}
   {turnstileError&&<p role="alert" style={{color:"#ffb2b2",fontSize:12}}>{turnstileError}</p>}
   <button className="liryContactSubmit" disabled={busy||!turnstileToken} type="submit">{busy?copy.sending:`${copy.submit} →`}</button>
  </>
  {result&&<p role="status" style={{fontSize:12,color:done?"#89ebd0":"#ffb2b2",margin:0}}>{result}</p>}
 </form>;
}
