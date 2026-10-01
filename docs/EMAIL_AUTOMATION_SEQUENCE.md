# FRAGMENTUN — Secuencia de Email v1.0

## Objetivo
Convertir registros del Capítulo 1 en lectores del libro completo sin depender de presión artificial ni métricas inventadas.

## Segmento
Grupo principal: lectores registrados desde la landing del Capítulo 1.

## Enlaces rastreables
Muestra ES:
`https://www.fragmentun.com/es/capitulo-1?utm_source=email&utm_medium=email&utm_campaign=fragmentun_nurture&utm_content=email_XX`

Compra Amazon:
`https://www.fragmentun.com/go/amazon?locale=es&utm_source=email&utm_medium=email&utm_campaign=fragmentun_nurture&utm_content=email_XX`

Sustituir `email_XX` por `email_01`, `email_02`, etc.

## Correo 1 — inmediato
**Asunto:** Aquí comienza tu viaje a Lumen

Hola, [nombre]:

Aquí tienes tu muestra de *Fragmentun I: El despertar emocional*:

[LEER CAPÍTULO 1]

Lumen promete una vida sin guerra, hambre ni pobreza. También ha decidido cuánto puede sentir cada persona. Elyon está a punto de descubrir lo que ocurre cuando esa regla se rompe.

Cuando termines, puedes continuar con el libro aquí:

[CONTINUAR EN AMAZON]

José Liranzo

## Correo 2 — día 2
**Asunto:** El precio del silencio perfecto

Hola, [nombre]:

Hay una pregunta detrás de *Fragmentun*: si eliminar el dolor nos hiciera más eficientes, ¿qué otras partes de nosotros desaparecerían con él?

Elyon vive dentro de la respuesta que Lumen eligió. Su historia comienza cuando esa respuesta deja de parecerle suficiente.

[LEER O VOLVER AL CAPÍTULO 1]

José

## Correo 3 — día 4
**Asunto:** Elyon no sabe por qué es diferente

Hola, [nombre]:

Elyon sueña y siente en una ciudad que trata ambas cosas como señales de inestabilidad. La doctora Kaelis Vorm ve en él una posibilidad que el Consejo quiere borrar.

Si esta tensión te atrapó, aquí puedes continuar con el libro:

[CONTINUAR EN AMAZON]

También puedes volver al comienzo:

[CAPÍTULO 1]

José

## Correo 4 — día 7
**Asunto:** Cuando Lumen empezó a sentir

Hola, [nombre]:

El Pulso cambia más que a Elyon. En Lumen, las emociones reprimidas empiezan a transformar barrios, cuerpos y relaciones. La ciudad que prometía control debe enfrentarse a lo que había escondido.

*Fragmentun I: El despertar emocional* está disponible aquí:

[CONTINUAR EN AMAZON]

José

## Correo 5 — día 10
**Asunto:** ¿Quieres continuar la historia de Elyon?

Hola, [nombre]:

Te envié el comienzo de *Fragmentun* para que pudieras decidir con la historia en tus manos.

Si quieres saber qué sucede después de que Lumen pierde el control:

[CONTINUAR EN AMAZON]

Gracias por leer y por acompañar este mundo.

José

## Reglas de automatización
- Entrada: registro válido con consentimiento.
- Idioma: ES y EN deben usar grupos separados.
- Baja: respetar inmediatamente el estado de unsubscribe del proveedor de email.
- No enviar insistencia comercial a contactos identificados como compradores cuando exista una señal fiable de compra.
- No inventar urgencia, descuento, disponibilidad, reseñas o cifras de ventas.
- Medir aperturas como señal secundaria; priorizar clics a muestra y clics Amazon.
- Las URLs hacia Amazon desde email deben usar `/go/amazon` para alimentar el dashboard interno.

## Métricas principales
- Lead → lectura del capítulo.
- Lead → clic Amazon.
- Clic por correo individual.
- Tasa de baja.
- Errores de entrega.
- Rendimiento por fuente UTM original.
