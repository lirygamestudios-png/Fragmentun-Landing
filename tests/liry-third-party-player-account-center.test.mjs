import test from "node:test";import assert from "node:assert/strict";import {readFileSync} from "node:fs";
test("Mi Liry tiene centro de cuenta bilingüe",()=>{const page=readFileSync(new URL("../app/lirygames/mi-liry/page.tsx",import.meta.url),"utf8");const center=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(page,/LiryPlayerAccountCenter locale=\{locale\}/);assert.match(center,/configuracion.*seguridad.*privacidad.*compras/);assert.match(center,/Change password/);assert.match(center,/Cambio de contraseña/);});
test("Configuración y seguridad no simulan cuentas o pagos",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/no se guardan en el servidor/);assert.match(source,/No hay cuenta|No verified account|Sin cuenta verificada/);assert.doesNotMatch(source,/signInWithPassword|updateUser\(|checkout\(|localStorage/);});

test("Liry ID utiliza estilos compartidos aprobados en lugar de estilos improvisados",()=>{const source=readFileSync(new URL("../components/LiryIdAccess.tsx",import.meta.url),"utf8");const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(source,/styles\.liryCredentialPreview/);assert.match(source,/styles\.liryCredentialSubmit/);assert.match(css,/\.liryCredentialPreview\{/);assert.match(css,/\.liryCredentialInput\{/);});

test("Mi Liry emplea clases compartidas y botones iluminados accesibles",()=>{const component=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(component,/styles\.accountCenter/);assert.match(component,/styles\.accountTab/);assert.match(css,/\.accountTab\[aria-pressed="true"\]/);assert.match(css,/@media\(max-width:560px\)/);});

test("Privacidad privada por defecto, siempre temporal y visible al jugador",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/useState\(true\)/);assert.match(source,/setPrivateProfile/);assert.match(source,/Preferencia temporal: perfil privado/);assert.doesNotMatch(source,/localStorage|updateUser\(/);});

test("Las preferencias de vista previa se pueden restablecer sin guardar datos",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/resetPreview=\(\)=>/);assert.match(source,/setPrivateProfile\(true\)/);assert.match(source,/setNotices\(false\)/);assert.match(source,/styles\.accountReset/);});

test("El jugador puede escoger foto local y quitarla sin carga al servidor",()=>{const component=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(component,/type="file"/);assert.match(component,/image\/jpeg,image\/png,image\/webp/);assert.match(component,/validateTemporaryGamerAvatar\(file\)/);assert.match(component,/validateTemporaryGamerAvatarContent\(file\)/);assert.match(component,/URL\.createObjectURL/);assert.match(component,/URL\.revokeObjectURL/);assert.match(component,/removeAvatar/);assert.doesNotMatch(component,/uploadAvatar|storage\.from\(/);});

test("El avatar se decodifica antes de aparecer y rechaza imágenes dañadas",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/new Image\(\)/);assert.match(source,/image\.onload/);assert.match(source,/image\.onerror/);assert.match(source,/image\.naturalWidth===0/);assert.match(source,/URL\.revokeObjectURL\(next\)/);});

test("La foto eliminada o sustituida no reaparece tras una carga tardía",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/avatarRequestRef=useRef\(0\)/);assert.match(source,/const request=\+\+avatarRequestRef\.current/);assert.match(source,/if\(request!==avatarRequestRef\.current\)/);assert.match(source,/removeAvatar=\(\)=>\{avatarRequestRef\.current\+\+/);});

test("El encabezado Mi Liry refleja foto temporal y eliminación",()=>{const header=readFileSync(new URL("../components/LiryPlayerIdentityHeader.tsx",import.meta.url),"utf8");const center=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const page=readFileSync(new URL("../app/lirygames/mi-liry/page.tsx",import.meta.url),"utf8");assert.match(header,/addEventListener\("liry:avatar-preview"/);assert.match(center,/CustomEvent\("liry:avatar-preview"/);assert.match(page,/LiryPlayerIdentityHeader locale=\{locale\}/);});

test("Lectura ampliada y reducción de movimiento son preferencias locales reversibles",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(source,/setLargeText\(e\.target\.checked\)/);assert.match(source,/setLargeText\(false\)/);assert.match(source,/styles\.accountLargeText/);assert.match(css,/\.accountLargeText \.accountPanel/);assert.match(css,/\.accountReducedMotion/);});

test("Navegación del Centro de Cuenta admite flechas, Inicio y Fin",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/onKeyDown=\{event=>/);assert.match(source,/ArrowRight/);assert.match(source,/ArrowLeft/);assert.match(source,/Home/);assert.match(source,/End/);assert.match(source,/\.focus\(\)/);});

