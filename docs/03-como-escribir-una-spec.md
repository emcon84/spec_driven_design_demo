# 3. Cómo escribir una buena spec

## Las secciones y para qué sirve cada una

| Sección | Para qué sirve | Error común |
|---------|----------------|-------------|
| Idea original | Guardar la frase tal como llegó, para comparar al final. | Editarla. |
| Problema | Que todos entiendan por qué existe esto. | Describir la solución en vez del problema. |
| Objetivos | Qué tiene que lograr. | Demasiados; mejor 3 claros que 10 vagos. |
| **No-objetivos** | Poner límites explícitos al alcance. | Omitirla: es la sección que más discusiones evita. |
| Glosario | Que "token", "enlace" y "solicitud" signifiquen lo mismo para todos. | Usar sinónimos para lo mismo. |
| Reglas de negocio | Hechos que siempre son verdad (R1, R2…). | Esconderlas dentro de los AC. |
| Contrato | Forma exacta de la API/UI/CLI. | Dejarlo "a definir en el código". |
| **Criterios de aceptación** | Cómo se comprueba que está hecho. | Criterios no verificables. |
| Preguntas abiertas | Lo que todavía no se sabe (`- [ ]`). | Aprobar la spec con preguntas sin resolver (el harness no lo deja). |

## Criterios de aceptación: la parte más importante

Formato recomendado:

> **AC-n** — Dado *\<contexto\>*, cuando *\<acción\>*, entonces *\<resultado observable\>*.

Un buen AC es:

- **Verificable** — se puede escribir un test que pase o falle.
- **Observable** — habla de lo que ve el usuario/cliente (status, mensaje, respuesta), no de la implementación.
- **Atómico** — un comportamiento por criterio.
- **Con ID estable y global** — `AC-5` sigue siendo `AC-5` aunque se reordene el documento. No se reutilizan IDs borrados. `npm run harness -- next-ac` te da el próximo libre.

### Ejemplos (idea: "recuperar la contraseña por email")

| ❌ Malo | ✅ Bueno |
|--------|---------|
| "El sistema envía un email de recuperación." | "**AC-1** — Dado un email registrado, cuando hago `POST /password-resets`, entonces recibo `202` y se envía un único email con un enlace." |
| "No revelar si el email existe." | "**AC-2** — Dado un email **no** registrado, cuando hago `POST /password-resets`, entonces recibo exactamente la misma respuesta que en AC-1 y no se envía ningún email." |
| "El enlace expira." | "**AC-4** — Dado un enlace emitido hace más de 30 minutos, cuando lo uso, entonces recibo `410` con `error.code = "RESET_EXPIRED"`." |
| "Debe ser seguro." | "**AC-5** — Dado un enlace ya usado, cuando lo uso otra vez, entonces recibo `410` con `error.code = "RESET_USED"`." |
| "Guardar el token hasheado en Redis." | *(eso es plan, no spec)* |
| "Manejar errores correctamente." | Un AC por cada error del contrato. |

## Preguntas para destrabar una spec

Cuando no sabés qué más escribir, recorré esta lista (el spec-writer la usa):

- ¿Qué pasa con la entrada vacía, gigante, con caracteres raros, del tipo equivocado?
- ¿Qué pasa si la misma operación se hace dos veces? (¿dos solicitudes seguidas generan dos emails?)
- ¿Qué pasa con el tiempo? (vencimientos, zonas horarias, orden)
- ¿Qué colisiona con qué? (nombres, rutas, IDs, otras specs)
- ¿Qué pasa si el recurso no existe o ya no existe? (`404` vs `410`)
- ¿La respuesta filtra información que no debería?
- ¿Quién puede hacer esto? (si la respuesta es "nadie en esta versión", va a No-objetivos)

## Tamaño

Si la spec no entra en ~2 pantallas o tiene más de ~15 AC, probablemente son
dos specs. Dividila por capacidad (`001-recuperar-contrasena`,
`002-bloqueo-por-intentos`), no por capa técnica.

Plantilla: [`templates/spec.md`](../templates/spec.md)

Siguiente: [4. Tu primera spec, de la idea a done](04-ejercicio.md)
