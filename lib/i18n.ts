export const locales = ["es", "en"] as const;
export type Locale = (typeof locales)[number];

export const copy = {
  es: {
    nav: { story:"Historia", universe:"Universo", test:"Test", map:"Mapa", author:"Autor" },
    heroKicker:"José Liranzo · Ciencia ficción emocional",
    title:"FRAGMENTUN",
    subtitle:"I · El Despertar Emocional",
    heroQuestion:"¿Y si sentir fuera el acto más peligroso del mundo?",
    heroBody:"En Lumen, las emociones están reguladas. Elyon Voss está a punto de descubrir por qué recuperar lo humano puede convertirse en una amenaza para todo el sistema.",
    buy:"Comprar en Amazon",
    chapter:"Leer gratis el Capítulo 1",
    officialCover:"Portada oficial",
    officialCoverNote:"Aquí se colocará exclusivamente la portada oficial publicada del libro.",
    why:"¿Por qué FRAGMENTUN?",
    whyBody:"Una experiencia de ciencia ficción centrada en emoción, identidad, libertad y humanidad.",
    lumen:"Lumen",
    lumenBody:"Una sociedad construida alrededor del control emocional. Su estabilidad parece perfecta, hasta que sentir deja de obedecer.",
    chapterTitle:"Entra en Lumen",
    chapterBody:"Recibe acceso al Capítulo 1 y comienza el viaje.",
    name:"Tu nombre",
    email:"Tu correo electrónico",
    send:"Quiero leer el Capítulo 1",
    author:"José Liranzo",
    authorBody:"Autor de FRAGMENTUN y creador de universos centrados en emoción, identidad, libertad y humanidad.",
    footer:"Todos los derechos reservados."
  },
  en: {
    nav: { story:"Story", universe:"Universe", test:"Test", map:"Map", author:"Author" },
    heroKicker:"José Liranzo · Emotional science fiction",
    title:"FRAGMENTUN",
    subtitle:"I · The Emotional Awakening",
    heroQuestion:"What if feeling became the most dangerous act in the world?",
    heroBody:"In Lumen, emotions are regulated. Elyon Voss is about to discover why recovering what makes us human can become a threat to the entire system.",
    buy:"Buy on Amazon",
    chapter:"Read Chapter 1 free",
    officialCover:"Official cover",
    officialCoverNote:"Only the officially published book cover will appear here.",
    why:"Why FRAGMENTUN?",
    whyBody:"A science-fiction experience centered on emotion, identity, freedom and humanity.",
    lumen:"Lumen",
    lumenBody:"A society built around emotional control. Its stability seems perfect, until feeling stops obeying.",
    chapterTitle:"Enter Lumen",
    chapterBody:"Get access to Chapter 1 and begin the journey.",
    name:"Your name",
    email:"Your email address",
    send:"Read Chapter 1",
    author:"José Liranzo",
    authorBody:"Author of FRAGMENTUN and creator of universes centered on emotion, identity, freedom and humanity.",
    footer:"All rights reserved."
  }
} as const;