test("La navegación y la carga de avatares no usan bordes dorados",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountTab\[aria-pressed="true"\]\{[^}]*border-color:#69d9ff/);assert.match(css,/\.accountAvatarInput::file-selector-button:hover\{border-color:#69d9ff/);});

test("El botón activo identifica su sección con texto sin bordes amarillos",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(source,/Viendo: /);assert.match(source,/Viewing: /);assert.match(css,/\.accountTab\[aria-pressed="true"\]\{[^}]*border-color:#69d9ff/);});

test("El nombre público temporal se valida y aparece en el encabezado",()=>{const center=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const header=readFileSync(new URL("../components/LiryPlayerIdentityHeader.tsx",import.meta.url),"utf8");assert.match(center,/liry:display-name-preview/);assert.match(center,/maxLength=\{40\}/);assert.match(header,/previewName\|\|displayName/);});

test("El nombre se puede restablecer sin eliminar el avatar",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Restablecer nombre/);assert.match(src,/onClick=\{\(\)=>\{updatePublicName\("".*?\);nameInput\.current\?\.focus\(\)\}\}/);});


test("Los errores de fotografía se anuncian y permiten reintentar el mismo archivo",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/role=\{avatarError\?"alert":"status"\}/);assert.match(src,/aria-live=\{avatarError\?"assertive":"polite"\}/);assert.match(src,/if\(avatarInput\.current\)avatarInput\.current\.value=""/);assert.match(src,/Photo loaded for this preview only/);assert.match(src,/Fotografía cargada solo para esta vista previa/);assert.doesNotMatch(src,/storage\.from\(|uploadAvatar\(/);});

test("Un error inesperado al leer el archivo no interrumpe el perfil",()=>{const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(source,/validateTemporaryGamerAvatarContent\(file\)\.catch\(\(\)=>false\)/);assert.match(source,/El contenido del archivo no es una imagen válida/);});

test("El contador bilingüe del alias respeta el límite de la vista previa",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/maxLength=\{40\}/);assert.match(src,/Caracteres: \$\{publicName\.length\} de 40/);assert.match(src,/Characters: \$\{publicName\.length\} of 40/);assert.match(src,/aria-invalid=\{Boolean\(nameError\)\}/);});

test("El selector de avatar se limpia tras carga válida para permitir elegir la misma imagen",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/avatarUrlRef\.current=next;[\s\S]*?setAvatarLoading\(false\);setAvatarUrl\(next\);[\s\S]*?setAvatarError\("".*?\);if\(avatarInput\.current\)avatarInput\.current\.value=""/);});

test("La cabecera anuncia los cambios temporales del nombre público",()=>{const header=readFileSync(new URL("../components/LiryPlayerIdentityHeader.tsx",import.meta.url),"utf8");assert.match(header,/aria-live="polite" aria-atomic="true"/);assert.match(header,/previewName\|\|displayName/);assert.match(header,/liry:display-name-preview/);});

test("El avatar comunica validación en curso sin guardar archivos",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/avatarLoading/);assert.match(src,/Comprobando imagen/);assert.match(src,/Checking image/);assert.match(src,/setAvatarLoading\(false\)/);assert.doesNotMatch(src,/uploadAvatar\(|storage\.from\(/);});

test("Nueva selección de avatar limpia primero el error anterior",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/const request=\+\+avatarRequestRef\.current;\s*setAvatarError\("".*?\);\s*setAvatarLoading\(true\)/);});

test("Restablecimiento conjunto de identidad temporal conserva preferencias",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/resetIdentityPreview=\(\)=>\{updatePublicName\("".*?\);removeAvatar\(\);nameInput\.current\?\.focus\(\)\}/);assert.match(src,/Restablecer nombre y fotografía/);assert.match(src,/Reset name and photo/);assert.match(src,/onClick=\{resetIdentityPreview\}/);});

test("Botones de Mi Liry presentan estado deshabilitado y tamaño táctil móvil",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountReset:disabled\{[^}]*cursor:not-allowed/);assert.match(css,/@media\(max-width:560px\)\{\.accountReset\{min-height:44px/);assert.match(css,/\.accountTab\{min-height:44px/);});

test("Mi Liry evita desbordamientos y facilita enfocar avatar en móvil",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountPanel\{overflow-wrap:anywhere\}/);assert.match(css,/\.accountAvatarInput:focus-visible\{outline:2px solid #8be9ff/);assert.match(css,/\.accountAvatarInput::file-selector-button\{min-height:44px/);});

test("La comprobación temporal del avatar expone estado ocupado",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/className=\{styles\.accountAvatarArea\} aria-busy=\{avatarLoading\}/);});

test("Una validación obsoleta del avatar no restaura errores tras restablecer",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/if\(!validation\.ok\)\{if\(request!==avatarRequestRef\.current\)return;setAvatarLoading\(false\)/);assert.match(src,/removeAvatar=\(\)=>\{avatarRequestRef\.current\+\+/);});

test("Permite cancelar la comprobación de fotografía antes de finalizar",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/\(avatarUrl\|\|avatarLoading\)\&\&<button/);assert.match(src,/Cancelar carga de fotografía/);assert.match(src,/Cancel photo selection/);assert.match(src,/onClick=\{avatarLoading\?cancelAvatarSelection:removeAvatar\}/);assert.match(src,/removeAvatar=\(\)=>\{avatarRequestRef\.current\+\+/);});

test("Cancelar una sustitución de avatar conserva la fotografía existente",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/cancelAvatarSelection=\(\)=>\{avatarRequestRef\.current\+\+;setAvatarLoading\(false\);setAvatarError\("".*?\)/);assert.match(src,/onClick=\{avatarLoading\?cancelAvatarSelection:removeAvatar\}/);const cancel=src.match(/const cancelAvatarSelection=\(\)=>\{([^}]*)\}/)?.[1]||"";assert.doesNotMatch(cancel,/setAvatarUrl\(|revokeObjectURL|liry:avatar-preview/);});

test("Cada control de sección identifica el panel activo de Mi Liry",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/aria-controls="liry-account-active-panel"/);assert.match(src,/id="liry-account-active-panel" role="region"/);assert.match(src,/aria-label=\{copy\.sections\[active\]\}/);});

