/** LIRYGAMES FrontDesk i18n foundation. Spanish remains the only released locale
 * until all visitor-facing components have verified English translations.
 * No automatic redirect, cookies or external translation services.
 */
export const LIRY_FRONTDESK_LOCALES=["es","en"] as const;
export type LiryFrontdeskLocale=(typeof LIRY_FRONTDESK_LOCALES)[number];
export const RELEASED_LIRY_FRONTDESK_LOCALES:readonly LiryFrontdeskLocale[]=["es"];
export const LIRY_FRONTDESK_STRINGS={
 es:{
  navigation:{home:"Inicio",worlds:"Mundos",dna:"Liry ADN",journey:"Tu viaje",community:"Comunidad",boost:"LiryBoost",store:"Tienda",social:"Redes sociales"},
  hero:{eyebrow:"UN ECOSISTEMA · CIENTOS DE MUNDOS",headline:"CIENTOS DE MUNDOS. INFINITAS FORMAS DE JUGAR.",explore:"EXPLORA CIENTOS DE MUNDOS",community:"ÚNETE A LA COMUNIDAD"},
  discovery:{title:"CIENTOS DE MUNDOS",eyebrow:"TU UNIVERSO DE JUEGO",description:"Explora los proyectos presentados hasta ahora. El catálogo crecerá progresivamente con videojuegos propios y de desarrolladores independientes, publicados únicamente después de su aprobación. Las tarjetas actuales no representan juegos disponibles para jugar."},
  gamerDna:{traits:["Explorador","Estratega","Competidor","Social","Acción","Creativo"],questions:["¿Disfrutas descubrir secretos y explorar escenarios desconocidos?","¿Te gusta planificar tácticas y resolver problemas complejos?","¿Te motivan los desafíos y superar tus propias marcas?","¿Prefieres jugar y colaborar con otras personas?","¿Disfrutas los juegos de reflejos y acción intensa?","¿Te gusta crear, construir o experimentar con nuevas ideas?"],answers:["Nada","Poco","Bastante","Mucho"],explore:"CONOCE LOS SEIS ESTILOS",survey:"DESCUBRIR MI LIRY ADN",hide:"OCULTAR CUESTIONARIO"},
  gamerProfile:{title:"MI PERFIL GAMER",visitor:"Visitante",avatar:"Elegir avatar temporal",noActivity:"XP pendiente de actividad verificada",noSession:"Estado visitante · sin sesión gamer. El avatar no se guarda ni se transmite."},
  communityTabs:{all:{label:"TODOS",title:"La comunidad está por despertar",copy:"Las publicaciones y actividades aparecerán cuando el servicio comunitario esté disponible. Sin conversaciones ficticias."},friends:{label:"AMIGOS",title:"Amigos próximamente",copy:"Las listas de amigos estarán disponibles cuando se habiliten las cuentas Liry ID."},achievements:{label:"LOGROS",title:"Logros comunitarios próximamente",copy:"Mostraremos únicamente logros de juego acreditados y compartidos con autorización."},events:{label:"EVENTOS",title:"Eventos próximamente",copy:"Los eventos aparecerán cuando existan convocatorias oficiales confirmadas."}},
  journey:{explore:"EXPLORA",connect:"CONECTA",play:"JUEGA",evolve:"EVOLUCIONA"},
  visitor:{label:"VISITANTE",loginUnavailable:"El acceso gamer estará disponible cuando habilitemos Liry ID."},
  catalog:{disclaimer:"Las tarjetas actuales no representan juegos disponibles para jugar."}
 },
 en:{
  navigation:{home:"Home",worlds:"Worlds",dna:"Liry DNA",journey:"Your journey",community:"Community",boost:"LiryBoost",store:"Store",social:"Social networks"},
  hero:{eyebrow:"ONE ECOSYSTEM · HUNDREDS OF WORLDS",headline:"HUNDREDS OF WORLDS. ENDLESS WAYS TO PLAY.",explore:"EXPLORE HUNDREDS OF WORLDS",community:"JOIN THE COMMUNITY"},
  discovery:{title:"HUNDREDS OF WORLDS",eyebrow:"YOUR GAMING UNIVERSE",description:"Explore the projects presented so far. The catalog will grow with original and independent games, published only after approval. The current cards are not games available to play."},
  gamerDna:{traits:["Explorer","Strategist","Competitor","Social","Action","Creator"],questions:["Do you enjoy discovering secrets and exploring unfamiliar places?","Do you enjoy planning tactics and solving complex problems?","Are you motivated by challenges and beating your own records?","Do you prefer playing and collaborating with others?","Do you enjoy reflex-based games and intense action?","Do you like creating, building or experimenting with new ideas?"],answers:["Not at all","A little","Quite a bit","A lot"],explore:"DISCOVER THE SIX STYLES",survey:"DISCOVER MY LIRY DNA",hide:"HIDE QUESTIONNAIRE"},
  gamerProfile:{title:"MY GAMER PROFILE",visitor:"Visitor",avatar:"Choose a temporary avatar",noActivity:"XP pending verified gameplay activity",noSession:"Visitor mode · no gamer session. The avatar is not saved or transmitted."},
  communityTabs:{all:{label:"ALL",title:"The community is about to awaken",copy:"Posts and activities will appear when community features become available. No fictional conversations."},friends:{label:"FRIENDS",title:"Friends coming soon",copy:"Friends lists will be available when Liry ID accounts launch."},achievements:{label:"ACHIEVEMENTS",title:"Community achievements coming soon",copy:"We will show only verified game achievements shared with permission."},events:{label:"EVENTS",title:"Events coming soon",copy:"Events will appear when official announcements are confirmed."}},
  journey:{explore:"EXPLORE",connect:"CONNECT",play:"PLAY",evolve:"EVOLVE"},
  visitor:{label:"VISITOR",loginUnavailable:"Gamer access will be available when Liry ID launches."},
  catalog:{disclaimer:"The current cards do not represent games available to play."}
 }
} as const;
export function getReleasedLiryFrontdeskLocale(requested:unknown):LiryFrontdeskLocale{
 return requested==="en"&&RELEASED_LIRY_FRONTDESK_LOCALES.includes("en")?"en":"es";
}
export function liryFrontdeskStrings(locale:LiryFrontdeskLocale){
 return LIRY_FRONTDESK_STRINGS[getReleasedLiryFrontdeskLocale(locale)];
}
