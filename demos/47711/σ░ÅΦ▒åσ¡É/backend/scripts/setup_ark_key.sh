#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_FILE="${BACKEND_DIR}/.env"
EXAMPLE_FILE="${BACKEND_DIR}/.env.example"

if [[ ! -f "${ENV_FILE}" ]]; then
  cp "${EXAMPLE_FILE}" "${ENV_FILE}"
fi

printf "Paste your new ARK_API_KEY. Input will be hidden: "
stty -echo
read -r ARK_API_KEY
stty echo
printf "\n"

if [[ -z "${ARK_API_KEY}" ]]; then
  echo "ARK_API_KEY was empty; no changes made."
  exit 1
fi

TMP_FILE="$(mktemp)"
awk -v key="${ARK_API_KEY}" '
  BEGIN { updated = 0 }
  /^ARK_API_KEY=/ {
    print "ARK_API_KEY=" key
    updated = 1
    next
  }
  { print }
  END {
    if (!updated) {
      print "ARK_API_KEY=" key
    }
  }
' "${ENV_FILE}" > "${TMP_FILE}"

mv "${TMP_FILE}" "${ENV_FILE}"
chmod 600 "${ENV_FILE}"

echo "Saved ARK_API_KEY to backend/.env with local-only file permissions."