test("Restablecer preferencias se habilita solamente cuando cambian",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/onClick=\{resetPreview\} disabled=\{!notices&&!reduceMotion&&!largeText&&privateProfile\}/);assert.match(src,/resetPreview=\(\)=>\{setSaveNotice\(null\);setNotices\(false\);setReduceMotion\(false\);setLargeText\(false\);setPrivateProfile\(true\)\}/);});

test("El error del nombre público se anuncia de forma accesible",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/role=\{nameError\?"alert":"status"\}/);assert.match(src,/aria-live=\{nameError\?"assertive":"polite"\}/);assert.match(src,/aria-describedby="liry-name-note"/);});

test("Tras restablecer la identidad temporal se recupera el foco en nombre",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/nameInput=useRef<HTMLInputElement>\(null\)/);assert.match(src,/ref=\{nameInput\} className=\{styles\.accountNameInput\}/);assert.match(src,/resetIdentityPreview=\(\)=>\{updatePublicName\("".*?\);removeAvatar\(\);nameInput\.current\?\.focus\(\)\}/);});

test("Restablecer solo el nombre devuelve foco al campo editable",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/onClick=\{\(\)=>\{updatePublicName\("".*?\);nameInput\.current\?\.focus\(\)\}\}/);assert.match(src,/ref=\{nameInput\} className=\{styles\.accountNameInput\}/);});

test("Mis compras muestra estado vacío veraz bilingüe sin activar pagos",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Sin historial de compras/);assert.match(src,/No purchase history/);assert.match(src,/Esta pantalla no procesa pagos/);assert.match(src,/This screen does not process payments/);});

test("Privacidad advierte que visibilidad temporal no publica datos personales",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/No publica tu nombre, avatar ni actividad/);assert.match(src,/It does not publish your name, avatar, or activity/);assert.match(src,/se restablece al cerrar Mi Liry/);});

test("Seguridad informa estado de autenticación pendiente en ambos idiomas",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Estado de seguridad: acceso de jugador no habilitado/);assert.match(src,/Security status: player sign-in is not enabled/);assert.match(src,/Sin sesión iniciada, no se pueden cambiar contraseñas/);});

test("Configuración explica selector de idioma y alcance temporal de preferencias",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/El idioma se cambia desde el selector ES\/EN de la plataforma/);assert.match(src,/Change language using the platform ES\/EN selector/);assert.match(src,/no modifican preferencias de una cuenta/);});

test("La selección de avatar comunica formato y errores por descripción accesible",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/aria-describedby="liry-avatar-help liry-avatar-status"/);assert.match(src,/id="liry-avatar-help"/);assert.match(src,/id="liry-avatar-status" role=\{avatarError\?"alert":"status"\}/);});

test("Los controles de configuración y privacidad son cómodos de pulsar en móvil",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/@media\(max-width:560px\)\{\.accountToggle\{min-height:44px/);assert.match(css,/\.accountToggle input\{flex:0 0 20px;width:20px;height:20px\}/);assert.match(css,/\.accountTab\{touch-action:manipulation\}/);});

test("Preferencia de avisos no simula notificaciones enviadas",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/No se enviarán correos ni notificaciones desde esta vista/);assert.match(src,/This preview does not send emails or notifications/);});

test("Estado general de Mi Liry diferencia vistas previas y servicios bloqueados",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Estado del perfil: nombre, avatar y preferencias disponibles como vista previa/);assert.match(src,/Profile status: name, avatar, and preferences are available as previews/);assert.match(src,/Seguridad y compras requieren una cuenta verificada/);});

test("Cancelar o quitar la foto devuelve el foco al selector de archivo",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");for(const name of ["cancelAvatarSelection","removeAvatar"]){const line=src.split("\n").find(x=>x.includes("const "+name+"=()=>"))||"";assert.match(line,/avatarInput\.current\.focus\(\)/);assert.match(line,/avatarInput\.current\.value=""/);}});

test("Datos personales y facturación tiene cinco campos de prueba sin persistencia",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/selected==="facturacion"/);assert.match(src,/Datos personales y facturación/);assert.match(src,/Personal and billing details/);for(const field of ["firstName","lastName","email","country","postalCode"])assert.match(src,new RegExp(field));assert.match(src,/autoComplete="off"/);assert.match(src,/Los datos no se almacenan al salir de esta página/);assert.match(src,/Borrar datos de prueba/);const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountBillingGrid\{display:grid/);});

test("Facturación provisional valida el formato del correo y anuncia errores",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/id="liry-billing-email-help"/);assert.match(src,/aria-describedby=\{field==="email"\?"liry-billing-email-help":undefined\}/);assert.match(src,/El correo de prueba debe tener un formato válido/);assert.match(src,/The test email must use a valid format/);});

test("Los nombres de facturación se distinguen del alias público",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Nombre y apellidos de facturación son distintos del alias público/);assert.match(src,/Billing first and last names are separate from your public gamer alias/);});

test("El código postal de prueba admite formatos internacionales sin longitud excesiva",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/maxLength=\{field==="email"\?120:field==="postalCode"\?20:80\}/);assert.match(src,/field==="postalCode"\?"text"/);});

test("Datos de prueba de facturación identifican cada campo en español e inglés",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Nombre\(s\) de facturación/);assert.match(src,/Billing last name\(s\)/);assert.match(src,/País de facturación/);assert.match(src,/Billing postal code/);assert.match(src,/spellCheck=\{false\}/);});

test("Campos de facturación no desbordan en pantalla móvil",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountBillingGrid \.accountNameLabel\{min-width:0;max-width:none\}/);assert.match(css,/\.accountBillingGrid \.accountNameInput\{display:block;width:100%;min-width:0;box-sizing:border-box\}/);});

