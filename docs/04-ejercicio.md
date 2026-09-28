# 4. Tu primera spec, de la idea a done

Un recorrido completo con el harness. Hacelo a mano la primera vez para ver cada
compuerta; después probá delegarlo al agente.

## Paso 0 — Preparar el proyecto

1. Completá `docs/proyecto/arquitectura.md`, `convenciones.md` y `verificacion.md`. Sin eso, el agente va a inventar la arquitectura.
2. En `harness.config.json`, apuntá `tests.dirs` a donde van a vivir tus tests y agregá tus comandos en `verify`:

   ```json
   "verify": [
     { "name": "lint", "run": "npm run lint" },
     { "name": "tests", "run": "npm test" }
   ]
   ```

3. `npm run harness -- check` tiene que dar verde.

## Paso 1 — Desplegar la idea

```bash
npm run harness -- new "Quiero que los usuarios puedan recuperar su contraseña por email" --title "Recuperar contraseña"
npm run harness -- status
```

Se crea `specs/001-recuperar-contrasena/spec.md` en estado `idea`, con la frase
original en la sección 0. Esa frase no se edita: al final vas a comparar cuánto creció.

## Paso 2 — Convertirla en spec (spec-writer)

Hacelo a mano, o pedíselo al agente: *"Sos el spec-writer, seguí `harness/agents/spec-writer.md` para la spec 001"*.

Una frase así deja muchas decisiones abiertas. Las que no tengas claras van a
"Preguntas abiertas" como `- [ ] ...`:

- ¿Qué respondemos si el email no existe? (¡no filtrar qué emails están registrados!)
- ¿Cuánto dura el enlace? ¿Se puede usar más de una vez?
- ¿Qué pasa si se piden dos enlaces seguidos? ¿El primero sigue sirviendo?
- ¿Hay límite de solicitudes por email o por IP?
- ¿Qué reglas tiene la contraseña nueva?
- ¿Se cierran las sesiones abiertas al cambiarla?

```bash
npm run harness -- move 001 draft
```

## Paso 3 — Intentar aprobarla con preguntas abiertas

```bash
npm run harness -- move 001 approved --by <tu-nombre>
```

Si quedó alguna `- [ ]`, el harness la rechaza:

```
✘ 001: draft → approved rechazado por la compuerta:
   - tiene 2 pregunta(s) abierta(s) sin resolver en la sección "Preguntas abiertas"
```

Respondelas: marcalas `- [x]` y anotá la decisión en la sección 9. Después volvé a aprobar.
Si un agente intenta aprobarla por vos, el hook de Cursor te pide confirmación.

## Paso 4 — Planificar (planner)

```bash
npm run harness -- plan 001
```

Completá `plan.md` y `tasks.md`. Si alguna tarea no menciona un AC, `move 001 planned` te dice cuál falta.

## Paso 5 — Implementar (implementer)

```bash
npm run harness -- move 001 in_progress
```

Por cada tarea: tests con `[AC-n]`, ver que fallan, implementar, correr `npm run harness -- check` y marcar `[x]`.
`npm run harness -- trace` muestra con `○` los criterios que todavía no tienen test.

## Paso 6 — Revisar (reviewer)

```bash
npm run harness -- move 001 review
```

Pedile a un agente **distinto**, sin el contexto de quien implementó, que haga
de reviewer (`harness/agents/reviewer.md`). Solo con `**Veredicto:** APPROVED`
en `progress/review_001.md` se puede pasar a done:

```bash
npm run harness -- move 001 done
```

## Variante: todo con un prompt

Con el harness listo, pedile al agente solamente *"seguí AGENTS.md y avanzá la
spec 001 hasta donde puedas"*. Fijate en qué momento se detiene y te pide la
aprobación, y qué informes quedan en `progress/`.
