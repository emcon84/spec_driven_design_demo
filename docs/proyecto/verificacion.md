# Verificación — cómo se demuestra que funciona

> El agente no dice "funciona": lo demuestra con evidencia ejecutable.

## Nivel 1 — Tests por criterio (obligatorio)

Cada AC tiene al menos un test con `[AC-n]` que verifica el resultado
**observable** que dice el criterio (status, mensaje, código de error, campos).
Si el AC lista casos borde, cada uno aparece en el test.

Comando: <!-- p. ej. npm test / pytest -q / go test ./... -->

## Nivel 2 — Integración (obligatorio si el AC habla de una interfaz)

<!-- Cómo se prueba contra la interfaz real: servidor HTTP en un puerto libre, CLI como subproceso,
     base de datos temporal, etc. -->

## Nivel 3 — Harness (obligatorio para cambiar de estado)

```bash
npm run harness -- check
```

Verifica archivos base, estado de las specs, trazabilidad AC ↔ tests y corre los
comandos de `harness.config.json → verify`.

## Nivel 4 — Smoke test manual (recomendado antes de `review`)

<!-- Los comandos para levantar el sistema y probar el flujo principal a mano. -->

## Anti-patrones

- ❌ "Debería funcionar" sin test.
- ❌ Un test que solo verifica que no se lanza una excepción.
- ❌ Un test con `[AC-n]` que no prueba lo que dice ese AC: el harness no lo detecta, el reviewer sí.
- ❌ Esperar tiempo real para probar algo que depende del tiempo: inyectar el reloj.
