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
  journey:{explore:"EXPLORA",connect:"CONECTA",play:"JUEGA",evolve:"EVOLUCIONA"},
  visitor:{label:"VISITANTE",loginUnavailable:"El acceso gamer estará disponible cuando habilitemos Liry ID."},
  catalog:{disclaimer:"Las tarjetas actuales no representan juegos disponibles para jugar."}
 },
 en:{
  navigation:{home:"Home",worlds:"Worlds",dna:"Liry DNA",journey:"Your journey",community:"Community",boost:"LiryBoost",store:"Store",social:"Social networks"},
  hero:{eyebrow:"ONE ECOSYSTEM · HUNDREDS OF WORLDS",headline:"HUNDREDS OF WORLDS. ENDLESS WAYS TO PLAY.",explore:"EXPLORE HUNDREDS OF WORLDS",community:"JOIN THE COMMUNITY"},
  discovery:{title:"HUNDREDS OF WORLDS",eyebrow:"YOUR GAMING UNIVERSE",description:"Explore the projects presented so far. The catalog will grow with original and independent games, published only after approval. The current cards are not games available to play."},
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
