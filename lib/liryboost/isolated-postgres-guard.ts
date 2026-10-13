/** LiryBoost: protección previa a pruebas PostgreSQL aisladas.
 * No establece conexiones ni ejecuta consultas.
 * Solo admite un PostgreSQL local, nombrado explícitamente como descartable.
 */
export function reviewIsolatedPostgresTarget(input:{environment:unknown;databaseUrl:unknown;explicitQaApproval:unknown}):
 {allowed:true;reason:"isolated_local_qa"}|{allowed:false;reason:"unsafe_target"}{
 if(input?.environment!=="isolated_test"||input.explicitQaApproval!=="LIRYBOOST_LOCAL_QA_ONLY"||
    typeof input.databaseUrl!=="string")return {allowed:false,reason:"unsafe_target"};
 try{
  const url=new URL(input.databaseUrl);
  const host=url.hostname.toLowerCase();
  const db=decodeURIComponent(url.pathname.slice(1));
  if(!["postgres:","postgresql:"].includes(url.protocol)||
     !["localhost","127.0.0.1","[::1]"].includes(host)||
     db!=="liryboost_qa_disposable"||
     !url.username||!url.password||!url.port||url.search||url.hash)
   return {allowed:false,reason:"unsafe_target"};
  return {allowed:true,reason:"isolated_local_qa"};
 }catch{return {allowed:false,reason:"unsafe_target"}}
}
