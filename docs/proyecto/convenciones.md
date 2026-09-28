# Convenciones de código — <nombre del proyecto>

> Homogeneidad: un agente predice mejor cuando el repo se parece a sí mismo en
> todas partes. El implementer las sigue; el reviewer las verifica.

## Estilo

<!-- Formato, largo de línea, comillas, imports, formatter/linter y cómo se corre. -->

- 

## Nombres

| Tipo | Convención | Ejemplo |
|------|-----------|---------|
| Archivos | | |
| Funciones / variables | | |
| Constantes | | |
| Códigos de error | | |

## Errores

<!-- Cómo se representan los errores de dominio, cómo se exponen al usuario/cliente,
     qué nunca se expone (stack traces, datos sensibles). -->

- 

## Tests

- Ubicación y nombre de los archivos: <!-- p. ej. tests/<módulo>.test.ts -->
- **Todo test nombra el criterio que cubre con `[AC-n]`** en el nombre, docstring o un comentario: el harness lo busca en el texto del archivo.
  - JS/TS: `test('[AC-5] rechaza un alias ya usado', ...)`
  - Python: `def test_rechaza_alias_usado():  # [AC-5]`
- Lo no determinista (reloj, red, random) se inyecta o se falsea; nunca `sleep`.

## Comentarios

Por defecto no se escriben. Solo para explicar un *por qué* no obvio.
