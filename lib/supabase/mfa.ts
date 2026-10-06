export async function hasSatisfiedMfa(supabase:any){
  const{data,error}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(error)return false;
  return !(data?.nextLevel==="aal2"&&data?.currentLevel!=="aal2");
}
