/** Status-only tracking for future Liry Developers reminders; no delivery, PII or persistence. */
export type DeveloperReminderStatus="pending"|"prepared"|"sent"|"acknowledged"|"resolved"|"expired"|"cancelled";
export type DeveloperReminderAction="prepare"|"mark_sent"|"acknowledge"|"resolve"|"expire"|"cancel";
export type DeveloperReminderActor="system"|"delivery_provider"|"applicant"|"authorized_reviewer";
export const LIRY_REMINDER_TRACKING_ACTIVE=false as const;
const rules:Record<DeveloperReminderAction,{from:readonly DeveloperReminderStatus[];to:DeveloperReminderStatus;actor:DeveloperReminderActor}>={
 prepare:{from:["pending"],to:"prepared",actor:"system"},
 mark_sent:{from:["prepared"],to:"sent",actor:"delivery_provider"},
 acknowledge:{from:["sent"],to:"acknowledged",actor:"applicant"},
 resolve:{from:["sent","acknowledged"],to:"resolved",actor:"authorized_reviewer"},
 expire:{from:["pending","prepared","sent","acknowledged"],to:"expired",actor:"system"},
 cancel:{from:["pending","prepared","sent","acknowledged"],to:"cancelled",actor:"authorized_reviewer"}
};
/** Disabled operational gate: even a legitimate actor cannot mutate real reminders. */
export function transitionDeveloperReminder(status:DeveloperReminderStatus,action:DeveloperReminderAction,actor:DeveloperReminderActor,authorized:boolean):DeveloperReminderStatus{
 if(!LIRY_REMINDER_TRACKING_ACTIVE||!authorized)return status;
 return simulateDeveloperReminder(status,action,actor);
}
/** Isolated deterministic simulation for testing design, never wired to user actions. */
export function simulateDeveloperReminder(status:DeveloperReminderStatus,action:DeveloperReminderAction,actor:DeveloperReminderActor):DeveloperReminderStatus{
 const rule=rules[action];
 return rule.actor===actor&&rule.from.includes(status)?rule.to:status;
}
