/** Barrera para conectar autenticación pública LIRY ID a un proyecto independiente.
 * No establece conexión ni utiliza privilegios administrativos.
 */
export function reviewLiryAuthProjectIsolation(input:{
 gamerUrl:unknown;gamerPublishableKey:unknown;
 fragmentunUrl:unknown;fragmentunPublishableKey:unknown
}):{ready:boolean;reason:"isolated_project"|"missing_or_shared_configuration"}{
 const urls=[input?.gamerUrl,input?.fragmentunUrl];
 if(urls.some(x=>typeof x!=="string"))return {ready:false,reason:"missing_or_shared_configuration"};
 try{
  const gamer=new URL(input.gamerUrl as string),fragmentun=new URL(input.fragmentunUrl as string);
  const gKey=input.gamerPublishableKey,fKey=input.fragmentunPublishableKey;
  if(gamer.protocol!=="https:"||fragmentun.protocol!=="https:"||
   !/^[a-z0-9-]+\.supabase\.co$/i.test(gamer.hostname)||
   !/^[a-z0-9-]+\.supabase\.co$/i.test(fragmentun.hostname)||
   gamer.hostname.toLowerCase()===fragmentun.hostname.toLowerCase()||
   gamer.pathname!=="/"||fragmentun.pathname!=="/"||
   gamer.username||gamer.password||fragmentun.username||fragmentun.password||
   gamer.search||fragmentun.search||gamer.hash||fragmentun.hash||
   typeof gKey!=="string"||typeof fKey!=="string"||
   gKey.length<20||fKey.length<20||gKey===fKey)
   return {ready:false,reason:"missing_or_shared_configuration"};
  return {ready:true,reason:"isolated_project"};
 }catch{return {ready:false,reason:"missing_or_shared_configuration"}}
}
