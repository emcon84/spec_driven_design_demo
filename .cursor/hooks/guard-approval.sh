#!/bin/bash
# Approving a spec is a human decision: if an agent tries
# `harness move <id> approved`, Cursor asks the user for confirmation.
input=$(cat)

if printf '%s' "$input" | grep -Eq 'harness[^"]*move[^"]*[[:space:]]approved'; then
  cat <<'JSON'
{
  "permission": "ask",
  "user_message": "An agent wants to APPROVE a spec. Confirm only if you reviewed it and agree with its contents.",
  "agent_message": "Approving specs is a human decision. Wait for the user's confirmation and do not retry another way."
}
JSON
  exit 0
fi

echo '{ "permission": "allow" }'