test("Facturación muestra solo progreso agregado del borrador local",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/Object\.values\(billingDraft\)\.filter\(value=>value\.trim\(\)!==""\)\.length/);assert.match(src,/de 5 campos de prueba completados/);assert.match(src,/of 5 test fields completed/);assert.match(src,/Details are not stored after leaving this page/);});

test("Avatar temporal conecta la cabecera del FrontDesk sin cuentas reales",()=>{const profile=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");const header=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");const frontdesk=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");assert.match(profile,/sessionStorage\.setItem\("liry:temporary-avatar-thumbnail"/);assert.match(profile,/sessionStorage\.removeItem\("liry:temporary-avatar-thumbnail"\)/);assert.match(header,/sessionStorage\.getItem\(key\)/);assert.match(frontdesk,/<LiryFrontdeskProfileAccess/);});

test("Botones guardar informan que no hay persistencia en las cuatro secciones editables",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");for(const name of ["perfil","configuracion","privacidad","facturacion"])assert.match(src,new RegExp('"' + name + '"'));for(const phrase of ["Guardar cambios","Guardar preferencias","Guardar configuración","Guardar datos","No se ha enviado información al servidor","No information has been sent to the server"])assert.ok(src.includes(phrase));assert.match(src,/setSaveNotice\(selected\)/);});

test("Buscador de cabecera reinicia texto y reconoce acentos sin resultados engañosos",()=>{const src=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(src,/if\(kind==="search"\)setTerm\("".*?\)/);assert.match(src,/\.normalize\("NFD"\)/);assert.doesNotMatch(src,/href:"#comunidad",tags:"desarrolladores developers"/);assert.match(src,/onClose=\{\(\)=>origin\.current\?\.focus/);});

test("La búsqueda del header utiliza teclado de búsqueda móvil",()=>{const src=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(src,/type="search" enterKeyHint="search" autoComplete="off"/);});

test("Buscador informa resultados reales y permite limpiar el término",()=>{const src=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(src,/results\.length\} secciones encontradas/);assert.match(src,/Clear search/);assert.match(src,/setTerm\("".*?\);input\.current\?\.focus/);});

test("Los botones de búsqueda y campana conservan los estilos azul/cian aprobados",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/\.nav button\.navSearch,\.nav button\.navNotice\{appearance:none/);assert.match(css,/background:transparent/);assert.match(css,/\.nav button\.navSearch:hover/);assert.match(css,/\.nav button\.navNotice:hover/);});

test("Flecha abajo desde búsqueda enfoca el primer resultado público",()=>{const src=readFileSync(new URL("../components/LiryHeaderUtilities.tsx",import.meta.url),"utf8");assert.match(src,/const firstResult=useRef<HTMLAnchorElement>\(null\)/);assert.match(src,/e\.key==="ArrowDown"&&results\.length>0/);assert.match(src,/firstResult\.current\?\.focus\(\{preventScroll:true\}\)/);assert.match(src,/ref=\{index===0\?firstResult:undefined\}/);});

test("Catálogo propio muestra máximo nueve tarjetas y filtros públicos sin revelar títulos internos",()=>{const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");assert.match(src,/publicGameEntries\.slice\(\(currentCatalogPage-1\)\*9,currentCatalogPage\*9\)/);assert.match(src,/paginatedGames\.map\(\(\{game,index\}\)/);assert.match(src,/setCatalogPage\(1\)/);assert.match(src,/liryCatalogPagination/);assert.match(src,/publicCodenames\[index\]/);});

test("Tienda prepara paginación de doce productos auténticos y filtros",()=>{const src=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");assert.match(src,/products=\[\]/);assert.match(src,/filtered\.slice\(\(currentPage-1\)\*12,currentPage\*12\)/);assert.match(src,/setCategory\(e\.target\.value\);setPage\(1\)/);assert.match(src,/liryStorePages/);assert.match(src,/Todavía no hay productos publicados/);});

test("Campos personales mantienen fondo navy incluso con autocompletado",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountNameInput:-webkit-autofill/);assert.match(css,/-webkit-text-fill-color:#f1faff!important/);assert.match(css,/box-shadow:0 0 0 1000px #07192c inset!important/);});
test("Filtros de tienda conservan proporción compacta y controles táctiles",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/\.liryStoreFilters\{gap:9px;margin:12px 0 10px;max-width:730px\}/);assert.match(css,/\.liryStoreFilters label:nth-child\(2\)/);assert.match(css,/\.liryStoreFilters input,\.liryStoreFilters select/);});

test("Los campos personales mantienen navy en autofill estándar y foco",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.accountNameInput:autofill\{background-color:#07192c!important/);assert.match(css,/\.accountNameInput:focus-visible\{background-color:#07192c/);});

test("Una sola insignia de marca conecta cabecera, favicon y carga LIRYGAMES",()=>{const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");const page=read("../app/lirygames/page.tsx"),layout=read("../app/lirygames/layout.tsx"),loader=read("../components/LiryBrandLoader.tsx"),css=read("../app/lirygames/lirygames.module.css"),icon=read("../public/lirygames-brand-icon.svg");for(const src of [page,layout,loader])assert.match(src,/lirygames-brand-icon\.svg/);assert.doesNotMatch(css,/\.sigil::before/);assert.match(icon,/M121 68H194/);assert.match(icon,/M118 129H187/);assert.match(icon,/M115 188H192/);});

test("Mi Liry usa el mismo símbolo que el FrontDesk, sin CSS antiguo",()=>{const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");assert.match(read("../app/lirygames/mi-liry/page.tsx"),/src="\/lirygames-brand-icon\.svg"/);assert.doesNotMatch(read("../app/lirygames/mi-liry/mi-liry.module.css"),/\.header \.sigil::before/);});

test("Tienda permite combinar disponibilidad, precio y categoría sin productos ficticios",()=>{const src=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");assert.match(src,/const \[availability,setAvailability\]=useState\("all"\)/);assert.match(src,/const \[sortBy,setSortBy\]=useState\("name"\)/);assert.match(src,/sortBy==="price-asc"/);assert.match(src,/setAvailability\("all"\);setSortBy\("name"\);setPage\(1\)/);assert.match(src,/products=\[\]/);});

test("Tienda encuentra nombres con o sin acentos y anuncia página activa",()=>{const src=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");assert.match(src,/normalize\("NFD"\)/);assert.match(src,/normalizeSearch\(item\.name\)\.includes\(normalizeSearch\(term\)\)/);assert.match(src,/aria-label=\{locale==="es"\?`Página \$\{n\} de \$\{pages\}`/);assert.match(src,/Array.from\(new Set\(/);});

test("Buscadores de videojuegos admiten acentos y paginación accesible",()=>{for(const p of ["../components/LiryGameDiscovery.tsx","../components/LiryThirdPartyCatalog.tsx"]){const src=readFileSync(new URL(p,import.meta.url),"utf8");assert.match(src,/normalizePublicSearch/);assert.match(src,/normalize\("NFD"\)/);assert.match(src,/aria-label=\{locale==="es"\?`Página \$\{(?:i\+1|n)\} de/);}});

test("Navegación móvil conserva foco cian y acceso a controles",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.match(css,/overscroll-behavior-inline:contain/);assert.match(css,/\.liryStoreFilters input:focus-visible/);assert.match(css,/outline:2px solid #7bdaf8/);});

test("La vista previa del perfil invalida aviso de guardado al editar datos",()=>{const src=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");assert.match(src,/const updatePublicName=\(name:string\)=>\{setSaveNotice\(null\);setPublicName\(name\)/);assert.match(src,/setSaveNotice\(null\);setBillingDraft/);});

test("ADN mantiene la alineación visual sin ResizeObserver",()=>{const src=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");assert.match(src,/typeof ResizeObserver!=="undefined"/);assert.match(src,/window\.addEventListener\("resize",measure\)/);assert.match(src,/window\.removeEventListener\("resize",measure\)/);});

test("Portal desarrolladores mantiene idioma y marca oficial",()=>{const src=readFileSync(new URL("../app/lirygames/developer/page.tsx",import.meta.url),"utf8");assert.match(src,/lirygames-brand-icon\.svg/);assert.match(src,/href=\{`\/lirygames\?lang=\$\{locale\}`\}/);const finance=readFileSync(new URL("../components/LiryDeveloperFinancePreview.tsx",import.meta.url),"utf8");assert.match(finance,/AUTOMATED DEVELOPER OPERATIONS/);assert.match(finance,/Pendiente de activación/);});

test("Ficha de desarrollador descarta precio premium al elegir freemium",()=>{const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");assert.match(src,/setModel\("freemium"\);setPrice\(""\)/);assert.match(src,/aria-invalid=\{price!==""&&!priceValid\}/);assert.match(src,/developer-game-price-help/);});

test("Admisión de desarrolladores distingue declaraciones de verificación real",()=>{const src=readFileSync(new URL("../components/LiryDeveloperAdmissionPreview.tsx",import.meta.url),"utf8");assert.match(src,/const confirmed=\[rights,executable,disclosure,content,review\]\.filter\(Boolean\)\.length/);assert.match(src,/do not verify identity or intellectual property ownership/);assert.match(src,/Las declaraciones no verifican identidad ni propiedad intelectual/);});

test("Etapas de lanzamiento son vista previa sin aprobación automática",()=>{const src=readFileSync(new URL("../components/LiryDeveloperReleasePreview.tsx",import.meta.url),"utf8");assert.match(src,/No modifica el estado de ningún videojuego/);assert.match(src,/does not change any game status/);assert.match(src,/no ejecuta verificaciones de IP/);});

test("Subpantallas Liry Developers admiten viewport móvil y foco teclado",()=>{const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");assert.match(css,/\.developerDialog\{max-width:min\(92vw,820px\)/);assert.match(css,/\.developerDialogBody :is\(button,input,select,textarea\):focus-visible/);assert.match(css,/max-height:calc\(100dvh - 24px\)/);});

test("Acceso Liry Developers anuncia estado del diálogo",()=>{const src=readFileSync(new URL("../components/LiryDeveloperAccess.tsx",import.meta.url),"utf8");assert.match(src,/aria-expanded=\{isOpen\}/);assert.match(src,/setIsOpen\(true\)/);assert.match(src,/setIsOpen\(false\)/);});

test("Subpantallas de desarrolladores comunican apertura y cierre",()=>{const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");assert.match(src,/aria-expanded=\{dialogOpen&&selected===area\.id\}/);assert.match(src,/setDialogOpen\(true\)/);assert.match(src,/setDialogOpen\(false\)/);});

test("Ficha Liry Developer explica requisitos pendientes sin aprobar publicación",()=>{const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");assert.match(src,/const missing=\[/);assert.match(src,/missing\.join\(", "\)/);assert.match(src,/todavía requiere revisión de derechos, seguridad y aprobación de LIRYGAMES/);});

test("Formulario de videojuegos indica requisitos accesibles de título y resumen",()=>{const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");assert.match(src,/developer-game-title-help/);assert.match(src,/developer-game-summary-help/);assert.match(src,/aria-invalid=\{name\.length>0&&name\.trim\(\)\.length<2\}/);assert.match(src,/aria-invalid=\{summary\.length>0&&summary\.trim\(\)\.length<20\}/);});

test("Ficha desarrollador no presenta clasificación preliminar como verificada",()=>{const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");assert.match(src,/La clasificación indicada es una declaración preliminar/);assert.match(src,/must be verified before publication/);assert.match(src,/La ficha no se envía ni se guarda en un servidor/);});

test("Ficha de desarrollador distingue clasificación y plataforma declaradas",()=>{const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");assert.match(src,/developer-game-age-help/);assert.match(src,/developer-game-platform-help/);assert.match(src,/no certifica ninguna clasificación de edad/);assert.match(src,/technical compatibility is not verified/);});

test("FrontDesk evita alineaciones end con soporte CSS desigual",()=>{const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");assert.doesNotMatch(css,/(?:align-items|align-self):end(?=[;}])/);assert.match(css,/\.liryCatalogFilters\{display:flex;align-items:flex-end/);});

test("QA visual exige contenido y espera fuentes antes de capturar",()=>{const src=readFileSync(new URL("../scripts/liry-frontdesk-browser-qa.mjs",import.meta.url),"utf8");assert.match(src,/document\.fonts\.ready/);assert.match(src,/missingMain/);assert.match(src,/mainPresent/);assert.match(src,/bodyTextLength<20/);});

test("Tienda limita a doce productos y conserva navegación compacta accesible",()=>{
 const src=readFileSync(new URL("../components/LiryStoreCategories.tsx",import.meta.url),"utf8");
 assert.match(src,/Math\.ceil\(filtered\.length\/12\)/);
 assert.match(src,/filtered\.slice\(\(currentPage-1\)\*12,currentPage\*12\)/);
 assert.match(src,/Array\.from\(new Set\(\[1,pages,currentPage-1,currentPage,currentPage\+1\]/);
 assert.match(src,/n-visible\[i-1\]>1/);
 assert.match(src,/aria-current=\{currentPage===n\?"page":undefined\}/);
 assert.match(src,/setTerm\(e\.target\.value\);setPage\(1\)/);
 assert.match(src,/setSortBy\(e\.target\.value\);setPage\(1\)/);
});

test("Compartir juegos y productos usa exclusivamente el FrontDesk",()=>{
 const read=p=>readFileSync(new URL(p,import.meta.url),"utf8");
 const share=read("../components/LiryShareEntry.tsx");
 const resolver=read("../lib/games/liry-share-url.ts");
 assert.match(share,/resolveLiryShareUrl\(process\.env\.NEXT_PUBLIC_LIRY_PUBLIC_URL,window\.location\.origin\)/);
 assert.match(share,/navigator\.share\(\{title,text,url\}\)/);
 assert.match(share,/navigator\.clipboard\.writeText\(url\)/);
 assert.match(resolver,/new URL\("\/lirygames",parsed\.origin\)/);
 assert.doesNotMatch(share,/new URL\([^\n]*name/);
 for(const path of ["../components/LiryStoreCategories.tsx","../components/LiryGameDiscovery.tsx","../components/LiryThirdPartyCatalog.tsx"]){
  assert.match(read(path),/<LiryShareEntry name=/);
 }
 assert.match(share,/aria-label=\{locale==="es"/);
 assert.match(share,/<svg viewBox=/);
});

test("Icono de compartir permanece accesible sobre la apertura de fichas",()=>{
 const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
 const game=readFileSync(new URL("../components/LiryGameDiscovery.tsx",import.meta.url),"utf8");
 const share=readFileSync(new URL("../components/LiryShareEntry.tsx",import.meta.url),"utf8");
 assert.match(css,/\.worldCardOpen\{position:absolute;inset:0;z-index:2/);
 assert.match(css,/\.liryShareEntry\{position:relative;z-index:4/);
 assert.match(game,/<LiryShareEntry name=/);
 assert.match(share,/<button type="button" onClick=\{share\}/);
 assert.match(share,/width="17" height="17"/);
});

test("Mi Liry mantiene el tratamiento oscuro al escribir o autocompletar datos",()=>{
 const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
 assert.match(css,/\.accountNameInput:-webkit-autofill/);
 assert.match(css,/\.accountNameInput:autofill/);
 assert.match(css,/\.accountNameInput:focus-visible/);
 assert.match(css,/background-color:#07192c/);
 assert.match(css,/color-scheme:dark/);
});

test("El avatar local actualiza el icono del FrontDesk sin subir imágenes",()=>{
 const identity=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");
 const header=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");
 assert.match(identity,/sessionStorage\.setItem\(thumbnailKey,thumbnail\)/);
 assert.match(identity,/sessionStorage\.removeItem\(thumbnailKey\)/);
 assert.match(identity,/window\.dispatchEvent\(new Event\("liry:avatar-changed"\)\)/);
 assert.match(header,/window\.addEventListener\("liry:avatar-changed",refresh\)/);
 assert.match(header,/window\.removeEventListener\("liry:avatar-changed",refresh\)/);
});

test("Mi Liry recupera avatar temporal al volver desde FrontDesk",()=>{
 const profile=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
 const header=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");
 assert.match(profile,/sessionStorage\.getItem\("liry:temporary-avatar-thumbnail"\)/);
 assert.match(profile,/saved\?\.startsWith\("data:image\/webp;base64,"\)/);
 assert.match(profile,/setAvatarUrl\(saved\)/);
 assert.match(profile,/sessionStorage\.removeItem\("liry:temporary-avatar-thumbnail"\)/);
 assert.match(header,/sessionStorage\.getItem\(key\)/);
});

test("Las seis pestañas limpian avisos tanto por clic como por teclado",()=>{
 const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
 assert.match(source,/sections\.map\(\(section,i\)=>/);
 assert.match(source,/onClick=\{\(\)=>\{setSelected\(section\);setSaveNotice\(null\)\}\}/);
 assert.match(source,/setSelected\(sections\[next\]\);setSaveNotice\(null\)/);
 assert.match(source,/\["ArrowRight","ArrowDown","ArrowLeft","ArrowUp","Home","End"\]/);
});

test("Editar preferencias invalida el aviso anterior de guardado de demostración",()=>{
 const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
 for(const setter of ["Notices","ReduceMotion","LargeText","PrivateProfile"]){
  assert.ok(source.includes(`onChange={e=>{setSaveNotice(null);set${setter}(e.target.checked)}}`),`El ajuste ${setter} debe limpiar el aviso anterior`);
 }
});

test("Mi Liry deshabilita confirmación con nombre público o correo de prueba inválidos",()=>{
 const source=readFileSync(new URL("../components/LiryPlayerAccountCenter.tsx",import.meta.url),"utf8");
 assert.match(source,/disabled=\{\(selected==="perfil"&&Boolean\(nameError\)\)/);
 assert.match(source,/selected==="facturacion"&&billingDraft\.email!==""/);
 assert.match(source,/aria-invalid=\{field==="email"/);
 assert.match(source,/role=\{billingDraft\.email!==""/);
});
test("Los campos de facturación mantienen medidas táctiles en móvil",()=>{
 const css=readFileSync(new URL("../app/lirygames/mi-liry/mi-liry.module.css",import.meta.url),"utf8");
 assert.match(css,/\.accountBillingGrid \.accountNameInput\{min-height:46px;font-size:16px/);
 assert.match(css,/\.accountBillingGrid\{grid-template-columns:1fr\}/);
});

test("Las fichas de terceros no quedan completas con clasificación por edad pendiente",()=>{
 const src=readFileSync(new URL("../components/LiryDeveloperGameListingPreview.tsx",import.meta.url),"utf8");
 assert.match(src,/age==="classified"&&platform!==""/);
 assert.match(src,/age!=="classified"/);
 assert.match(src,/<option value="pending">/);
 assert.match(src,/<option value="classified">/);
 assert.match(src,/aprobación de LIRYGAMES/);
});

test("Liry Developers presenta cuatro áreas preliminares aisladas en subpantallas",()=>{
 const src=readFileSync(new URL("../components/LiryDeveloperAreas.tsx",import.meta.url),"utf8");
 for(const area of ["admission","listing","release","finance"]){
  assert.ok(src.includes(`selected==="${area}"&&<LiryDeveloper`),`Falta área ${area}`);
 }
 assert.match(src,/modal\.current\?\.showModal\(\)/);
 assert.match(src,/onClose=\{\(\)=>\{setDialogOpen\(false\);setSession\(value=>value\+1\)/);
 assert.match(src,/key=\{session\}/);
 assert.match(src,/if\(event\.target===modal\.current\)modal\.current\.close\(\)/);
});
test("La admisión y publicación siguen sujetas a aprobación humana",()=>{
 for(const path of ["../components/LiryDeveloperAdmissionPreview.tsx","../components/LiryDeveloperGameListingPreview.tsx","../components/LiryDeveloperReleasePreview.tsx"]){
  const src=readFileSync(new URL(path,import.meta.url),"utf8");
  assert.match(src,/aprobación expresa de LIRYGAMES/);
 }
});

test("El menú móvil anuncia su cierre en el idioma activo del FrontDesk",()=>{
 const nav=readFileSync(new URL("../components/LiryMobileNav.tsx",import.meta.url),"utf8");
 const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
 assert.match(nav,/locale==="es"\?"Cerrar menú":"Close menu"/);
 assert.match(nav,/aria-expanded=\{open\}/);
 assert.match(page,/<LiryMobileNav locale=\{locale\}/);
 assert.match(nav,/window\.addEventListener\("hashchange",closeOnNavigation\)/);
});

test("Las pestañas de Comunidad admiten cuatro flechas, Inicio y Fin",()=>{
 const src=readFileSync(new URL("../components/LiryCommunityTabs.tsx",import.meta.url),"utf8");
 assert.match(src,/event\.key==="ArrowRight"\|\|event\.key==="ArrowDown"/);
 assert.match(src,/event\.key==="ArrowLeft"\|\|event\.key==="ArrowUp"/);
 assert.match(src,/event\.key==="Home"/);
 assert.match(src,/event\.key==="End"/);
 assert.match(src,/role="tablist"/);
 assert.match(src,/aria-selected=\{tab===item\.id\}/);
 assert.match(src,/role="tabpanel"/);
});

test("Tienda y catálogo permiten recuperar resultados vacíos sin perder paginación accesible",()=>{
 for(const [path,resetLabel] of [["../components/LiryStoreCategories.tsx","Mostrar todos los productos"],["../components/LiryThirdPartyCatalog.tsx","Mostrar todos los videojuegos"]]){
  const src=readFileSync(new URL(path,import.meta.url),"utf8");
  assert.ok(src.includes(resetLabel));
  assert.match(src,/aria-current=\{currentPage===n\?"page":undefined\}/);
  assert.match(src,/resultStatus\.current\?\.focus\(\{preventScroll:true\}\)/);
  assert.match(src,/tabIndex=\{-1\} aria-live="polite"/);
 }
});

test("El captcha de contacto renueva sus textos cuando cambia el idioma",()=>{
 const src=readFileSync(new URL("../components/LiryContactForm.tsx",import.meta.url),"utf8");
 assert.match(src,/script\.onload=/);
 assert.match(src,/setTurnstileError\(copy\.captchaExpired\)/);
 assert.match(src,/setTurnstileError\(copy\.captchaFailed\)/);
 assert.match(src,/\},\[locale\]\);/);
});

test("Contacto conserva datos ante errores y limpia los campos solo tras éxito",()=>{
 const src=readFileSync(new URL("../components/LiryContactForm.tsx",import.meta.url),"utf8");
 assert.match(src,/if\(busy\)return/);
 assert.match(src,/if\(!turnstileToken\)\{setDone\(false\);setResult\(copy\.captchaRequired\)/);
 assert.match(src,/const j=await r\.json\(\)\.catch\(\(\)=>null\)/);
 assert.match(src,/if\(!r\.ok\|\|!j\?\.ok\)throw Error/);
 assert.match(src,/setName\(""\);setEmail\(""\);setSubject\("opinion"\)/);
 assert.match(src,/setDone\(true\);setResult\(j\.message\|\|copy\.success\)/);
 assert.match(src,/catch\(error\)\{setResult\(/);
 assert.match(src,/finally\{setBusy\(false\);setTurnstileToken\(""\)/);
});

test("Menú de cabecera móvil muestra ocho enlaces en cuadrícula compacta",()=>{
 const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
 const page=readFileSync(new URL("../app/lirygames/page.tsx",import.meta.url),"utf8");
 assert.match(css,/Header móvil: ocho enlaces visibles en una vista/);
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(css,/max-height:calc\(100dvh - 86px\)/);
 assert.match(css,/max-height:calc\(100dvh - 75px\)/);
 const menu=page.match(/<LiryMobileNav[\s\S]*?\/>/);
 assert.ok(menu);
 assert.equal((menu[0].match(/\{href:"#/g)||[]).length,8);
});

test("El menú del header en escritorio muestra ocho enlaces sin scroll interno y respeta móvil",()=>{
 const css=readFileSync(new URL("../app/lirygames/lirygames.module.css",import.meta.url),"utf8");
 const desktop=css.slice(css.lastIndexOf("/* Desktop: mostrar los ocho accesos del menú superior en una sola vista. */"));
 assert.match(desktop,/@media\(min-width:751px\)/);
 assert.match(desktop,/\.nav \.navMenuPanel\{[\s\S]*?display:grid/);
 assert.match(desktop,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
 assert.match(desktop,/max-height:none/);
 assert.match(desktop,/overflow:visible/);
 assert.match(desktop,/width:340px/);
 assert.doesNotMatch(desktop,/@media\(max-width:750px\)/);
});

test("Avatar temporal evita restaurar miniaturas eliminadas y comunica errores",()=>{
 const gamer=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");
 const header=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");
 assert.match(gamer,/const selection=\+\+avatarSelection\.current/);
 assert.match(gamer,/if\(selection!==avatarSelection\.current\)\{bitmap\.close\(\);return;\}/);
 assert.match(gamer,/if\(selection===avatarSelection\.current&&thumbnail\.length<180000\)/);
 assert.match(gamer,/sessionStorage\.removeItem\(thumbnailKey\)/);
 assert.match(gamer,/setAvatarError\(locale==="es"\?/);
 assert.match(header,/window\.addEventListener\("liry:avatar-changed",refresh\)/);
});

test("Cabecera y perfil aceptan solo la miniatura WebP temporal de la misma sesión",()=>{
 const header=readFileSync(new URL("../components/LiryFrontdeskProfileAccess.tsx",import.meta.url),"utf8");
 const gamer=readFileSync(new URL("../components/LiryGamerIdentity.tsx",import.meta.url),"utf8");
 for(const source of [header,gamer]){
  assert.match(source,/liry:temporary-avatar-thumbnail/);
  assert.match(source,/startsWith\("data:image\/webp;base64,"\)/);
  assert.match(source,/length<180000/);
 }
 assert.match(gamer,/sessionStorage\.removeItem\(thumbnailKey\)/);
 assert.match(header,/window\.addEventListener\("pageshow",refresh\)/);
});

test("Las preferencias de Mi Liry mantienen grupos y mensajes accesibles",()=>{
 const src=readFileSync(new URL("../components/MiLiryIdentityPreview.tsx",import.meta.url),"utf8");
 assert.match(src,/const canReset=avatar!=="orb"\|\|theme!=="navy"\|\|notifications/);
 assert.match(src,/disabled=\{!canReset\}/);
 assert.match(src,/role="group" aria-labelledby="liry-preview-avatar-label"/);
 assert.match(src,/role="group" aria-labelledby="liry-preview-theme-label"/);
 assert.match(src,/aria-pressed=\{avatar===item\}/);
 assert.match(src,/aria-pressed=\{theme===item\}/);
 assert.match(src,/role="status" aria-live="polite" aria-atomic="true"/);
 assert.match(src,/<p className=\{styles\.previewNote\}>\{copy\.previewNote\}<\/p>/);
});
