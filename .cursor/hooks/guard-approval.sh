#!/bin/bash
# Aprobar una spec es una decisión humana: si un agente intenta
# `harness move <id> approved`, Cursor le pide confirmación al usuario.
input=$(cat)

if printf '%s' "$input" | grep -Eq 'harness[^"]*move[^"]*[[:space:]]approved'; then
  cat <<'JSON'
{
  "permission": "ask",
  "user_message": "Un agente quiere APROBAR una spec. Confirmá solo si vos la revisaste y estás de acuerdo con su contenido.",
  "agent_message": "Aprobar specs es una decisión humana. Esperá la confirmación del usuario y no reintentes por otra vía."
}
JSON
  exit 0
fi

echo '{ "permission": "allow" }'
