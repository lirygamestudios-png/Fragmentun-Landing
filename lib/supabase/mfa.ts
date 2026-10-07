export async function hasSatisfiedMfa(supabase:any){
  const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(error)return false;
  return data?.currentLevel==="aal2";
}

export async function getMfaState(supabase:any){
  const {data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(error)return {state:"error" as const,currentLevel:null,nextLevel:null};
  const currentLevel=data?.currentLevel??null;
  const nextLevel=data?.nextLevel??null;
  if(currentLevel==="aal2") return {state:"satisfied" as const,currentLevel,nextLevel};
  if(nextLevel==="aal2") return {state:"challenge" as const,currentLevel,nextLevel};
  return {state:"enroll" as const,currentLevel,nextLevel};
}
