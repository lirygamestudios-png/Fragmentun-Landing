/** Pure scheduling policy for Developer document reminders. No scheduler or sending is active. */
export const LIRY_DEVELOPER_REMINDERS_ENABLED=false as const;
export type ReminderDecision={eligible:boolean;reason:"disabled"|"not_due"|"cooldown"|"limit_reached"|"eligible"};
export function evaluateReminder(input:{now:number;dueAt:number;lastSentAt:number|null;sentCount:number;enabled:boolean}):ReminderDecision{
 if(!input.enabled||!LIRY_DEVELOPER_REMINDERS_ENABLED)return{eligible:false,reason:"disabled"};
 if(!Number.isFinite(input.now)||!Number.isFinite(input.dueAt)||input.now<input.dueAt)return{eligible:false,reason:"not_due"};
 if(input.sentCount>=3)return{eligible:false,reason:"limit_reached"};
 if(input.lastSentAt!==null&&input.now-input.lastSentAt<72*60*60*1000)return{eligible:false,reason:"cooldown"};
 return{eligible:true,reason:"eligible"};
}
/** Offline policy simulation only: verifies limits without enabling notifications. */
export function simulateReminderPolicy(input:{now:number;dueAt:number;lastSentAt:number|null;sentCount:number}):ReminderDecision{
 if(!Number.isFinite(input.now)||!Number.isFinite(input.dueAt)||input.now<input.dueAt)return{eligible:false,reason:"not_due"};
 if(input.sentCount>=3)return{eligible:false,reason:"limit_reached"};
 if(input.lastSentAt!==null&&input.now-input.lastSentAt<72*60*60*1000)return{eligible:false,reason:"cooldown"};
 return{eligible:true,reason:"eligible"};
}
