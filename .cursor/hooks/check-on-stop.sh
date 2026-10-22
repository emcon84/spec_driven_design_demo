#!/bin/bash
# When the agent finishes, run the harness. If it is red, return the
# summary as a follow-up so it can fix it or document the block.
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
    followup_message: "The harness is red (`npm run harness -- check`). Fix it or, if you are blocked, document it in progress/current.md and move the spec to blocked:\n" + process.env.HARNESS_OUTPUT
  }))'
