# Arquitectura — <nombre del proyecto>

> Qué significa "buen trabajo" en este proyecto. El planner y el reviewer lo usan
> para decidir si un cambio encaja. Completalo antes de la primera spec: sin esto,
> el agente va a inventar la arquitectura.

## Stack

<!-- Lenguaje, versión, framework, base de datos, cómo se despliega. -->

- 

## Capas / módulos

<!-- Qué carpetas existen, qué responsabilidad tiene cada una y en qué dirección van las dependencias.
     Ejemplo:
       src/domain/   reglas de negocio puras, sin I/O
       src/adapters/ HTTP, base de datos, colas: traducen de afuera al dominio
       src/main.*    arranque: arma las piezas
     Las dependencias van hacia adentro: main → adapters → domain. -->

## Reglas

<!-- Lo que no se negocia. Ejemplos:
     - El dominio no importa nada de los adapters.
     - Todo lo no determinista (reloj, random, IDs) se inyecta.
     - Agregar una dependencia externa requiere justificarlo en el plan.md de la spec. -->

- 

## Límites actuales

<!-- Lo que el sistema deliberadamente NO hace todavía (sin auth, sin persistencia, etc.). -->

- 
