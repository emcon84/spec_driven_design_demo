# CHECKPOINTS — Qué significa "estado final correcto"

> No se evalúa el camino, se evalúa el destino. Lo marcado con ⚙️ lo verifica
> `npm run harness -- check` automáticamente; lo marcado con 👀 lo juzga el
> reviewer (o un humano) leyendo.

## C1 — El harness está completo

- [ ] ⚙️ Existen los archivos listados en `harness.config.json → requiredFiles`.
- [ ] ⚙️ `npm run harness -- check` termina con exit code 0.

## C2 — El estado de las specs es coherente

- [ ] ⚙️ Toda spec tiene frontmatter con `status` válido y cumple la compuerta de su estado.
- [ ] ⚙️ Como mucho una spec en `in_progress`.
- [ ] ⚙️ Ninguna spec `approved` o posterior tiene preguntas abiertas sin resolver.
- [ ] ⚙️ Toda spec `approved` o posterior tiene `approved_by` (un humano).
- [ ] 👀 El `approved_by` corresponde a una persona real, no a un agente.

## C3 — La implementación respeta la spec

- [ ] ⚙️ Todo AC de una spec `review`/`done` tiene al menos un test `[AC-n]`.
- [ ] ⚙️ Ningún test referencia un AC inexistente, y ningún AC está duplicado entre specs.
- [ ] 👀 Cada test prueba **lo que dice su AC**, no algo parecido (status, códigos de error, campos).
- [ ] 👀 No hay comportamiento nuevo que la spec no pida (scope creep).
- [ ] 👀 Lo que está en "Fuera de alcance" no se implementó.

## C4 — El código respeta el proyecto

- [ ] 👀 Respeta las capas de `docs/proyecto/arquitectura.md`.
- [ ] 👀 Respeta `docs/proyecto/convenciones.md`.
- [ ] ⚙️ Los comandos de `harness.config.json → verify` pasan.

## C5 — La sesión se cerró bien

- [ ] 👀 `progress/current.md` está vacío (plantilla) o describe la sesión activa.
- [ ] 👀 `progress/history.md` tiene una entrada por la última sesión.
- [ ] 👀 No hay archivos temporales, logs de debug ni TODOs sin contexto.

---

**Cómo se usa:** el reviewer (`harness/agents/reviewer.md`) recorre cada checkbox en
`progress/review_<id>.md`, marca `[x]` o `[ ]` con el motivo, y solo emite
`APPROVED` si no queda ninguno vacío.
