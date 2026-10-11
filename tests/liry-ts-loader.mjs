/** Resolver los imports relativos TypeScript usados por los módulos del proyecto en Node 24. */
export async function resolve(specifier,context,nextResolve){
 try{return await nextResolve(specifier,context);}
 catch(error){
  if(!specifier.startsWith(".")||/\.[cm]?[jt]sx?$/.test(specifier))throw error;
  return nextResolve(specifier+".ts",context);
 }
}
