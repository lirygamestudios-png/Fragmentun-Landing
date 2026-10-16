"use client";
import {useRef,useState,type KeyboardEvent} from "react";
import styles from "../app/lirygames/lirygames.module.css";
import {canShowCommunityActivity} from "../lib/games/liry-community-readiness";
import {liryFrontdeskStrings} from "../lib/games/liry-frontdesk-i18n";
const communityCopy=liryFrontdeskStrings("es").communityTabs;
const feedCopy=liryFrontdeskStrings("es").communityFeedIntro;
const categories=[
 {id:"todos",...communityCopy.all},
 {id:"amigos",...communityCopy.friends},
 {id:"logros",...communityCopy.achievements},
 {id:"eventos",...communityCopy.events}
] as const;
type Category=(typeof categories)[number]["id"];
export function LiryCommunityTabs(){
 const [tab,setTab]=useState<Category>("todos");
 const tabButtons=useRef<Record<string,HTMLButtonElement|null>>({});
 const handleTabKeyDown=(event:KeyboardEvent<HTMLButtonElement>,index:number)=>{
  let next=index;
  if(event.key==="ArrowRight")next=(index+1)%categories.length;
  else if(event.key==="ArrowLeft")next=(index-1+categories.length)%categories.length;
  else if(event.key==="Home")next=0;
  else if(event.key==="End")next=categories.length-1;
  else return;
  event.preventDefault();
  const target=categories[next].id;
  setTab(target);
  tabButtons.current[target]?.focus({preventScroll:true});
 };
 const selected=categories.find(item=>item.id===tab)??categories[0];
 const serviceKey=tab==="todos"?"posts":tab==="amigos"?"friends":tab==="logros"?"achievements":"events";
 // Sin autenticación gamer ni fuente verificada, nunca representar actividad real.
 const servicePending=!canShowCommunityActivity(serviceKey,false,false);
 return <>
  <div className={styles.communityTabs} role="tablist" aria-label={feedCopy.tabsAria}>
   {categories.map(item=><button type="button" role="tab" key={item.id} id={`liry-tab-${item.id}`} ref={node=>{tabButtons.current[item.id]=node}} tabIndex={tab===item.id?0:-1} onKeyDown={event=>handleTabKeyDown(event,categories.findIndex(category=>category.id===item.id))} aria-controls="liry-community-panel" aria-selected={tab===item.id} className={tab===item.id?styles.communityTabActive:undefined} onClick={()=>setTab(item.id)}>{item.label}</button>)}
  </div>
  <div className={styles.communityFeed} role="tabpanel" id="liry-community-panel" aria-labelledby={`liry-tab-${tab}`}>
    {servicePending&&<div className={styles.communityEmpty}><span className={styles.communityEmptyIcon} aria-hidden="true"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3"/><path d="M5.5 20v-2a6.5 6.5 0 0 1 13 0v2M4.5 10a2.5 2.5 0 1 0 0-5M19.5 5a2.5 2.5 0 1 1 0 5M2 19v-2a4 4 0 0 1 3-3.8M22 19v-2a4 4 0 0 0-3-3.8"/></svg></span><strong>{selected.title}</strong><p>{selected.copy}</p></div>}
    {tab==="todos"&&servicePending&&<div className={styles.communityPost}><span className={styles.communityAvatar} aria-hidden="true">L</span><div><strong>{feedCopy.title}</strong><p>{feedCopy.intro}</p><small>{feedCopy.notice}</small></div></div>}
  </div>
 </>;
}
