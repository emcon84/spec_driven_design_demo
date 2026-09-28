# Spec-Driven Design — framework + harness

Un framework chico para llevar **una idea → una spec → código verificado**,
pensado para trabajar con agentes de IA sin que se salteen pasos:

- **Specs como unidad de trabajo**, con un ciclo de vida (`idea → draft → approved → planned → in_progress → review → done`) y compuertas que un programa verifica.
- **Un harness genérico** (`harness/`, sin dependencias) que sirve para cualquier stack. Se configura en `harness.config.json`.
- **Roles de agentes** (leader, spec-writer, planner, implementer, reviewer) que dejan todo en `progress/`.
- **Hooks de Cursor** que exigen aprobación humana y verifican el estado al cerrar.

## Empezar

Requiere Node.js 20 o superior. No hay dependencias que instalar.

1. Completá `docs/proyecto/arquitectura.md`, `convenciones.md` y `verificacion.md`.
2. En `harness.config.json`, configurá dónde están tus tests (`tests.dirs`) y tus comandos de verificación (`verify`).
3. Verificá que todo esté en verde:

   ```bash
   npm run harness -- check
   ```

## Desplegar una idea

```bash
npm run harness -- new "Quiero que los usuarios puedan recuperar su contraseña por email" --title "Recuperar contraseña"
```

Después, en Cursor, pedile al agente: **«seguí AGENTS.md y avanzá la spec 001»**.
El agente toma el rol que corresponde, te devuelve la spec con preguntas abiertas
y se detiene hasta que vos la apruebes:

```bash
npm run harness -- move 001 approved --by <tu-nombre>
```

## Comandos

| Comando | Qué hace |
|---------|----------|
| `npm run harness -- new "<idea>" --title "..."` | Crea `specs/NNN-slug/spec.md` en estado `idea` |
| `npm run harness -- status` | Estado de cada spec y el siguiente paso |
| `npm run harness -- next-ac` | Próximo ID de criterio libre |
| `npm run harness -- plan <id>` | Crea `plan.md` y `tasks.md` desde las plantillas |
| `npm run harness -- move <id> <estado>` | Cambia de estado si pasa la compuerta |
| `npm run harness -- check` | Verificación completa (al empezar y al cerrar) |
| `npm run harness -- trace` | Solo trazabilidad entre criterios y tests |

## Guía

1. [¿Qué es Spec-Driven Design?](docs/01-que-es-sdd.md)
2. [El flujo paso a paso](docs/02-flujo.md)
3. [Cómo escribir una buena spec](docs/03-como-escribir-una-spec.md)
4. [Tu primera spec, de la idea a done](docs/04-ejercicio.md)
5. [El framework: specs + harness](docs/05-framework-y-harness.md): ciclo de vida, compuertas, roles, hooks y cómo usarlo en tu proyecto

## Estructura

```
AGENTS.md              mapa para agentes (punto de entrada)
CHECKPOINTS.md         qué significa "estado final correcto"
harness.config.json    comandos de verificación y dónde están los tests  ← por proyecto
harness/cli.js         new · plan · status · move · check · trace · next-ac
harness/agents/        roles: leader, spec-writer, planner, implementer, reviewer
templates/             plantillas de spec, plan y tareas
specs/                 una carpeta por spec: spec.md, plan.md, tasks.md  ← fuente de verdad
progress/              estado de la sesión, bitácora e informes de los agentes
docs/proyecto/         arquitectura, convenciones, verificación  ← por proyecto
.cursor/hooks*         aprobación humana + check al cerrar
```

## La regla de oro

**Primero cambia la spec, después el código.** Si `npm run harness -- check` está
en rojo, el código y las specs no están alineados.
