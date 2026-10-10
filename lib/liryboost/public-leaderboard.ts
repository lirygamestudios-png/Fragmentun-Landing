/**
 * Adaptador de lectura para el futuro Top 10.
 * Nunca inventa participantes ni consulta la base de datos.
 * La capa de servidor debe entregar únicamente datos verificados y públicos.
 */
export type PublicLiryBoostEntry={
  publicName:string;
  verifiedInvitations:number;
};
export function preparePublicLiryBoostTop(
 entries:ReadonlyArray<PublicLiryBoostEntry>,
 programActive:boolean
):PublicLiryBoostEntry[]{
 if(!programActive)return [];
 const usedNames=new Set<string>();
 return entries.filter(entry=>{
  const name=entry.publicName.trim();
  if(!name||name.length>60||!Number.isSafeInteger(entry.verifiedInvitations)||entry.verifiedInvitations<=0||usedNames.has(name))return false;
  usedNames.add(name);return true;
 }).sort((a,b)=>b.verifiedInvitations-a.verifiedInvitations||a.publicName.localeCompare(b.publicName,"es")).slice(0,10);
}
