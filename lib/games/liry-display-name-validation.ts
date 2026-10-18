/** Validación única para la vista previa y la futura persistencia de nombres públicos. */
export function isValidLiryDisplayName(name:unknown):name is string{
 return typeof name==="string"&&name.length>=2&&name.length<=40&&
 name===name.trim()&&!/[<>\u0000-\u001f\u007f-\u009f]/.test(name);
}
