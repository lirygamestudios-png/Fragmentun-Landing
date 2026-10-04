export const FRAGMENTUN_EMAIL_SEQUENCE = [
  {
    id:"welcome-chapter",
    order:1,
    delay:"Inmediato",
    purpose:"Bienvenida + entrega del Capítulo 1",
    subject:"Bienvenido a FRAGMENTUN — Tu Capítulo 1 te espera",
    preheader:"Entra en Lumen y comienza El Despertar Emocional.",
    primaryCta:{label:"LEER EL CAPÍTULO 1 EN LA WEB",href:"https://www.fragmentun.com/es/capitulo-1"},
    secondaryCta:{label:"ENTRAR A FRAGMENTUN",href:"https://www.fragmentun.com/es"},
    note:"Debe incluir acceso a la copia descargable del Capítulo 1 cuando el PDF oficial esté publicado."
  },
  {
    id:"emotional-hook",
    order:2,
    delay:"2 días",
    purpose:"Conexión emocional + identidad del lector",
    subject:"¿Y si sentir demasiado fuera tu mayor fortaleza?",
    preheader:"En Lumen, sentir es una anomalía. Para Elyon, puede ser la clave.",
    primaryCta:{label:"DESCUBRIR MI PERFIL EMOCIONAL",href:"https://www.fragmentun.com/es/test"},
    secondaryCta:{label:"ENTRAR A FRAGMENTUN",href:"https://www.fragmentun.com/es"},
    note:"Refuerza sensibilidad, identificación y el concepto de emociones como información."
  },
  {
    id:"world-lumen",
    order:3,
    delay:"3 días",
    purpose:"Worldbuilding + deseo de continuar",
    subject:"Lumen parecía perfecta. Ese era el problema.",
    preheader:"Una ciudad sin guerra, sin hambre y casi sin emociones.",
    primaryCta:{label:"EXPLORAR FRAGMENTUN",href:"https://www.fragmentun.com/es"},
    secondaryCta:{label:"VER EL LIBRO EN AMAZON",href:"https://www.amazon.com/dp/B0HBLTHT8S"},
    note:"Presenta la paradoja moral de Lumen y aumenta el deseo de descubrir qué ocurre después del Capítulo 1."
  },
  {
    id:"amazon-conversion",
    order:4,
    delay:"4 días",
    purpose:"Conversión a compra",
    subject:"El Capítulo 1 solo fue el primer pulso",
    preheader:"La historia de Elyon, Nara y Lumen apenas comienza.",
    primaryCta:{label:"CONTINUAR LA HISTORIA EN AMAZON",href:"https://www.amazon.com/dp/B0HBLTHT8S"},
    secondaryCta:{label:"ENTRAR A FRAGMENTUN",href:"https://www.fragmentun.com/es"},
    note:"CTA comercial principal. No usar urgencia artificial ni afirmaciones de compra no verificadas."
  },
  {
    id:"review-request",
    order:5,
    delay:"10 días después",
    purpose:"Solicitud emocional de reseña",
    subject:"Tu voz también forma parte de FRAGMENTUN",
    preheader:"Si ya compraste y comenzaste a leer, tu opinión puede ayudar a otro lector a entrar en Lumen.",
    primaryCta:{label:"DEJAR MI RESEÑA EN AMAZON",href:"https://www.amazon.com/review/create-review?&asin=B0HBLTHT8S"},
    secondaryCta:{label:"ENTRAR A FRAGMENTUN",href:"https://www.fragmentun.com/es"},
    note:"Petición condicional y no incentivada. Idealmente dirigir este correo a quienes hicieron clic en Amazon; nunca asumir que compraron."
  }
] as const;

export const FRAGMENTUN_EMAIL_BRAND = {
  logo:"https://www.fragmentun.com/fragmentun-mark.png",
  wordmark:"FRAGMENTUN",
  background:"#0A1628",
  gold:"#C9A84C",
  blue:"#4A90D9",
  maxWidth:640,
  requiredElements:[
    "Logotipo oficial FRAGMENTUN en cabecera",
    "Botón ENTRAR A FRAGMENTUN",
    "Diseño responsive",
    "Enlace de baja de suscripción",
    "Pie legal y autoría",
    "Contraste suficiente para lectura móvil"
  ]
} as const;
