# AGENTS.md — Mapa para agentes de IA

> Punto de entrada para cualquier agente (Cursor, Claude Code, Codex…) que trabaje
> en este repo. Es un **mapa**, no una biblia: leé cada archivo cuando lo necesites.

## 1. Antes de empezar (obligatorio)

1. Corré `npm run harness -- check`. Si termina en rojo, **pará** y arreglá el estado antes de tocar código.
2. Leé `progress/current.md` para ver en qué quedó la última sesión.
3. Corré `npm run harness -- status` para ver cada spec, su estado y el siguiente paso.

## 2. Cómo funciona este repo

Todo trabajo nace de una **spec** en `specs/NNN-nombre/spec.md`. Cada spec tiene un
`status` en su frontmatter y avanza por este ciclo:

```
idea → draft → approved → planned → in_progress → review → done     (blocked en cualquier momento)
```

Solo se cambia de estado con `npm run harness -- move <id> <estado>`, que se niega
si no se cumple la compuerta (criterios, preguntas abiertas, tareas, tests, revisión).

## 3. Mapa del repositorio

| Archivo / carpeta | Qué contiene | Cuándo leerlo |
|-------------------|--------------|---------------|
| `specs/NNN-*/spec.md` | Qué construir y cómo se acepta (fuente de verdad) | Siempre, antes de actuar |
| `specs/NNN-*/plan.md`, `tasks.md` | Cómo se construye y en qué pasos | Al planificar o implementar |
| `harness/agents/` | Roles: leader, spec-writer, planner, implementer, reviewer | Al tomar un rol |
| `docs/proyecto/arquitectura.md` | Capas y límites del proyecto | Antes de planificar o implementar |
| `docs/proyecto/convenciones.md` | Estilo, nombres, errores, tests | Antes de escribir código |
| `docs/proyecto/verificacion.md` | Cómo se demuestra que algo funciona | Antes de pasar a `review` |
| `CHECKPOINTS.md` | Qué significa "estado final correcto" | Al revisar o cerrar |
| `progress/current.md` | Estado vivo de la sesión | Siempre, y actualizarlo mientras trabajás |
| `progress/history.md` | Bitácora append-only | Si necesitás contexto histórico |
| `templates/` | Plantillas de spec, plan y tareas | Las usa el harness |
| `harness.config.json` | Comandos de verificación y dónde están los tests | Si cambia el stack |

## 4. Qué rol tomar

| Situación (`harness status`) | Rol | Archivo |
|------------------------------|-----|---------|
| El usuario trae una idea nueva | spec-writer | `harness/agents/spec-writer.md` |
| Spec en `idea` o `draft` | spec-writer | `harness/agents/spec-writer.md` |
| Spec en `approved` | planner | `harness/agents/planner.md` |
| Spec en `planned` / `in_progress` | implementer | `harness/agents/implementer.md` |
| Spec en `review` | reviewer | `harness/agents/reviewer.md` |
| Tarea grande o varios pasos | leader (orquesta los anteriores) | `harness/agents/leader.md` |

## 5. Reglas duras

- **La spec manda.** Si el código necesita algo que la spec no dice, se para y se actualiza la spec (vuelve a `draft`).
- **Nunca apruebes una spec.** `move <id> approved --by <nombre>` lo ejecuta un humano.
- **Una spec en `in_progress` a la vez.** El harness lo impone.
- **No marques `done` sin evidencia**: tests verdes y `progress/review_<id>.md` con `APPROVED`.
- **Estado en disco, no en el chat.** Los subagentes escriben sus informes en `progress/` y devuelven solo `done -> <archivo>` o `blocked -> <archivo>`.
- **No inventes workarounds.** Si algo no funciona como esperás, anotalo en `progress/current.md` y pasá la spec a `blocked`.

## 6. Cierre de sesión

1. `npm run harness -- check` en verde.
2. Mové el resumen de `progress/current.md` al final de `progress/history.md` y dejá `current.md` como la plantilla vacía.
3. Sin archivos temporales, `console.log` de debug ni TODOs sin contexto.
