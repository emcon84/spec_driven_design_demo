#!/bin/bash
# Al terminar el agente, corre el harness. Si está en rojo, le devuelve el
# resumen como follow-up para que lo arregle o documente el bloqueo.
cat >/dev/null
cd "$(dirname "$0")/../.." || { echo '{}'; exit 0; }

NODE=$(command -v node || ls -d "$HOME"/.nvm/versions/node/*/bin/node 2>/dev/null | tail -1)
if [ -z "$NODE" ] || [ ! -x "$NODE" ]; then echo '{}'; exit 0; fi

if output=$("$NODE" harness/cli.js check 2>&1); then
  echo '{}'
  exit 0
fi

HARNESS_OUTPUT=$(printf '%s' "$output" | grep -E '\[FAIL\]|^[[:space:]]+- ' | head -20) \
  "$NODE" -e 'process.stdout.write(JSON.stringify({
    followup_message: "El harness está en rojo (`npm run harness -- check`). Arreglalo o, si estás bloqueado, documentalo en progress/current.md y pasá la spec a blocked:\n" + process.env.HARNESS_OUTPUT
  }))'
